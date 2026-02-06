/**
 * API Client
 * 
 * Handles all communication with the backend API.
 */

import type { 
  ApiResponse, 
  SearchQuery, 
  SearchResponse,
  Document,
  PaginatedResponse,
  User,
  AuditLogEntry,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || data.error) {
    throw new ApiError(
      data.error?.message || 'An unexpected error occurred',
      data.error?.code || 'UNKNOWN_ERROR',
      response.status,
      data.error?.details
    );
  }

  return data.data as T;
}

// ============================================================================
// Search API
// ============================================================================

export async function search(query: SearchQuery): Promise<SearchResponse> {
  return request<SearchResponse>('/search', {
    method: 'POST',
    body: JSON.stringify(query),
  });
}

export async function getSuggestions(query: string): Promise<string[]> {
  return request<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}`);
}

// ============================================================================
// Documents API
// ============================================================================

export async function getDocuments(params?: {
  limit?: number;
  offset?: number;
  status?: string;
  type?: string;
  matter?: string;
}): Promise<PaginatedResponse<Document>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
  }
  const query = searchParams.toString();
  return request<PaginatedResponse<Document>>(`/documents${query ? `?${query}` : ''}`);
}

export async function getDocument(id: string): Promise<Document> {
  return request<Document>(`/documents/${id}`);
}

export async function uploadDocument(
  file: File,
  metadata?: Partial<Pick<Document, 'type' | 'matter' | 'tags'>>
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data: ApiResponse<Document> = await response.json();
  
  if (!response.ok || data.error) {
    throw new ApiError(
      data.error?.message || 'Upload failed',
      data.error?.code || 'UPLOAD_ERROR',
      response.status,
      data.error?.details
    );
  }

  return data.data as Document;
}

export async function updateDocument(
  id: string,
  updates: Partial<Pick<Document, 'title' | 'type' | 'matter' | 'tags' | 'metadata'>>
): Promise<Document> {
  return request<Document>(`/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteDocument(id: string): Promise<void> {
  return request<void>(`/documents/${id}`, {
    method: 'DELETE',
  });
}

export function getDocumentDownloadUrl(id: string): string {
  return `${API_BASE_URL}/documents/${id}/download`;
}

// ============================================================================
// Users API
// ============================================================================

export async function getCurrentUser(): Promise<User> {
  return request<User>('/users/me');
}

export async function getUsers(params?: {
  limit?: number;
  offset?: number;
  role?: string;
}): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
  }
  const query = searchParams.toString();
  return request<PaginatedResponse<User>>(`/users${query ? `?${query}` : ''}`);
}

// ============================================================================
// Audit API
// ============================================================================

export async function getAuditLogs(params?: {
  limit?: number;
  offset?: number;
  userId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<PaginatedResponse<AuditLogEntry>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
  }
  const query = searchParams.toString();
  return request<PaginatedResponse<AuditLogEntry>>(`/admin/audit${query ? `?${query}` : ''}`);
}

// ============================================================================
// Health API
// ============================================================================

export async function getHealth(): Promise<{ status: string; services: Record<string, string> }> {
  return request<{ status: string; services: Record<string, string> }>('/health');
}
