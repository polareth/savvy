'use client';

import { AIRDROP_TOKENS } from '@/lib/constants/solutions/airdrop';
import { useSelectionStore } from '@/lib/store/use-selection';
import { ComboboxOption } from '@/lib/types/templates';

import ComboBoxResponsive from '@/components/templates/combobox-responsive';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const items: ComboboxOption[] = AIRDROP_TOKENS.map((token) => ({
  label: token.label,
  value: token.id,
}));

const TokenSelection = () => {
  const { token, setToken } = useSelectionStore.airdrop((state) => ({
    token: state.tokenOption,
    setToken: state.setTokenOption,
  }));

  return (
    // <ToggleGroup
    //   type="single"
    //   onValueChange={(e) => (e === '' ? setToken(null) : setToken(e as Token))}
    // >
    //   {Object.keys(AIRDROP_TOKENS).map((key) => (
    //     <ToggleGroupItem
    //       key={key}
    //       value={key}
    //       aria-label={`Select ${AIRDROP_TOKENS[key as Token]}`}
    //     >
    //       {AIRDROP_TOKENS[key as Token]}
    //     </ToggleGroupItem>
    //   ))}
    // </ToggleGroup>
    <ComboBoxResponsive items={items} label="Token" selected={token} setSelected={setToken} />
  );
};

export default TokenSelection;
