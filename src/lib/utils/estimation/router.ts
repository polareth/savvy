import { toastErrorWithContact } from '..';
import { CallError } from '@tevm/api';

import { AirdropData, AirdropMethod, AirdropSolution, Token } from '@/lib/types/airdrop';
import { Chain } from '@/lib/types/chains';
import { GasCostEstimation, GasFeesData, TxGasUsed } from '@/lib/types/estimate';
import { generateRandomAirdropData } from '@/lib/utils/estimation/random';

type EstimateGasCostAirdrop = (
  currentChain: Chain,
  solution: AirdropSolution,
  gasFeesData: GasFeesData,
  nativeTokenPrice: number,
  recipientCount: number,
  airdropData?: AirdropData,
) => Promise<GasCostEstimation>;

type ApiCallData = {
  status: number;
  data: { gasUsed: TxGasUsed };
  errors: CallError[];
};

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
) => {
  const { contract, deployments, id, functionName } = solution;
  const { hasCustomStack } = currentChain;

  /* ---------------------------------- CALL ---------------------------------- */
  // Prepare data for the call
  const forkUrl = currentChain.rpcUrl;
  const contractAddress = deployments[currentChain.config.id];
  const abi = contract.abi;
  const args = getAirdropArgs(id, recipientCount, airdropData);

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
      args,
      hasCustomStack,
    }),
  });

  const callData: ApiCallData = await callRes.json();

  if (callData.errors.length > 0) {
    toastErrorWithContact('Error estimating the gas cost.', 'See the console for more details.');
    console.error(callData.errors);

    return {
      config: {
        chain: currentChain,
        solution,
        gasFeesData,
        nativeTokenPrice,
      },
      gasUsed: {
        deployment: { root: '0', l1submission: '0' },
        call: { root: '0', l1submission: '0' },
      },
      gasCostsUsd: {
        deployment: { root: '0', l1submission: '0' },
        call: { root: '0', l1submission: '0' },
      },
    };
  }

  /* ----------------------------- USD CALCULATION ---------------------------- */
  // Total fee per gas would be only the base fee for a chain with no priority fee (e.g. Arbitrum One)
  const feePerGas = gasFeesData.hasChainPriorityFee
    ? gasFeesData.totalFeePerGas
    : gasFeesData.nextBaseFeePerGas;

  // Calculate costs in USD
  const costs = {
    deployment: {
      root: gasUsedAndFeeToUsd(
        Number(feePerGas),
        Number(callData.data.gasUsed.deployment.root),
        currentChain.config.nativeCurrency.decimals,
        nativeTokenPrice,
      ),
      l1submission: '0',
    },
    call: {
      root: gasUsedAndFeeToUsd(
        Number(feePerGas),
        Number(callData.data.gasUsed.call.root),
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
    gasUsed: callData.data.gasUsed,
    gasCostsUsd: costs,
  };
};

/* -------------------------------------------------------------------------- */
/*                                CALCULATIONS                                */
/* -------------------------------------------------------------------------- */

const gasUsedAndFeeToUsd = (
  feePerGas: number,
  gasUsed: number,
  decimals: number,
  nativeTokenPrice: number,
) => {
  return ((gasUsed * feePerGas * nativeTokenPrice) / 10 ** decimals).toString();
};

/* -------------------------------------------------------------------------- */
/*                                    UTILS                                   */
/* -------------------------------------------------------------------------- */

const getAirdropArgs = (
  id: `${AirdropMethod['id']}-${Token['id']}`,
  recipientCount: number,
  airdropData?: AirdropData,
) => {
  const { recipients, amounts, ids, totalAmount } = extractOrRandomAirdropData(
    recipientCount,
    airdropData,
  );

  // We pass totalAmount for 'push-native' for easier access to transfer to the contract
  // but it's not actually used as an arg
  return id === 'push-native' || id === 'push-ERC20'
    ? [recipients, amounts, totalAmount]
    : id === 'push-ERC721'
    ? [recipients, ids]
    : id === 'push-ERC1155'
    ? [recipients, amounts, ids]
    : id === 'merkle-native' || id === 'merkle-ERC20'
    ? generateMerkleRoot(recipients, amounts)
    : id === 'merkle-ERC721'
    ? generateMerkleRoot(recipients, ids)
    : id === 'merkle-ERC1155'
    ? generateMerkleRoot(recipients, amounts, ids)
    : [];
};

const extractOrRandomAirdropData = (recipientCount: number, airdropData?: AirdropData) => {
  // we already made sure recipients.length === amounts.length
  if (airdropData && airdropData.recipients.length > 0) {
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
