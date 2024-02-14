'use client';

import { AIRDROP_METHODS } from '@/lib/constants/solutions/airdrop';
import { useSelectionStore } from '@/lib/store/use-selection';
import { ComboboxOption } from '@/lib/types/templates';
import { toMethodOption } from '@/lib/utils/combobox';

import ComboBoxResponsive from '@/components/templates/combobox-responsive';

const items: ComboboxOption[] = AIRDROP_METHODS.map((method) => toMethodOption(method));

const AirdropMethodSelection = () => {
  const formDisabled = useSelectionStore.global((state) => state.formDisabled);
  const { method, setMethod } = useSelectionStore.airdrop((state) => ({
    method: state.methodOption,
    setMethod: state.setMethodOption,
  }));

  return (
    <ComboBoxResponsive
      items={items}
      label="Method"
      boxWidth="w-[250px]"
      selected={method}
      setSelected={setMethod}
      disabled={formDisabled}
    />
  );
};

export default AirdropMethodSelection;
