/**
 * Search Suggestions API Route
 * 
 * Returns autocomplete suggestions based on partial query input.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/search-engine';

/**
 * GET /api/search/suggestions?q=<query>&limit=<number>
 * 
 * Get search suggestions for autocomplete.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ data: [] });
    }

    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 10) : 5;
    const suggestions = getSuggestions(query.trim(), limit);

    return NextResponse.json({ data: suggestions });
  } catch (error) {
    console.error('Suggestions API error:', error);
    
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Fehler beim Laden der Vorschläge',
      },
    }, { status: 500 });
  }
}
