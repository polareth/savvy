'use client';

import { useEffect, useState } from 'react';

import { useSelectionStore } from '@/lib/store/use-selection';
import { fetchNativeTokenPrice } from '@/lib/utils/native-token';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const NativePriceSelection = () => {
  const [loading, setLoading] = useState(false);
  const { chainOption, getCurrentChain, nativeTokenPrice, setNativeTokenPrice } =
    useSelectionStore.global((state) => ({
      chainOption: state.chainOption,
      getCurrentChain: state.getCurrentChain,
      nativeTokenPrice: state.nativeTokenPrice,
      setNativeTokenPrice: state.setNativeTokenPrice,
    }));

  useEffect(() => {
    const fetchAndUpdateNativeTokenPrice = async () => {
      setLoading(true);
      const currentChain = getCurrentChain();
      if (!currentChain) return;

      const price = await fetchNativeTokenPrice(currentChain.nativeTokenSlug);
      setNativeTokenPrice(price);
      setLoading(false);
    };

    if (chainOption) fetchAndUpdateNativeTokenPrice();
  }, [chainOption, getCurrentChain, setNativeTokenPrice]);

  // return price formatted in us dollars
  return (
    <div>
      {loading ? (
        <Skeleton className="my-1 h-4 w-24 rounded-md" />
      ) : (
        <div className="relative">
          <Input
            type="number"
            className="pl-8"
            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            value={Number(nativeTokenPrice.toFixed(2))}
            onChange={(e) => setNativeTokenPrice(Number(e.target.value))}
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
