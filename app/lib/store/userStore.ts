import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  user_AGI: number | null
  scanned_tax_data: boolean
  setUserAGI: (agi: number | null) => void
  setScannedTaxData: (scanned: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user_AGI: null,
      scanned_tax_data: false,
      setUserAGI: (agi) => set({ user_AGI: agi }),
      setScannedTaxData: (scanned) => set({ scanned_tax_data: scanned }),
    }),
    {
      name: 'dc-user-store',
    }
  )
)
