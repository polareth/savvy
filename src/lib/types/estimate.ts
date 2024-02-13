import { AirdropSolution } from '@/lib/types/airdrop';
import { Chain } from '@/lib/types/chains';

export type GasControls = {
  min: number;
  max: number;
  step: number;
  gweiDecimals: number;
};

export type GasFeesData = {
  nextBaseFeePerGas: bigint;
  baseFeeToPriorityFeeBounds: {
    lowRatio: bigint;
    middleRatio: bigint;
    highRatio: bigint;
  };
  totalFeePerGas: bigint; // default: base fee + lower bound priority fee
  analysisPeriod: number; // Interval between the first and last block used for the analysis
  hasChainPriorityFee: boolean;
  gasControls: GasControls;
};

type TxGasResult = {
  deployment: {
    root: string;
    l1submission?: string;
  };
  call: {
    root: string;
    l1submission?: string;
  };
};

export type TxGasUsed = TxGasResult;
export type TxGasCostsUsd = TxGasResult;

export type GasCostEstimation = {
  config: {
    chain: Chain;
    solution: AirdropSolution;
    gasFeesData: GasFeesData;
    nativeTokenPrice: number;
  };
  gasUsed: TxGasUsed;
  gasCostsUsd: TxGasCostsUsd;
  error?: string;
};
