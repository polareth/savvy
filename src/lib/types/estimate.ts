import { AirdropSolution } from '@/lib/types/airdrop';
import { Chain } from '@/lib/types/chains';

export type GasControls = {
  min: bigint;
  max: bigint;
  step: bigint;
};

export type GasFeesData = {
  nextBaseFee: bigint;
  baseFeeToPriorityFeeBounds: {
    lowRatio: bigint;
    middleRatio: bigint;
    highRatio: bigint;
  };
  totalFee: bigint; // default: base fee + lower bound priority fee
  analysisPeriod: number; // Interval between the first and last block used for the analysis
  hasChainPriorityFee: boolean;
};

export type TxCosts = {
  deployment: {
    rootCostUsd: number;
    l1submissionCostUsd?: number;
  };
  call: {
    rootCostUsd: number;
    l1submissionCostUsd?: number;
  };
};

export type GasCostEstimation = TxCosts & {
  config: {
    chain: Chain;
    solution: AirdropSolution;
    gasPrice: bigint;
    nativeTokenPrice: number;
  };
};
