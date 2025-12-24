import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AnalyzedData } from '../extractor/analyzer'

export type FamilyMember = 'student' | 'parent1' | 'parent2'
export type DocType = 'W-2' | '1040' | '1099' | 'Schedule A' | 'Business' | 'Award Letter' | 'Unknown'

export interface ScannedDoc {
  id: string
  /** Original file name (persists across refresh). */
  fileName: string
  /** In-memory File object (not persisted). */
  file?: File
  rawText: string
  status: 'processing' | 'complete' | 'error'
  assignedOwner: FamilyMember | null
  detectedType: DocType
  extractedData: any
  awardData?: AnalyzedData | null
  errorMessage?: string
}

interface DocumentStore {
  documents: ScannedDoc[]
  addDocument: (doc: ScannedDoc) => void
  updateDocument: (id: string, updates: Partial<ScannedDoc>) => void
  removeDocument: (id: string) => void
  clearDocuments: () => void
  getDocsByOwner: (owner: FamilyMember) => ScannedDoc[]
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],
      addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
        })),
      removeDocument: (id) => set((state) => ({ documents: state.documents.filter((doc) => doc.id !== id) })),
      clearDocuments: () => set({ documents: [] }),
      getDocsByOwner: (owner) => get().documents.filter((doc) => doc.assignedOwner === owner),
    }),
    {
      name: 'dc-extractor-documents-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        documents: state.documents.map(({ file, ...rest }) => rest),
      }),
    },
  ),
)
