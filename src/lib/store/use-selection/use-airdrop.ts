import { create } from 'zustand';

import { DEFAULTS } from '@/lib/constants/defaults';
import {
  AIRDROP_METHODS,
  AIRDROP_SOLUTIONS,
  AIRDROP_TOKENS,
} from '@/lib/constants/solutions/airdrop';
import { AirdropMethod, AirdropSolution, Token } from '@/lib/types/airdrop';
import { ComboboxOption } from '@/lib/types/templates';
import { toMethodOption, toTokenOption } from '@/lib/utils/combobox';

type SelectionAirdrop = {
  tokenOption: ComboboxOption | null;
  methodOption: ComboboxOption | null;
  recipientsCount: number;
  customToken: boolean;
  customTokenAddress: string;
  customTokenOwner: string;
  setTokenOption: (tokenOption: ComboboxOption | null) => void;
  setMethodOption: (methodOption: ComboboxOption | null) => void;
  setRecipientsCount: (recipientsCount: number) => void;
  toggleCustomToken: () => void;
  setCustomTokenAddress: (customTokenAddress: string) => void;
  setCustomTokenOwner: (customTokenOwner: string) => void;
  getCurrent: () => {
    token: Token | null;
    method: AirdropMethod | null;
    solution: AirdropSolution | null;
  };
  getSolution: () => AirdropSolution | null;
};

export const useAirdropStore = create<SelectionAirdrop>((set, get) => ({
  // Current options (selected by user)
  tokenOption: toTokenOption(DEFAULTS.airdropToken),
  methodOption: toMethodOption(DEFAULTS.airdropMethod),
  recipientsCount: DEFAULTS.airdropRecipients.count,
  // ERC20, ERC721, ERC1155: when using a custom token
  customToken: false,
  customTokenAddress: '',
  // The owner of the token (to mint the required amount for the airdrop)
  customTokenOwner: '',

  // Set options
  setTokenOption: (tokenOption) => set({ tokenOption }),
  setMethodOption: (methodOption) => set({ methodOption }),
  setRecipientsCount: (recipientsCount) => set({ recipientsCount }),
  toggleCustomToken: () => set((state) => ({ customToken: !state.customToken })),
  setCustomTokenAddress: (customTokenAddress) => set({ customTokenAddress }),
  setCustomTokenOwner: (customTokenOwner) => set({ customTokenOwner }),

  // Get current selection & solution
  getCurrent: () => {
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
