'use client';

import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useSelectionStore } from '@/lib/store/use-selection';
import { GasCostEstimation } from '@/lib/types/estimate';
import { toastErrorWithContact } from '@/lib/utils';
import { estimateGasCostAirdrop } from '@/lib/utils/estimation/router';

import TooltipConditional from '@/components/common/tooltip-conditional';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const CostEstimation = () => {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const [estimation, setEstimation] = useState<GasCostEstimation | null>(null);

  /* --------------------------------- stores --------------------------------- */
  const { chainOption, gasFeesData, nativeTokenPrice, setFormDisabled, getCurrentChain } =
    useSelectionStore.global((state) => ({
      chainOption: state.chainOption,
      gasFeesData: state.gasFeesData,
      nativeTokenPrice: state.nativeTokenPrice,
      setFormDisabled: state.setFormDisabled,
      getCurrentChain: state.getCurrentChain,
    }));
  const {
    tokenOption,
    methodOption,
    recipientsCount,
    customToken,
    customTokenAddress,
    customTokenOwnerOrHolder,
    getCurrentAirdropSelection,
  } = useSelectionStore.airdrop((state) => ({
    customToken: state.customToken,
    customTokenAddress: state.customTokenAddress,
    customTokenOwnerOrHolder: state.customTokenOwnerOrHolder,
    tokenOption: state.tokenOption,
    methodOption: state.methodOption,
    recipientsCount: state.recipientsCount,
    getCurrentAirdropSelection: state.getCurrent,
  }));

  /* ------------------------------- estimation ------------------------------- */
  const estimateCostForSolution = async () => {
    const currentChain = getCurrentChain();
    const { solution } = getCurrentAirdropSelection();
    const customTokenParams = {
      enabled: customToken,
      contract: customTokenAddress,
      ownerOrHolder: customTokenOwnerOrHolder,
    };

    if (!currentChain || !solution) {
      toast.warning('Please select a chain and a solution');
      return;
    }

    if (!gasFeesData || !nativeTokenPrice) {
      toastErrorWithContact('There seems to be an issue fetching data.', '');
      return;
    }

    setLoading(true);
    setFormDisabled(true);
    const toastEstimating = toast.loading('Estimating costs...', {
      description: 'This may take a few minutes.',
    });

    try {
      const est = await estimateGasCostAirdrop(
        currentChain,
        solution,
        gasFeesData,
        nativeTokenPrice,
        recipientsCount,
        { recipients: [], amounts: [], ids: [] },
        customTokenParams,
      );
      setEstimation(est);

      if (est.error) {
        toastErrorWithContact(est.error, '', toastEstimating);
      } else {
        toast.success('Estimation successful.', {
          id: toastEstimating,
          description: 'You can see the results in the table.',
        });
      }
    } catch (error) {
      console.error(error);
      toastErrorWithContact(
        'There was an error estimating the costs.',
        'See the console for more information',
        toastEstimating,
      );
    }

    setLoading(false);
    setFormDisabled(false);
  };

  /* --------------------------------- effects -------------------------------- */
  useEffect(() => {
    if (
      gasFeesData?.nextBaseFeePerGas &&
      chainOption &&
      tokenOption &&
      methodOption &&
      recipientsCount > 0 &&
      !loading
    ) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [chainOption, tokenOption, methodOption, gasFeesData, recipientsCount, loading]);

  /* -------------------------------- component ------------------------------- */
  return (
    <div className="flex flex-col">
      <TooltipConditional
        condition={!ready && !loading}
        tooltip="Please select a chain, a token and a method"
      >
        <Button className="w-full" onClick={estimateCostForSolution} disabled={!ready}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Estimate cost
        </Button>
      </TooltipConditional>
      <div className="mt-4">
        {loading ? (
          <Skeleton className="h-8 w-full rounded-md" />
        ) : estimation?.gasUsed && estimation.gasCostsUsd ? (
          <div className="flex flex-col">
            <span className="font-medium">Deployment</span>
            <span>
              Gas used: {estimation.gasUsed.deployment.root} +{' '}
              {estimation.gasUsed.deployment.l1submission}
            </span>
            <span>
              Cost in USD: {estimation.gasCostsUsd.deployment.root} +{' '}
              {estimation.gasCostsUsd.deployment.l1submission}
            </span>
            <span className="mt-4 font-medium">Call</span>
            <span>
              Gas used: {estimation.gasUsed.call.root} + {estimation.gasUsed.call.l1submission}
            </span>
            <span>
              Cost in USD: {estimation.gasCostsUsd.call.root} +{' '}
              {estimation.gasCostsUsd.call.l1submission}
            </span>
          </div>
        ) : (
          'no estimation yet'
        )}
      </div>
    </div>
  );
};

export default CostEstimation;
