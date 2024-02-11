import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains';

import { Chain, OPStackSupport } from '@/lib/types/chains';

import { Icons } from '@/components/common/icons';

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
  hasPriorityFee: true,
  avgBlockTime: 12080,
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
  // gascontrols: {
  //   min: parseGwei('1'),
  //   max: parseGwei('1000'),
  //   step: parseGwei('1'),
  // },
  icon: Icons.ethereum,
};

const Arbitrum: Chain = {
  config: arbitrum,
  ...evmOptimisticRollupBase,
  hasPriorityFee: false,
  avgBlockTime: 260,
  rpcUrl: 'https://arb-mainnet.g.alchemy.com/v2/',
  // gascontrols: {
  //   min: parseGwei('0.1'),
  //   max: parseGwei('1000'),
  //   step: parseGwei('0.1'),
  // },
  icon: Icons.arbitrum,
  disabled: false,
};

const Base: Chain = {
  config: base,
  ...evmOptimisticRollupBase,
  hasPriorityFee: true,
  avgBlockTime: 2000,
  rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/',
  icon: Icons.base,
  disabled: false,
};

const Optimism: Chain = {
  config: optimism,
  ...evmOptimisticRollupBase,
  hasPriorityFee: true,
  avgBlockTime: 2000,
  rpcUrl: 'https://opt-mainnet.g.alchemy.com/v2/',
  icon: Icons.optimism,
  disabled: false,
};

const Polygon: Chain = {
  config: polygon,
  consensusMechanism: 'PoS',
  nativeTokenSlug: 'polygon',
  evmCompatible: true,
  layer: 2,
  hasCustomStack: false,
  hasPriorityFee: true,
  avgBlockTime: 2140,
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/',
  icon: Icons.polygon,
  disabled: false,
};

export const CHAINS: Chain[] = [Ethereum, Arbitrum, Base, Optimism, Polygon];
