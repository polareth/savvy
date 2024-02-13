import { type Chain as ViemChain } from 'viem/chains';

import { GasControls } from '@/lib/types/estimate';

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

type GasFeesModel = OPStackSupport & {
  hasPriorityFee: boolean;
};

export type Chain = GasFeesModel & {
  config: ViemChain;
  rpcUrl: string;
  avgBlockTime: number;

  gasControls?: GasControls;
  icon?: Icon;
  disabled?: boolean;
};

export type { ViemChain };
