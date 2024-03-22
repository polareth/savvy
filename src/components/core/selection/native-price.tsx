'use client';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useConfigStore } from '@/lib/store/use-config';
import { useProviderStore } from '@/lib/store/use-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/common/icons';
import TooltipResponsive from '@/components/common/tooltip-responsive';

/**
 * @notice The native price selection
 * @dev This will display the native price for the chain, and let the user update it.
 * @dev The price will be formatted in USD.
 */
const NativePriceSelection = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md

  // Get the chain and its initializing status
  const { chain, initializing } = useProviderStore((state) => ({
    chain: state.chain,
    initializing: state.initializing,
  }));

  // Get the native token price, its fetching status and its getter/setter
  const {
    nativeTokenPrice,
    fetchingNativeTokenPrice,
    getLatestNativeTokenPrice,
    setNativeTokenPrice,
  } = useConfigStore((state) => ({
    nativeTokenPrice: state.nativeTokenPrice,
    fetchingNativeTokenPrice: state.fetchingNativeTokenPrice,
    getLatestNativeTokenPrice: state.getLatestNativeTokenPrice,
    setNativeTokenPrice: state.setNativeTokenPrice,
  }));

  const loading = initializing || fetchingNativeTokenPrice;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground md:text-sm">
        <Icons.bullet className="mr-0" /> {chain.nativeCurrency.name} price
        <TooltipResponsive
          trigger="info"
          content="Simulate a different price for the native token in USD"
        />
        <span className="grow" />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 justify-end"
          onClick={getLatestNativeTokenPrice}
          disabled={loading}
        >
          latest
        </Button>
      </div>
      {loading ? (
        <Button variant="ghost" className="p-0">
          <Skeleton className="h-full w-full rounded-md" />
        </Button>
      ) : (
        <div className="relative">
          <Input
            type="number"
            className="pl-8 font-mono"
            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            value={Number(nativeTokenPrice.toFixed(2))}
            onChange={(e) => setNativeTokenPrice(Number(e.target.value))}
          />
          <span className="absolute left-3 top-[50%] translate-y-[-50%] text-sm text-muted-foreground">
            $
          </span>
          {!isDesktop ? (
            <TooltipResponsive
              trigger="info"
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
