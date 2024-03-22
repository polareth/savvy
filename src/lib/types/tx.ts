import { ABIFunction } from '@shazow/whatsabi/lib.types/abi';
import { CallResult, ContractResult, GetAccountResult } from 'tevm';
import { Log } from 'tevm/actions-types';
import { Address, Hex } from 'tevm/utils';

import { RollupFramework } from '@/lib/types/providers';

/* ---------------------------------- UTILS --------------------------------- */
// A type expected either as returned data by Tevm, or to be passed as input data
export type ExpectedType =
  | bigint
  | boolean
  | number
  | string
  | (bigint | boolean | number | string)[];

// An input with the correct value types for a Tevm call
export type Input = {
  name: string;
  type: string;
  value: ExpectedType;
};

// An input with the correct value types for parsing into/from local storage
export type InputStringified = {
  name: string;
  type: string;
  value: string | string[];
};

/* --------------------------------- OBJECTS -------------------------------- */
/**
 * @type {Object} TevmResult
 * @notice The result of a call, as returned by Tevm with either `Client.contract` or `Client.call`
 */
type TevmResult = CallResult | ContractResult;

/**
 * @type {Object} TxError
 * @notice An error that occurred during the call or on the app when pending the call
 * @property {string} title The title of the error
 * @property {string} message The message of the error
 * @dev This will wrap any Tevm error or app error that occurred during the call
 */
type TxError = {
  title: string;
  message: string;
};

/**
 * @type {Object} TxResponse
 * @notice The result of a call, as returned by Tevm with either `Client.contract` or `Client.call`
 * @dev This will contain the call result as returned by Tevm, along with additional information.
 * @dev This can also be the object returned from the catch block.
 * @property {TevmResult} result The result of the call
 * @property {boolean} couldDecodeOutput Whether the output could be decoded or not
 * @property {string} value The value initially sent with the transaction
 * @property {Hex} encodedData The encoded data sent with the transaction
 * @property {TxError[] | undefined} errors The errors that occurred during the call; either Tevm errors or app errors
 * formatted as `TxError` for consistency
 */
export type TxResponse = {
  result: TevmResult;
  couldDecodeOutput: boolean;
  value: string;
  encodedData: Hex;
  errors?: TxError[];
};

/**
 * @type {Object} TxGasConfig
 * @notice The configuration of the gas for a transaction
 * @property {bigint | string} baseFee The base fee per gas for the transaction
 * @property {boolean} hasChainPriorityFee Whether the chain has a priority fee or not
 * @property {bigint | string | undefined} priorityFee The priority fee per gas for the transaction
 * @property {bigint | string | undefined} underlyingBase The base fee per gas for the next block on the underlying chain
 * @property {bigint | string | undefined} underlyingBlobBase The current blob base fee on the underlying chain
 * @property {RollupFramework} stack The framework of the rollup (if relevant)
 */
export type TxGasConfig = {
  baseFee: bigint | string;
  hasChainPriorityFee: boolean;
  priorityFee?: bigint | string;
  underlyingBaseFee?: bigint | string;
  underlyingBlobBaseFee?: bigint | string;
  stack?: RollupFramework;
};

/**
 * @type {Object} TxGasCost
 * @notice The gas costs of a transaction
 * @property {string} root The gas cost in native token for the call on the original chain
 * @property {string | undefined} l1Submission The gas cost in native token for the L1 submission (if relevant)
 */
type TxGasCost = {
  root: string;
  l1Submission?: string;
};

/**
 * @type {Object} TxGasResult
 * @notice The generic object for the gas costs of a transaction
 * @property {TxGasCost} costUsd The gas cost in USD for the call
 * @property {TxGasCost} costNative The gas cost in native token for the call
 * @property {string | undefined} error Any error that occurred during the gas estimation
 */
export type TxGasResult = {
  costUsd: TxGasCost;
  costNative: TxGasCost;
  error?: string;
};

