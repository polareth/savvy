'use client';

import { useState } from 'react';
import { CaretUpIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CallerSelection from '@/components/core/selection/caller';
import ChainSelection from '@/components/core/selection/chain';
import GasPriceSelection from '@/components/core/selection/gas-price';
import NativePriceSelection from '@/components/core/selection/native-price';

/**
 * @notice The configuration menu to define parameters for the calls/estimations
 * @dev This will display a side menu on desktop and a bottom-sliding menu on mobile.
 * @dev This includes the chain, gas price, native price, and caller selection.
 */
const ConfigMenu = () => {
  return (
    <>
      <ConfigMenuDesktop />
      <ConfigMenuMobile />
    </>
  );
};

/* --------------------------------- DESKTOP -------------------------------- */
const ConfigMenuDesktop = () => {
  return (
    <nav
      className="hide-scrollbar sticky top-28 z-50 -ml-3 hidden min-w-[16rem] max-w-[16rem] flex-col gap-4 overflow-y-scroll px-0.5 md:flex lg:min-w-[18rem] lg:max-w-[18rem]"
      style={{ height: 'calc(100vh - 11rem)' }}
    >
      <ChainSelection />
      <GasPriceSelection />
      <NativePriceSelection />
      <CallerSelection />
    </nav>
  );
};

/* --------------------------------- MOBILE --------------------------------- */
const ConfigMenuMobile = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background px-1 shadow-lg md:hidden">
      {/* Toggle Button */}
      <Button
        onClick={() => setOpen(!open)}
        variant="ghost"
        size="sm"
        className="flex w-full justify-center"
      >
        <CaretUpIcon
          className={cn(
            'h-4 w-4 transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
        <span className="sr-only">Toggle</span>
      </Button>

      {/* Sliding Menu Content */}
      <div
        className={cn(
          'flex flex-col gap-2 overflow-hidden px-2 transition-all duration-300 ease-out',
          open ? 'h-[600px]' : 'h-0',
        )}
      >
        <ChainSelection />
        <NativePriceSelection />

        <GasPriceSelection />
        <CallerSelection />
      </div>
    </div>
  );
};

export default ConfigMenu;
