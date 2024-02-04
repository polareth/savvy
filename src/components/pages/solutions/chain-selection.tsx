'use client';

import { CHAINS } from '@/lib/constants/chains';
import { useSelectionStore } from '@/lib/store/use-selection';
import { Chain, ChainOption } from '@/lib/types/chains';

import ComboBoxResponsive from '@/components/templates/combobox-responsive';

const items: ChainOption[] = CHAINS.map((chain: Chain) => ({
  ...chain,
  label: chain.config.name,
  value: chain.config.name,
}));

const ChainSelection = () => {
  const { chain, setChain } = useSelectionStore((state) => ({
    chain: state.chain,
    setChain: state.setChain,
  }));

  return <ComboBoxResponsive items={items} name="chain" selected={chain} setSelected={setChain} />;
};

export default ChainSelection;
