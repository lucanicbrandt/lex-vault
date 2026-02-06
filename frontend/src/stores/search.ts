/**
 * Search State Store
 * 
 * Manages global search state using Zustand.
 * Includes search history, loading states, and filter persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchMode, SearchFilters, SearchResult } from '@/types';

/**
 * Search history entry for recent searches.
 */
export interface SearchHistoryEntry {
  query: string;
  timestamp: number;
  resultCount: number;
}

/**
 * Search store state and actions.
 */
interface SearchStore {
  // State
  query: string;
  mode: SearchMode;
  filters: SearchFilters;
  results: SearchResult[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  selectedResultId: string | null;
  processingTimeMs: number | null;
  
  // Search history (persisted)
  searchHistory: SearchHistoryEntry[];
  
  // Suggestions state
  suggestions: string[];
  showSuggestions: boolean;

  // Actions
  setQuery: (query: string) => void;
  setMode: (mode: SearchMode) => void;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  clearFilters: () => void;
  setResults: (results: SearchResult[], totalCount: number, processingTimeMs: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  selectResult: (resultId: string | null) => void;
  
  // History actions
  addToHistory: (query: string, resultCount: number) => void;
  clearHistory: () => void;
  
  // Suggestion actions
  setSuggestions: (suggestions: string[]) => void;
  setShowSuggestions: (show: boolean) => void;
  
  // Reset
  reset: () => void;
}

const initialFilters: SearchFilters = {};

const MAX_HISTORY_ENTRIES = 20;

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      query: '',
      mode: 'hybrid',
      filters: initialFilters,
      results: [],
      totalCount: 0,
      isLoading: false,
      error: null,
      selectedResultId: null,
      processingTimeMs: null,
      searchHistory: [],
      suggestions: [],
      showSuggestions: false,

      // Actions
      setQuery: (query) => set({ query }),
      
      setMode: (mode) => set({ mode }),
      
      setFilters: (filters) => set({ filters }),
      
      updateFilter: (key, value) => 
        set((state) => ({
          filters: { ...state.filters, [key]: value }
        })),
      
      clearFilters: () => set({ filters: initialFilters }),
      
      setResults: (results, totalCount, processingTimeMs) => 
        set({ results, totalCount, processingTimeMs, error: null, isLoading: false }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      selectResult: (selectedResultId) => set({ selectedResultId }),
      
      // History actions
      addToHistory: (query, resultCount) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        
        set((state) => {
          // Remove duplicate if exists
          const filteredHistory = state.searchHistory.filter(
            (entry) => entry.query.toLowerCase() !== trimmedQuery.toLowerCase()
          );
          
          // Add new entry at the beginning
          const newHistory: SearchHistoryEntry[] = [
            {
              query: trimmedQuery,
              timestamp: Date.now(),
              resultCount,
            },
            ...filteredHistory,
          ].slice(0, MAX_HISTORY_ENTRIES);
          
          return { searchHistory: newHistory };
        });
      },
      
      clearHistory: () => set({ searchHistory: [] }),
      
      // Suggestion actions
      setSuggestions: (suggestions) => set({ suggestions }),
      setShowSuggestions: (showSuggestions) => set({ showSuggestions }),
      
      // Reset
      reset: () => set({
        query: '',
        mode: 'hybrid',
        filters: initialFilters,
        results: [],
        totalCount: 0,
        isLoading: false,
        error: null,
        selectedResultId: null,
        processingTimeMs: null,
        suggestions: [],
        showSuggestions: false,
      }),
    }),
    {
      name: 'lexvault-search',
      // Only persist these fields
      partialize: (state) => ({
        mode: state.mode,
        filters: state.filters,
        searchHistory: state.searchHistory,
      }),
    }
  )
);

/**
 * Selector for getting recent search history (last 5 entries).
 */
export const selectRecentSearches = (state: SearchStore): SearchHistoryEntry[] => 
  state.searchHistory.slice(0, 5);
