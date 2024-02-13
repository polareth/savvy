'use client';

import ChainSelection from '@/components/pages/solutions/common/chain-selection';
import GasPriceSelection from '@/components/pages/solutions/common/gas-price-selection';
import NativePriceSelection from '@/components/pages/solutions/common/native-price-selection';

const ConfigMenu = () => {
  return (
    <>
      <ConfigMenuDesktop />
      <ConfigMenuMobile />
    </>
  );
};

const ConfigMenuDesktop = () => {
  return (
    <nav
      className="hide-scrollbar sticky top-28 z-50 -ml-3 flex hidden min-w-[16rem] max-w-[16rem] flex-col flex-col gap-4 overflow-y-scroll px-0.5 md:flex lg:min-w-[18rem] lg:max-w-[18rem]"
      style={{ height: 'calc(100vh - 11rem)' }}
    >
      <ChainSelection />
      <GasPriceSelection />
      <NativePriceSelection />
    </nav>
  );
};

const ConfigMenuMobile = () => {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      <div className="flex gap-2">
        <ChainSelection />
        <NativePriceSelection className="grow" />
      </div>
      <GasPriceSelection />
    </div>
  );
};

export default ConfigMenu;
