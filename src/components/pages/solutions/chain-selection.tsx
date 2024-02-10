'use client';

import { CHAINS } from '@/lib/constants/chains';
import { useSelectionStore } from '@/lib/store/use-selection';
import { Chain } from '@/lib/types/chains';
import { ComboboxOption } from '@/lib/types/templates';
import { toChainOption } from '@/lib/utils/combobox';

import ComboBoxResponsive from '@/components/templates/combobox-responsive';

const items: ComboboxOption[] = CHAINS.map((chain: Chain) => toChainOption(chain));

const ChainSelection = () => {
  const { chain, formDisabled, setChain } = useSelectionStore.global((state) => ({
    chain: state.chainOption,
    formDisabled: state.formDisabled,
    setChain: state.setChainOption,
  }));

  return (
    <ComboBoxResponsive
      items={items}
      label="Chain"
      selected={chain}
      setSelected={setChain}
      disabled={formDisabled}
    />
  );
};

export default ChainSelection;
