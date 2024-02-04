import { Client } from 'viem';
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
  client: Client;
};

export type Chain = ViemChain & ChainType;
export type { ViemChain };
