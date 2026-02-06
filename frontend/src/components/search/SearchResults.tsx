'use client';

import { FileSearch, Clock, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResultCard } from './ResultCard';
import { useSearchStore } from '@/stores/search';

interface SearchResultsProps {
  onViewDocument?: (documentId: string, page: number) => void;
}

export function SearchResults({ onViewDocument }: SearchResultsProps) {
  const { 
    results, 
    totalCount, 
    isLoading, 
    error, 
    query, 
    processingTimeMs,
    selectedResultId,
    selectResult 
  } = useSearchStore();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Durchsuche Dokumente...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-destructive/10 p-3">
          <FileSearch className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="mt-4 font-medium text-foreground">Fehler bei der Suche</h3>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Empty state (no query yet)
  if (!query) {
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
        <div className="mt-6 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
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
    );
  }

  // No results
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-3">
          <FileSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-medium text-foreground">Keine Ergebnisse</h3>
        <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
          Für &quot;{query}&quot; wurden keine Dokumente gefunden. 
          Versuchen Sie andere Suchbegriffe oder passen Sie die Filter an.
        </p>
      </div>
    );
  }

  // Results
  return (
    <div className="flex flex-col">
      {/* Results Header */}
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

      {/* Results List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 pb-4">
          {results.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              isSelected={selectedResultId === result.id}
              onSelect={() => selectResult(result.id)}
              onViewDocument={() => onViewDocument?.(result.documentId, result.pageNumbers[0])}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
