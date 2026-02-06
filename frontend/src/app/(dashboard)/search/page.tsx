'use client';

/**
 * Search Page
 * 
 * Main search interface for LexVault.
 * Combines SearchBar, SearchFilters, and SearchResults components.
 */

import { useCallback, useEffect, useRef } from 'react';
import { SearchBar, SearchFilters, SearchResults } from '@/components/search';
import { useSearchStore } from '@/stores/search';
import { useUIStore } from '@/stores/ui';
import { search } from '@/lib/api';

export default function SearchPage() {
  const { 
    query, 
    mode, 
    filters, 
    setResults, 
    setLoading, 
    setError,
    addToHistory,
    isLoading,
  } = useSearchStore();
  
  const { setViewerDocument } = useUIStore();
  
  // Track if this is the first render (for URL-based search)
  const isFirstRender = useRef(true);
  
  // Abort controller for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Execute search with the given query.
   * Handles loading states, errors, and search history.
   */
  const executeSearch = useCallback(async (searchQuery: string) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const response = await search({
        query: searchQuery,
        mode,
        filters,
        limit: 20,
        offset: 0,
      });

      // Only update results if this request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setResults(response.results, response.totalCount, response.processingTimeMs);
        
        // Add to search history
        addToHistory(searchQuery, response.totalCount);
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const message = err instanceof Error 
        ? err.message 
        : 'Ein unerwarteter Fehler ist aufgetreten';
      setError(message);
    }
  }, [mode, filters, setResults, setLoading, setError, addToHistory]);

  /**
   * Handle search submission from the SearchBar.
   */
  const handleSearch = useCallback((searchQuery: string) => {
    executeSearch(searchQuery);
  }, [executeSearch]);

  /**
   * Re-execute search when filters or mode change (only if we have a query).
   */
  useEffect(() => {
    // Skip on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only re-search if we have an active query and aren't already loading
    if (query && !isLoading) {
      executeSearch(query);
    }
  }, [mode, filters]); // Intentionally exclude query and executeSearch to avoid infinite loops

  /**
   * Cleanup: abort any pending requests on unmount.
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Handle view document action.
   * Opens the document viewer (or would in a full implementation).
   */
  const handleViewDocument = useCallback((documentId: string, page: number) => {
    setViewerDocument(documentId, page);
    
    // In a full implementation, this would:
    // 1. Open a side panel with PDF viewer
    // 2. Navigate to the specific page
    // 3. Highlight the matched text
    console.log(`Opening document ${documentId} at page ${page}`);
    
    // For now, show an alert as feedback
    // In production, this would be replaced with actual navigation
  }, [setViewerDocument]);

  return (
    <div className="flex h-full flex-col">
      {/* Search Header */}
      <div className="border-b bg-card px-6 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Dokumentensuche
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Durchsuchen Sie Ihre gesamte Dokumentenbibliothek mit KI-gestützter Suche
            </p>
          </div>
          
          {/* Search Bar */}
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Suchbegriff, Artikelnummer oder Zitat eingeben..."
            autoFocus
          />
          
          {/* Filters */}
          <SearchFilters />
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="mx-auto h-full max-w-4xl">
          <SearchResults onViewDocument={handleViewDocument} />
        </div>
      </div>
    </div>
  );
}
