import { MemoryClient } from 'tevm';
import { extractChain } from 'viem';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Chain, CustomChainOptions } from '@/lib/types/providers';
import { DEFAULTS } from '@/lib/constants/defaults';
import { CHAINS, createCustomChain } from '@/lib/constants/providers';
import { TEVM_PREFIX } from '@/lib/local-storage';
import { useConfigStore } from '@/lib/store/use-config';
import { initializeClient } from '@/lib/tevm/client';

/* ---------------------------------- TYPES --------------------------------- */
type ProviderInitialState = {
  chain: Chain;
  chainId: Chain['id'] | undefined; // synced with local storage
  client: MemoryClient | null;
  forkTime: Record<Chain['id'], number>; // synced with local storage
  initializedClients: MemoryClient[] | [];
  customChains: CustomChainOptions[];
  initializing: boolean;

  isHydrated: boolean;
};

type ProviderSetState = {
  setProvider: (
    chain: Chain,
    hydrate?: boolean,
  ) => Promise<MemoryClient | null>;
  setForkTime: (chainId: Chain['id'], status?: 'loading' | 'update') => void;
  // TODO: chain creation options
  addChain: (options: CustomChainOptions) => void;
  removeChain: (chainId: number, chainName: string) => void;

  hydrate: () => void;
};

type ProviderStore = ProviderInitialState & ProviderSetState;

/* ---------------------------------- STORE --------------------------------- */
/**
 * @notice A store to manage the current chain selection and the associated Tevm client
 */
export const useProviderStore = create<ProviderStore>()(
  persist(
    (set, get) => ({
      // The current chain the contract is on
      chain: DEFAULTS.chain,
      chainId: undefined,
      // The current Tevm client
      client: null,
      // The timestamp of the fork for each chain (when first initialized or when reset)
      forkTime: CHAINS.reduce(
        (acc, chain) => ({ ...acc, [chain.id]: undefined }),
        {},
      ),
      // The hydratation status to prevent displaying default values on first mount
      // when the local storage is not yet rehydrated
      isHydrated: false,

      // Clients that were already initialized
      initializedClients: [],
      // Custom chains that were added by the user
      customChains: [],
      // Whether a client is being initialized
      initializing: false,

      // Set the selected chain and its client on user selection (or on first mount)
      setProvider: async (chain, hydrate) => {
        const {
          chainId: currentChainId,
          client: currentClient,
          initializing,
          initializedClients,
          forkTime,
          setForkTime,
        } = get();
        // The user should not be able to change the chain while a client is being initialized
        if (initializing) return null;
        set({ initializing: true });

        // An error might occur, e.g. if trying to connect to a local chain when it's not running
        try {
          // 1. Check if we already have the appropriate client for the selected chain
          // e.g. when searching a different account on the same chain
          let client =
            (await currentClient?.getChainId()) === chain.id
              ? currentClient
              : null;

          // 2. If not found, try to find the client for the selected chain if it was
          // already initialized earlier
          if (!client) {
            for (const c of initializedClients) {
              if ((await c.getChainId()) === chain.id) {
                client = c;
              }
            }
          }

          // 3. If not found, initialize a new client
          if (!client) {
            client = await initializeClient(chain);

            // Set its fork time if it's never been initialized
            // This is aligned with the client being completely new, or already used
            // before (synced with local storage)
            if (forkTime[chain.id] === undefined) setForkTime(chain.id);

            // Add the client to the list of initialized clients
            set({ initializedClients: [...initializedClients, client] });
          }

          set({ chain, client, initializing: false });

          // 4. Fetch the latest gas fees and native token price
          // Only if we're switching chains or hydrating
          if (currentChainId !== chain.id || hydrate) {
            const { getLatestGasFeesData, getLatestNativeTokenPrice } =
              useConfigStore.getState();
            getLatestGasFeesData();
            getLatestNativeTokenPrice();
          }

          return client;
        } catch (err) {
          console.error('Failed to set provider:', err);
          set({ initializing: false });

          return null;
        }
      },

      // Set the fork time for a given chain
      setForkTime: (chainId, status = 'update') => {
        set((state) => ({
          forkTime: {
            ...state.forkTime,
            // 0 means loading, otherwise it's the timestamp
            [chainId]: status === 'update' ? Date.now() : 0,
          },
        }));
      },

      // Add a custom chain to the list of chains
      addChain: (options) => {
        const { customChains, setProvider } = get();
        set({ customChains: [...customChains, options] });

        const chain = createCustomChain(options);
        setProvider(chain);
      },

      // Remove a custom chain from the list of chains
      removeChain: (chainId, chainName) => {
        const { customChains } = get();
        set({
          customChains: customChains.filter(
            (chain) => chain.chainId !== chainId && chain.name !== chainName,
          ),
        });
      },

      hydrate: () => set({ isHydrated: true }),
    }),
    {
      name: `${TEVM_PREFIX}provider`,
      storage: createJSONStorage(() => localStorage),
      // We only need to store the chain id and the fork time
      partialize: (state: ProviderStore) => ({
        chainId: state.chain.id,
        forkTime: state.forkTime,
        customChains: state.customChains,
      }),
      onRehydrateStorage: () => async (state, error) => {
        if (error) console.error('Failed to rehydrate provider store:', error);
        if (!state) return;

        // Retrieve the full chain object from the id
        const { chainId, customChains, setProvider, hydrate } = state;
        // Retrieve custom chain from local storage
        const customChainOptions = chainId
          ? customChains.find((option) => option.chainId === chainId)
          : undefined;

        // Load either custom chain or existing one from the last session
        const chain = chainId
          ? customChainOptions
            ? createCustomChain(customChainOptions)
            : extractChain({ chains: CHAINS, id: chainId })
          : DEFAULTS.chain;
        // and set the provider
        await setProvider(chain, true);

        hydrate();
      },
    },
  ),
);
