import { ComboboxOption } from './templates';
import { type Chain as ViemChain } from 'viem/chains';

type ChainBase = {
  consensusMechanism: 'PoW' | 'PoS' | 'DPoS' | 'Optimistic Rollup';
  nativeTokenSlug: string; // Coinmarketcap slug
};

type ChainEVMSupport = ChainBase & {
  evmCompatible: boolean;
};

type ChainLayer = ChainEVMSupport & {
  layer: number;
  underlying?: 'ethereum';
};

export type OPStackSupport = ChainLayer & {
  hasCustomStack: boolean;
};

type ChainType = OPStackSupport & {
  rpcUrl: string;
};

export type Chain = ChainType & {
  config: ViemChain;
};

export type ChainOption = Chain & ComboboxOption;

export type { ViemChain };
