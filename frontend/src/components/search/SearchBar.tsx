'use client';

/**
 * SearchBar Component
 * 
 * Full-featured search input with:
 * - Search mode selector (Hybrid/Semantic/Keyword)
 * - Autocomplete suggestions
 * - Search history
 * - Keyboard navigation (Cmd+K to focus, arrows for suggestions)
 * - Loading states
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Search, X, Sparkles, Type, Zap, Clock, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useSearchStore, selectRecentSearches } from '@/stores/search';
import type { SearchMode } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const SEARCH_MODES: { mode: SearchMode; label: string; icon: React.ElementType; description: string }[] = [
  { 
    mode: 'hybrid', 
    label: 'Hybrid', 
    icon: Zap,
    description: 'Kombiniert semantische und Keyword-Suche für beste Ergebnisse'
  },
  { 
    mode: 'semantic', 
    label: 'Semantisch', 
    icon: Sparkles,
    description: 'Findet konzeptionell ähnliche Inhalte'
  },
  { 
    mode: 'keyword', 
    label: 'Exakt', 
    icon: Type,
    description: 'Sucht nach exakten Begriffen und Zitaten'
  },
];

// Debounce delay for suggestions (ms)
const SUGGESTION_DEBOUNCE = 200;

// ============================================================================
// Component Props
// ============================================================================

interface SearchBarProps {
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function SearchBar({ 
  onSearch, 
  placeholder = 'Dokumente durchsuchen...', 
  autoFocus = false,
  className 
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Store state
  const { 
    query, 
    mode, 
    setQuery, 
    setMode, 
    isLoading,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
  } = useSearchStore();
  
  const searchHistory = useSearchStore(selectRecentSearches);
  
  // Local state
  const [localQuery, setLocalQuery] = useState(query);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  // Debounce timer for suggestions
  const suggestionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with store
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // ============================================================================
  // Suggestion Items
  // ============================================================================
  
  /**
   * Combined list of suggestions and history for the dropdown.
   * History is shown when input is empty, suggestions when typing.
   */
  const suggestionItems = useMemo(() => {
    if (localQuery.trim().length === 0) {
      // Show recent searches when input is empty
      return searchHistory.map((entry) => ({
        type: 'history' as const,
        value: entry.query,
        resultCount: entry.resultCount,
      }));
    }
    
    // Show API suggestions when typing
    return suggestions.map((suggestion) => ({
      type: 'suggestion' as const,
      value: suggestion,
    }));
  }, [localQuery, suggestions, searchHistory]);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Fetch suggestions from the API.
   */
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setSuggestions(data.data);
      }
    } catch {
      // Silently fail - suggestions are non-critical
      setSuggestions([]);
    }
  }, [setSuggestions]);

  /**
   * Handle input changes with debounced suggestion fetching.
   */
  const handleInputChange = useCallback((value: string) => {
    setLocalQuery(value);
    setSelectedSuggestionIndex(-1);
    setShowSuggestions(true);

    // Clear existing timer
    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
    }

    // Debounce suggestion fetch
    suggestionTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, SUGGESTION_DEBOUNCE);
  }, [fetchSuggestions, setShowSuggestions]);

  /**
   * Submit the search query.
   */
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedQuery = localQuery.trim();
    
    if (trimmedQuery) {
      setQuery(trimmedQuery);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      onSearch?.(trimmedQuery);
    }
  }, [localQuery, setQuery, setShowSuggestions, onSearch]);

  /**
   * Select a suggestion from the dropdown.
   */
  const handleSelectSuggestion = useCallback((value: string) => {
    setLocalQuery(value);
    setQuery(value);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    onSearch?.(value);
  }, [setQuery, setShowSuggestions, onSearch]);

  /**
   * Clear the search input.
   */
  const handleClear = useCallback(() => {
    setLocalQuery('');
    setQuery('');
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  }, [setQuery, setSuggestions]);

  /**
   * Handle keyboard navigation in the search bar.
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const itemCount = suggestionItems.length;

    switch (e.key) {
      case 'Escape':
        if (showSuggestions) {
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        } else {
          handleClear();
        }
        break;

      case 'ArrowDown':
        if (itemCount > 0) {
          e.preventDefault();
          setShowSuggestions(true);
          setSelectedSuggestionIndex((prev) => 
            prev < itemCount - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        if (itemCount > 0) {
          e.preventDefault();
          setShowSuggestions(true);
          setSelectedSuggestionIndex((prev) => 
            prev > 0 ? prev - 1 : itemCount - 1
          );
        }
        break;

      case 'Enter':
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < itemCount) {
          e.preventDefault();
          handleSelectSuggestion(suggestionItems[selectedSuggestionIndex].value);
        } else {
          handleSubmit(e);
        }
        break;

      case 'Tab':
        if (showSuggestions && itemCount > 0) {
          setShowSuggestions(false);
        }
        break;
    }
  }, [showSuggestions, suggestionItems, selectedSuggestionIndex, setShowSuggestions, handleClear, handleSubmit, handleSelectSuggestion]);

  /**
   * Handle focus on the input.
   */
  const handleFocus = useCallback(() => {
    setShowSuggestions(true);
  }, [setShowSuggestions]);

  /**
   * Handle blur on the input (with delay for click handling).
   */
  const handleBlur = useCallback(() => {
    // Delay to allow click events on suggestions to fire
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, [setShowSuggestions]);

  // ============================================================================
  // Global Keyboard Shortcut
  // ============================================================================

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Cleanup suggestion timer on unmount
  useEffect(() => {
    return () => {
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className={cn('w-full', className)}>
        <div className="flex flex-col gap-3">
          {/* Main Search Input with Suggestions Dropdown */}
          <div className="relative">
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-4 flex items-center">
                <Search className={cn(
                  'h-5 w-5 transition-colors',
                  isLoading ? 'text-primary animate-pulse' : 'text-muted-foreground'
                )} />
              </div>
              
              <Input
                ref={inputRef}
                type="text"
                value={localQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                autoFocus={autoFocus}
                autoComplete="off"
                aria-label="Suchbegriff eingeben"
                aria-expanded={showSuggestions && suggestionItems.length > 0}
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                className={cn(
                  'h-14 pl-12 pr-32 text-lg',
                  'rounded-xl border-2 transition-all',
                  'focus:border-primary focus:ring-2 focus:ring-primary/20',
                  'placeholder:text-muted-foreground/60'
                )}
              />

              <div className="absolute right-2 flex items-center gap-2">
                {localQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="Suche löschen"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  disabled={!localQuery.trim() || isLoading}
                  className="h-10 px-6"
                >
                  {isLoading ? 'Suchen...' : 'Suchen'}
                </Button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestionItems.length > 0 && (
              <div
                ref={suggestionsRef}
                id="search-suggestions"
                role="listbox"
                className={cn(
                  'absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg',
                  'max-h-80 overflow-auto'
                )}
              >
                <Command className="bg-transparent">
                  <CommandList>
                    {localQuery.trim().length === 0 && suggestionItems.length > 0 && (
                      <CommandGroup heading="Letzte Suchen">
                        {suggestionItems.map((item, index) => (
                          <CommandItem
                            key={item.value}
                            value={item.value}
                            onSelect={() => handleSelectSuggestion(item.value)}
                            className={cn(
                              'flex items-center justify-between cursor-pointer',
                              selectedSuggestionIndex === index && 'bg-accent'
                            )}
                            role="option"
                            aria-selected={selectedSuggestionIndex === index}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{item.value}</span>
                            </div>
                            {'resultCount' in item && (
                              <span className="text-xs text-muted-foreground">
                                {item.resultCount} Ergebnisse
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {localQuery.trim().length > 0 && suggestionItems.length > 0 && (
                      <CommandGroup heading="Vorschläge">
                        {suggestionItems.map((item, index) => (
                          <CommandItem
                            key={item.value}
                            value={item.value}
                            onSelect={() => handleSelectSuggestion(item.value)}
                            className={cn(
                              'flex items-center gap-2 cursor-pointer',
                              selectedSuggestionIndex === index && 'bg-accent'
                            )}
                            role="option"
                            aria-selected={selectedSuggestionIndex === index}
                          >
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <span>{item.value}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    <CommandEmpty>Keine Vorschläge</CommandEmpty>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>

          {/* Search Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Suchmodus:</span>
            <div className="flex gap-1">
              {SEARCH_MODES.map(({ mode: m, label, icon: Icon, description }) => (
                <Tooltip key={m} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={mode === m ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode(m)}
                      className={cn(
                        'gap-1.5 transition-all',
                        mode === m && 'shadow-sm'
                      )}
                      aria-pressed={mode === m}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Keyboard Shortcut Hint */}
            <div className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Badge variant="outline" className="font-mono text-[10px]">
                ⌘K
              </Badge>
              <span>zum Fokussieren</span>
            </div>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
}
