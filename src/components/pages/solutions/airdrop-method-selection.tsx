'use client';

import { AIRDROP_METHODS } from '@/lib/constants/solutions/airdrop';
import { useSelectionStore } from '@/lib/store/use-selection';
import { ComboboxOption } from '@/lib/types/templates';

import ComboBoxResponsive from '@/components/templates/combobox-responsive';

const items: ComboboxOption[] = AIRDROP_METHODS.map((method) => ({
  label: method.label,
  value: method.id,
  icon: method.icon,
}));

const AirdropMethodSelection = () => {
  const { method, setMethod } = useSelectionStore((state) => ({
    method: state.method,
    setMethod: state.setMethod,
  }));

  return (
    <ComboBoxResponsive items={items} label="Method" selected={method} setSelected={setMethod} />
  );
};

export default AirdropMethodSelection;
