'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';

import { useConfigStore } from '@/lib/store/use-config';
import { useProviderStore } from '@/lib/store/use-provider';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import GweiAmount from '@/components/common/gwei-amount';
import ShrinkedAddress from '@/components/common/shrinked-address';
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

  const chain = useProviderStore((state) => state.chain);
  const { caller, gasFeesConfig } = useConfigStore((state) => ({
    caller: state.caller,
    gasFeesConfig: state.gasFeesConfig,
  }));

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => setOpen(o)}>
        <SheetTrigger
          className="absolute right-4 top-4 md:hidden"
          style={{ zIndex: 50 }}
        >
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'transition-opacity duration-300',
              open && 'opacity-70',
            )}
          >
            <Settings className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="pt-2">
          <SheetHeader className="pb-4 text-muted-foreground">
            Config
          </SheetHeader>
          <SheetDescription>
            <div className="flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-out">
              <ChainSelection />
              <NativePriceSelection />

              <GasPriceSelection />
              <CallerSelection />
            </div>
          </SheetDescription>
        </SheetContent>
      </Sheet>

      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="font-medium"
              onClick={() => setOpen(true)}
            >
              {chain.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => setOpen(true)}>
              <GweiAmount
                amount={gasFeesConfig?.nextBaseFeePerGas || BigInt(0)}
              />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <ShrinkedAddress address={caller} />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};

export default ConfigMenu;
