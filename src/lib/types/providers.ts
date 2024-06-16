import { MemoryClient } from 'tevm';
import { PublicClient, Chain as ViemChain } from 'viem';

import { GasControls } from '@/lib/types/gas';
import { Icon } from '@/components/common/icons';

/* -------------------------------------------------------------------------- */
/*                                   CHAINS                                   */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- BASE ---------------------------------- */
/**
 * @notice A consensus mechanism
 */
type ConsensusMechanism = 'PoW' | 'PoS' | 'DPoS' | 'Optimistic Rollup';

/**
 * @notice A rollup development framework
 */
export type RollupFramework = 'op-stack' | 'arbitrum-orbit';

/**
 * @notice The base technical details of a chain
 * @param consensusMechanism The consensus mechanism of the chain
 * @param avgBlockTime The average time between blocks in seconds
 * @param layer The layer of the chain (1, 2, 3)
 * @param evmCompatible Whether the chain is EVM compatible or not
 * @param hasPriorityFee Whether the chain uses priority fees or not (e.g. Arbitrum One does not)
 * @param underlying The underlying chain (as a viem chain) if it's a layer 2+ (optional)
 * @param rollup The rollup development framework (optional)
 */
type ChainTech = {
  consensusMechanism: ConsensusMechanism | undefined;
  avgBlockTime: number;
  layer: number;
  evmCompatible: boolean;
  hasPriorityFee: boolean;
  underlying?: Chain;
  rollup?: RollupFramework;
};

/**
 * @notice The chain configuration
 * @param rpcUrl The RPC URL to interact with the chain (used to create a Tevm memory client as well)
 * @param provider The public viem client for base chain queries
 * @param nativeTokenSlug The Coinmarketcap slug of the native token
 * @param gasControls The gas controls for this chain (optional)
 * @param icon The icon of the chain (optional)
 * @param disabled Whether the chain is disabled or not (optional)
 */
type ChainConfig = {
  rpcUrl: string;
  provider: PublicClient;
  nativeTokenSlug: string;
  gasControls?: GasControls;
  icon?: Icon;
  disabled?: boolean;
};

/* --------------------------------- EXPORTS -------------------------------- */
export type { ViemChain };

/**
 * @type {Chain}
 * @notice A Viem chain with custom technical details and configuration
 * @dev The rpc url will be used to create a Tevm memory client from a fork.
 * @dev The provider is useful to fetch ABIs with WhatsABI.
 */
export type Chain = ViemChain & {
  custom: {
    tech: ChainTech;
    config: ChainConfig;
  };
};

/**
 * @type {OptimisticRollupBase}
 * @notice The base technical details of an optimistic rollup chain
 */
export type OptimisticRollupBase = Omit<
  ChainTech,
  'avgBlockTime' | 'hasPriorityFee' | 'rollup'
>;

/* --------------------------------- CUSTOM --------------------------------- */
export type CustomChainOptions = {
  name: string;
  rpcUrl: string;
  chainId: number;
  nativeToken: {
    name: string;
    symbol: string;
    decimals: number;
    slug: string;
  };
  layer: number;
  evmCompatible: boolean;
  hasPriorityFee: boolean;
  rollup?: RollupFramework;
  underlyingChain?: string;
};

/* -------------------------------------------------------------------------- */
/*                                  ACCOUNTS                                  */
/* -------------------------------------------------------------------------- */

/**
 * @type {Object} UpdateAccountOptions
 * @notice Options for updating the account state (optional)
 * @param {boolean} updateAbi Whether to attempt to fetch/refetch the ABI at the provided address
 * @param {Chain} chain The chain to target for the abi retrieval
 * @param {MemoryClient} client The client to use for the account state
 */
export type UpdateAccountOptions = {
  updateAbi: boolean;
  chain: Chain;
  client: MemoryClient;
};
