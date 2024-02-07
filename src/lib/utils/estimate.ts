import { getClient } from '../constants/provider';
import { CallError, CallResult, Tevm } from 'tevm';

import { AirdropSolution } from '@/lib/types/airdrop';
import { Chain } from '@/lib/types/chains';
import { GasCostEstimation, GasFeesData, TxCosts } from '@/lib/types/estimate';

type EstimateGasCostAirdrop = (
  currentChain: Chain,
  solution: AirdropSolution,
  gasFeesData: GasFeesData,
  nativeTokenPrice: number,
) => Promise<GasCostEstimation>;

type EstimateGasCostAirdrop_sub = (
  contract: string,
  functionSig: string,
  deployments: { [chain: Chain['config']['id']]: string },
  gasUsed: bigint,
  nativeTokenPrice: number,
  nativeTokenDecimals: number,
) => Promise<TxCosts>;

type EstimateGasCostAirdrop_subParams = Parameters<EstimateGasCostAirdrop_sub>;

/* -------------------------------------------------------------------------- */
/*                                   ROUTER                                   */
/* -------------------------------------------------------------------------- */

export const estimateGasCostAirdrop: EstimateGasCostAirdrop = async (
  currentChain,
  solution,
  gasFeesData,
  nativeTokenPrice,
) => {
  const { contract, functionSig, deployments } = solution;
  // Total fee per gas would be only the base fee for a chain with no priority fee (e.g. Arbitrum One)
  const gasUsed = gasFeesData.hasChainPriorityFee
    ? gasFeesData.totalFeePerGas
    : gasFeesData.nextBaseFeePerGas;

  const args: EstimateGasCostAirdrop_subParams = [
    contract,
    functionSig,
    deployments,
    gasUsed,
    nativeTokenPrice,
    currentChain.config.nativeCurrency.decimals,
  ];
  // Take chain (so can decide based on layer & hasCustomOPStack what to do next),
  // maybe tx data, gas price, token price, etc
  // Then call different function based on L1 (normal gas price estimation) or L2
  // (with L1 submission estimation as well)
  // Maybe will need different estimateGasForDeployment & estimateGasForCall?
  // Maybe if we can't calculate cost of deploying we can just craft the whole tx data/bytecode
  // Maybe if we can't estimate for a call to a nonexistent contract, we can create the bytecode of the call over the nondeployed contract???

  // Get txs data
  // const contractDeployment

  // ! TEMP test
  const result = await getClient(currentChain.config.id).estimateContractGas({
    address: deployments[currentChain.config.id],
    abi: [
      {
        inputs: [
          { internalType: 'address', name: '_token', type: 'address' },
          {
            internalType: 'address[]',
            name: '_addresses',
            type: 'address[]',
          },
          { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
          { internalType: 'uint256', name: '_totalAmount', type: 'uint256' },
        ],
        name: 'airdropERC20',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ],
    functionName: 'airdropERC20',
    account: '0xAD285b5dF24BDE77A8391924569AF2AD2D4eE4A7',
    args: [
      '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      ['0x514910771AF9Ca656af840dff83E8264EcF986CA'],
      [BigInt('1000000000000000000')],
      BigInt('1000000000000000000'),
    ],
  });
  console.log('result', result);

  const { layer, hasCustomStack } = currentChain;
  const estimatedCosts =
    // Reroute to OP L2 stack calculation if needed
    layer === 2 && hasCustomStack
      ? await estimateGasCostAirdrop_L2OP(...args)
      : await estimateGasCostAirdrop_L1(...args);

  return {
    config: {
      chain: currentChain,
      solution,
      gasFeesData,
      nativeTokenPrice,
    },
    ...estimatedCosts,
  };
};

/* -------------------------------------------------------------------------- */
/*                                    CHAIN                                   */
/* -------------------------------------------------------------------------- */
/* ----------------------------------- L1 ----------------------------------- */

const estimateGasCostAirdrop_L1: EstimateGasCostAirdrop_sub = async (
  contract,
  functionSig,
  deployments,
  gasUsed,
  nativeTokenPrice,
  nativeTokenDecimals,
) => {
  return {
    deployment: {
      rootCostUsd: 0,
      l1submissionCostUsd: 0,
    },
    call: {
      rootCostUsd: 0,
      l1submissionCostUsd: 0,
    },
  };
};

/* ----------------------------------- L2 ----------------------------------- */
const estimateGasCostAirdrop_L2OP: EstimateGasCostAirdrop_sub = async (
  contract,
  functionSig,
  deployments,
  gasUsed,
  nativeTokenPrice,
  nativeTokenDecimals,
) => {
  return {
    deployment: {
      rootCostUsd: 0,
      l1submissionCostUsd: 0,
    },
    call: {
      rootCostUsd: 0,
      l1submissionCostUsd: 0,
    },
  };
};

/* -------------------------------------------------------------------------- */
/*                                CALCULATIONS                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                         API FUNCTIONS (LOCAL CHAIN)                        */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- TYPES --------------------------------- */
type CallToLocalChainParams = {
  tevm: Tevm;
  caller: `0x${string}`;
  targetContract: `0x${string}`;
  encodedData: `0x${string}`;
  value: string;
  type: string;
};
type CallToLocalChain = (params: CallToLocalChainParams) => Promise<{
  gasUsed: string;
  errors: CallError[];
}>;

type CallToLocalChain_subParams = Omit<CallToLocalChainParams, 'type'>;
type CallToLocalChain_sub = (params: CallToLocalChain_subParams) => Promise<CallResult>;

/* --------------------------------- ROUTER --------------------------------- */
export const callToLocalChain: CallToLocalChain = async (params) => {
  const { type, ...rest } = params;
  const callResult = type === 'airdrop-eth' ? await airdropEth(rest) : await airdropEth(rest);

  const gasUsed = Number(callResult.executionGasUsed).toString();
  const errors = callResult.errors || [];

  return { gasUsed, errors };
};

/* ---------------------------------- CALLS --------------------------------- */
export const airdropEth: CallToLocalChain_sub = async ({
  tevm,
  caller,
  targetContract,
  encodedData,
  value,
}) => {
  return await tevm.call({
    caller,
    to: targetContract,
    value: BigInt(value),
    data: encodedData,
    skipBalance: true,
  });
};
