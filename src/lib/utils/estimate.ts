import { AirdropSolution } from '@/lib/types/airdrop';
import { Chain } from '@/lib/types/chains';
import { GasCostEstimation, TxCosts } from '@/lib/types/estimate';

type EstimateGasCostAirdrop = (
  currentChain: Chain,
  solution: AirdropSolution,
  gasPrice: bigint,
  nativeTokenPrice: number,
) => Promise<GasCostEstimation>;

type EstimateGasCostAirdrop_sub = (
  contract: string,
  functionSig: string,
  deployments: { [chain: Chain['config']['id']]: string },
  gasPrice: bigint,
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
  gasPrice,
  nativeTokenPrice,
) => {
  const { contract, functionSig, deployments } = solution;
  const args: EstimateGasCostAirdrop_subParams = [
    contract,
    functionSig,
    deployments,
    gasPrice,
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
      gasPrice,
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
  gasPrice,
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
  gasPrice,
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
