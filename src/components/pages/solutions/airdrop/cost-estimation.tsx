'use client';

import { useEffect, useState } from 'react';

import { useSelectionStore } from '@/lib/store/use-selection';

import { Skeleton } from '@/components/ui/skeleton';

const CostEstimation = () => {
  const [loading, setLoading] = useState(false);
  const { chain, gasPrice, setGasPrice } = useSelectionStore.global((state) => ({
    chain: state.chainOption,
    gasPrice: state.gasPrice,
    setGasPrice: state.setGasPrice,
  }));

  const fetchAndUpdateGasPrice = async (chainId: number) => {
    setLoading(true);
    // ...
    setLoading(false);
  };

  return <div>{loading ? <Skeleton className="h-4 w-24 rounded-md" /> : 'result'}</div>;
};

export default CostEstimation;
