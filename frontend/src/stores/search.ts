/**
 * Search State Store
 * 
 * Manages global search state using Zustand.
 */

import { create } from 'zustand';
import type { SearchMode, SearchFilters, SearchResult } from '@/types';

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
  reset: () => void;
}

const initialFilters: SearchFilters = {};

export const useSearchStore = create<SearchStore>((set) => ({
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
    set({ results, totalCount, processingTimeMs, error: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  selectResult: (selectedResultId) => set({ selectedResultId }),
  
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
  }),
}));
