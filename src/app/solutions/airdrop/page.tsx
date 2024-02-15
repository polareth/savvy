import CostEstimation from '@/components/pages/solutions/airdrop/cost-estimation';
import Header from '@/components/pages/solutions/airdrop/header';
import AirdropParameters from '@/components/pages/solutions/airdrop/parameters';
import ConfigMenu from '@/components/pages/solutions/common/config-menu';

const Airdrop = () => {
  return (
    <div className="relative flex flex-col space-x-0 pb-6 md:flex-row md:space-x-16">
      <ConfigMenu />
      <div className="flex w-full flex-col">
        <Header />
        <AirdropParameters />
        <CostEstimation />
      </div>
    </div>
  );
};

export default Airdrop;
