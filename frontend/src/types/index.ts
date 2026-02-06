/**
 * LexVault Type Definitions
 * 
 * Core types for the legal document search platform.
 */

// ============================================================================
// User & Auth
// ============================================================================

export type UserRole = 'viewer' | 'contributor' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Session {
  user: User;
  accessToken: string;
  expiresAt: string;
}

// ============================================================================
// Documents
// ============================================================================

export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'error';
export type DocumentType = 'contract' | 'correspondence' | 'court_decision' | 'legislation' | 'memo' | 'other';

export interface Document {
  id: string;
  tenantId: string;
  title: string;
  filename: string;
  type: DocumentType;
  status: DocumentStatus;
  pageCount: number;
  fileSize: number;
  mimeType: string;
  matter?: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  processedAt?: string;
  errorMessage?: string;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  author?: string;
  createdDate?: string;
  modifiedDate?: string;
  language?: string;
  caseNumber?: string;
  parties?: string[];
  jurisdiction?: string;
  [key: string]: unknown;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumbers: number[];
  articleRef?: string;
  chunkIndex: number;
  embedding?: number[];
}

// ============================================================================
// Search
// ============================================================================

export type SearchMode = 'hybrid' | 'semantic' | 'keyword';

export interface SearchFilters {
  documentTypes?: DocumentType[];
  matters?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  uploadedBy?: string[];
}

export interface SearchQuery {
  query: string;
  mode: SearchMode;
  filters: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  documentId: string;
  document: Document;
  content: string;
  snippet: string;
  highlightedSnippet: string;
  score: number;
  pageNumbers: number[];
  articleRef?: string;
  matchType: 'semantic' | 'keyword' | 'both';
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: SearchQuery;
  processingTimeMs: number;
  appliedFilters: SearchFilters;
}

// ============================================================================
// Audit
// ============================================================================

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'search'
  | 'document_view'
  | 'document_upload'
  | 'document_delete'
  | 'document_update'
  | 'user_create'
  | 'user_update'
  | 'user_delete'
  | 'settings_update';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// ============================================================================
// API
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// UI State
// ============================================================================

export interface SidebarState {
  isCollapsed: boolean;
  activeSection: 'search' | 'documents' | 'admin';
}

export interface SearchState {
  query: string;
  mode: SearchMode;
  filters: SearchFilters;
  results: SearchResult[];
  isLoading: boolean;
  error?: string;
  selectedResultId?: string;
}

export interface DocumentViewerState {
  documentId?: string;
  currentPage: number;
  zoom: number;
  highlights: PageHighlight[];
}

export interface PageHighlight {
  pageNumber: number;
  rects: HighlightRect[];
  resultId: string;
}

export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
