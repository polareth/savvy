import CostEstimation from '@/components/pages/solutions/airdrop/cost-estimation';
import CustomTokenSelection from '@/components/pages/solutions/airdrop/custom-token-selection';
import Header from '@/components/pages/solutions/airdrop/header';
import RecipientsSelection from '@/components/pages/solutions/airdrop/recipients-selection';
import ConfigMenu from '@/components/pages/solutions/common/config-menu';
import { Separator } from '@/components/ui/separator';

const Airdrop = () => {
  return (
    <div className="relative flex flex-col space-x-0 pb-6 md:flex-row md:space-x-16">
      <ConfigMenu />
      <div className="flex w-full flex-col">
        <Header />
        <Separator className="mb-0 mt-4 md:mb-8" />
        <CustomTokenSelection />
        <Separator className="mb-4 md:my-8" />
        <RecipientsSelection />
        <Separator className="my-8" />
        <CostEstimation />
      </div>
    </div>
  );
};

export default Airdrop;
