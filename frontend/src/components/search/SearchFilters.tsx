'use client';

/**
 * SearchFilters Component
 * 
 * Filter controls for search results:
 * - Document type (multi-select)
 * - Matter/case (multi-select)
 * - Tags (multi-select)
 * - Date range
 */

import { useState, useEffect } from 'react';
import { Calendar, Filter, Tag, FileType, Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/stores/search';
import { getAllTags, getAllMatters } from '@/lib/mock-data';
import type { DocumentType } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'contract', label: 'Vertrag' },
  { value: 'correspondence', label: 'Korrespondenz' },
  { value: 'court_decision', label: 'Gerichtsentscheid' },
  { value: 'legislation', label: 'Gesetzgebung' },
  { value: 'memo', label: 'Memo' },
  { value: 'other', label: 'Sonstiges' },
];

// ============================================================================
// Component
// ============================================================================

export function SearchFilters() {
  const { filters, updateFilter, clearFilters } = useSearchStore();
  
  // Local state for date inputs
  const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? '');
  const [dateTo, setDateTo] = useState(filters.dateTo ?? '');

  // Get available tags and matters from the mock data
  const availableTags = getAllTags();
  const availableMatters = getAllMatters();

  // Sync local date state with store
  useEffect(() => {
    setDateFrom(filters.dateFrom ?? '');
    setDateTo(filters.dateTo ?? '');
  }, [filters.dateFrom, filters.dateTo]);

  /**
   * Count active filters for the summary badge.
   */
  const activeFilterCount = [
    filters.documentTypes?.length ?? 0,
    filters.matters?.length ?? 0,
    filters.tags?.length ?? 0,
    filters.dateFrom ? 1 : 0,
    filters.dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  /**
   * Toggle document type in the filter.
   */
  const handleDocumentTypeToggle = (type: DocumentType, checked: boolean) => {
    const current = filters.documentTypes ?? [];
    const updated = checked 
      ? [...current, type] 
      : current.filter((t) => t !== type);
    updateFilter('documentTypes', updated.length > 0 ? updated : undefined);
  };

  /**
   * Toggle matter in the filter.
   */
  const handleMatterToggle = (matter: string, checked: boolean) => {
    const current = filters.matters ?? [];
    const updated = checked 
      ? [...current, matter] 
      : current.filter((m) => m !== matter);
    updateFilter('matters', updated.length > 0 ? updated : undefined);
  };

  /**
   * Toggle tag in the filter.
   */
  const handleTagToggle = (tag: string, checked: boolean) => {
    const current = filters.tags ?? [];
    const updated = checked 
      ? [...current, tag] 
      : current.filter((t) => t !== tag);
    updateFilter('tags', updated.length > 0 ? updated : undefined);
  };

  /**
   * Handle date range changes.
   */
  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setDateFrom(value);
      updateFilter('dateFrom', value || undefined);
    } else {
      setDateTo(value);
      updateFilter('dateTo', value || undefined);
    }
  };

  /**
   * Clear a specific filter type.
   */
  const clearSpecificFilter = (filterKey: keyof typeof filters) => {
    updateFilter(filterKey, undefined);
    if (filterKey === 'dateFrom') setDateFrom('');
    if (filterKey === 'dateTo') setDateTo('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Document Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              'gap-2',
              (filters.documentTypes?.length ?? 0) > 0 && 'border-primary'
            )}
          >
            <FileType className="h-4 w-4" />
            Dokumenttyp
            {(filters.documentTypes?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {filters.documentTypes!.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Dokumenttyp</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {DOCUMENT_TYPES.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filters.documentTypes?.includes(value) ?? false}
              onCheckedChange={(checked) => handleDocumentTypeToggle(value, checked)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Matter Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              'gap-2',
              (filters.matters?.length ?? 0) > 0 && 'border-primary'
            )}
          >
            <Briefcase className="h-4 w-4" />
            Mandat
            {(filters.matters?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {filters.matters!.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Mandat / Akte</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableMatters.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Keine Mandate verfügbar
            </div>
          ) : (
            availableMatters.map(({ id, label }) => (
              <DropdownMenuCheckboxItem
                key={id}
                checked={filters.matters?.includes(id) ?? false}
                onCheckedChange={(checked) => handleMatterToggle(id, checked)}
              >
                <span className="truncate">{label}</span>
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tags Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              'gap-2',
              (filters.tags?.length ?? 0) > 0 && 'border-primary'
            )}
          >
            <Tag className="h-4 w-4" />
            Tags
            {(filters.tags?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {filters.tags!.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
          <DropdownMenuLabel>Tags</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableTags.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Keine Tags verfügbar
            </div>
          ) : (
            availableTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={filters.tags?.includes(tag) ?? false}
                onCheckedChange={(checked) => handleTagToggle(tag, checked)}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Range Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              'gap-2',
              (filters.dateFrom || filters.dateTo) && 'border-primary'
            )}
          >
            <Calendar className="h-4 w-4" />
            Zeitraum
            {(filters.dateFrom || filters.dateTo) && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                ✓
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-3">
          <DropdownMenuLabel className="px-0">Zeitraum</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label 
                htmlFor="date-from" 
                className="text-xs font-medium text-muted-foreground"
              >
                Von
              </label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="h-8"
                max={dateTo || undefined}
              />
            </div>
            <div className="space-y-1.5">
              <label 
                htmlFor="date-to" 
                className="text-xs font-medium text-muted-foreground"
              >
                Bis
              </label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="h-8"
                min={dateFrom || undefined}
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  clearSpecificFilter('dateFrom');
                  clearSpecificFilter('dateTo');
                }}
              >
                Zeitraum löschen
              </Button>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear All Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Filter zurücksetzen ({activeFilterCount})
        </Button>
      )}

      {/* Active Filters Summary (shown on larger screens) */}
      {activeFilterCount > 0 && (
        <div className="hidden lg:flex items-center gap-1 ml-2 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" />
          <span>{activeFilterCount} Filter aktiv</span>
        </div>
      )}
    </div>
  );
}
