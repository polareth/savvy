import { MemoryClient } from 'tevm';
import { Hex } from 'tevm/utils';

import { RollupFramework } from '@/lib/types/providers';

const BASE_FEE_SCALAR = BigInt(684000);
const BLOB_BASE_FEE_SCALAR = BigInt(0);
const COMPRESSION_SCALAR = BigInt(16);

// export const calculateL1DataFee = (
//   stack: RollupFramework,
//   txData: Hex,
//   baseFee: bigint,
//   blobBaseFee: bigint,
//   nativeTokenPrice: number,
//   nativeTokenDecimals: number,
// ) => {
//   if (stack === 'op-stack') {
//     return calculateOPStackL1DataFee(
//       txData,
//       baseFee,
//       blobBaseFee,
//       nativeTokenPrice,
//       nativeTokenDecimals,
//     );
//   }

//   // TODO TEMP not supporting Arbitrum Orbit yet
//   return { costNative: BigInt(0), costUsd: BigInt(0) };
// };

/**
 * @notice Calculate the L1 data fee on OP stack given the transaction data and gas fee
 * @param txData
 * @param baseFee
 * @param blobBaseFee
 * @param nativeTokenPrice
 * @param nativeTokenDecimals
 * @dev We're reproducing the following calculation described on the Optimism documentation:
 * tx_compressed_size = [(count_zero_bytes(tx_data)*4 + count_non_zero_bytes(tx_data)*16)] / 16
 * weighted_gas_price = 16*base_fee_scalar*base_fee + blob_base_fee_scalar*blob_base_fee
 * l1_data_fee = tx_compressed_size * weighted_gas_price
 * @see https://docs.optimism.io/stack/transactions/fees#ecotone
 */
// const calculateOPStackL1DataFee = (
//   txData: Hex,
//   baseFee: bigint,
//   blobBaseFee: bigint,
//   nativeTokenPrice: number,
//   nativeTokenDecimals: number,
// ) => {
//   const { zeroBytes, nonZeroBytes } = countBytes(txData);
//   const txCompressedSize =
//     (zeroBytes * BigInt(4) + nonZeroBytes * BigInt(16)) / COMPRESSION_SCALAR;

//   const weightedGasPrice =
//     COMPRESSION_SCALAR * baseFee * BASE_FEE_SCALAR +
//     blobBaseFee * BLOB_BASE_FEE_SCALAR;

//   const l1DataFee = txCompressedSize * weightedGasPrice;

//   return {
//     costNative: l1DataFee,
//     costUsd: nativeToUsd(l1DataFee, nativeTokenPrice, nativeTokenDecimals),
//   };
// };
