'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { GasCostEstimation } from '@/lib/types/gas';
import { useSelectionStore } from '@/lib/store/use-selection';
import { toastErrorWithContact } from '@/lib/utils';
import { estimateGasCostAirdrop } from '@/lib/utils/estimation/router';
import { Button } from '@/components/ui/button';
import TooltipResponsive from '@/components/common/tooltip-responsive';
import DataTableEstimation from '@/components/pages/solutions/airdrop/data-table-estimation';

const CostEstimation = () => {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const [estimation, setEstimation] = useState<GasCostEstimation | null>(null);

  /* --------------------------------- stores --------------------------------- */
  const {
    chainOption,
    gasFeesData,
    nativeTokenPrice,
    setSelectionDisabled,
    getCurrentChain,
  } = useSelectionStore.global((state) => ({
    chainOption: state.chainOption,
    gasFeesData: state.gasFeesData,
    nativeTokenPrice: state.nativeTokenPrice,
    setSelectionDisabled: state.setSelectionDisabled,
    getCurrentChain: state.getCurrentChain,
  }));
  const {
    tokenOption,
    methodOption,
    recipientsCount,
    customAirdropData,
    customToken,
    customTokenAddress,
    customTokenOwnerOrHolder,
    getCurrentAirdropSelection,
  } = useSelectionStore.airdrop((state) => ({
    tokenOption: state.tokenOption,
    methodOption: state.methodOption,
    recipientsCount: state.recipientsCount,
    customAirdropData: state.customAirdropData,
    customToken: state.customToken,
    customTokenAddress: state.customTokenAddress,
    customTokenOwnerOrHolder: state.customTokenOwnerOrHolder,
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
    const airdropData = customAirdropData.enabled
      ? {
          recipients: customAirdropData.recipients,
          amounts: customAirdropData.amounts,
          ids: customAirdropData.ids,
        }
      : { recipients: [], amounts: [], ids: [] };

    if (!currentChain || !solution) {
      toast.warning('Please select a chain and a solution');
      return;
    }

    if (!gasFeesData || !nativeTokenPrice) {
      toastErrorWithContact('There seems to be an issue fetching data.', '');
      return;
    }

    setLoading(true);
    setSelectionDisabled(true);
    const toastEstimating = toast.loading('Estimating costs...', {
      description: 'This may take a few minutes.',
      icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
    });

    try {
      const est = await estimateGasCostAirdrop(
        currentChain,
        solution,
        gasFeesData,
        nativeTokenPrice,
        recipientsCount,
        airdropData,
        customTokenParams,
      );
      setEstimation(est);
      console.log(est);

      if (est.error) {
        toastErrorWithContact(est.error, '', toastEstimating);
      } else {
        toast.success('Estimation successful.', {
          id: toastEstimating,
          description: 'You can see the results in the table.',
          icon: null,
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
    setSelectionDisabled(false);
  };

  /* --------------------------------- effects -------------------------------- */
  useEffect(() => {
    if (
      gasFeesData?.nextBaseFeePerGas &&
      chainOption &&
      tokenOption &&
      methodOption &&
      ((!customAirdropData.enabled && recipientsCount > 0) ||
        (customAirdropData.enabled &&
          customAirdropData.recipients.length > 0)) &&
      !loading
    ) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [
    chainOption,
    tokenOption,
    methodOption,
    gasFeesData,
    recipientsCount,
    loading,
    customAirdropData.enabled,
    customAirdropData.recipients.length,
  ]);

  /* -------------------------------- component ------------------------------- */
  return (
    <div className="flex flex-col">
      <TooltipResponsive
        trigger={
          <Button
            className="w-full"
            onClick={estimateCostForSolution}
            disabled={!ready}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Estimate cost
          </Button>
        }
        content="Please select a chain, a token and a method"
        disabled={ready || loading}
      />
      <div className="mt-4">
        {estimation || loading ? (
          <DataTableEstimation data={estimation} loading={loading} />
        ) : null}
      </div>
    </div>
  );
};

export default CostEstimation;
