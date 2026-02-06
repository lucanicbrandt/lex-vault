'use client';

/**
 * ResultCard Component
 * 
 * Individual search result card displaying:
 * - Document title and metadata
 * - Relevance score visualization
 * - Highlighted snippet
 * - Match type indicator
 * - Action buttons
 */

import { FileText, Calendar, Tag, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SearchResult, DocumentType } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  contract: 'Vertrag',
  correspondence: 'Korrespondenz',
  court_decision: 'Gerichtsentscheid',
  legislation: 'Gesetzgebung',
  memo: 'Memo',
  other: 'Sonstiges',
};

const DOCUMENT_TYPE_COLORS: Record<DocumentType, string> = {
  contract: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  correspondence: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  court_decision: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  legislation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  memo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
};

const MATCH_TYPE_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; description: string }> = {
  semantic: { 
    label: 'Semantisch', 
    variant: 'secondary',
    description: 'Konzeptioneller Treffer basierend auf Bedeutung'
  },
  keyword: { 
    label: 'Exakt', 
    variant: 'outline',
    description: 'Exakter Wort-/Phrasentreffer'
  },
  both: { 
    label: 'Hybrid', 
    variant: 'default',
    description: 'Treffer sowohl für Bedeutung als auch exakte Begriffe'
  },
};

// ============================================================================
// Component Props
// ============================================================================

interface ResultCardProps {
  /** The search result to display */
  result: SearchResult;
  /** Whether this card is currently selected */
  isSelected?: boolean;
  /** Callback when the card is clicked */
  onSelect?: () => void;
  /** Callback when "View in document" is clicked */
  onViewDocument?: () => void;
  /** Result rank (1-indexed) for accessibility */
  rank?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format a date string to Swiss locale.
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format file size to human-readable string.
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get score color based on value.
 */
function getScoreColor(score: number): string {
  const percentage = score * 100;
  if (percentage >= 80) {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  }
  if (percentage >= 60) {
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
  return 'bg-muted text-muted-foreground';
}

// ============================================================================
// Component
// ============================================================================

export const ResultCard = memo(function ResultCard({ 
  result, 
  isSelected, 
  onSelect, 
  onViewDocument,
  rank 
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  /**
   * Copy citation to clipboard.
   */
  const handleCopyCitation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const citation = result.articleRef
      ? `${result.document.title}, ${result.articleRef} (S. ${result.pageNumbers.join(', ')})`
      : `${result.document.title} (S. ${result.pageNumbers.join(', ')})`;
    
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      console.error('Failed to copy to clipboard');
    }
  };

  const scorePercentage = Math.round(result.score * 100);
  const matchConfig = MATCH_TYPE_CONFIG[result.matchType];
  const docTypeColor = DOCUMENT_TYPE_COLORS[result.document.type];
  const docTypeLabel = DOCUMENT_TYPE_LABELS[result.document.type] ?? result.document.type;

  return (
    <TooltipProvider>
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary',
          isSelected && 'ring-2 ring-primary shadow-md'
        )}
        onClick={onSelect}
        role="article"
        aria-label={`Suchergebnis ${rank ?? ''}: ${result.document.title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.();
          }
        }}
      >
        <CardContent className="p-4">
          {/* Header Row */}
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              {/* Document Icon */}
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                docTypeColor
              )}>
                <FileText className="h-5 w-5" />
              </div>
              
              {/* Title & Meta */}
              <div className="min-w-0 flex-1">
                <h3 className="font-medium leading-tight text-foreground line-clamp-2">
                  {result.document.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{docTypeLabel}</span>
                  <span>•</span>
                  <span>{result.document.pageCount} Seiten</span>
                  <span>•</span>
                  <span>{formatFileSize(result.document.fileSize)}</span>
                </div>
              </div>
            </div>

            {/* Score & Match Type */}
            <div className="flex shrink-0 items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={matchConfig.variant} className="text-xs">
                    {matchConfig.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{matchConfig.description}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold',
                      getScoreColor(result.score)
                    )}
                    aria-label={`Relevanz: ${scorePercentage}%`}
                  >
                    {scorePercentage}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Relevanz: {scorePercentage}%</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Snippet */}
          <div className="mb-3 rounded-md bg-muted/50 p-3">
            <p
              className="text-sm leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: result.highlightedSnippet }}
            />
            {result.articleRef && (
              <p className="mt-2 text-xs font-medium text-primary">
                {result.articleRef}
              </p>
            )}
          </div>

          {/* Metadata Row */}
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(result.document.uploadedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>Seite {result.pageNumbers.join(', ')}</span>
            </div>
            {result.document.matter && (
              <Badge variant="outline" className="text-xs">
                {result.document.matter}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {result.document.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {result.document.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
              {result.document.tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{result.document.tags.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t pt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCitation}
                  className="gap-1.5"
                  aria-label={copied ? 'Zitat kopiert' : 'Zitat kopieren'}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Kopiert
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Zitat kopieren
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dokumentreferenz in die Zwischenablage kopieren</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDocument?.();
              }}
              className="gap-1.5"
            >
              <ExternalLink className="h-4 w-4" />
              Im Dokument anzeigen
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});
