/**
 * Search Engine
 * 
 * Core search logic with scoring algorithms.
 * Implements hybrid search combining BM25 (keyword) and semantic similarity.
 * 
 * In production, this connects to Weaviate. For development/demo,
 * uses the mock data with local scoring algorithms.
 */

import type { SearchFilters, SearchMode, SearchResult, Document, DocumentType } from '@/types';
import { mockDocuments, mockChunks, type DocumentChunk } from './mock-data';

// ============================================================================
// Types
// ============================================================================

export interface SearchOptions {
  query: string;
  mode: SearchMode;
  filters: SearchFilters;
  limit: number;
  offset: number;
}

export interface SearchEngineResult {
  results: SearchResult[];
  totalCount: number;
  processingTimeMs: number;
}

// ============================================================================
// Swiss Legal Citation Patterns
// ============================================================================

/**
 * Patterns for detecting Swiss legal citations in queries.
 * When detected, the search engine boosts exact keyword matching.
 */
const CITATION_PATTERNS = {
  // Federal Supreme Court: BGE 142 III 91
  federalCourt: /\bBGE\s*\d{1,3}\s*[IV]+\s*\d+/gi,
  // Article references: Art. 261 OR, Art. 28 ZGB
  articleRef: /\bArt\.?\s*\d+[a-z]?(\s+Abs\.?\s*\d+)?(\s+[A-Z]{2,4})?\b/gi,
  // SR numbers: SR 220
  srNumber: /\bSR\s*\d{3}(\.\d+)?\b/gi,
  // Cantonal court: Obergericht ZH
  cantonalCourt: /\b(Obergericht|Kantonsgericht|Handelsgericht)\s+[A-Z]{2}\b/gi,
};

/**
 * Detect if a query contains legal citations.
 * Returns the types of citations found.
 */
function detectCitations(query: string): string[] {
  const found: string[] = [];
  
  if (CITATION_PATTERNS.federalCourt.test(query)) {
    found.push('federal_court');
    // Reset lastIndex after test
    CITATION_PATTERNS.federalCourt.lastIndex = 0;
  }
  if (CITATION_PATTERNS.articleRef.test(query)) {
    found.push('article');
    CITATION_PATTERNS.articleRef.lastIndex = 0;
  }
  if (CITATION_PATTERNS.srNumber.test(query)) {
    found.push('sr_number');
    CITATION_PATTERNS.srNumber.lastIndex = 0;
  }
  if (CITATION_PATTERNS.cantonalCourt.test(query)) {
    found.push('cantonal_court');
    CITATION_PATTERNS.cantonalCourt.lastIndex = 0;
  }
  
  return found;
}

// ============================================================================
// Text Processing
// ============================================================================

/**
 * German stop words to exclude from term matching.
 */
const STOP_WORDS = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'einem', 'einen',
  'und', 'oder', 'aber', 'doch', 'sondern', 'weil', 'wenn', 'dass', 'ob',
  'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'wurde', 'wurden',
  'hat', 'haben', 'hatte', 'hatten', 'kann', 'können', 'konnte', 'konnten',
  'muss', 'müssen', 'musste', 'mussten', 'soll', 'sollen', 'sollte', 'sollten',
  'im', 'in', 'an', 'auf', 'aus', 'bei', 'mit', 'nach', 'von', 'zu', 'zum', 'zur',
  'für', 'über', 'unter', 'vor', 'hinter', 'neben', 'zwischen',
  'nicht', 'auch', 'nur', 'noch', 'schon', 'sehr', 'mehr', 'als', 'so', 'wie',
  'sich', 'es', 'er', 'sie', 'wir', 'ihr', 'sie', 'man',
  'dieser', 'diese', 'dieses', 'jener', 'jene', 'jenes', 'welcher', 'welche', 'welches',
]);

/**
 * Tokenize and normalize text for searching.
 * - Lowercases text
 * - Splits on whitespace and punctuation
 * - Removes stop words
 * - Filters short tokens
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s.,;:!?()\[\]{}"'«»„"]+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

/**
 * Calculate term frequency (TF) for a token in a document.
 */
function termFrequency(token: string, tokens: string[]): number {
  const count = tokens.filter((t) => t === token).length;
  // Log-normalized TF
  return count > 0 ? 1 + Math.log(count) : 0;
}

/**
 * Calculate inverse document frequency (IDF) for a token.
 * Uses the entire corpus of chunks.
 */
