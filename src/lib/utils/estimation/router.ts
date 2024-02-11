import { AirdropData, AirdropParams, AirdropSolution, AirdropUniqueId } from '@/lib/types/airdrop';
import { ApiTevmCall } from '@/lib/types/api';
import { Chain } from '@/lib/types/chains';
import { GasCostEstimation, GasFeesData } from '@/lib/types/estimate';
import { toastErrorWithContact } from '@/lib/utils';
import { calculate } from '@/lib/utils/estimation/calculate';
import { generateRandomAirdropData } from '@/lib/utils/estimation/random';

type CustomTokenParams = {
  enabled: boolean;
  contract: string;
  owner: string;
};

type EstimateGasCostAirdrop = (
  currentChain: Chain,
  solution: AirdropSolution,
  gasFeesData: GasFeesData,
  nativeTokenPrice: number,
  recipientCount: number,
  airdropData: AirdropData,
  customTokenParams: CustomTokenParams,
) => Promise<GasCostEstimation>;

/* -------------------------------------------------------------------------- */
/*                                   ROUTER                                   */
/* -------------------------------------------------------------------------- */

export const estimateGasCostAirdrop: EstimateGasCostAirdrop = async (
  currentChain,
  solution,
  gasFeesData,
  nativeTokenPrice,
  recipientCount,
  airdropData,
  customTokenParams,
) => {
  const { contract, deployments, id, functionName } = solution;
  const { hasCustomStack } = currentChain;

  /* ---------------------------------- CALL ---------------------------------- */
  // Prepare data for the call
  const forkUrl = currentChain.rpcUrl;
  const contractAddress = deployments[currentChain.config.id];
  const abi = contract.abi;
  const params = getAirdropParams(id, recipientCount, airdropData, customTokenParams);

  // Call the local chain
  const callRes = await fetch('/local-chain-estimate', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      id,
      forkUrl,
      contractAddress,
      abi,
      functionName,
      params,
      hasCustomStack,
    }),
  });

  const callResJson: ApiTevmCall = await callRes.json();

  if (callResJson.errors.length > 0) {
    console.error(callResJson.errors);

    return emptyGasCostEstimationWithError(
      currentChain,
      solution,
      gasFeesData,
      'Error estimating the gas costs',
    );
  }

  /* ----------------------------- USD CALCULATION ---------------------------- */
  // Total fee per gas would be only the base fee for a chain with no priority fee (e.g. Arbitrum One)
  const feePerGas = gasFeesData.hasChainPriorityFee
    ? gasFeesData.totalFeePerGas
    : gasFeesData.nextBaseFeePerGas;

  // Calculate costs in USD
  const costs = {
    deployment: {
      root: calculate.gasUsedAndFeeToUsd(
        Number(feePerGas),
        Number(callResJson.data.gasUsed.deployment.root),
        currentChain.config.nativeCurrency.decimals,
        nativeTokenPrice,
      ),
      l1submission: '0',
    },
    call: {
      root: calculate.gasUsedAndFeeToUsd(
        Number(feePerGas),
        Number(callResJson.data.gasUsed.call.root),
        currentChain.config.nativeCurrency.decimals,
        nativeTokenPrice,
      ),
      l1submission: '0',
    },
  };

  return {
    config: {
      chain: currentChain,
      solution,
      gasFeesData,
      nativeTokenPrice,
    },
    gasUsed: callResJson.data.gasUsed,
    gasCostsUsd: costs,
  };
};

/* -------------------------------------------------------------------------- */
/*                              FORMATTING PARAMS                             */
/* -------------------------------------------------------------------------- */

const getAirdropParams = (
  id: AirdropUniqueId,
  recipientCount: number,
  airdropData: AirdropData,
  customTokenParams: CustomTokenParams,
) => {
  const { recipients, amounts, ids, totalAmount } = extractOrRandomAirdropData(
    recipientCount,
    airdropData,
  );

  switch (id) {
    case 'push-native': {
      return {
        totalAmount: totalAmount,
        args: [recipients, amounts],
      } as AirdropParams['push-native'];
    }

    case 'push-ERC20': {
      // TODO Temp, always a non-custom token
      // const tokenAddress = (
      //   customTokenParams.enabled ? customTokenParams.contract : '0x'
      // ) as `0x${string}`;
      // const tokenOwner = (
      //   customTokenParams.enabled ? customTokenParams.owner : '0x'
      // ) as `0x${string}`;
      const tokenAddress = customTokenParams.contract as `0x${string}`;
      const tokenOwner = customTokenParams.owner as `0x${string}`;

      return {
        tokenAddress: tokenAddress,
        tokenOwner: tokenOwner,
        args: [tokenAddress, recipients, amounts, totalAmount],
      } as AirdropParams['push-ERC20'];
    }

    default:
      throw new Error('Invalid airdrop method');
  }
};

const extractOrRandomAirdropData = (recipientCount: number, airdropData: AirdropData) => {
  // we already made sure recipients.length === amounts.length
  if (airdropData.recipients.length > 0) {
    const { recipients, amounts, ids } = airdropData;
    return {
      recipients,
      amounts,
      ids,
      totalAmount: amounts.reduce((acc, amount) => acc + BigInt(amount), BigInt(0)).toString(),
    };
  }

  return generateRandomAirdropData(recipientCount);
};

const generateMerkleRoot = (recipients: string[], amounts: string[], ids?: string[]) => {
  return '';
};

/* -------------------------------------------------------------------------- */
/*                                    UTILS                                   */
/* -------------------------------------------------------------------------- */

const emptyGasCostEstimationWithError = (
  chain: Chain,
  solution: AirdropSolution,
  gasFeesData: GasFeesData,
  error: string,
) => {
  return {
    config: {
      chain,
      solution,
      gasFeesData,
      nativeTokenPrice: 0,
    },
    gasUsed: {
      deployment: { root: '0', l1submission: '0' },
      call: { root: '0', l1submission: '0' },
    },
    gasCostsUsd: {
      deployment: { root: '0', l1submission: '0' },
      call: { root: '0', l1submission: '0' },
    },
    error,
  };
};
