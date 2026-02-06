# LexVault Architecture

> Enterprise-grade legal document search for Swiss law firms

## Overview

LexVault provides sovereign AI-powered document retrieval that never leaves Swiss jurisdiction. This document outlines the production architecture replacing the Verba proof-of-concept.

## Design Principles

1. **Security First** — Law firms handle privileged information. Every feature considers data isolation, access control, and audit trails.
2. **Search Precision** — Lawyers need exact answers with verifiable sources. Semantic search alone isn't enough.
3. **Professional UX** — Clean, efficient interface that respects lawyers' time. No gimmicks.
4. **Swiss Sovereignty** — All data processing in Switzerland. No exceptions.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Frontend (TypeScript)                                   │
│  ├── Authentication (NextAuth.js + Azure AD / local)            │
│  ├── Document Management UI                                      │
│  ├── Search Interface (hybrid: keyword + semantic)              │
│  ├── PDF Viewer with highlight anchors                          │
│  └── Admin Dashboard (users, audit logs, usage)                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Backend (Python)                                        │
│  ├── /auth/* — Session management, RBAC                         │
│  ├── /documents/* — Upload, process, delete, permissions        │
│  ├── /search/* — Hybrid search, reranking, filters              │
│  ├── /admin/* — User management, audit logs                     │
│  └── Middleware: rate limiting, audit logging, tenant isolation │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│      VECTOR STORE        │   │      DOCUMENT STORE      │
├──────────────────────────┤   ├──────────────────────────┤
│  Weaviate                │   │  PostgreSQL              │
│  ├── Vector embeddings   │   │  ├── Document metadata   │
│  ├── BM25 keyword index  │   │  ├── User accounts       │
│  ├── Hybrid search       │   │  ├── Permissions/RBAC    │
│  └── Multi-tenant class  │   │  ├── Audit logs          │
│      isolation           │   │  └── Search history      │
└──────────────────────────┘   └──────────────────────────┘
                    │
                    ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│      FILE STORAGE        │   │      AI SERVICES         │
├──────────────────────────┤   ├──────────────────────────┤
│  S3-compatible (MinIO    │   │  Azure OpenAI            │
│  or Infomaniak)          │   │  (Switzerland North)     │
│  ├── Original PDFs       │   │  ├── text-embedding-3    │
│  ├── Processed text      │   │  ├── GPT-4 for answers   │
│  └── Tenant-isolated     │   │  └── Document Intelligence│
│      buckets             │   │      (OCR/extraction)    │
└──────────────────────────┘   └──────────────────────────┘
```

---

## Frontend Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14 (App Router) | SSR, API routes, mature ecosystem |
| Language | TypeScript | Type safety critical for legal software |
| Styling | Tailwind CSS + shadcn/ui | Professional components, fast iteration |
| State | Zustand | Simple, performant |
| Forms | React Hook Form + Zod | Validation, type inference |
| PDF | react-pdf + PDF.js | Industry standard |
| Auth | NextAuth.js | Flexible providers (Azure AD, credentials) |

### Component Architecture

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── logout/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Authenticated shell
│   │   ├── page.tsx            # Dashboard home
│   │   ├── search/
│   │   │   └── page.tsx        # Main search interface
│   │   ├── documents/
│   │   │   ├── page.tsx        # Document library
│   │   │   ├── upload/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Document detail + PDF viewer
│   │   └── admin/
│   │       ├── users/
│   │       ├── audit/
│   │       └── settings/
│   ├── api/                    # Next.js API routes (proxy to FastAPI)
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── SearchResults.tsx
│   │   └── ResultCard.tsx
│   ├── documents/
│   │   ├── DocumentList.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── PDFViewer.tsx
│   │   └── HighlightOverlay.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── Breadcrumbs.tsx
├── lib/
│   ├── api.ts                  # API client
│   ├── auth.ts                 # Auth config
│   └── utils.ts
├── hooks/
│   ├── useSearch.ts
│   ├── useDocuments.ts
│   └── useAuth.ts
└── types/
    └── index.ts                # Shared TypeScript types
```

### Key UI Components

#### 1. Search Interface
- **Input**: Large search bar with type-ahead suggestions
- **Filters**: Date range, document type, matter/case, tags
- **Mode toggle**: Semantic / Keyword / Hybrid
- **Results**: Cards with relevance score, snippet, source citation
- **Actions**: View in context, copy citation, export

#### 2. PDF Viewer
- Side-by-side: search results + PDF
- Click result → jump to page with highlight
- Highlight persistence (save annotations)
- Zoom, rotate, download original

#### 3. Document Management
- Drag-and-drop upload (single + bulk)
- Processing status indicators
- Metadata editing (matter, tags, access level)
- Version history

#### 4. Admin Dashboard
- User management (invite, roles, deactivate)
- Audit log viewer (who searched what, when)
- Usage analytics (queries/day, popular docs)
- System health

---

## Search Architecture

### Hybrid Search Flow

```
User Query
    │
    ▼
┌─────────────────┐
│ Query Analyzer  │ ← Detect: citation? date? exact phrase?
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ BM25  │ │Vector │ ← Parallel execution
│Search │ │Search │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│  Reciprocal     │ ← Fuse results (RRF or weighted)
│  Rank Fusion    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Reranker      │ ← Cross-encoder for precision
│ (Cohere/local)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Result Assembly │ ← Add metadata, snippets, highlights
└────────┬────────┘
         │
         ▼
    Search Results
```

### Citation Detection

Legal queries often contain citations that need exact matching:
- `BGE 123 IV 45` → Swiss Federal Court decision
- `Art. 123 OR` → Code of Obligations article
- `SR 220` → Systematic collection number

The query analyzer detects these patterns and routes to keyword search with boosted weight.

---

## Security Model

### Authentication
- **Primary**: Azure AD (most Swiss law firms use Microsoft)
- **Fallback**: Email/password with MFA
- **Sessions**: HTTP-only cookies, 8-hour expiry

### Authorization (RBAC)
| Role | Permissions |
|------|-------------|
| Viewer | Search, view documents |
| Contributor | + Upload, edit metadata |
| Manager | + Delete, manage matter access |
| Admin | + User management, audit logs |

### Multi-Tenancy
- Tenant ID embedded in all database records
- Weaviate classes prefixed per tenant
- S3 bucket isolation per tenant
- API middleware enforces tenant boundaries

### Audit Logging
Every action logged:
```json
{
  "timestamp": "2024-01-15T14:32:00Z",
  "tenant_id": "firm_abc",
  "user_id": "user_123",
  "action": "search",
  "details": {
    "query": "Mietvertrag Kündigung",
    "results_count": 23,
    "filters": {"matter": "2024-001"}
  },
  "ip": "192.168.1.100"
}
```

---

## Development Phases

### Phase 1: Foundation ✅ COMPLETE
- [x] Architecture documentation
- [x] Next.js 14 project setup with TypeScript
- [x] shadcn/ui component library (button, input, card, dialog, dropdown, avatar, badge, separator, scroll-area, sheet, tabs, tooltip, command)
- [x] Basic layout (Sidebar, Header, AppShell)
- [x] Search interface (SearchBar, SearchFilters, SearchResults, ResultCard)
- [x] State management (Zustand stores for search and UI)
- [x] Type-safe API client
- [x] Mock search API with realistic Swiss legal data
- [ ] Authentication scaffolding (deferred to Phase 5)

### Phase 2: Core Search
- [ ] Search bar component
- [ ] Results display
- [ ] Integration with Weaviate (direct, then via API)
- [ ] Basic filtering

### Phase 3: Document Management
- [ ] Upload interface
- [ ] Document list/grid view
- [ ] PDF viewer integration
- [ ] Highlight anchoring

### Phase 4: Backend API
- [ ] FastAPI project structure
- [ ] Weaviate service layer
- [ ] Hybrid search implementation
- [ ] Document processing pipeline

### Phase 5: Enterprise Features
- [ ] User management
- [ ] Audit logging
- [ ] Multi-tenancy
- [ ] Azure AD integration

### Phase 6: Polish & Deploy
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Security audit
- [ ] Infomaniak deployment

---

## File Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Types: `PascalCase` in `types/index.ts`
- API routes: `kebab-case`

## Code Standards

- ESLint + Prettier enforced
- Strict TypeScript (`strict: true`)
- No `any` types
- Components < 200 lines (extract if larger)
- All user-facing strings in constants (i18n ready)

---

*Last updated: 2026-02-06*
