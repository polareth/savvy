'use client';

import { ABI, ABIFunction } from '@shazow/whatsabi/lib.types/abi';
import { toast } from 'sonner';
import { Abi, CallParams, ContractParams, MemoryClient } from 'tevm';
import { Address, encodeFunctionData, Hex } from 'tevm/utils';
import { serializeTransaction } from 'viem/op-stack';

import { ExpectedType, TxContext, TxEntry, TxResponse } from '@/lib/types/tx';
import { CHAINS } from '@/lib/constants/providers';
import { calculateGasCost } from '@/lib/gas';
import { formatTx as formatTxForLocalStorage } from '@/lib/local-storage';
import { calculateL1DataFee as calculateOpStackL1DataFee } from '@/lib/tevm/op-stack';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

/**
 * @type {Function} CallContract
 * @param {MemoryClient} client The client to call the function on
 * @param {Address} caller The address of the caller to impersonate
 * @param {Address} contract The address of the target contract
 * @param {string} functionName The name of the function
 * @param {ABI} abi The ABI of the contract
 * @param {ExpectedType[]} args The input values to pass
 * @param {string} value The value to send with the transaction
 * @param {boolean} skipBalance Whether to skip the balance check
 * @returns {Promise<TxResponse>} The result of the transaction
 * or an unexpected error (caught in the catch block)
 */
type CallContract = (
  client: MemoryClient,
  caller: Address,
  contract: Address,
  functionName: string,
  abi: ABI,
  args: ExpectedType[],
  value: string,
  skipBalance?: boolean,
) => Promise<TxResponse>;

/**
 * @type {Function} CallWithArbitraryData
 * @param {MemoryClient} client The client to execute the call on
 * @param {Address} caller The address of the caller to impersonate
 * @param {Address} target The address of the target contract or account
 * @param {Hex} data The encoded hex data
 * @param {string} value The value to send with the transaction
 * @param {boolean} skipBalance Whether to skip the balance check
 */
type CallWithArbitraryData = (
  client: MemoryClient,
  caller: Address,
  target: Address,
  data: Hex,
  value: string,
  skipBalance?: boolean,
) => Promise<TxResponse>;

/**
 * @type {Function} HandleCall
 * @param {MemoryClient} client The client to execute the call on
 * @param {CallParams | ContractParams} params The parameters to pass for the call
 * @param {string} value The value to send with the transaction
 * @param {Hex} encodeData The encoded data to send with the transaction
 * @param {boolean} lowLevel Whether to use the low level call method (`Client.call`)
 * @returns {Promise<TxResponse>} The result of the transaction
 */
type HandleCall = (
  client: MemoryClient,
  params: CallParams | ContractParams,
  value: string,
  encodeData: Hex,
  lowLevel: boolean,
) => Promise<TxResponse>;

/**
 * @type {Function} HandleAfterCall
 * @param {TxResponse} tx The result of the transaction
 * @param {TxContext} context The context of the transaction
 * @param {string} id The unique id of the transaction
 * @param {string | number} toastId The id of the toast to update
 * @returns {Promise<TxEntry>} The formatted transaction
 */
type HandleAfterCall = (
  tx: TxResponse,
  context: TxContext,
  id: string,
  client: MemoryClient,
  toastId: string | number,
) => Promise<TxEntry>;

/* -------------------------------------------------------------------------- */
/*                                  FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */

/* -------------------------------- CONTRACT -------------------------------- */
/**
 * @notice Call a function on a given fork using its Tevm client
 * @dev This will call the function on the local fork and return the transaction hash.
 * @dev If enough information was given to decode the output (meaning an abi with actual outputs fields),
 * it will use the Tevm `Client.contract` method; otherwise it will use `Client.call` with the encoded data.
 */
export const callContract: CallContract = async (
  client,
  caller,
  contract,
  functionName,
  abi,
  args,
  value,
  skipBalance = true,
) => {
  // If the we can't define the type of the output, we won't be able to decode it
  // In this case, we just make a regular call without attempting to decode the output
  const funcObj = abi.find((f) => f.name === functionName) as
    | ABIFunction
    | undefined;
  const canDecodeOutput = funcObj?.outputs
    ? funcObj.outputs?.length > 0
    : false;

  // Base parameters for both `Client.contract` and `Client.call`
  const baseParams = {
    caller,
    to: contract,
    value: BigInt(value) ?? BigInt(0),
    createTransaction: true,
    throwOnFail: false,
    skipBalance,
  };

  // Parameters for the `Client.contract` function (or encoded data for `Client.call`)
  const dataParams = {
    functionName,
    abi: abi as Abi,
    args,
  };

  // For gas estimation on L2s we need the encoded data
  const encodedData = encodeFunctionData(dataParams);

  // Call with either `Client.contract` (if we can decode the output) or `Client.call`
  return canDecodeOutput
    ? await handleCall(
        client,
        Object.assign(baseParams, dataParams) satisfies ContractParams,
        value,
        encodedData,
        false,
      )
    : await handleCall(
        client,
        {
          ...baseParams,
          data: encodeFunctionData(dataParams),
        } satisfies CallParams,
        value,
        encodedData,
        true,
      );
};

