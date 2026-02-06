/**
 * Search API Route
 * 
 * Handles search requests from the frontend.
 * Uses the search engine for scoring and filtering.
 * 
 * In production, this would connect to Weaviate for hybrid search.
 * Currently uses the mock implementation with local scoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SearchQuery, SearchResponse } from '@/types';
import { performSearch, getSuggestions as getSearchSuggestions } from '@/lib/search-engine';

/**
 * POST /api/search
 * 
 * Execute a search query against the document corpus.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SearchQuery;
    const { query, mode, filters, limit = 20, offset = 0 } = body;

    // Validate query
    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        error: {
          code: 'INVALID_QUERY',
          message: 'Suchbegriff erforderlich',
        },
      }, { status: 400 });
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return NextResponse.json({
        error: {
          code: 'EMPTY_QUERY',
          message: 'Suchbegriff darf nicht leer sein',
        },
      }, { status: 400 });
    }

    if (trimmedQuery.length < 2) {
      return NextResponse.json({
        error: {
          code: 'QUERY_TOO_SHORT',
          message: 'Suchbegriff muss mindestens 2 Zeichen lang sein',
        },
      }, { status: 400 });
    }

    // Validate mode
    const validModes = ['hybrid', 'semantic', 'keyword'];
    if (mode && !validModes.includes(mode)) {
      return NextResponse.json({
        error: {
          code: 'INVALID_MODE',
          message: 'Ungültiger Suchmodus. Erlaubt: hybrid, semantic, keyword',
        },
      }, { status: 400 });
    }

    // Simulate network latency for realistic demo experience
    // In production, remove this delay
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));

    // Perform the search
    const searchResult = performSearch({
      query: trimmedQuery,
      mode: mode || 'hybrid',
      filters: filters || {},
      limit: Math.min(limit, 100), // Cap at 100 results
      offset: Math.max(offset, 0),
    });

    const response: SearchResponse = {
      results: searchResult.results,
      totalCount: searchResult.totalCount,
      query: {
        query: trimmedQuery,
        mode: mode || 'hybrid',
        filters: filters || {},
        limit,
        offset,
      },
      processingTimeMs: searchResult.processingTimeMs,
      appliedFilters: filters || {},
    };

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Search API error:', error);
    
    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        error: {
          code: 'INVALID_JSON',
          message: 'Ungültiges JSON im Request-Body',
        },
      }, { status: 400 });
    }

    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      },
    }, { status: 500 });
  }
}

/**
 * GET /api/search/suggestions?q=<query>
 * 
 * This endpoint is handled by a separate route file.
 * See: /api/search/suggestions/route.ts
 */