function inverseDocumentFrequency(token: string, allChunkTokens: string[][]): number {
  const docsWithToken = allChunkTokens.filter((tokens) => tokens.includes(token)).length;
  if (docsWithToken === 0) return 0;
  return Math.log(allChunkTokens.length / docsWithToken);
}

// ============================================================================
// Scoring Algorithms
// ============================================================================

/**
 * Calculate BM25 score for keyword matching.
 * BM25 is a probabilistic ranking function used by search engines.
 * 
 * Parameters:
 * - k1: Term frequency saturation (typically 1.2-2.0)
 * - b: Document length normalization (typically 0.75)
 */
function calculateBM25Score(
  queryTokens: string[],
  chunkTokens: string[],
  allChunkTokens: string[][],
  k1 = 1.5,
  b = 0.75
): number {
  const avgDocLength = allChunkTokens.reduce((sum, t) => sum + t.length, 0) / allChunkTokens.length;
  const docLength = chunkTokens.length;
  
  let score = 0;
  
  for (const queryToken of queryTokens) {
    const tf = chunkTokens.filter((t) => t === queryToken).length;
    if (tf === 0) continue;
    
    const idf = inverseDocumentFrequency(queryToken, allChunkTokens);
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
    
    score += idf * (numerator / denominator);
  }
  
  return score;
}

/**
 * Calculate semantic similarity using term overlap and fuzzy matching.
 * This is a simplified semantic score for the mock implementation.
 * In production, this would use vector embeddings.
 */
function calculateSemanticScore(
  queryTokens: string[],
  chunkTokens: string[],
  content: string
): number {
  if (queryTokens.length === 0) return 0;
  
  const chunkTokenSet = new Set(chunkTokens);
  const contentLower = content.toLowerCase();
  
  let matchCount = 0;
  let partialMatchCount = 0;
  
  for (const queryToken of queryTokens) {
    // Exact token match
    if (chunkTokenSet.has(queryToken)) {
      matchCount++;
      continue;
    }
    
    // Partial match (token contained in chunk token or vice versa)
    for (const chunkToken of chunkTokens) {
      if (chunkToken.includes(queryToken) || queryToken.includes(chunkToken)) {
        partialMatchCount++;
        break;
      }
    }
    
    // Check if the query token appears as a substring in the content
    if (contentLower.includes(queryToken)) {
      partialMatchCount += 0.5;
    }
  }
  
  // Weighted combination of exact and partial matches
  const exactWeight = 1.0;
  const partialWeight = 0.3;
  
  return (matchCount * exactWeight + partialMatchCount * partialWeight) / queryTokens.length;
}

/**
 * Apply boosts based on document metadata and context.
 */
function calculateBoosts(
  document: Document,
  chunk: DocumentChunk,
  queryLower: string,
  citationTypes: string[]
): number {
  let boost = 1.0;
  
  // Boost court decisions when query contains BGE citation
  if (citationTypes.includes('federal_court') && document.type === 'court_decision') {
    boost *= 1.5;
    // Extra boost if the case number matches
    if (document.metadata.caseNumber && queryLower.includes(document.metadata.caseNumber.toLowerCase())) {
      boost *= 2.0;
    }
  }
  
  // Boost legislation when query contains article references
  if (citationTypes.includes('article') && (document.type === 'legislation' || chunk.articleRef)) {
    boost *= 1.3;
    // Check if the article reference in the chunk matches the query
    if (chunk.articleRef) {
      const articleRefLower = chunk.articleRef.toLowerCase();
      if (queryLower.includes(articleRefLower) || 
          articleRefLower.split(' ').some((part) => queryLower.includes(part) && part.length > 2)) {
        boost *= 1.5;
      }
    }
  }
  
  // Boost recent documents slightly
  const uploadedDate = new Date(document.uploadedAt);
  const daysSinceUpload = (Date.now() - uploadedDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpload < 30) {
    boost *= 1.1;
  }
  
  // Boost documents tagged as "Wichtig"
  if (document.tags.includes('Wichtig')) {
    boost *= 1.15;
  }
  
  return boost;
}

// ============================================================================
// Filter Application
// ============================================================================

/**
 * Check if a document passes the given filters.
 */
