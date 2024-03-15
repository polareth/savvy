import { isAddress } from 'viem';

import { ApiTevmCall } from '@/lib/types/api';
import { Chain, CustomStackSupport } from '@/lib/types/chains';
import { GasCostEstimation, GasFeesConfig, TxGasUsed } from '@/lib/types/gas';
import {
  AirdropData,
  AirdropParams,
  AirdropSolution,
  AirdropUniqueId,
} from '@/lib/types/solutions/airdrop';
import { calculate } from '@/lib/utils/estimation/calculate';
import { generateRandomAirdropData } from '@/lib/utils/estimation/random';

type CustomTokenParams = {
  enabled: boolean;
  contract: string;
  ownerOrHolder: string;
};

type EstimateGasCostAirdrop = (
  currentChain: Chain,
  solution: AirdropSolution,
  gasFeesData: GasFeesConfig,
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
  const { customStack } = currentChain;

  /* ---------------------------------- CALL ---------------------------------- */
  // Prepare data for the call
  const forkUrl = currentChain.rpcUrl;
  const contractAddress = deployments[currentChain.config.id];
  const abi = contract.abi;
  const params = getAirdropParams(
    id,
    recipientCount,
    airdropData,
    customTokenParams,
  );

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
      customStack,
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
    ? gasFeesData.nextBaseFeePerGas + gasFeesData.priorityFeePerGas
    : gasFeesData.nextBaseFeePerGas;

  // Calculate costs
  const { gasCostsUsd, gasCostsNative } = getCosts(
    Number(feePerGas),
    callResJson.data.gasUsed,
    currentChain.config.nativeCurrency.decimals,
    nativeTokenPrice,
    customStack,
  );

  return {
    config: {
      chain: currentChain,
      solution,
      gasFeesData,
      nativeTokenPrice,
    },
    gasUsed: callResJson.data.gasUsed,
    gasCostsUsd,
    gasCostsNative,
  };
};

const getCosts = (
  feePerGas: number,
  gasUsed: TxGasUsed,
  decimals: number,
  nativeTokenPrice: number,
  customStack: CustomStackSupport | undefined,
) => ({
  gasCostsUsd: {
    deployment: {
      root: calculate.gasUsedAndFeeToUsd(
        feePerGas,
        Number(gasUsed.deployment.root),
        decimals,
        nativeTokenPrice,
      ),
      l1Submission: customStack
        ? calculate[customStack.model].l1SubmissionGasUsedAndFeeToUsd(
            Number(30000000000), // TODO Implement base fee for the underlying as well
            Number(gasUsed.deployment.l1Submission),
            decimals,
            nativeTokenPrice,
          )
        : '0',
    },
    call: {
      root: calculate.gasUsedAndFeeToUsd(
        feePerGas,
        Number(gasUsed.call.root),
        decimals,
        nativeTokenPrice,
      ),
      l1Submission: customStack
        ? calculate[customStack.model].l1SubmissionGasUsedAndFeeToUsd(
            Number(30000000000), // TODO Implement base fee for the underlying as well
            Number(gasUsed.call.l1Submission),
            decimals,
            nativeTokenPrice,
          )
        : '0',
    },
  },
  gasCostsNative: {
    deployment: {
      root: calculate.gasUsedAndFeeToNative(
        feePerGas,
        Number(gasUsed.deployment.root),
        decimals,
      ),
      l1Submission: customStack
        ? calculate[customStack.model].l1SubmissionGasUsedAndFeeToNative(
            Number(30000000000), // TODO Implement base fee for the underlying as well
            Number(gasUsed.deployment.l1Submission),
            decimals,
          )
        : '0',
    },
    call: {
      root: calculate.gasUsedAndFeeToNative(
        feePerGas,
        Number(gasUsed.call.root),
        decimals,
      ),
      l1Submission: customStack
        ? calculate[customStack.model].l1SubmissionGasUsedAndFeeToNative(
            Number(30000000000), // TODO Implement base fee for the underlying as well
            Number(gasUsed.call.l1Submission),
            decimals,
          )
        : '0',
    },
  },
});

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
      const tokenAddress = (
        customTokenParams.enabled && isAddress(customTokenParams.contract)
          ? customTokenParams.contract
          : '0x'
      ) as `0x${string}`;
      const tokenOwnerOrHolder = (
        customTokenParams.enabled && isAddress(customTokenParams.ownerOrHolder)
          ? customTokenParams.ownerOrHolder
          : '0x'
      ) as `0x${string}`;

      return {
        tokenAddress: tokenAddress,
        tokenOwnerOrHolder: tokenOwnerOrHolder,
        args: [tokenAddress, recipients, amounts, totalAmount],
      } as AirdropParams['push-ERC20'];
    }

    default:
      throw new Error('Invalid airdrop method');
  }
};

const extractOrRandomAirdropData = (
  recipientCount: number,
  airdropData: AirdropData,
) => {
  // we already made sure recipients.length === amounts.length
  if (airdropData.recipients.length > 0) {
    const { recipients, amounts, ids } = airdropData;
    return {
      recipients,
      amounts,
      ids,
      totalAmount: amounts
        .reduce((acc, amount) => acc + BigInt(amount), BigInt(0))
        .toString(),
    };
  }

  return generateRandomAirdropData(recipientCount);
};

const generateMerkleRoot = (
  recipients: string[],
  amounts: string[],
  ids?: string[],
) => {
  return '';
};

/* -------------------------------------------------------------------------- */
/*                                    UTILS                                   */
/* -------------------------------------------------------------------------- */

const emptyGasCostEstimationWithError = (
  chain: Chain,
  solution: AirdropSolution,
  gasFeesData: GasFeesConfig,
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
      deployment: { root: '0', l1Submission: '0' },
      call: { root: '0', l1Submission: '0' },
    },
    gasCostsUsd: {
      deployment: { root: '0', l1Submission: '0' },
      call: { root: '0', l1Submission: '0' },
    },
    gasCostsNative: {
      deployment: { root: '0', l1Submission: '0' },
      call: { root: '0', l1Submission: '0' },
    },
    error,
  };
};
