/**
 * @notice Opinionated gas controls for a chain to provide pertinent values
 * @param min The minimum gas price
 * @param max The maximum gas price
 * @param step The step for variation
 * @param gweiDecimals The number of decimals to display (depending on the native token's relative USD price)
 */
export type GasControls = {
  min: bigint;
  max: bigint;
  step: bigint;
  gweiDecimals: number;
};

/**
 * @notice The selected gas data for a chain
 * @param nextBaseFeePerGas The base fee per unit of gas for the next block
 * @param baseFeeToPriorityFeeBounds The ratio of base fee to a priority fee that makes sense
 * @param priorityFeePerGas The priority fee per unit of gas
 * @param analysisPeriod The period used for the analysis of priority fees
 * @param hasChainPriorityFee Whether the chain has priority fees or not
 * @param gasControls The gas controls for this chain
 * @param underlyingNextBaseFeePerGas The base fee per unit of gas for the next block on the underlying chain
 * @param underlyingBlobBaseFeePerGas The blob base fee for the underlying chain
 */
export type GasFeesConfig = {
  nextBaseFeePerGas: bigint;
  baseFeeToPriorityFeeBounds: {
    low: bigint;
    mid: bigint;
    high: bigint;
  };
  priorityFeePerGas?: bigint; // default: base fee + lower bound priority fee
  analysisPeriod: number; // Interval between the first and last block used for the analysis
  hasChainPriorityFee: boolean;
  gasControls: GasControls;
  underlyingNextBaseFeePerGas?: bigint;
  underlyingBlobBaseFeePerGas?: bigint;
};
