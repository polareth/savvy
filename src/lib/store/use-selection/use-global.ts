import { create } from 'zustand';

import { CHAINS } from '@/lib/constants/chains';
import { DEFAULTS } from '@/lib/constants/defaults';
import { Chain } from '@/lib/types/chains';
import { GasFeesData } from '@/lib/types/estimate';
import { ComboboxOption } from '@/lib/types/templates';
import { toChainOption } from '@/lib/utils/combobox';

type SelectionGlobal = {
  chainOption: ComboboxOption | null;
  gasFeesData: GasFeesData | null;
  nativeTokenPrice: number;
  setChainOption: (chainOption: ComboboxOption | null) => void;
  setGasFeesData: (gasFeesData: GasFeesData) => void;
  setNativeTokenPrice: (nativeTokenPrice: number) => void;
  getCurrentChain: () => Chain | null;
};

export const useGlobalStore = create<SelectionGlobal>((set, get) => ({
  // Current options (selected by user)
  chainOption: toChainOption(DEFAULTS.chain),
  // Current options (selected by user or current onchain values)
  gasFeesData: null,
  nativeTokenPrice: 0,

  // Set options
  setChainOption: (chainOption) => set({ chainOption }),
  // Set options (onchain)
  setGasFeesData: (gasFeesData) => set({ gasFeesData }),
  setNativeTokenPrice: (nativeTokenPrice) => set({ nativeTokenPrice }),

  // Get current chain
  getCurrentChain: () => {
    const { chainOption } = get();
    const chainId = chainOption ? chainOption.value : null;

    return CHAINS.find((c) => c.config.id.toString() === chainId) || null;
  },
}));
