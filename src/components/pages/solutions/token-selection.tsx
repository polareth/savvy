'use client';

import { useSelectionStore } from '@/lib/store/use-selection';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// TODO Create constant SOLUTIONS with key-value pairs for each token {method: {contract, contractAddress, website, sourceUrl, etc}}
// TODO ADD ICONS TO CHAINS!!
const items = ['Native token', 'ERC20', 'ERC721', 'ERC1155'];

const TokenSelection = () => {
  const { chain, setChain } = useSelectionStore((state) => ({
    chain: state.chain,
    setChain: state.setChain,
  }));

  return (
    <ToggleGroup type="single">
      {items.map((item) => (
        <ToggleGroupItem key={item} value={item} aria-label={`Select ${item}`} onClick={() => null}>
          {item}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default TokenSelection;
