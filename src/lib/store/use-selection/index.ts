import { useAirdropStore } from './use-airdrop';
import { useGlobalStore } from './use-global';

export const useSelectionStore = {
  global: useGlobalStore,
  airdrop: useAirdropStore,
};
