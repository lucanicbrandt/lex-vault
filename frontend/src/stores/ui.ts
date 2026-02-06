/**
 * UI State Store
 * 
 * Manages global UI state (sidebar, modals, etc.)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Document Viewer
  viewerDocumentId: string | null;
  viewerPage: number;
  viewerZoom: number;
  setViewerDocument: (documentId: string | null, page?: number) => void;
  setViewerPage: (page: number) => void;
  setViewerZoom: (zoom: number) => void;

  // Modals
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      // Document Viewer
      viewerDocumentId: null,
      viewerPage: 1,
      viewerZoom: 100,
      setViewerDocument: (viewerDocumentId, page = 1) => 
        set({ viewerDocumentId, viewerPage: page }),
      setViewerPage: (viewerPage) => set({ viewerPage }),
      setViewerZoom: (viewerZoom) => set({ viewerZoom }),

      // Modals
      uploadModalOpen: false,
      setUploadModalOpen: (uploadModalOpen) => set({ uploadModalOpen }),

      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'lexvault-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
