'use client';

import { FC, useEffect, useState } from 'react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useSelectionStore } from '@/lib/store/use-selection';
import { cn, toastErrorWithContact } from '@/lib/utils';

import PopoverInfo from '@/components/common/popover-info';
import TooltipInfo from '@/components/common/tooltip-info';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

type NativePriceSelectionProps = {
  className?: string;
};

const NativePriceSelection: FC<NativePriceSelectionProps> = ({ className }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const [nativeTokenName, setNativeTokenName] = useState<string>('Native token');

  const {
    chain,
    nativeTokenPrice,
    formDisabled,
    fetchingNativeTokenPrice,
    getCurrentChain,
    fetchAndUpdateNativeTokenPrice,
    setNativeTokenPrice,
  } = useSelectionStore.global((state) => ({
    chain: state.chainOption,
    nativeTokenPrice: state.nativeTokenPrice,
    formDisabled: state.formDisabled,
    fetchingNativeTokenPrice: state.fetchingNativeTokenPrice,
    getCurrentChain: state.getCurrentChain,
    fetchAndUpdateNativeTokenPrice: state.fetchAndUpdateNativeTokenPrice,
    setNativeTokenPrice: state.setNativeTokenPrice,
  }));

  useEffect(() => {
    const init = async () => {
      const currentChain = getCurrentChain();
      if (currentChain) {
        const { success, error } = await fetchAndUpdateNativeTokenPrice();
        if (!success && error) toastErrorWithContact(error.title, error.message);
        setNativeTokenName(currentChain.config.nativeCurrency.name || 'Native token');
      }
    };

    init();
  }, [chain, getCurrentChain, fetchAndUpdateNativeTokenPrice]);

  useEffect(() => {
    console.log('nativeTokenPrice', nativeTokenPrice);
  }, [nativeTokenPrice]);

  // return price formatted in us dollars
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {isDesktop ? (
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          3. {nativeTokenName} price
          <TooltipInfo content="Simulate a different price for the native token in USD" />
          <span className="grow" />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 justify-end"
            onClick={fetchAndUpdateNativeTokenPrice}
          >
            reset
          </Button>
        </span>
      ) : null}
      {fetchingNativeTokenPrice ? (
        <Button variant="ghost" className="p-0">
          <Skeleton className="h-full w-full rounded-md" />
        </Button>
      ) : (
        <div className="relative">
          <Input
            type="number"
            className="pl-8"
            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            value={Number(nativeTokenPrice.toFixed(2))}
            onChange={(e) => setNativeTokenPrice(Number(e.target.value))}
            disabled={formDisabled}
          />
          <span className="absolute left-3 top-[50%] translate-y-[-50%] text-sm text-muted-foreground">
            $
          </span>
          {!isDesktop ? (
            <PopoverInfo
              content="Simulate a different price for the native token in USD"
              classNameTrigger="absolute right-3 top-1/2 -translate-y-1/2 transform"
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default NativePriceSelection;
