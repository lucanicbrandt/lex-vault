# LexVault Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### 2026-02-06 - Frontend Foundation

#### Added
- **Project Structure**
  - Next.js 14 with App Router and TypeScript
  - Tailwind CSS v4 with shadcn/ui component library
  - Zustand for state management
  - Professional project architecture

- **UI Components**
  - `Sidebar` - Collapsible navigation with main and admin sections
  - `Header` - Top bar with user menu, notifications, help
  - `AppShell` - Main layout wrapper combining sidebar and header
  - `SearchBar` - Full-featured search input with mode selector (Hybrid/Semantic/Keyword)
  - `SearchFilters` - Document type, matter, tag, and date range filters
  - `SearchResults` - Results list with loading, empty, and error states
  - `ResultCard` - Individual result display with relevance score, snippets, and actions

- **State Management**
  - `useSearchStore` - Search query, mode, filters, results
  - `useUIStore` - Sidebar state, document viewer, theme (persisted)

- **API Layer**
  - Type-safe API client (`lib/api.ts`)
  - Mock search endpoint with realistic Swiss legal document data
  - Full TypeScript type definitions for all entities

- **Pages**
  - `/search` - Main search interface
  - Dashboard layout with sidebar navigation

#### Technical Details
- All UI text in German (de-CH) for Swiss market
- Keyboard shortcuts: `⌘K` to focus search
- Mobile-responsive sidebar collapse
- Relevance scoring visualization
- Citation copy functionality

---

## Architecture Decisions

### Why Next.js 14?
- Server-side rendering for SEO and initial load
- API routes for backend proxy
- Mature ecosystem, well-supported
- App Router for modern React patterns

### Why shadcn/ui?
- Professional, accessible components
- Full control (components live in codebase)
- Consistent with Tailwind
- Easy to customize for legal/enterprise aesthetic

### Why Zustand over Redux?
- Simpler API, less boilerplate
- TypeScript-first
- Built-in persistence middleware
- Sufficient for this application's scale

### Why German UI?
- Primary market: Swiss law firms
- Legal terminology must be precise in German
- i18n-ready structure for future expansion (FR, IT, EN)

---

## Next Steps

### Phase 2: Core Search Integration
- [ ] Connect to Weaviate API
- [ ] Implement hybrid search (BM25 + vector)
- [ ] Add reranking layer
- [ ] Citation detection and routing

### Phase 3: Document Management
- [ ] Upload interface with drag-and-drop
- [ ] Document list/grid views
- [ ] PDF viewer integration
- [ ] Highlight anchoring from search results

### Phase 4: Backend API
- [ ] FastAPI project setup
- [ ] Weaviate service layer
- [ ] Document processing pipeline
- [ ] Azure Document Intelligence integration
