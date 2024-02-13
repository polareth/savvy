import AirdropMethodSelection from '@/components/pages/solutions/airdrop/airdrop-method-selection';
import CostEstimation from '@/components/pages/solutions/airdrop/cost-estimation';
import CustomTokenSelection from '@/components/pages/solutions/airdrop/custom-token-selection';
import RecipientsSelection from '@/components/pages/solutions/airdrop/recipients-selection';
import TokenSelection from '@/components/pages/solutions/airdrop/token-selection';
import ConfigMenu from '@/components/pages/solutions/common/config-menu';
import { Separator } from '@/components/ui/separator';

const Airdrop = () => {
  return (
    <div className="relative flex flex-col space-x-0 pb-6 md:flex-row md:space-x-16">
      <ConfigMenu />
      <div className="flex flex-col">
        <TokenSelection />
        <AirdropMethodSelection />
        <Separator className="my-8" />
        <CustomTokenSelection />
        <RecipientsSelection />
        <Separator className="my-8" />
        <CostEstimation />
      </div>
    </div>
  );
};

export default Airdrop;
