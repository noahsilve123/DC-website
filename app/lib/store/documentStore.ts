import { create } from 'zustand'

export type FamilyMember = 'student' | 'parent1' | 'parent2'
export type DocType = 'W-2' | '1040' | '1099' | 'Schedule A' | 'Business' | 'Unknown'

export interface ScannedDoc {
  id: string
  file: File
  rawText: string
  status: 'processing' | 'complete' | 'error'
  assignedOwner: FamilyMember | null
  detectedType: DocType
  extractedData: any
  errorMessage?: string
}

interface DocumentStore {
  documents: ScannedDoc[]
  addDocument: (doc: ScannedDoc) => void
  updateDocument: (id: string, updates: Partial<ScannedDoc>) => void
  removeDocument: (id: string) => void
  getDocsByOwner: (owner: FamilyMember) => ScannedDoc[]
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
    })),
  removeDocument: (id) =>
    set((state) => ({ documents: state.documents.filter((doc) => doc.id !== id) })),
  getDocsByOwner: (owner) => get().documents.filter((doc) => doc.assignedOwner === owner),
}))