/* -------------------------------- ARBITRARY ------------------------------- */
/**
 * @notice Execute an arbitrary call on a given fork using its Tevm client
 * @dev This will attempt to execute a call given the target account or contract and the encoded data.
 */
export const callWithArbitraryData: CallWithArbitraryData = async (
  client,
  caller,
  target,
  data,
  value,
  skipBalance = true,
) => {
  return await handleCall(
    client,
    {
      caller,
      to: target,
      value: BigInt(value) ?? BigInt(0),
      data,
      createTransaction: true,
      throwOnFail: false,
      skipBalance,
    } satisfies CallParams,
    value,
    data,
    true,
  );
};

/* -------------------------------- HANDLERS -------------------------------- */
/**
 * @notice The handler for executing Tevm calls and returning expected results
 */
const handleCall: HandleCall = async (
  client,
  params,
  value,
  encodedData,
  lowLevel,
) => {
  try {
    // Call with either `Client.contract` (if we can decode the output) or `Client.call`
    const callResult = lowLevel
      ? await client.call(params)
      : await client.contract(params as ContractParams);

    // Return a formatted result
    return {
      result: callResult,
      couldDecodeOutput: !lowLevel,
      value,
      encodedData,
      errors: callResult.errors?.map((e) => ({
        title: 'Transaction failed',
        message: `${e.name}: ${e.message}`,
      })),
    };
  } catch (err) {
    console.error(err);
    // Return empty result with error
    return {
      result: {
        rawData: '0x',
        executionGasUsed: BigInt(0),
      },
      value,
      encodedData,
      couldDecodeOutput: false,
      errors: [
        {
          title: 'Call failed',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      ],
    };
  }
};

/**
 * @notice Handle the result of a call and display the appropriate toast
 * @notice This will handle gas cost calculation (as well as appropriary calls to the L1 client if relevant)
 * @dev This will display a toast with the result of the call, or an error message if the call failed
 * @dev It will also return the formatted transaction for local storage
 */
export const handleAfterCall: HandleAfterCall = async (
  tx,
  context,
  id,
  client,
  toastId,
) => {
  const chain = CHAINS.find((chain) => chain.id === context.chainId);
  const gasConfig = context.gasConfig;

  // Calculate the gas cost of the transaction
  const { native: costNative, usd: costUsd } = calculateGasCost(
    BigInt(gasConfig.baseFee) +
      (gasConfig.hasChainPriorityFee && gasConfig.priorityFee
        ? BigInt(gasConfig.priorityFee)
        : BigInt(0)),
    tx.result.executionGasUsed,
    context.nativeTokenPrice,
    chain?.nativeCurrency.decimals ?? 18,
  );

  // Same for the L1 submission gas cost if relevant
  // OP stack
  const {
    native: costL1SubmissionNative,
    usd: costL1SubmissionUsd,
    error: estimationError,
  } = gasConfig.stack === 'op-stack'
    ? await calculateOpStackL1DataFee(
        client,
        serializeTransaction({
          type: 'eip1559',
          chainId: context.chainId,
          to: context.target.address,
          data: tx.encodedData,
          value: BigInt(tx.value),
        }),
        BigInt(gasConfig.underlyingBaseFee ?? 0),
        BigInt(gasConfig.underlyingBlobBaseFee ?? 0),
        context.nativeTokenPrice,
        chain?.nativeCurrency.decimals ?? 18,
      )
    : { native: undefined, usd: undefined, error: null };

  // Show the first error that occurred during the estimation
  if (estimationError) {
    toast.error('L1 submission fee estimation failed', {
      description: estimationError,
    });
  }

  // Report the result of the transaction to the user
  if (tx.errors?.length) {
    toast.error(tx.errors[0].title, {
      id: toastId,
      description: tx.errors[0].message,
    });
  } else {
    // The result provided by the call
    const result = tx.result;
    // Prefer the data if it was decoded and not an array (too long), otherwise the raw data
    const data =
      'data' in result &&
      result.data !== undefined &&
      !Array.isArray(result.data)
        ? (result.data as ExpectedType)
        : result.rawData;
    const adaptedData =
      // Show the first 100 characters of the data if it's too long
      data.toString().length > 100
        ? `${data.toString().slice(0, 100)}...`
        : // or the entire data if it's less than 100 characters
          data;

    toast.success('Transaction successful!', {
      id: toastId,
      description:
        // Don't try to display if there was no return value/transaction reverted/failed to retrieve it
        data === '0x'
          ? 'See below for more details.'
          : `Returned: ${adaptedData}. See below for more details.`,
    });
  }

  // Return the formatted transaction
  // TODO Add globalError
  return formatTxForLocalStorage(
    {
      ...tx,
      gasResult: {
        costNative: {
          root: costNative.toString(),
          l1Submission: costL1SubmissionNative?.toString(),
        },
        costUsd: {
          root: costUsd.toString(),
          l1Submission: costL1SubmissionUsd?.toString(),
        },
        error: estimationError ?? undefined,
      },
    },
    context,
    id,
  );
};
