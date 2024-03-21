import { createGasPriceOracle, createL1Block } from '@tevm/opstack';
import { encodePacked, MemoryClient } from 'tevm';
import { Hex } from 'tevm/utils';
import { toFunctionSelector } from 'viem';

import { nativeToUsd } from '../gas';

const DEPOSITOR_ACCOUNT = '0xDeaDDEaDDeAdDeAdDEAdDEaddeAddEAdDEAd0001';
const GasPriceOracle = createGasPriceOracle();
const L1Block = createL1Block();

type CalculateL1DataFee = (
  client: MemoryClient,
  txData: Hex,
  baseFee: bigint,
  blobBaseFee: bigint,
  nativeTokenPrice: number,
  nativeTokenDecimals: number,
) => Promise<{
  native: bigint | undefined;
  usd: number | undefined;
  error: string | null;
}>;

/**
 * @notice Calculate the L1 data fee for a transaction on the OP stack
 * @dev This will fetch the current base fee and blob base fee scalars from the chain, then set
 * them on the L1Block contract and call the GasPriceOracle to calculate the L1 data fee for the transaction data.
 * @dev Here we're assuming the chain has activated the Ecotone upgrade. If it was not obvious, we could just check it
 * and then call either `setL1BlockValues()` or `setL1BlockValuesEcotone()` depending on the upgrade status.
 * @param client The memory client for the chain
 * @param txData The serialized transaction data
 * @param baseFee The base fee for the transaction on the underlying chain
 * @param blobBaseFee The blob base fee for the transaction on the underlying chain
 * @param nativeTokenPrice The price of the native token in USD
 * @param nativeTokenDecimals The decimals of the native token
 */
// see https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L2/L1Block.sol#L101
export const calculateL1DataFee: CalculateL1DataFee = async (
  client,
  txData,
  baseFee,
  blobBaseFee,
  nativeTokenPrice,
  nativeTokenDecimals,
) => {
  // We just want to grab any first error that occurs, since any subsequent call would be inacurate
  try {
    // Find the scalar values for the base and blob base fees on this chain
    const { data: baseFeeScalar } = await client.contract({
      ...GasPriceOracle.read.baseFeeScalar(),
    });

    const { data: blobBaseFeeScalar } = await client.contract({
      ...GasPriceOracle.read.blobBaseFeeScalar(),
    });

    // Set the L1Block values
    await client.call({
      caller: DEPOSITOR_ACCOUNT,
      to: L1Block.address,
      createTransaction: true,
      // We're encoding the data manually because the function doesn't specify inputs,
      // instead it uses the calldata directly
      data: (toFunctionSelector('setL1BlockValuesEcotone()') +
        encodePacked(
          [
            'uint32', // _baseFeeScalar
            'uint32', // _blobBaseFeeScalar
            'uint64', // _sequenceNumber
            'uint64', // _timestamp
            'uint64', // _number
            'uint256', // _basefee
            'uint256', // _blobBaseFee
            'bytes32', // _hash
            'bytes32', // _batcherHash
          ],
          [
            Number(baseFeeScalar) || 0,
            Number(blobBaseFeeScalar) || 0,
            BigInt(0),
            BigInt(0),
            BigInt(0),
            baseFee,
            blobBaseFee,
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ).slice(2)) as Hex,
    });

    // Calculate the L1 data fee
    const { data: l1DataFee } = await client.contract({
      ...GasPriceOracle.read.getL1Fee(txData),
    });

    // Convert the L1 data fee to USD
    const l1DataFeeUsd = l1DataFee
      ? nativeToUsd(l1DataFee, nativeTokenPrice, nativeTokenDecimals)
      : undefined;

    return { native: l1DataFee, usd: l1DataFeeUsd, error: null };
  } catch (err) {
    return {
      native: undefined,
      usd: undefined,
      error:
        err && typeof err === 'object' && 'message' in err
          ? (err.message as string)
          : err instanceof Error
            ? err.toString()
            : 'Unknown error',
    };
  }
};
