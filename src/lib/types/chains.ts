import { type Chain as ViemChain } from 'viem/chains';

import { Icon } from '@/components/common/icons';

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

export type Chain = OPStackSupport & {
  rpcUrl: string;
  config: ViemChain;
  icon?: Icon;
};

// export type ChainId = 1 | 10 | 137 | 8453 | 42161;

export type { ViemChain };
