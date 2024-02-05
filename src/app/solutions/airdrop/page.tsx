import AirdropMethodSelection from '@/components/pages/solutions/airdrop/airdrop-method-selection';
import TokenSelection from '@/components/pages/solutions/airdrop/token-selection';
import ChainSelection from '@/components/pages/solutions/chain-selection';
import GasPriceSelection from '@/components/pages/solutions/gas-price-selection';
import NativePriceSelection from '@/components/pages/solutions/native-price-selection';

const Airdrop = () => {
  return (
    <div className="flex flex-col">
      <ChainSelection />
      <TokenSelection />
      <AirdropMethodSelection />
      <GasPriceSelection />
      <NativePriceSelection />
    </div>
  );
};

export default Airdrop;
