import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ApplicationStatus = 'saved' | 'applied' | 'accepted' | 'rejected' | 'waitlisted' | 'enrolled'

export interface School {
  id: number
  name: string
  city?: string
  state?: string
  status: ApplicationStatus
  deadlines?: {
    earlyAction?: string
    earlyDecision?: string
    regularDecision?: string
  }
  notes?: string
  dateAdded: number
}

interface OrganizeState {
  schools: School[]
  addSchool: (school: Omit<School, 'status' | 'dateAdded'>) => void
  removeSchool: (id: number) => void
  updateStatus: (id: number, status: ApplicationStatus) => void
  updateNotes: (id: number, notes: string) => void
}

export const useOrganizeStore = create<OrganizeState>()(
  persist(
    (set) => ({
      schools: [],
      addSchool: (school) =>
        set((state) => {
          if (state.schools.some((s) => s.id === school.id)) return state
          return {
            schools: [
              ...state.schools,
              { ...school, status: 'saved', dateAdded: Date.now() },
            ],
          }
        }),
      removeSchool: (id) =>
        set((state) => ({
          schools: state.schools.filter((s) => s.id !== id),
        })),
      updateStatus: (id, status) =>
        set((state) => ({
          schools: state.schools.map((s) =>
            s.id === id ? { ...s, status } : s
          ),
        })),
      updateNotes: (id, notes) =>
        set((state) => ({
          schools: state.schools.map((s) =>
            s.id === id ? { ...s, notes } : s
          ),
        })),
    }),
    {
      name: 'organize-storage',
    }
  )
)
