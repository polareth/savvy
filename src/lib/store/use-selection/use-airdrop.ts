import { create } from 'zustand';

import {
  AIRDROP_METHODS,
  AIRDROP_SOLUTIONS,
  AIRDROP_TOKENS,
} from '@/lib/constants/solutions/airdrop';
import { AirdropMethod, AirdropSolution, Token } from '@/lib/types/airdrop';
import { ComboboxOption } from '@/lib/types/templates';

type SelectionAirdrop = {
  tokenOption: ComboboxOption | null;
  methodOption: ComboboxOption | null;
  setTokenOption: (tokenOption: ComboboxOption | null) => void;
  setMethodOption: (methodOption: ComboboxOption | null) => void;
  current: () => {
    token: Token | null;
    method: AirdropMethod | null;
    solution: AirdropSolution | null;
  };
  getSolution: () => AirdropSolution | null;
};

export const useAirdropStore = create<SelectionAirdrop>((set, get) => ({
  // Current options (selected by user)
  tokenOption: null,
  methodOption: null,

  // Set options
  setTokenOption: (tokenOption) => set({ tokenOption }),
  setMethodOption: (methodOption) => set({ methodOption }),

  // Get current selection & solution
  current: () => {
    const { tokenOption, methodOption } = get();
    const tokenId = tokenOption ? (tokenOption.value as Token['id']) : null;
    const methodId = methodOption ? (methodOption.value as AirdropMethod['id']) : null;

    return {
      token: AIRDROP_TOKENS.find((t) => t.id === tokenId) || null,
      method: AIRDROP_METHODS.find((m) => m.id === methodId) || null,
      solution: tokenId && methodId ? AIRDROP_SOLUTIONS[tokenId][methodId] : null,
    };
  },
  getSolution: () => {
    const { tokenOption, methodOption } = get();
    return tokenOption && methodOption
      ? AIRDROP_SOLUTIONS[tokenOption.value as Token['id']][
          methodOption.value as AirdropMethod['id']
        ]
      : null;
  },
}));
