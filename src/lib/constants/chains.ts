import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains';

import { Chain, OPStackSupport } from '@/lib/types/chains';

const evmOptimisticRollupBase: OPStackSupport = {
  consensusMechanism: 'Optimistic Rollup',
  nativeTokenSlug: 'ethereum',
  evmCompatible: true,
  layer: 2,
  hasCustomStack: true,
  underlying: 'ethereum',
};

/* -------------------------------------------------------------------------- */
/*                                   CHAINS                                   */
/* -------------------------------------------------------------------------- */

const Ethereum: Chain = {
  config: mainnet,
  consensusMechanism: 'PoS',
  nativeTokenSlug: 'ethereum',
  evmCompatible: true,
  layer: 1,
  hasCustomStack: false,
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
};

const Arbitrum: Chain = {
  config: arbitrum,
  ...evmOptimisticRollupBase,
  rpcUrl: 'https://arb-mainnet.g.alchemy.com/v2/',
};

const Base: Chain = {
  config: base,
  ...evmOptimisticRollupBase,
  rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/',
};

const Optimism: Chain = {
  config: optimism,
  ...evmOptimisticRollupBase,
  rpcUrl: 'https://opt-mainnet.g.alchemy.com/v2/',
};

const Polygon: Chain = {
  config: polygon,
  consensusMechanism: 'PoS',
  nativeTokenSlug: 'polygon',
  evmCompatible: true,
  layer: 2,
  hasCustomStack: false,
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/',
};

export const CHAINS: Chain[] = [Ethereum, Arbitrum, Base, Optimism, Polygon];
