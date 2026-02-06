'use client';

/**
 * SearchResults Component
 * 
 * Displays search results with:
 * - Loading skeleton states
 * - Empty states (no query, no results)
 * - Error states
 * - Results list with metadata
 */

import { FileSearch, Clock, AlertCircle, Loader2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { SkeletonResultsList } from '@/components/ui/skeleton';
import { ResultCard } from './ResultCard';
import { useSearchStore } from '@/stores/search';

// ============================================================================
// Component Props
// ============================================================================

interface SearchResultsProps {
  /** Callback when user clicks to view a document */
  onViewDocument?: (documentId: string, page: number) => void;
}

// ============================================================================
// Subcomponents
// ============================================================================

/**
 * Empty state when no search has been performed yet.
 */
function EmptyStateInitial() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-muted p-4">
        <FileSearch className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-foreground">
        Dokumentensuche
      </h3>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Geben Sie einen Suchbegriff ein, um relevante Dokumente zu finden. 
        Sie können nach Rechtsbegriffen, Artikelnummern, Vertragsklauseln oder 
        beliebigen Textstellen suchen.
      </p>
      
      {/* Example searches */}
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Beispielsuchen
        </p>
        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="rounded-md bg-muted px-3 py-2 text-center">
            <span className="font-mono">Art. 261 OR</span>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-center">
            <span className="font-mono">Kündigungsfrist Mietvertrag</span>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-center">
            <span className="font-mono">BGE 142 III 91</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state when search returned no results.
 */
function EmptyStateNoResults({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-muted p-3">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-medium text-foreground">Keine Ergebnisse</h3>
      <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
        Für <span className="font-medium text-foreground">&quot;{query}&quot;</span> wurden keine Dokumente gefunden.
      </p>
      
      {/* Suggestions */}
      <div className="mt-4 max-w-sm text-center">
        <p className="text-sm text-muted-foreground">Versuchen Sie:</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>• Andere Suchbegriffe oder Synonyme</li>
          <li>• Weniger spezifische Suchbegriffe</li>
          <li>• Filter zurücksetzen</li>
        </ul>
      </div>
      
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onReset}
      >
        Filter zurücksetzen
      </Button>
    </div>
  );
}

/**
 * Error state when search failed.
 */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mt-4 font-medium text-foreground">Fehler bei der Suche</h3>
      <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">{error}</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onRetry}
      >
        Erneut versuchen
      </Button>
    </div>
  );
}

/**
 * Loading state with skeleton cards.
 */
function LoadingState() {
  return (
    <div className="flex flex-col">
      {/* Fake loading header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Durchsuche Dokumente...</span>
        </div>
      </div>
      
      {/* Skeleton cards */}
      <SkeletonResultsList count={3} />
    </div>
  );
}

/**
 * Results header with count and processing time.
 */
function ResultsHeader({ 
  totalCount, 
  query, 
  processingTimeMs 
}: { 
  totalCount: number; 
  query: string; 
  processingTimeMs: number | null;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{totalCount}</span>
        <span>Ergebnis{totalCount !== 1 ? 'se' : ''} für</span>
        <span className="font-medium text-foreground">&quot;{query}&quot;</span>
      </div>
      {processingTimeMs !== null && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{(processingTimeMs / 1000).toFixed(2)}s</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SearchResults({ onViewDocument }: SearchResultsProps) {
  const { 
    results, 
    totalCount, 
    isLoading, 
    error, 
    query, 
    processingTimeMs,
    selectedResultId,
    selectResult,
    clearFilters,
    reset,
  } = useSearchStore();

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => {
          // Trigger a re-search by resetting error
          // The parent component should handle the actual retry
          reset();
        }} 
      />
    );
  }

  // Empty state (no query yet)
  if (!query) {
    return <EmptyStateInitial />;
  }

  // No results state
  if (results.length === 0) {
    return (
      <EmptyStateNoResults 
        query={query} 
        onReset={clearFilters}
      />
    );
  }

  // Results
  return (
    <div className="flex flex-col h-full">
      {/* Results Header */}
      <ResultsHeader 
        totalCount={totalCount} 
        query={query} 
        processingTimeMs={processingTimeMs} 
      />

      {/* Results List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 pb-4">
          {results.map((result, index) => (
            <ResultCard
              key={result.id}
              result={result}
              isSelected={selectedResultId === result.id}
              onSelect={() => selectResult(result.id)}
              onViewDocument={() => onViewDocument?.(result.documentId, result.pageNumbers[0])}
              rank={index + 1}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
