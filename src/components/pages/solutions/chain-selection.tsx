'use client';

import { CHAINS } from '@/lib/constants/chains';
import { useSelectionStore } from '@/lib/store/use-selection';
import { Chain } from '@/lib/types/chains';
import { ComboboxOption } from '@/lib/types/templates';

import ComboBoxResponsive from '@/components/templates/combobox-responsive';

const items: ComboboxOption[] = CHAINS.map((chain: Chain) => ({
  label: chain.config.name,
  value: chain.config.id.toString(),
  icon: chain.icon,
}));

const ChainSelection = () => {
  const { chain, setChain } = useSelectionStore((state) => ({
    chain: state.chain,
    setChain: state.setChain,
  }));

  return <ComboBoxResponsive items={items} label="Chain" selected={chain} setSelected={setChain} />;
};

export default ChainSelection;
