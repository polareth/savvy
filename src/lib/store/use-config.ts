import { ABI } from '@shazow/whatsabi/lib.types/abi';
import { toast } from 'sonner';
import { GetAccountResult } from 'tevm';
import { Address } from 'tevm/utils';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { GasFeesConfig } from '@/lib/types/gas';
import { UpdateAccountOptions } from '@/lib/types/providers';
import { DEFAULTS } from '@/lib/constants/defaults';
import { getGasFeesData } from '@/lib/gas';
import { TEVM_PREFIX } from '@/lib/local-storage';
import { fetchNativeTokenPrice } from '@/lib/native-token';
import { useProviderStore } from '@/lib/store/use-provider';
import { getAccount } from '@/lib/tevm/account';
import { fetchAbi } from '@/lib/whatsabi';

/* ---------------------------------- TYPES --------------------------------- */
type ConfigInitialState = {
  account: GetAccountResult | null;
  fetchingAccount: boolean;
  abi: ABI | null;
  fetchingAbi: boolean;
  caller: Address;
  skipBalance: boolean;

  gasFeesConfig: GasFeesConfig | null;
  fetchingGasFeesData: boolean;
  nativeTokenPrice: number;
  fetchingNativeTokenPrice: boolean;

  isHydrated: boolean;
};

type ConfigSetState = {
  updateAccount: (
    address: Address,
    options: UpdateAccountOptions,
  ) => Promise<GetAccountResult>;
  setAbi: (abi: ABI | null) => void;
  setCaller: (address: Address) => void;
  resetCaller: () => void;
  setSkipBalance: (skip: boolean) => void;

  setGasFeesConfig: (gasFeesConfig: GasFeesConfig) => void;
  setNativeTokenPrice: (nativeTokenPrice: number) => void;
  getLatestGasFeesData: () => Promise<void>;
  getLatestNativeTokenPrice: () => Promise<void>;

  hydrate: () => void;
};

type ConfigStore = ConfigInitialState & ConfigSetState;

/* ---------------------------------- STORE --------------------------------- */
/**
 * @notice A store to manage the current config (contract, methods, gas parameters, etc.)
 */
export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      // A valid Ethereum account (either a contract or an EOA)
      account: null,
      // Whether the account is currently being fetched
      fetchingAccount: false,
      // The contract's abi after it's been fetched with WhatsABI
      abi: null,
      // Whether the abi is currently being fetched
      fetchingAbi: false,
      // The current address to impersonate as the caller
      caller: DEFAULTS.caller,
      // Whether to skip native balance checks during calls
      skipBalance: true,

      // Gas fees configuration
      gasFeesConfig: null,
      // Whether the gas fees history is currently being fetched to set the base config
      fetchingGasFeesData: false,
      // The current native token price
      nativeTokenPrice: 0,
      // Whether the native token price is currently being fetched
      fetchingNativeTokenPrice: false,

      // The hydratation status to prevent displaying default values on first mount
      // when the local storage is not yet rehydrated
      isHydrated: false,

      // Update the account with its latest state, and fetch the abi if it's a contract
      // This will be called upon search, chain change/reset, and after making a call
      updateAccount: async (address, { updateAbi, chain, client }) => {
        set({ fetchingAccount: true, fetchingAbi: updateAbi });
        const account = await getAccount(client, address);
        set({ fetchingAccount: false });

        // If we can't be sure if it's a contract, we can attempt to fetch the abi anyway
        if (updateAbi && account.isContract) {
          set({ fetchingAbi: true });
          // TODO maybe it's bad practice to manage the toast here—i.e. in a zustand store?
          const toastId = toast.loading('Fetching ABI');

          const { success, data: abi } = await fetchAbi(account.address, chain);

          // Set the abi in the store if it's successful
          if (success && abi && abi.length > 0) {
            set({ abi });
            toast.success('ABI fetched', {
              id: toastId,
            });
          } else {
            set({ abi: null });
            toast.error('Failed to retrieve the ABI', {
              id: toastId,
              description:
                'Please make sure this contract is deployed on the selected chain.',
            });
          }
        } else {
          if (updateAbi) set({ abi: null });
        }

        // Set the new account in any case
        set({ account, fetchingAbi: false });

        return account;
      },

      setAbi: (abi) => set({ abi }),
      setCaller: (address) => set({ caller: address }),
      resetCaller: () => set({ caller: DEFAULTS.caller }),
      setSkipBalance: (skip) => set({ skipBalance: skip }),

      setGasFeesConfig: (gasFeesConfig) => set({ gasFeesConfig }),
      setNativeTokenPrice: (nativeTokenPrice) => set({ nativeTokenPrice }),

      // Fetch the latest gas fees data and update the store
      getLatestGasFeesData: async () => {
        const { chain } = useProviderStore.getState();

        // Fetch the latest gas fees data
        set({ fetchingGasFeesData: true });
        const gasFeesData = await getGasFeesData(chain);

        set({
          gasFeesConfig: {
            ...gasFeesData,
            hasChainPriorityFee: chain.custom.tech.hasPriorityFee,
            gasControls:
              chain.custom.config.gasControls || DEFAULTS.gasControls,
          },
          fetchingGasFeesData: false,
        });

        // Check if it could calculate an appropriate priority fee
        if (
          chain.custom.tech.hasPriorityFee &&
          Object.values(gasFeesData.baseFeeToPriorityFeeBounds).some(
            (v) => v === BigInt(0),
          )
        ) {
          toast.error('Error: gas fees', {
            description:
              'Failed to retrieve enough fees history to calculate appropriate max priority fees.',
          });
        }
      },

      // Fetch the latest native token price and update the store
      getLatestNativeTokenPrice: async () => {
        const { chain } = useProviderStore.getState();

        // Fetch the latest native token price
        set({ fetchingNativeTokenPrice: true });
        const price = await fetchNativeTokenPrice(
          chain.custom.config.nativeTokenSlug,
        );

        set({ nativeTokenPrice: price, fetchingNativeTokenPrice: false });

        if (price === 0) {
          toast.error('Error: native token', {
            description: 'Failed to retrieve native token price',
          });
        }
      },

      hydrate: () => set({ isHydrated: true }),
    }),
    {
      name: `${TEVM_PREFIX}config`,
      storage: createJSONStorage(() => localStorage),
      partialize: (state: ConfigStore) => ({
        caller: state.caller,
        skipBalance: state.skipBalance,
      }),
      onRehydrateStorage: () => async (state, error) => {
        if (error) console.error('Failed to rehydrate config store:', error);
        if (!state) return;

        const { hydrate } = state;
        hydrate();
      },
    },
  ),
);
