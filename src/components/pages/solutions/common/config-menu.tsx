'use client';

import { useState } from 'react';

import { CaretUpIcon } from '@radix-ui/react-icons';

import { useSelectionStore } from '@/lib/store/use-selection';
import { cn } from '@/lib/utils';

import ChainSelection from '@/components/pages/solutions/common/chain-selection';
import GasPriceSelection from '@/components/pages/solutions/common/gas-price-selection';
import NativePriceSelection from '@/components/pages/solutions/common/native-price-selection';
import { Button } from '@/components/ui/button';

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
  const [open, setOpen] = useState(false);
  const { fetchAndUpdateGasFeesData, fetchAndUpdateNativeTokenPrice } = useSelectionStore.global(
    (state) => ({
      fetchAndUpdateGasFeesData: state.fetchAndUpdateGasFeesData,
      fetchAndUpdateNativeTokenPrice: state.fetchAndUpdateNativeTokenPrice,
    }),
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background px-1 shadow-lg">
      {/* Toggle Button */}
      <Button
        onClick={() => setOpen(!open)}
        variant="ghost"
        size="sm"
        className="flex w-full justify-center"
      >
        <CaretUpIcon
          className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')}
        />
        <span className="sr-only">Toggle</span>
      </Button>

      {/* Sliding Menu Content */}
      <div
        className={cn(
          'flex transform flex-col gap-2 overflow-hidden px-2 transition-all duration-300 ease-out',
          open ? 'h-[150px]' : 'h-0',
        )}
      >
        <div className="flex gap-2">
          <ChainSelection />
          <NativePriceSelection className="grow" />
        </div>
        <GasPriceSelection />
        <Button
          variant="secondary"
          size="sm"
          className="h-6"
          onClick={() => {
            Promise.all([fetchAndUpdateGasFeesData(), fetchAndUpdateNativeTokenPrice()]);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
    // <>
    //   <div className="absolute bottom-0 flex">
    //     <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
    //       icon
    //       <span className="sr-only">Toggle</span>
    //     </Button>
    //     <Button
    //       variant="ghost"
    //       size="sm"
    //       className={cn('absolute right-0 top-0')}
    //       onClick={() =>
    //         Promise.all([fetchAndUpdateGasFeesData(), fetchAndUpdateNativeTokenPrice()])
    //       }
    //     >
    //       reset
    //     </Button>
    //   </div>

    //   <div
    //     className={cn(
    //       'fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 bg-background p-4 shadow-lg transition-transform duration-500',
    //       open ? 'translate-y-0' : 'translate-y-full',
    //     )}
    //   >
    //     <div className="flex gap-2">
    //       <ChainSelection />
    //       <NativePriceSelection className="grow" />
    //     </div>
    //     <GasPriceSelection />
    //   </div>
    // </>
  );
};

export default ConfigMenu;
