'use client';

import { useState } from 'react';
import { Calendar, Filter, Tag, FileType, User, X } from 'lucide-react';
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
import type { DocumentType } from '@/types';

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'contract', label: 'Vertrag' },
  { value: 'correspondence', label: 'Korrespondenz' },
  { value: 'court_decision', label: 'Gerichtsentscheid' },
  { value: 'legislation', label: 'Gesetzgebung' },
  { value: 'memo', label: 'Memo' },
  { value: 'other', label: 'Sonstiges' },
];

// Mock data - replace with actual data from API
const availableMatters = [
  { id: '2024-001', label: 'Meier vs. Müller' },
  { id: '2024-002', label: 'Immobilienkauf Zürich' },
  { id: '2024-003', label: 'Arbeitsrecht Beratung' },
  { id: '2023-045', label: 'Erbschaftssache Schmidt' },
];

const availableTags = [
  'Dringend',
  'Wichtig',
  'Archiv',
  'In Prüfung',
  'Mietrecht',
  'Arbeitsrecht',
  'Vertragsrecht',
];

export function SearchFilters() {
  const { filters, updateFilter, clearFilters } = useSearchStore();
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
  const [dateTo, setDateTo] = useState(filters.dateTo || '');

  const activeFilterCount = [
    filters.documentTypes?.length ?? 0,
    filters.matters?.length ?? 0,
    filters.tags?.length ?? 0,
    filters.dateFrom ? 1 : 0,
    filters.dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleDocumentTypeToggle = (type: DocumentType, checked: boolean) => {
    const current = filters.documentTypes || [];
    const updated = checked 
      ? [...current, type] 
      : current.filter((t) => t !== type);
    updateFilter('documentTypes', updated.length > 0 ? updated : undefined);
  };

  const handleMatterToggle = (matter: string, checked: boolean) => {
    const current = filters.matters || [];
    const updated = checked 
      ? [...current, matter] 
      : current.filter((m) => m !== matter);
    updateFilter('matters', updated.length > 0 ? updated : undefined);
  };

  const handleTagToggle = (tag: string, checked: boolean) => {
    const current = filters.tags || [];
    const updated = checked 
      ? [...current, tag] 
      : current.filter((t) => t !== tag);
    updateFilter('tags', updated.length > 0 ? updated : undefined);
  };

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setDateFrom(value);
      updateFilter('dateFrom', value || undefined);
    } else {
      setDateTo(value);
      updateFilter('dateTo', value || undefined);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Document Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
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
          {documentTypes.map(({ value, label }) => (
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
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
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
          {availableMatters.map(({ id, label }) => (
            <DropdownMenuCheckboxItem
              key={id}
              checked={filters.matters?.includes(id) ?? false}
              onCheckedChange={(checked) => handleMatterToggle(id, checked)}
            >
              <span className="truncate">{label}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tags Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Tag className="h-4 w-4" />
            Tags
            {(filters.tags?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {filters.tags!.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Tags</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableTags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag}
              checked={filters.tags?.includes(tag) ?? false}
              onCheckedChange={(checked) => handleTagToggle(tag, checked)}
            >
              {tag}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Range Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
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
              <label className="text-xs font-medium text-muted-foreground">Von</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Bis</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
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
    </div>
  );
}
