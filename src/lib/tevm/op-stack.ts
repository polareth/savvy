import { createGasPriceOracle, createL1Block, L1Client } from '@tevm/opstack';
import { encodePacked, MemoryClient } from 'tevm';
import { Hex } from 'tevm/utils';
import { toFunctionSelector } from 'viem';

import { nativeToUsd } from '../gas';

const DEPOSITOR_ACCOUNT = '0xDeaDDEaDDeAdDeAdDEAdDEaddeAddEAdDEAd0001';
const GasPriceOracle = createGasPriceOracle();
const L1Block = createL1Block();

type CalculateL1DataFee = (
  client: MemoryClient,
  opClient: L1Client,
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
 * @notice Create and initialize the client for OP stack operations (gas overrides and estimation)
 */
export const createAndInitializeL1Client = async () => {
  const { createL1Client } = await import('@tevm/opstack');
  // Create the L1 client
  const client = createL1Client();
  await client.ready();
  return client;
};

/**
 * @notice Calculate the L1 data fee for a transaction on the OP stack
 * @dev This will fetch the current base fee and blob base fee scalars from the chain, then use
 * a mock op client to set these values on the L1Block contract and call the GasPriceOracle to
 * calculate the L1 data fee for the transaction data.
 * @param client The memory client for the chain
 * @param opClient The OP stack memory client on Optimism
 * @param txData The serialized transaction data
 * @param baseFee The base fee for the transaction on the underlying chain
 * @param blobBaseFee The blob base fee for the transaction on the underlying chain
 * @param nativeTokenPrice The price of the native token in USD
 * @param nativeTokenDecimals The decimals of the native token
 */
// see https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L2/L1Block.sol#L101
export const calculateL1DataFee: CalculateL1DataFee = async (
  client,
  opClient,
  txData,
  baseFee,
  blobBaseFee,
  nativeTokenPrice,
  nativeTokenDecimals,
) => {
  // We just want to grab any first error that occurs, since any subsequent call would be inacurate
  try {
    // Create the L1Block and GasPriceOracle contracts
    await opClient.setAccount({
      address: L1Block.address,
      deployedBytecode: L1Block.deployedBytecode,
    });
    await opClient.setAccount({
      address: GasPriceOracle.address,
      deployedBytecode: GasPriceOracle.deployedBytecode,
    });

    // Find the scalar values for the base and blob base fees on this chain
    const { data: baseFeeScalar } = await client.contract({
      ...GasPriceOracle.read.baseFeeScalar(),
    });
    const { data: blobBaseFeeScalar } = await client.contract({
      ...GasPriceOracle.read.blobBaseFeeScalar(),
    });

    // Set the L1Block values
    await opClient.call({
      createTransaction: true,
      caller: DEPOSITOR_ACCOUNT,
      to: L1Block.address,
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
            baseFeeScalar || 0,
            blobBaseFeeScalar || 0,
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

    // Activate Ecotone (blobs) only if not already activated
    const { data: ecotoneActivated } = await opClient.contract({
      ...GasPriceOracle.read.isEcotone(),
    });
    if (!ecotoneActivated) {
      await opClient.contract({
        ...GasPriceOracle.write.setEcotone(),
        createTransaction: true,
        caller: DEPOSITOR_ACCOUNT,
      });
    }

    // Calculate the L1 data fee
    const { data: l1DataFee } = await opClient.contract({
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
