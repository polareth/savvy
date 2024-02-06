'use client';

import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { useSelectionStore } from '@/lib/store/use-selection';
import { GasCostEstimation } from '@/lib/types/estimate';
import { estimateGasCostAirdrop } from '@/lib/utils/estimate';

import TooltipConditional from '@/components/common/tooltip-conditional';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const CostEstimation = () => {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const [estimation, setEstimation] = useState<GasCostEstimation | null>(null);

  /* --------------------------------- stores --------------------------------- */
  const { chainOption, getCurrentChain, gasPrice, nativeTokenPrice } = useSelectionStore.global(
    (state) => ({
      chainOption: state.chainOption,
      getCurrentChain: state.getCurrentChain,
      gasPrice: state.gasPrice,
      nativeTokenPrice: state.nativeTokenPrice,
    }),
  );
  const { tokenOption, methodOption, getCurrentAirdropSelection } = useSelectionStore.airdrop(
    (state) => ({
      tokenOption: state.tokenOption,
      methodOption: state.methodOption,
      getCurrentAirdropSelection: state.getCurrent,
    }),
  );

  /* ------------------------------- estimation ------------------------------- */
  const estimateCostForSolution = async () => {
    const currentChain = getCurrentChain();
    const { solution } = getCurrentAirdropSelection();
    if (!currentChain || !solution) {
      toast.warning('Please select a chain and a solution');
      return;
    }

    setLoading(true);
    // const est = await estimateGasCostAirdrop(currentChain, solution, gasPrice, nativeTokenPrice);
    // setEstimation(est);
    setLoading(false);
  };

  /* --------------------------------- effects -------------------------------- */
  useEffect(() => {
    if (chainOption && tokenOption && methodOption) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [chainOption, tokenOption, methodOption]);

  /* -------------------------------- component ------------------------------- */
  return (
    <div className="flex flex-col">
      <TooltipConditional condition={!ready} tooltip="Please select a chain, a token and a method">
        <Button className="w-full" onClick={estimateCostForSolution} disabled={!ready}>
          Estimate cost
        </Button>
      </TooltipConditional>
      {loading ? <Skeleton className="h-4 w-24 rounded-md" /> : 'result'}
    </div>
  );
};

export default CostEstimation;