/**
 * @type {Object} TxContext
 * @notice The context of a transaction (for the local storage)
 * @property {number} chainId The id of the chain the transaction was made on
 * @property {GetAccountResult} target The account targeted by the transaction (contract or EOA)
 * @property {Address} caller The address of the impersonated caller
 * @property {string} functionName The name of the function called; undefined if low level call
 * @property {AbiFunction['stateMutability'] | undefined} stateMutability The state mutability of the function called (or undefined if unknown or low-level call)
 * @property {InputStringified[]} inputValues The input values passed to the function (as strings)
 * @property {string} value The value sent with the transaction
 * @property {number} nativeTokenPrice The price of the native token on the chain at the time of the call (in USD)
 * @property {TxGasConfig} gasConfig The gas configuration for the transaction
 */

export type TxContext = {
  chainId: number;
  target: GetAccountResult;
  caller: Address;
  functionName: string | undefined;
  stateMutability: ABIFunction['stateMutability'] | undefined;
  inputValues: InputStringified[];
  value: string;
  nativeTokenPrice: number;
  gasConfig: TxGasConfig;
};

/**
 * @type {Object} TxUtils
 * @notice Utility properties for better UX
 * @property {boolean} includedInTotalFees Whether the transaction is included in the total cost (default: false for view/pure)
 */
export type TxUtils = {
  includedInTotalFees: boolean;
};

/**
 * @type {Object} TxEntry
 * @notice The entry of a transaction in the local storage
 * @property {string} id The unique id of the transaction
 * @property {TxContext} context The context of the transaction (chain, target, caller, function)
 * @property {TxUtils} utils Utility properties for better UX
 * @property {TxGasResult} gasCosts The gas costs of the transaction in native tokens and usd
 * @property {number} gasUsed The amount of gas used by the call
 * @property {string | string[]} data The data returned by the call, either decoded or raw (hex)
 * @property {boolean} decoded Whether the data is decoded or not
 * @property {'success' | 'revert' | 'failure' | 'pending'} status The status of the transaction
 * @property {Log[] | null} logs The logs emitted by the transaction
 * @property {TxError[] | null} errors The errors that occurred during the call
 * @property {number} timestamp The timestamp of the transaction (when it was saved)
 */
export type TxEntry = {
  id: string;
  // Input/details
  context: TxContext;
  // Utils
  utils: TxUtils;
  // Gas
  gasCosts: TxGasResult;
  gasUsed: string;
  // Output
  data: string | string[];
  decoded: boolean;
  status: 'success' | 'revert' | 'failure' | 'pending';
  logs: Log[] | null;
  errors: TxError[] | null;
  timestamp: number;
};

/**
 * @type {Object} TxPending
 * @notice The pending transaction (for loading purposes)
 * @property {string} id The unique id of the transaction
 * @property {TxContext} context The context of the transaction (chain, target, caller, function)
 */
export type TxPending = {
  id: string;
  context: TxContext;
};

/**
 * @type {Object} TotalFees
 * @notice The total costs of all transactions, indexed by chain id
 * @property {string} gasUsed The total gas used by all transactions
 * @property {TxGasCost} costUsd The total gas cost in USD for all transactions
 * @property {TxGasCost} costNative The total gas cost in native token for all transactions
 */
export type TotalFees = Record<
  number,
  {
    gasUsed: string;
    costUsd: Required<TxGasCost>;
    costNative: Required<TxGasCost>;
  }
>;

/* -------------------------------- FUNCTIONS ------------------------------- */
/**
 * @type {Function} SaveTx
 * @param {TxEntry} entry The transaction to save along with its context
 */
export type SaveTx = (entry: TxEntry) => void;

/**
 * @type {Function} FormatTx
 * @param {TxResponse & { gasResult: TxGasResult }} tx The transaction to format along with its gas costs
 * @param {TxContext} context The context of the transaction
 * @param {string} id A unique id for this transaction
 * @returns {TxEntry} The formatted transaction
 */
export type FormatTx = (
  tx: TxResponse & { gasResult: TxGasResult },
  context: TxContext,
  id: string,
) => TxEntry;
