import ChainSelection from '@/components/pages/solutions/chain-selection';
import TokenSelection from '@/components/pages/solutions/token-selection';

const Airdrop = () => {
  return (
    <div className="flex flex-col">
      <ChainSelection />
      <TokenSelection />
      <p>Native token/ERC20/ERC721/ERC1155</p>
      <p>Push-based (direct transfer)/claim-based airdrop::(merkle tree/signature)</p>
      <p>(show cheapest badge on the cheapest)</p>
    </div>
  );
};

export default Airdrop;
