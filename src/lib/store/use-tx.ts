import { ABIFunction } from '@shazow/whatsabi/lib.types/abi';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { TxEntry, TxPending } from '@/lib/types/tx';
import { TEVM_PREFIX } from '@/lib/local-storage';

import { getFunctionId } from '../utils';

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
        const { txHistory } = get();
        set({
          txHistory: {
            ...txHistory,
            [chainId]: [...(txHistory[chainId] ?? []), { ...tx }],
          },
        });
      },
      // Reset the history for a chain
      resetTxs: (chainId) => {
        set((state) => {
          delete state.txHistory[chainId];
          return { txHistory: state.txHistory };
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
