'use client';

import { useEffect, useState } from 'react';

import { formatGwei, parseGwei } from 'viem';

import { useSelectionStore } from '@/lib/store/use-selection';
import { toastErrorWithContact } from '@/lib/utils';
import { estimatePriorityFeesForBaseFee, getGasFeesData } from '@/lib/utils/gas';

import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const GasPriceSelection = () => {
  const [loading, setLoading] = useState(false);

  const [priorityFeeBounds, setPriorityFeeBounds] = useState<bigint[]>([
    BigInt(0),
    BigInt(0),
    BigInt(0),
  ]);
  const [selectedPriorityFee, setSelectedPriorityFee] = useState<'low' | 'mid' | 'high'>('low');

  const { chain, gasFeesData, setGasFeesData } = useSelectionStore.global((state) => ({
    chain: state.chainOption,
    gasFeesData: state.gasFeesData,
    setGasFeesData: state.setGasFeesData,
  }));

  useEffect(() => {
    const fetchAndUpdateGasPrice = async (chainId: number) => {
      setLoading(true);
      const gasFeesData = await getGasFeesData(chainId);
      setGasFeesData(gasFeesData);
      setLoading(false);

      // Display an error if we should get rewards data but failed to do so
      if (
        gasFeesData.hasChainPriorityFee &&
        Object.values(gasFeesData.baseFeeToPriorityFeeBounds).some((v) => v === BigInt(0))
      ) {
        toastErrorWithContact(
          'Error: gas fees',
          'Failed to retrieve enough fees history to calculate appropriate max priority fees.',
        );
      }
    };

    // chain.value is the chain id; retrieved from the chain selection
    if (chain) fetchAndUpdateGasPrice(Number(chain.value));
  }, [chain, setGasFeesData]);

  useEffect(() => {
    if (gasFeesData) {
      const { lowerBound, middleBound, upperBound } = estimatePriorityFeesForBaseFee(
        gasFeesData.nextBaseFee,
        gasFeesData.baseFeeToPriorityFeeBounds,
      );
      setPriorityFeeBounds([lowerBound, middleBound, upperBound]);
    } else {
      setPriorityFeeBounds([BigInt(0), BigInt(0), BigInt(0)]);
    }
  }, [gasFeesData]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        Base fee (simulate network conditions)
        <Slider
          // ! TEMP
          disabled
          min={0}
          max={Number(parseGwei('1000'))}
          value={[Number(gasFeesData?.nextBaseFee || 0)]}
          defaultValue={[0]}
          onValueChange={(v) => {
            gasFeesData ? setGasFeesData({ ...gasFeesData, nextBaseFee: BigInt(v[0]) }) : null;
          }}
        />
        {loading ? (
          <Skeleton className="h-4 w-24 rounded-md" />
        ) : (
          formatGwei(gasFeesData?.nextBaseFee || BigInt(0))
        )}
      </div>
      <div className="flex flex-col">
        <span>
          Priority fee (derived from the selected base fee, using historical data + give link)
        </span>
        <ToggleGroup
          // ! TEMP
          disabled
          type="single"
          value={selectedPriorityFee}
          onValueChange={(v) => {
            if (v) setSelectedPriorityFee(v as 'low' | 'mid' | 'high');
            if (gasFeesData) {
              const totalFee =
                v === 'low'
                  ? priorityFeeBounds[0]
                  : v === 'mid'
                  ? priorityFeeBounds[1]
                  : priorityFeeBounds[2];
              setGasFeesData({ ...gasFeesData, totalFee: gasFeesData?.nextBaseFee + totalFee });
            }
          }}
        >
          <ToggleGroupItem value="low" aria-label="Select low priority fee">
            Slow (
            {loading ? (
              <Skeleton className="h-4 w-24 rounded-md" />
            ) : (
              formatGwei(priorityFeeBounds[0])
            )}
            )
          </ToggleGroupItem>
          <ToggleGroupItem value="mid" aria-label="Select mid priority fee">
            Standard (
            {loading ? (
              <Skeleton className="h-4 w-24 rounded-md" />
            ) : (
              formatGwei(priorityFeeBounds[1])
            )}
            )
          </ToggleGroupItem>
          <ToggleGroupItem value="high" aria-label="Select high priority fee">
            Fast (
            {loading ? (
              <Skeleton className="h-4 w-24 rounded-md" />
            ) : (
              formatGwei(priorityFeeBounds[2])
            )}
            )
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

export default GasPriceSelection;
