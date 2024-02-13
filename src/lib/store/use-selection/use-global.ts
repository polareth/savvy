import { create } from 'zustand';

import { CHAINS } from '@/lib/constants/chains';
import { DEFAULTS } from '@/lib/constants/defaults';
import { Chain } from '@/lib/types/chains';
import { GasFeesData } from '@/lib/types/estimate';
import { ComboboxOption } from '@/lib/types/templates';
import { toChainOption } from '@/lib/utils/combobox';
import { getGasFeesData } from '@/lib/utils/gas';
import { fetchNativeTokenPrice } from '@/lib/utils/native-token';

type FetchingResponse = { success: boolean; error: { title: string; message: string } | null };

type SelectionGlobal = {
  chainOption: ComboboxOption;
  gasFeesData: GasFeesData | null;
  nativeTokenPrice: number;
  fetchingGasFeesData: boolean;
  fetchingNativeTokenPrice: boolean;
  formDisabled: boolean;
  setChainOption: (chainOption: ComboboxOption) => void;
  setGasFeesData: (gasFeesData: GasFeesData) => void;
  setNativeTokenPrice: (nativeTokenPrice: number) => void;
  setFetchingGasFeesData: (fetchingGasFeesData: boolean) => void;
  setFetchingNativeTokenPrice: (fetchingNativeTokenPrice: boolean) => void;
  setFormDisabled: (formDisabled: boolean) => void;
  getCurrentChain: () => Chain | null;
  fetchAndUpdateGasFeesData: () => Promise<FetchingResponse>;
  fetchAndUpdateNativeTokenPrice: () => Promise<FetchingResponse>;
};

export const useGlobalStore = create<SelectionGlobal>((set, get) => ({
  // Current options (selected by user)
  chainOption: toChainOption(DEFAULTS.chain),
  // Current options (selected by user or current onchain values)
  gasFeesData: null,
  nativeTokenPrice: 0,
  fetchingGasFeesData: true,
  fetchingNativeTokenPrice: true,
  // Form disabled (when loading data)
  formDisabled: false,

  // Set options
  setChainOption: (chainOption) => set({ chainOption }),
  // Set options (onchain)
  setGasFeesData: (gasFeesData) => set({ gasFeesData }),
  setNativeTokenPrice: (nativeTokenPrice) => set({ nativeTokenPrice }),
  setFetchingGasFeesData: (fetchingGasFeesData) => set({ fetchingGasFeesData }),
  setFetchingNativeTokenPrice: (fetchingNativeTokenPrice) => set({ fetchingNativeTokenPrice }),

  setFormDisabled: (formDisabled) => set({ formDisabled }),

  // Get current chain
  getCurrentChain: () => {
    const { chainOption } = get();
    const chainId = chainOption ? chainOption.value : null;

    return CHAINS.find((c) => c.config.id === chainId) || null;
  },

  // Fetch latest gas fees data and update store
  fetchAndUpdateGasFeesData: async () => {
    const { getCurrentChain, setGasFeesData, setFetchingGasFeesData } = get();
    const currentChain = getCurrentChain();
    if (!currentChain)
      return { success: false, error: { title: 'Error: chain', message: 'No chain selected' } };

    setFetchingGasFeesData(true);
    const gasFeesData = await getGasFeesData(currentChain.config.id);
    setGasFeesData(gasFeesData);
    setFetchingGasFeesData(false);

    if (
      gasFeesData.hasChainPriorityFee &&
      Object.values(gasFeesData.baseFeeToPriorityFeeBounds).some((v) => v === BigInt(0))
    ) {
      return {
        success: false,
        error: {
          title: 'Error: gas fees',
          message:
            'Failed to retrieve enough fees history to calculate appropriate max priority fees.',
        },
      };
    }

    return { success: true, error: null };
  },

  // Fetch latest native token price and update store
  fetchAndUpdateNativeTokenPrice: async () => {
    const { getCurrentChain, setNativeTokenPrice, setFetchingNativeTokenPrice } = get();
    const currentChain = getCurrentChain();
    if (!currentChain)
      return { success: false, error: { title: 'Error: chain', message: 'No chain selected' } };

    setFetchingNativeTokenPrice(true);
    const price = await fetchNativeTokenPrice(currentChain.nativeTokenSlug);
    if (price === 0)
      return {
        success: false,
        error: { title: 'Error: native token', message: 'Failed to retrieve native token price' },
      };

    setNativeTokenPrice(price);
    setFetchingNativeTokenPrice(false);

    return { success: true, error: null };
  },
}));
