import { create } from 'zustand'
import type { MarketRegime } from '@/types'

interface AppState {
  currentRegime: MarketRegime | null
  setCurrentRegime: (regime: MarketRegime) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentRegime: null,
  setCurrentRegime: (regime) => set({ currentRegime: regime }),
}))
