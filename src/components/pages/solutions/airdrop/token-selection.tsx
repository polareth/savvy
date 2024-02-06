'use client';

import { AIRDROP_TOKENS } from '@/lib/constants/solutions/airdrop';
import { useSelectionStore } from '@/lib/store/use-selection';
import { ComboboxOption } from '@/lib/types/templates';

import ComboBoxResponsive from '@/components/templates/combobox-responsive';

const items: ComboboxOption[] = AIRDROP_TOKENS.map((token) => ({
  label: token.label,
  value: token.id,
}));

const TokenSelection = () => {
  const { token, setToken } = useSelectionStore.airdrop((state) => ({
    token: state.tokenOption,
    setToken: state.setTokenOption,
  }));

  return <ComboBoxResponsive items={items} label="Token" selected={token} setSelected={setToken} />;
};

export default TokenSelection;
