import { create } from 'zustand';

import { CHAINS } from '@/lib/constants/chains';
import { Chain } from '@/lib/types/chains';
import { ComboboxOption } from '@/lib/types/templates';

type SelectionGlobal = {
  chainOption: ComboboxOption | null;
  gasPrice: bigint;
  nativeTokenPrice: number;
  setChainOption: (chainOption: ComboboxOption | null) => void;
  setGasPrice: (gasPrice: bigint) => void;
  setNativeTokenPrice: (nativeTokenPrice: number) => void;
  getCurrentChain: () => Chain | null;
};

export const useGlobalStore = create<SelectionGlobal>((set, get) => ({
  // Current options (selected by user)
  chainOption: null,
  // Current options (selected by user or current onchain values)
  gasPrice: BigInt(0),
  nativeTokenPrice: 0,

  // Set options
  setChainOption: (chainOption) => set({ chainOption }),
  // Set options (onchain)
  setGasPrice: (gasPrice) => set({ gasPrice }),
  setNativeTokenPrice: (nativeTokenPrice) => set({ nativeTokenPrice }),

  // Get current chain
  getCurrentChain: () => {
    const { chainOption } = get();
    const chainId = chainOption ? chainOption.value : null;

    return CHAINS.find((c) => c.config.id.toString() === chainId) || null;
  },
}));
