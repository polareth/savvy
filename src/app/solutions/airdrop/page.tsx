import AirdropMethodSelection from '@/components/pages/solutions/airdrop/airdrop-method-selection';
import CostEstimation from '@/components/pages/solutions/airdrop/cost-estimation';
import RecipientsSelection from '@/components/pages/solutions/airdrop/recipients-selection';
import TokenSelection from '@/components/pages/solutions/airdrop/token-selection';
import ChainSelection from '@/components/pages/solutions/chain-selection';
import GasPriceSelection from '@/components/pages/solutions/gas-price-selection';
import NativePriceSelection from '@/components/pages/solutions/native-price-selection';
import { Separator } from '@/components/ui/separator';

const Airdrop = () => {
  return (
    <div className="flex flex-col">
      <ChainSelection />
      <TokenSelection />
      <AirdropMethodSelection />
      <GasPriceSelection />
      <NativePriceSelection />
      <RecipientsSelection />
      <Separator className="my-8" />
      <CostEstimation />
    </div>
  );
};

export default Airdrop;
