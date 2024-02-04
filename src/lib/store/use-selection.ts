import { create } from 'zustand';

import { ChainOption } from '@/lib/types/chains';

type Selection = {
  chain: ChainOption | null;
  setChain: (chain: ChainOption | null) => void;
};

export const useSelectionStore = create<Selection>((set, get) => ({
  chain: null,

  setChain: (chain) => set({ chain }),
}));
