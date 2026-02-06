'use client';

import { FileText, Calendar, Tag, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
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
import type { SearchResult } from '@/types';

interface ResultCardProps {
  result: SearchResult;
  isSelected?: boolean;
  onSelect?: () => void;
  onViewDocument?: () => void;
}

const documentTypeLabels: Record<string, string> = {
  contract: 'Vertrag',
  correspondence: 'Korrespondenz',
  court_decision: 'Gerichtsentscheid',
  legislation: 'Gesetzgebung',
  memo: 'Memo',
  other: 'Sonstiges',
};

const matchTypeBadges: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  semantic: { label: 'Semantisch', variant: 'secondary' },
  keyword: { label: 'Exakt', variant: 'outline' },
  both: { label: 'Hybrid', variant: 'default' },
};

export function ResultCard({ result, isSelected, onSelect, onViewDocument }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCitation = async () => {
    const citation = `${result.document.title}${result.articleRef ? `, ${result.articleRef}` : ''} (S. ${result.pageNumbers.join(', ')})`;
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const scorePercentage = Math.round(result.score * 100);
  const matchBadge = matchTypeBadges[result.matchType];

  return (
    <TooltipProvider>
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          isSelected && 'ring-2 ring-primary'
        )}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          {/* Header Row */}
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium leading-tight text-foreground line-clamp-1">
                  {result.document.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{documentTypeLabels[result.document.type] || result.document.type}</span>
                  <span>•</span>
                  <span>{result.document.pageCount} Seiten</span>
                  <span>•</span>
                  <span>{formatFileSize(result.document.fileSize)}</span>
                </div>
              </div>
            </div>

            {/* Score & Match Type */}
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={matchBadge.variant} className="text-xs">
                {matchBadge.label}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                      scorePercentage >= 80
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : scorePercentage >= 60
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-muted text-muted-foreground'
                    )}
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
              {result.document.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t pt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCitation();
                  }}
                  className="gap-1.5"
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
}
