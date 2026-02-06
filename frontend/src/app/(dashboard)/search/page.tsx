'use client';

import { useCallback } from 'react';
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
    setError 
  } = useSearchStore();
  
  const { setViewerDocument } = useUIStore();

  const handleSearch = useCallback(async (searchQuery: string) => {
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

      setResults(response.results, response.totalCount, response.processingTimeMs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      setError(message);
    }
  }, [mode, filters, setResults, setLoading, setError]);

  const handleViewDocument = useCallback((documentId: string, page: number) => {
    setViewerDocument(documentId, page);
    // In a real implementation, this would navigate to the document viewer
    // or open a side panel
    console.log(`Opening document ${documentId} at page ${page}`);
  }, [setViewerDocument]);

  return (
    <div className="flex h-full flex-col">
      {/* Search Header */}
      <div className="border-b bg-card px-6 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Dokumentensuche
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Durchsuchen Sie Ihre gesamte Dokumentenbibliothek mit KI-gestützter Suche
            </p>
          </div>
          
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Suchbegriff, Artikelnummer oder Zitat eingeben..."
            autoFocus
          />
          
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
