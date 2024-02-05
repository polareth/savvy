import { create } from 'zustand';

import { CHAINS } from '@/lib/constants/chains';
import {
  AIRDROP_METHODS,
  AIRDROP_SOLUTIONS,
  AIRDROP_TOKENS,
} from '@/lib/constants/solutions/airdrop';
import { AirdropMethod, AirdropSolution, Token } from '@/lib/types/airdrop';
import { Chain } from '@/lib/types/chains';
import { ComboboxOption } from '@/lib/types/templates';

type Selection = {
  chain: ComboboxOption | null;
  token: ComboboxOption | null;
  method: ComboboxOption | null;
  gasPrice: bigint;
  nativeTokenPrice: number;
  setChain: (chain: ComboboxOption | null) => void;
  setToken: (token: ComboboxOption | null) => void;
  setMethod: (method: ComboboxOption | null) => void;
  setGasPrice: (gasPrice: bigint) => void;
  setNativeTokenPrice: (nativeTokenPrice: number) => void;
  current: () => {
    chain: Chain | null;
    token: Token | null;
    method: AirdropMethod | null;
    solution: AirdropSolution | null;
  };
  isAllSelected: () => boolean;
  getSolution: () => AirdropSolution | null;
};

export const useSelectionStore = create<Selection>((set, get) => ({
  // Current options (selected by user)
  chain: null,
  token: null,
  method: null,
  // Current options (selected by user or current onchain values)
  gasPrice: BigInt(0),
  nativeTokenPrice: 0,

  // Set options
  setChain: (chain) => set({ chain }),
  setToken: (token) => set({ token }),
  setMethod: (method) => set({ method }),
  // Set options (onchain)
  setGasPrice: (gasPrice) => set({ gasPrice }),
  setNativeTokenPrice: (nativeTokenPrice) => set({ nativeTokenPrice }),

  // Get current selection
  current: () => {
    const { chain, token, method } = get();
    const chainId = chain ? chain.value : null;
    const tokenId = token ? (token.value as Token['id']) : null;
    const methodId = method ? (method.value as AirdropMethod['id']) : null;

    return {
      chain: CHAINS.find((c) => c.config.id.toString() === chainId) || null,
      token: AIRDROP_TOKENS.find((t) => t.id === tokenId) || null,
      method: AIRDROP_METHODS.find((m) => m.id === methodId) || null,
      solution: tokenId && methodId ? AIRDROP_SOLUTIONS[tokenId][methodId] : null,
    };
  },
  isAllSelected: () => {
    const { chain, token, method } = get();
    if (!chain || !token || !method) return false;
    return true;
  },
  getSolution: () => {
    const { token, method } = get();
    return token && method
      ? AIRDROP_SOLUTIONS[token.value as Token['id']][method.value as AirdropMethod['id']]
      : null;
  },
}));
