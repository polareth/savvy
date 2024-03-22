import { ABIFunction } from '@shazow/whatsabi/lib.types/abi';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { TotalFees, TxEntry, TxPending } from '@/lib/types/tx';
import { CHAINS } from '@/lib/constants/providers';
import { TEVM_PREFIX } from '@/lib/local-storage';
import { getFunctionId } from '@/lib/utils';

import { aggregateChainFees } from '../gas';

/* ---------------------------------- TYPES --------------------------------- */
// Input values
type InputValues = Record<
  string,
  { args: Record<number, unknown>; value: string }
>;

type TxInitialState = {
  // Tx history
  txHistory: Record<number, TxEntry[]>; // chainId -> txs
  // Context of the current transaction being processed
  pending: TxPending | undefined;
  // Input values
  inputValues: InputValues;
  // Total costs
  totalFees: TotalFees; // chainId -> costs

  isHydrated: boolean;
};

type TxSetState = {
  // Tx history
  saveTx: (chainId: number, tx: TxEntry) => void;
  resetTxs: (chainId: number) => void;
  // Tx pending
  setPending: (pending: TxPending | undefined) => void;
  // Handling inputs
  updateInputValue: (id: string, index: number, value: unknown) => void;
  initializeInputs: (abi: ABIFunction[]) => void; // we eliminated events
  resetInputs: () => void;
  // Total costs
  toggleIncludeTxInTotalFees: (chainId: number, id: string) => void;
  includeAllTxsInTotalFees: (chainId: number) => void;
  excludeAllTxsFromTotalFees: (chainId: number) => void;

  updateTxHistoryAndTotalFees: (
    chainId: number,
    newTxHistory: TxEntry[],
  ) => void;

  hydrate: () => void;
};

type TxStore = TxInitialState & TxSetState;

/* ---------------------------------- STORE --------------------------------- */
/**
 * @notice A store to manage the transactions history, and input values for making transactions
 */
