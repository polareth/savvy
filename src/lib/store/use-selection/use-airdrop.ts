import { create } from 'zustand';

import { DEFAULTS } from '@/lib/constants/defaults';
import {
  AIRDROP_METHODS,
  AIRDROP_SOLUTIONS,
  AIRDROP_TOKENS,
} from '@/lib/constants/solutions/airdrop';
import { AirdropData, AirdropMethod, AirdropSolution, Token } from '@/lib/types/airdrop';
import { ComboboxOption } from '@/lib/types/templates';
import { toMethodOption, toTokenOption } from '@/lib/utils/combobox';

type AirdropDataWithEnabled = AirdropData & { enabled: boolean };

type SelectionAirdrop = {
  tokenOption: ComboboxOption;
  methodOption: ComboboxOption;
  recipientsCount: number;
  customAirdropData: AirdropDataWithEnabled;
  customToken: boolean;
  customTokenAddress: string;
  customTokenOwnerOrHolder: string;
  setTokenOption: (tokenOption: ComboboxOption) => void;
  setMethodOption: (methodOption: ComboboxOption) => void;
  setRecipientsCount: (recipientsCount: number) => void;
  setCustomAirdropData: (customAirdropData: AirdropDataWithEnabled) => void;
  toggleCustomToken: () => void;
  setCustomTokenAddress: (customTokenAddress: string) => void;
  setcustomTokenOwnerOrHolder: (customTokenOwnerOrHolder: string) => void;
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
  customAirdropData: {
    enabled: false,
    recipients: [],
    amounts: [],
    ids: [],
  },
  // ERC20, ERC721, ERC1155: when using a custom token
  customToken: false,
  customTokenAddress: '',
  // The owner of the token (to mint the required amount for the airdrop)
  // or a holder with enough balance to cover the airdrop
  customTokenOwnerOrHolder: '',

  // Set options
  setTokenOption: (tokenOption) => set({ tokenOption }),
  setMethodOption: (methodOption) => set({ methodOption }),
  setRecipientsCount: (recipientsCount) => set({ recipientsCount }),
  setCustomAirdropData: (customAirdropData) => set({ customAirdropData }),
  toggleCustomToken: () => set((state) => ({ customToken: !state.customToken })),
  setCustomTokenAddress: (customTokenAddress) => set({ customTokenAddress }),
  setcustomTokenOwnerOrHolder: (customTokenOwnerOrHolder) => set({ customTokenOwnerOrHolder }),

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
