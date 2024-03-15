import { MemoryClient } from 'tevm';

import { Chain } from '@/lib/types/providers';
import { STANDALONE_RPC_CHAINS } from '@/lib/constants/providers';

const alchemyApiKey = process.env.ALCHEMY_API_KEY || '';

/* ---------------------------------- TYPES --------------------------------- */
/**
 * @type {Function} CreateClient
 * @param {number} chainId The id of the chain to create the client for
 * @param {string} forkUrl The url of the fork to use
 * @returns {Promise<MemoryClient>}
 */
type CreateClient = (chainId: number, forkUrl: string) => Promise<MemoryClient>;

/**
 * @type {Function} ResetClient
 * @param {MemoryClient} client The client to reset
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
type ResetClient = (client: MemoryClient) => Promise<{
  success: boolean;
  error?: string;
}>;

/**
 * @type {Function} InitializeClient
 * @param {Chain} chain The chain to initialize a client for (using the custom fork url)
 * @returns {Promise<MemoryClient>}
 */
type InitializeClient = (chain: Chain) => Promise<MemoryClient>;

/* -------------------------------- FUNCTIONS ------------------------------- */
/**
 * @notice Create a Tevm client for a given chain
 * @dev This will create a memory client with a sync storage persister, meaning that
 * the state of the client will be synced with local storage every second (default throttle).
 * @dev If there is a state saved in local storage, it will be loaded.
 * @see https://tevm.sh/learn/clients/#state-persistence
 */
// TODO TEMP async/await because of lazy import
const createClient: CreateClient = async (chainId, forkUrl) => {
  const { createMemoryClient } = await import('tevm');
  const { createSyncStoragePersister } = await import(
    'tevm/sync-storage-persister'
  );

  return createMemoryClient({
    persister: createSyncStoragePersister({
      storage: localStorage,
      key: `TEVM_CLIENT_${chainId.toString()}`,
    }),
    fork: {
      url: STANDALONE_RPC_CHAINS.includes(chainId)
        ? forkUrl
        : `${forkUrl}${alchemyApiKey}`,
    },
  });
};

/**
 * @notice Reset the state of a provided Tevm client
 * @dev This will clear the underlying cache of the client, effectively resetting its state.
 */
export const resetClient: ResetClient = async (client) => {
  try {
    (await client.getVm()).stateManager.clearCaches();
    return { success: true };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};

/**
 * @notice Initialize the client for a given chain
 * @dev This will create or load a client for this chain on first mount.
 */
export const initializeClient: InitializeClient = async (chain) => {
  const client = await createClient(chain.id, chain.custom.config.rpcUrl);
  await client.ready();
  return client;
};
