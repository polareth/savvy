'use client';

import { useEffect, useState } from 'react';

import { useSelectionStore } from '@/lib/store/use-selection';
import { fetchNativeTokenPrice } from '@/lib/utils/native-token';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const NativePriceSelection = () => {
  const [loading, setLoading] = useState(false);
  const { chain, current, nativeTokenPrice, setNativeTokenPrice } = useSelectionStore((state) => ({
    chain: state.chain,
    current: state.current,
    nativeTokenPrice: state.nativeTokenPrice,
    setNativeTokenPrice: state.setNativeTokenPrice,
  }));

  useEffect(() => {
    const fetchAndUpdateNativeTokenPrice = async () => {
      setLoading(true);
      const currentChain = current().chain;
      if (!currentChain) return;

      const price = await fetchNativeTokenPrice(currentChain.nativeTokenSlug);
      setNativeTokenPrice(price);
      setLoading(false);
    };

    if (chain) fetchAndUpdateNativeTokenPrice();
  }, [chain, current, setNativeTokenPrice]);

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
