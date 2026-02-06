import { NextRequest, NextResponse } from 'next/server';
import type { SearchQuery, SearchResponse, SearchResult, Document } from '@/types';

/**
 * Mock Search API
 * 
 * This provides realistic mock data for development and demos.
 * Replace with actual Weaviate integration in production.
 */

// Mock documents database
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    tenantId: 'demo',
    title: 'Mietvertrag Geschäftsräume Zürich',
    filename: 'mietvertrag_zuerich_2024.pdf',
    type: 'contract',
    status: 'ready',
    pageCount: 24,
    fileSize: 2456000,
    mimeType: 'application/pdf',
    matter: '2024-001',
    tags: ['Mietrecht', 'Wichtig'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T10:35:00Z',
    metadata: {
      language: 'de',
      parties: ['ABC GmbH', 'Immobilien AG'],
    },
  },
  {
    id: 'doc-2',
    tenantId: 'demo',
    title: 'BGE 142 III 91 - Kündigungsschutz Mietrecht',
    filename: 'bge_142_iii_91.pdf',
    type: 'court_decision',
    status: 'ready',
    pageCount: 18,
    fileSize: 1234000,
    mimeType: 'application/pdf',
    tags: ['Mietrecht', 'Bundesgericht'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-10T14:20:00Z',
    processedAt: '2024-01-10T14:22:00Z',
    metadata: {
      language: 'de',
      caseNumber: 'BGE 142 III 91',
      jurisdiction: 'Bundesgericht',
    },
  },
  {
    id: 'doc-3',
    tenantId: 'demo',
    title: 'Obligationenrecht (OR) - Auszug Art. 253-304',
    filename: 'or_mietrecht_auszug.pdf',
    type: 'legislation',
    status: 'ready',
    pageCount: 45,
    fileSize: 3200000,
    mimeType: 'application/pdf',
    tags: ['Gesetzgebung', 'Mietrecht'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-05T09:00:00Z',
    processedAt: '2024-01-05T09:10:00Z',
    metadata: {
      language: 'de',
    },
  },
  {
    id: 'doc-4',
    tenantId: 'demo',
    title: 'Arbeitsvertrag Kader - Vorlage 2024',
    filename: 'arbeitsvertrag_kader_vorlage.pdf',
    type: 'contract',
    status: 'ready',
    pageCount: 12,
    fileSize: 890000,
    mimeType: 'application/pdf',
    matter: '2024-003',
    tags: ['Arbeitsrecht', 'Vorlage'],
    uploadedBy: 'user-2',
    uploadedAt: '2024-01-20T11:00:00Z',
    processedAt: '2024-01-20T11:05:00Z',
    metadata: {
      language: 'de',
    },
  },
  {
    id: 'doc-5',
    tenantId: 'demo',
    title: 'Rechtsgutachten Datenschutz DSGVO/DSG',
    filename: 'gutachten_datenschutz_2024.pdf',
    type: 'memo',
    status: 'ready',
    pageCount: 35,
    fileSize: 1890000,
    mimeType: 'application/pdf',
    matter: '2024-002',
    tags: ['Datenschutz', 'DSGVO', 'Wichtig'],
    uploadedBy: 'user-1',
    uploadedAt: '2024-02-01T15:30:00Z',
    processedAt: '2024-02-01T15:40:00Z',
    metadata: {
      language: 'de',
      author: 'Dr. Anna Weber',
    },
  },
];

// Mock search results with content
const mockChunks: Record<string, { content: string; articleRef?: string; pageNumbers: number[] }[]> = {
  'doc-1': [
    {
      content: 'Der Vermieter kann das Mietverhältnis kündigen, wenn der Mieter mit der Zahlung des Mietzinses oder der Nebenkosten im Rückstand ist. Die Kündigung ist nur gültig, wenn sie schriftlich erfolgt und die gesetzlichen Fristen einhält.',
      articleRef: 'Art. 8 Abs. 2',
      pageNumbers: [8],
    },
    {
      content: 'Die Kündigungsfrist beträgt für Geschäftsräume sechs Monate auf einen ortsüblichen Termin. Die Kündigung muss dem Mieter spätestens am letzten Tag vor Beginn der Kündigungsfrist zugegangen sein.',
      articleRef: 'Art. 10 Abs. 1',
      pageNumbers: [10, 11],
    },
  ],
  'doc-2': [
    {
      content: 'Das Bundesgericht bestätigt, dass eine Kündigung nur dann missbräuchlich ist, wenn sie gegen Treu und Glauben verstösst. Der blosse Umstand, dass der Vermieter Eigenbedarf geltend macht, genügt nicht für die Annahme einer Missbräuchlichkeit.',
      pageNumbers: [4, 5],
    },
    {
      content: 'Erwägung 3.2: Bei der Prüfung der Kündigungsanfechtung ist zu berücksichtigen, ob der Vermieter seinen Eigenbedarf substantiiert dargelegt hat und ob dieser plausibel erscheint.',
      pageNumbers: [7],
    },
  ],
  'doc-3': [
    {
      content: 'Art. 261 OR: Veräussert der Vermieter die Sache oder wird sie ihm in einem Schuldbetreibungs- oder Konkursverfahren entzogen, so geht das Mietverhältnis mit dem Eigentum auf den Erwerber über.',
      articleRef: 'Art. 261 OR',
      pageNumbers: [15],
    },
    {
      content: 'Art. 271 OR: Die Kündigung ist anfechtbar, wenn sie gegen den Grundsatz von Treu und Glauben verstösst. Die Anfechtung muss innert 30 Tagen nach Empfang der Kündigung bei der Schlichtungsbehörde eingereicht werden.',
      articleRef: 'Art. 271 OR',
      pageNumbers: [22],
    },
  ],
  'doc-4': [
    {
      content: 'Die Kündigungsfrist beträgt für Kadermitarbeiter drei Monate auf das Ende eines Kalendermonats. Während der Probezeit kann das Arbeitsverhältnis jederzeit mit einer Frist von sieben Tagen gekündigt werden.',
      articleRef: 'Ziffer 8',
      pageNumbers: [5],
    },
  ],
  'doc-5': [
    {
      content: 'Nach Art. 6 DSG dürfen Personendaten nur rechtmässig bearbeitet werden. Die Bearbeitung muss verhältnismässig sein und für die betroffenen Personen erkennbar erfolgen.',
      articleRef: 'Kapitel 3.1',
      pageNumbers: [12],
    },
  ],
};

function simulateSearch(query: string, filters: SearchQuery['filters']): SearchResult[] {
  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const doc of mockDocuments) {
    // Apply filters
    if (filters.documentTypes?.length && !filters.documentTypes.includes(doc.type)) {
      continue;
    }
    if (filters.matters?.length && doc.matter && !filters.matters.includes(doc.matter)) {
      continue;
    }
    if (filters.tags?.length && !filters.tags.some(tag => doc.tags.includes(tag))) {
      continue;
    }

    // Check chunks for matches
    const chunks = mockChunks[doc.id] || [];
    for (const chunk of chunks) {
      const contentLower = chunk.content.toLowerCase();
      const titleLower = doc.title.toLowerCase();

      // Simple relevance scoring
      let score = 0;
      let matchType: 'semantic' | 'keyword' | 'both' = 'semantic';

      // Exact keyword match
      if (contentLower.includes(queryLower) || titleLower.includes(queryLower)) {
        score += 0.4;
        matchType = 'keyword';
      }

      // Term overlap (simplified semantic)
      const queryTerms = queryLower.split(/\s+/);
      const contentTerms = contentLower.split(/\s+/);
      const matchingTerms = queryTerms.filter(term => 
        contentTerms.some(ct => ct.includes(term) || term.includes(ct))
      );
      score += (matchingTerms.length / queryTerms.length) * 0.4;

      // Boost for article references
      if (chunk.articleRef && queryLower.includes('art')) {
        score += 0.1;
      }

      // Boost for specific document types
      if (doc.type === 'court_decision' && (queryLower.includes('bge') || queryLower.includes('bundesgericht'))) {
        score += 0.15;
      }

      if (score > 0.2) {
        // Highlight matching terms in snippet
        let highlightedSnippet = chunk.content;
        queryTerms.forEach(term => {
          if (term.length > 2) {
            const regex = new RegExp(`(${term})`, 'gi');
            highlightedSnippet = highlightedSnippet.replace(regex, '<mark>$1</mark>');
          }
        });

        if (matchingTerms.length > 0 && contentLower.includes(queryLower)) {
          matchType = 'both';
        } else if (matchingTerms.length > queryTerms.length / 2) {
          matchType = 'semantic';
        }

        results.push({
          id: `${doc.id}-${chunk.pageNumbers[0]}`,
          documentId: doc.id,
          document: doc,
          content: chunk.content,
          snippet: chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''),
          highlightedSnippet,
          score: Math.min(score + Math.random() * 0.1, 0.99),
          pageNumbers: chunk.pageNumbers,
          articleRef: chunk.articleRef,
          matchType,
        });
      }
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchQuery = await request.json();
    const { query, filters, limit = 20, offset = 0 } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        error: {
          code: 'INVALID_QUERY',
          message: 'Suchbegriff erforderlich',
        },
      }, { status: 400 });
    }

    // Simulate processing time
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

    const allResults = simulateSearch(query.trim(), filters);
    const paginatedResults = allResults.slice(offset, offset + limit);
    const processingTimeMs = Date.now() - startTime;

    const response: SearchResponse = {
      results: paginatedResults,
      totalCount: allResults.length,
      query: body,
      processingTimeMs,
      appliedFilters: filters,
    };

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ein interner Fehler ist aufgetreten',
      },
    }, { status: 500 });
  }
}
