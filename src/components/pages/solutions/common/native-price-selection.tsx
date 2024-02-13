'use client';

import { FC, useCallback, useEffect, useState } from 'react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useSelectionStore } from '@/lib/store/use-selection';
import { cn } from '@/lib/utils';
import { fetchNativeTokenPrice } from '@/lib/utils/native-token';

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
  const [loading, setLoading] = useState(true);

  const { chainOption, nativeTokenPrice, formDisabled, getCurrentChain, setNativeTokenPrice } =
    useSelectionStore.global((state) => ({
      chainOption: state.chainOption,
      nativeTokenPrice: state.nativeTokenPrice,
      formDisabled: state.formDisabled,
      getCurrentChain: state.getCurrentChain,
      setNativeTokenPrice: state.setNativeTokenPrice,
    }));

  const fetchAndUpdateNativeTokenPrice = useCallback(async () => {
    setLoading(true);
    const currentChain = getCurrentChain();
    // TODO Handle error, if no current chain, should never be null
    if (!currentChain) return;

    const price = await fetchNativeTokenPrice(currentChain.nativeTokenSlug);
    setNativeTokenPrice(price);
    setLoading(false);
    setNativeTokenName(currentChain.config.nativeCurrency.name);
  }, [getCurrentChain, setNativeTokenPrice]);

  useEffect(() => {
    if (chainOption) fetchAndUpdateNativeTokenPrice();
  }, [chainOption, fetchAndUpdateNativeTokenPrice]);

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
      {loading ? (
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
        </div>
      )}
    </div>
  );
};

export default NativePriceSelection;
