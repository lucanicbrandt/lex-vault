'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Type, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/stores/search';
import type { SearchMode } from '@/types';

const searchModes: { mode: SearchMode; label: string; icon: React.ElementType; description: string }[] = [
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

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({ 
  onSearch, 
  placeholder = 'Dokumente durchsuchen...', 
  autoFocus = false,
  className 
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, mode, setQuery, setMode, isLoading } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);

  // Sync local state with store
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedQuery = localQuery.trim();
    if (trimmedQuery) {
      setQuery(trimmedQuery);
      onSearch?.(trimmedQuery);
    }
  }, [localQuery, setQuery, onSearch]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    setQuery('');
    inputRef.current?.focus();
  }, [setQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  // Keyboard shortcut: Cmd/Ctrl + K to focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className={cn('w-full', className)}>
        <div className="flex flex-col gap-3">
          {/* Main Search Input */}
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
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus={autoFocus}
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
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Löschen</span>
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

          {/* Search Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Suchmodus:</span>
            <div className="flex gap-1">
              {searchModes.map(({ mode: m, label, icon: Icon, description }) => (
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
