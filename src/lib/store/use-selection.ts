import { create } from 'zustand';

import { DEFAULTS } from '@/lib/constants/defaults';
import { Chain } from '@/lib/types/chains';

type Selection = {
  chain: Chain;
};

export const useSelectionStore = create<Selection>((set, get) => ({
  chain: DEFAULTS.chain,

  setChain: (chain: Chain) => set({ chain }),
}));