function passesFilters(document: Document, filters: SearchFilters): boolean {
  // Document type filter
  if (filters.documentTypes && filters.documentTypes.length > 0) {
    if (!filters.documentTypes.includes(document.type)) {
      return false;
    }
  }
  
  // Matter filter
  if (filters.matters && filters.matters.length > 0) {
    if (!document.matter || !filters.matters.includes(document.matter)) {
      return false;
    }
  }
  
  // Tags filter (document must have at least one of the selected tags)
  if (filters.tags && filters.tags.length > 0) {
    if (!filters.tags.some((tag) => document.tags.includes(tag))) {
      return false;
    }
  }
  
  // Date range filter (based on upload date)
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    const uploadDate = new Date(document.uploadedAt);
    if (uploadDate < fromDate) {
      return false;
    }
  }
  
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999); // Include the entire day
    const uploadDate = new Date(document.uploadedAt);
    if (uploadDate > toDate) {
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// Snippet Generation
// ============================================================================

/**
 * Generate a snippet from content, centered around the best match.
 */
function generateSnippet(content: string, queryTokens: string[], maxLength = 250): string {
  const contentLower = content.toLowerCase();
  
  // Find the first occurrence of any query token
  let bestPosition = 0;
  for (const token of queryTokens) {
    const pos = contentLower.indexOf(token);
    if (pos !== -1 && (bestPosition === 0 || pos < bestPosition)) {
      bestPosition = pos;
    }
  }
  
  // Calculate snippet boundaries
  const halfLength = Math.floor(maxLength / 2);
  let start = Math.max(0, bestPosition - halfLength);
  let end = Math.min(content.length, bestPosition + halfLength);
  
  // Adjust to word boundaries
  if (start > 0) {
    const spaceIndex = content.indexOf(' ', start);
    if (spaceIndex !== -1 && spaceIndex < start + 20) {
      start = spaceIndex + 1;
    }
  }
  
  if (end < content.length) {
    const spaceIndex = content.lastIndexOf(' ', end);
    if (spaceIndex !== -1 && spaceIndex > end - 20) {
      end = spaceIndex;
    }
  }
  
  let snippet = content.slice(start, end);
  
  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet;
}

/**
 * Add HTML highlighting to matched terms in the snippet.
 */
function highlightSnippet(snippet: string, queryTokens: string[]): string {
  let highlighted = snippet;
  
  // Sort tokens by length (longest first) to avoid partial replacements
  const sortedTokens = [...queryTokens].sort((a, b) => b.length - a.length);
  
  for (const token of sortedTokens) {
    if (token.length < 3) continue; // Skip very short tokens
    
    // Create a case-insensitive regex that matches the token
    const regex = new RegExp(`(${escapeRegex(token)})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  }
  
  return highlighted;
}

/**
 * Escape special regex characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Main Search Function
// ============================================================================

/**
 * Perform a search across the document corpus.
 * 
 * This is the main entry point for the search engine.
 * It orchestrates filtering, scoring, and result assembly.
 */
export function performSearch(options: SearchOptions): SearchEngineResult {
  const startTime = performance.now();
  
  const { query, mode, filters, limit, offset } = options;
  const queryLower = query.toLowerCase();
  const queryTokens = tokenize(query);
  
  // Detect citation types for boosting
  const citationTypes = detectCitations(query);
  
  // Pre-tokenize all chunks for IDF calculation
  const allChunkTokens = mockChunks.map((chunk) => tokenize(chunk.content));
  
  // Build document lookup map
  const documentMap = new Map<string, Document>();
  for (const doc of mockDocuments) {
    documentMap.set(doc.id, doc);
  }
  
  // Score each chunk
  const scoredChunks: Array<{
    chunk: DocumentChunk;
    document: Document;
    bm25Score: number;
    semanticScore: number;
    finalScore: number;
    matchType: 'semantic' | 'keyword' | 'both';
  }> = [];
  
  for (let i = 0; i < mockChunks.length; i++) {
    const chunk = mockChunks[i];
    const document = documentMap.get(chunk.documentId);
    
    if (!document) continue;
    
    // Apply filters
    if (!passesFilters(document, filters)) continue;
    
    const chunkTokens = allChunkTokens[i];
    
    // Calculate scores based on mode
    let bm25Score = 0;
    let semanticScore = 0;
    
    if (mode === 'keyword' || mode === 'hybrid') {
      bm25Score = calculateBM25Score(queryTokens, chunkTokens, allChunkTokens);
    }
    
    if (mode === 'semantic' || mode === 'hybrid') {
      semanticScore = calculateSemanticScore(queryTokens, chunkTokens, chunk.content);
    }
    
    // Check for exact phrase match (boosts keyword score significantly)
    if (chunk.content.toLowerCase().includes(queryLower)) {
      bm25Score *= 1.5;
    }
    
    // Calculate final score based on mode
    let finalScore: number;
    
    switch (mode) {
      case 'keyword':
        finalScore = bm25Score;
        break;
      case 'semantic':
        finalScore = semanticScore;
        break;
      case 'hybrid':
        // Weighted combination: 60% BM25, 40% semantic
        finalScore = bm25Score * 0.6 + semanticScore * 0.4;
        break;
    }
    
    // Apply boosts
    const boost = calculateBoosts(document, chunk, queryLower, citationTypes);
    finalScore *= boost;
    
    // Only include results with meaningful scores
    if (finalScore > 0.01) {
      // Determine match type
      let matchType: 'semantic' | 'keyword' | 'both';
      if (bm25Score > 0 && semanticScore > 0) {
        matchType = 'both';
      } else if (bm25Score > 0) {
        matchType = 'keyword';
      } else {
        matchType = 'semantic';
      }
      
      scoredChunks.push({
        chunk,
        document,
        bm25Score,
        semanticScore,
        finalScore,
        matchType,
      });
    }
  }
  
  // Sort by final score (descending)
  scoredChunks.sort((a, b) => b.finalScore - a.finalScore);
  
  // Normalize scores to 0-1 range
  const maxScore = scoredChunks.length > 0 ? scoredChunks[0].finalScore : 1;
  
  // Apply pagination
  const totalCount = scoredChunks.length;
  const paginatedChunks = scoredChunks.slice(offset, offset + limit);
  
  // Build search results
  const results: SearchResult[] = paginatedChunks.map((scored) => {
    const snippet = generateSnippet(scored.chunk.content, queryTokens);
    const highlightedSnippet = highlightSnippet(snippet, queryTokens);
    
    // Normalize and slightly randomize score for realistic variation
    const normalizedScore = Math.min(0.99, (scored.finalScore / maxScore) * 0.85 + Math.random() * 0.1 + 0.05);
    
    return {
      id: `${scored.chunk.documentId}-${scored.chunk.chunkIndex}`,
      documentId: scored.chunk.documentId,
      document: scored.document,
      content: scored.chunk.content,
      snippet,
      highlightedSnippet,
      score: normalizedScore,
      pageNumbers: scored.chunk.pageNumbers,
      articleRef: scored.chunk.articleRef,
      matchType: scored.matchType,
    };
  });
  
  const processingTimeMs = Math.round(performance.now() - startTime);
  
  return {
    results,
    totalCount,
    processingTimeMs,
  };
}

// ============================================================================
// Search Suggestions
// ============================================================================

/**
 * Common Swiss legal search terms for autocomplete suggestions.
 */
const LEGAL_SUGGESTIONS = [
  // Mietrecht
  'Kündigung Mietvertrag',
  'Kündigungsfrist',
  'Mängelrüge Miete',
  'Mietzinserhöhung',
  'Nebenkosten',
  'Art. 261 OR',
  'Art. 271 OR',
  'Art. 257d OR',
  'BGE 142 III 91',
  // Arbeitsrecht
  'Arbeitsvertrag Kündigung',
  'missbräuchliche Kündigung',
  'Probezeit',
  'Arbeitszeugnis',
  'Konkurrenzverbot',
  'Art. 336 OR',
  'Art. 337 OR',
  'BGE 138 III 59',
  // Datenschutz
  'Datenschutz Einwilligung',
  'Personendaten',
  'Auskunftsrecht',
  'DSG Art. 25',
  'DSGVO',
  // Vertragsrecht
  'Kaufvertrag',
  'Werkvertrag',
  'Sachmängel',
  'Gewährleistung',
  // Erbrecht
  'Pflichtteil',
  'Testament',
  'Erbvertrag',
  'Erbschaftssteuer',
  'Art. 471 ZGB',
  // Gesellschaftsrecht
  'GmbH Gründung',
  'Gesellschaftsvertrag',
  'Stammanteile',
  'Geschäftsführung',
];

/**
 * Get search suggestions based on partial query.
 */
export function getSuggestions(query: string, limit = 5): string[] {
  if (!query || query.length < 2) return [];
  
  const queryLower = query.toLowerCase();
  
  // Filter suggestions that start with or contain the query
  const matches = LEGAL_SUGGESTIONS.filter((suggestion) => {
    const suggestionLower = suggestion.toLowerCase();
    return suggestionLower.startsWith(queryLower) || suggestionLower.includes(queryLower);
  });
  
  // Sort by relevance (starts with > contains)
  matches.sort((a, b) => {
    const aStarts = a.toLowerCase().startsWith(queryLower);
    const bStarts = b.toLowerCase().startsWith(queryLower);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.length - b.length;
  });
  
  return matches.slice(0, limit);
}
