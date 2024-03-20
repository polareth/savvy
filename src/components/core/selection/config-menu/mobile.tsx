'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
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
import CallerSelection from '@/components/core/selection/caller';
import ChainSelection from '@/components/core/selection/chain';
import GasPriceSelection from '@/components/core/selection/gas-price';
import NativePriceSelection from '@/components/core/selection/native-price';

/**
 * @notice The configuration menu on mobile to define parameters for the calls/estimations
 * @dev This will display a bottom-sliding menu on mobile and a side menu on desktop.
 * @dev This includes the chain, gas price, native price, and caller selection.
 */
const ConfigMenuMobile = () => {
  const [open, setOpen] = useState(false);
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const chain = useProviderStore((state) => state.chain);
  const gasFeesConfig = useConfigStore((state) => state.gasFeesConfig);

  if (!isTablet) return null;
  return (
    <>
      <Sheet open={open} onOpenChange={(o) => setOpen(o)}>
        <SheetTrigger>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'ml-1 transition-opacity duration-300',
                      open && 'opacity-70',
                    )}
                  >
                    <Settings className="h-6 w-5" />
                  </Button>
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="font-medium">
                  {chain.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <GweiAmount
                    amount={gasFeesConfig?.nextBaseFeePerGas || BigInt(0)}
                  />
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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
    </>
  );
};

export default ConfigMenuMobile;
