import AirdropMethodSelection from '@/components/pages/solutions/airdrop-method-selection';
import ChainSelection from '@/components/pages/solutions/chain-selection';
import GasPriceSelection from '@/components/pages/solutions/gas-price-selection';
import NativePriceSelection from '@/components/pages/solutions/native-price-selection';
import TokenSelection from '@/components/pages/solutions/token-selection';

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
