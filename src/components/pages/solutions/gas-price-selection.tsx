'use client';

import { useEffect, useState } from 'react';

import { formatGwei, parseGwei } from 'viem';

import { useSelectionStore } from '@/lib/store/use-selection';
import { getGasPrice } from '@/lib/utils/gas';

import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';

const GasPriceSelection = () => {
  const [loading, setLoading] = useState(false);
  const { chain, gasPrice, setGasPrice } = useSelectionStore.global((state) => ({
    chain: state.chainOption,
    gasPrice: state.gasPrice,
    setGasPrice: state.setGasPrice,
  }));

  useEffect(() => {
    const fetchAndUpdateGasPrice = async (chainId: number) => {
      setLoading(true);
      const gasPrice = await getGasPrice(chainId);
      setGasPrice(gasPrice);
      setLoading(false);
    };

    // chain.value is the chain id; retrieved from the chain selection
    if (chain) fetchAndUpdateGasPrice(Number(chain.value));
  }, [chain, setGasPrice]);

  return (
    <div>
      <Slider
        min={0}
        max={Number(parseGwei('1000'))}
        value={[Number(gasPrice)]}
        defaultValue={[Number(gasPrice)]}
        onValueChange={(e) => setGasPrice(BigInt(e[0]))}
      />
      {loading ? <Skeleton className="h-4 w-24 rounded-md" /> : formatGwei(gasPrice)}
    </div>
  );
};

export default GasPriceSelection;