export const useTxStore = create<TxStore>()(
  persist(
    (set, get) => ({
      /* --------------------------------- HISTORY -------------------------------- */
      txHistory: [],
      // Save a transaction to the history
      saveTx: (chainId, tx) => {
        const { txHistory, totalFees } = get();
        set({
          txHistory: {
            ...txHistory,
            [chainId]: [...(txHistory[chainId] ?? []), { ...tx }],
          },
        });

        // Update the total costs if the tx should be included
        if (!tx.utils.includedInTotalFees) return;
        set({
          totalFees: {
            ...totalFees,
            [chainId]: aggregateChainFees([...txHistory[chainId], tx]),
          },
        });
      },
      // Reset the history for a chain
      resetTxs: (chainId) => {
        const { txHistory, totalFees } = get();
        set({
          txHistory: {
            ...txHistory,
            [chainId]: [],
          },
        });

        // Reset the total costs
        set({
          totalFees: {
            ...totalFees,
            [chainId]: {
              costUsd: { root: '0', l1Submission: '0' },
              costNative: { root: '0', l1Submission: '0' },
              gasUsed: '0',
            },
          },
        });
      },

      /* ------------------------------- PROCESSING ------------------------------- */
      // The current transaction being processed (function id or empty string for none)
      pending: undefined,
      setPending: (pending) => set({ pending }),

      /* --------------------------------- INPUTS --------------------------------- */
      inputValues: {},
      // Update a single input value
      updateInputValue: (id, index, value) => {
        // Use index -1 to update the value sent with the transaction
        if (index === -1) {
          set((state) => ({
            inputValues: {
              ...state.inputValues,
              [id]: {
                ...state.inputValues[id],
                value: value as string,
              },
            },
          }));
          return;
        }

        set((state) => ({
          inputValues: {
            ...state.inputValues,
            [id]: {
              ...state.inputValues[id],
              args: {
                ...state.inputValues[id]?.args,
                [index]: value,
              },
              value: state.inputValues[id]?.value ?? '',
            },
          },
        }));
      },
      // Initialize the inputs for the current contract (an empty string for each input) for
      // filling validation; this will be called on loading the abi
      initializeInputs: (abi) => {
        set({
          inputValues: abi.reduce((acc, func) => {
            const id = getFunctionId(abi, func);

            return {
              ...acc,
              [id]: {
                args: Object.fromEntries(
                  func.inputs?.map((_, i) => [i, '']) ?? [],
                ),
                value: '',
              },
            };
          }, {}),
        });
      },
      // Reset all inputs (when loading a new contract)
      resetInputs: () => {
        set({ inputValues: {} });
      },

      /* ------------------------------- TOTAL COST ------------------------------- */
      totalFees: CHAINS.reduce(
        (acc, chain) => ({
          ...acc,
          [chain.id]: {
            costUsd: { root: '0', l1Submission: '0' },
            costNative: { root: '0', l1Submission: '0' },
            gasUsed: '0',
          },
        }),
        {},
      ),
      // Include/exclude a transaction in the total cost
      toggleIncludeTxInTotalFees: (chainId, id) => {
        const { txHistory, updateTxHistoryAndTotalFees } = get();
        const tx = txHistory[chainId].find((tx) => tx.id === id);
        if (!tx) return;

        const newTxHistory = txHistory[chainId].map((tx) =>
          tx.id === id
            ? {
                ...tx,
                utils: {
                  ...tx.utils,
                  includedInTotalFees: !tx.utils.includedInTotalFees,
                },
              }
            : tx,
        );
        updateTxHistoryAndTotalFees(chainId, newTxHistory);
      },
      // Include all transactions in the total cost
      includeAllTxsInTotalFees: (chainId) => {
        const { txHistory, updateTxHistoryAndTotalFees } = get();
        const newTxHistory = txHistory[chainId].map((tx) => ({
          ...tx,
          utils: { ...tx.utils, includedInTotalFees: true },
        }));
        updateTxHistoryAndTotalFees(chainId, newTxHistory);
      },
      // Exclude all transactions from the total cost
      excludeAllTxsFromTotalFees: (chainId) => {
        const { txHistory, updateTxHistoryAndTotalFees } = get();
        const newTxHistory = txHistory[chainId].map((tx) => ({
          ...tx,
          utils: { ...tx.utils, includedInTotalFees: false },
        }));
        updateTxHistoryAndTotalFees(chainId, newTxHistory);
      },

      // Helper function to update both the tx history and the total fees
      updateTxHistoryAndTotalFees: (chainId, newTxHistory) => {
        const { txHistory, totalFees } = get();
        set({
          txHistory: {
            ...txHistory,
            [chainId]: newTxHistory,
          },
        });

        set({
          totalFees: {
            ...totalFees,
            [chainId]: aggregateChainFees(newTxHistory),
          },
        });
      },

      isHydrated: false,
      hydrate: () => set({ isHydrated: true }),
    }),
    {
      name: `${TEVM_PREFIX}txs`,
      storage: createJSONStorage(() => localStorage),
      // We only keep the tx history
      partialize: (state: TxStore) => ({
        // Replace any bigint with a string for serialization
        txHistory: Object.fromEntries(
          Object.entries(state.txHistory).map(([chainId, txs]) => [
            chainId,
            txs.map((tx) => ({
              ...tx,
              context: {
                ...tx.context,
                target: {
                  ...tx.context.target,
                  balance: tx.context.target.balance.toString(),
                  nonce: tx.context.target.nonce.toString(),
                },
              },
            })),
          ]),
        ),
        // We're keeping the total costs in storage to avoid recomputing it frequently
        totalFees: state.totalFees,
      }),
      onRehydrateStorage: () => async (state, error) => {
        if (error) console.error('Failed to rehydrate tx store:', error);
        if (!state) return;

        const { hydrate } = state;
        hydrate();
      },
    },
  ),
);
