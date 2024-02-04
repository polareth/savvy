import { createPublicClient, http } from 'viem';
import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains';

import { Chain, OPStackSupport, ViemChain } from '@/lib/types/chains';

const evmOptimisticRollupBase: OPStackSupport = {
  consensusMechanism: 'Optimistic Rollup',
  nativeTokenSlug: 'ethereum',
  evmCompatible: true,
  layer: 2,
  hasCustomStack: true,
  underlying: 'ethereum',
};

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID || '';

const getViemClient = (chain: ViemChain, rpc: string) => {
  return createPublicClient({
    chain,
    transport: http(`${rpc}${alchemyId}`, {
      name: `Alchemy provider for ${chain.name}`,
    }),
  });
};

/* -------------------------------------------------------------------------- */
/*                                   CHAINS                                   */
/* -------------------------------------------------------------------------- */

const Ethereum: Chain = {
  ...mainnet,
  consensusMechanism: 'PoS',
  nativeTokenSlug: 'ethereum',
  evmCompatible: true,
  layer: 1,
  hasCustomStack: false,
  client: getViemClient(mainnet, 'https://eth-mainnet.g.alchemy.com/v2/'),
};

const Arbitrum: Chain = {
  ...arbitrum,
  ...evmOptimisticRollupBase,
  client: getViemClient(arbitrum, 'https://arb-mainnet.g.alchemy.com/v2/'),
};

const Base: Chain = {
  ...base,
  ...evmOptimisticRollupBase,
  client: getViemClient(base, 'https://base-mainnet.g.alchemy.com/v2/'),
};

const Optimism: Chain = {
  ...optimism,
  ...evmOptimisticRollupBase,
  client: getViemClient(optimism, 'https://opt-mainnet.g.alchemy.com/v2/'),
};

const Polygon: Chain = {
  ...polygon,
  consensusMechanism: 'PoS',
  nativeTokenSlug: 'polygon',
  evmCompatible: true,
  layer: 2,
  hasCustomStack: false,
  client: getViemClient(polygon, 'https://polygon-mainnet.g.alchemy.com/v2/'),
};

export const CHAINS: Chain[] = [Ethereum, Arbitrum, Base, Optimism, Polygon];
