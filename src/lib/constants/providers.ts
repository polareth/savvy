import { parseGwei } from 'tevm';
import { createPublicClient, http, Chain as ViemChain } from 'viem';
import {
  arbitrum,
  base,
  foundry,
  mainnet,
  optimism,
  polygon,
  sepolia,
  zora,
} from 'viem/chains';

import { Chain, OptimisticRollupBase } from '@/lib/types/providers';
import { Icons } from '@/components/common/icons';

// TODO Create client here when top-level await is solved

/* -------------------------------------------------------------------------- */
/*                                    RPCS                                    */
/* -------------------------------------------------------------------------- */

const alchemyApiKey = process.env.ALCHEMY_API_KEY || '';

const RPC_URLS = {
  arbitrum: 'https://arb-mainnet.g.alchemy.com/v2/',
  base: 'https://base-mainnet.g.alchemy.com/v2/',
  foundry: 'http://localhost:8545',
  mainnet: 'https://eth-mainnet.g.alchemy.com/v2/',
  optimism: 'https://opt-mainnet.g.alchemy.com/v2/',
  polygon: 'https://polygon-mainnet.g.alchemy.com/v2/',
  sepolia: 'https://eth-sepolia.g.alchemy.com/v2/',
  zora: 'https://rpc.zora.energy/',
};

// Chains that don't need an API key
export const STANDALONE_RPC_CHAINS = [
  // Foundry/Hardhat
  31337,
  // Zora
  7777777,
];

/**
 * @notice Create a viem provider for a given chain
 * @param chain The viem chain object
 * @param rpcUrl The RPC URL for the chain
 */
export const createProvider = (chain: ViemChain, rpcUrl: string) => {
  return createPublicClient({
    chain,
    transport: STANDALONE_RPC_CHAINS.includes(chain.id)
      ? http(rpcUrl)
      : http(`${rpcUrl}${alchemyApiKey}`),
  });
};

/* -------------------------------------------------------------------------- */
/*                                   CHAINS                                   */
/* -------------------------------------------------------------------------- */

const CHAINS_LAYER_1: Record<string, Chain> = {
  /* -------------------------------- ETHEREUM -------------------------------- */
  ethereum: {
    ...mainnet,
    custom: {
      tech: {
        consensusMechanism: 'PoS',
        avgBlockTime: 12080,
        layer: 1,
        evmCompatible: true,
        hasPriorityFee: true,
      },
      config: {
        rpcUrl: RPC_URLS.mainnet,
        provider: createProvider(mainnet, RPC_URLS.mainnet),
        nativeTokenSlug: 'ethereum',
        gasControls: {
          min: parseGwei('1'),
          max: parseGwei('1000'),
          step: parseGwei('1'),
          gweiDecimals: 2,
        },
        icon: Icons.ethereum,
      },
    },
  },
  /* ---------------------------- ETHEREUM SEPOLIA ---------------------------- */
  sepolia: {
    ...sepolia,
    custom: {
      tech: {
        consensusMechanism: 'PoS',
        avgBlockTime: 12080,
        layer: 1,
        evmCompatible: true,
        hasPriorityFee: true,
      },
      config: {
        rpcUrl: RPC_URLS.sepolia,
        provider: createProvider(sepolia, RPC_URLS.sepolia),
        nativeTokenSlug: 'ethereum',
        gasControls: {
          min: parseGwei('1'),
          max: parseGwei('1000'),
          step: parseGwei('1'),
          gweiDecimals: 2,
        },
        icon: Icons.ethereum,
      },
    },
  },
  /* ----------------------------- FOUNDRY/HARDHAT ---------------------------- */
  foundry: {
    ...foundry,
    custom: {
      tech: {
        consensusMechanism: 'PoW',
        avgBlockTime: 0,
        layer: 1,
        evmCompatible: true,
        hasPriorityFee: true,
      },
      config: {
        rpcUrl: RPC_URLS.foundry,
        provider: createProvider(foundry, RPC_URLS.foundry),
        nativeTokenSlug: 'ethereum',
        gasControls: {
          min: parseGwei('1'),
          max: parseGwei('1000'),
          step: parseGwei('1'),
          gweiDecimals: 2,
        },
        icon: Icons.coin,
      },
    },
    name: 'Local (Foundry/Hardhat)',
  },
};

// Base for an optimistic rollup on top of Ethereum
const evmOptimisticRollupBase: OptimisticRollupBase = {
  consensusMechanism: 'Optimistic Rollup',
  evmCompatible: true,
  layer: 2,
  underlying: CHAINS_LAYER_1.ethereum,
};

export const CHAINS: Chain[] = [
  /* --------------------------------- ARBITRUM -------------------------------- */
  // TODO Add when arbitrum orbit is supported
  // {
  //   ...arbitrum,
  //   custom: {
  //     tech: {
  //       ...evmOptimisticRollupBase,
  //       avgBlockTime: 260,
  //       hasPriorityFee: false,
  //       rollup: 'arbitrum-orbit',
  //     },
  //     config: {
  //       rpcUrl: RPC_URLS.arbitrum,
  //       provider: createProvider(arbitrum, RPC_URLS.arbitrum),
  //       nativeTokenSlug: 'ethereum',
  //       // TODO: Add gas controls
  //       icon: Icons.arbitrum,
  //     },
  //   },
  // },
  /* ---------------------------------- BASE ---------------------------------- */
  {
    ...base,
    custom: {
      tech: {
        ...evmOptimisticRollupBase,
        avgBlockTime: 2000,
        hasPriorityFee: true,
        rollup: 'op-stack',
      },
      config: {
        rpcUrl: RPC_URLS.base,
        provider: createProvider(base, RPC_URLS.base),
        nativeTokenSlug: 'ethereum',
        gasControls: {
          min: parseGwei('0.001'),
          max: parseGwei('500'),
          step: parseGwei('0.001'),
          gweiDecimals: 4,
        },
        icon: Icons.base,
      },
    },
  },
  CHAINS_LAYER_1.ethereum,
  CHAINS_LAYER_1.foundry,
  /* ------------------------------ OPTIMISM ------------------------------- */
  {
    ...optimism,
    custom: {
      tech: {
        ...evmOptimisticRollupBase,
        avgBlockTime: 2000,
        hasPriorityFee: true,
        rollup: 'op-stack',
      },
      config: {
        rpcUrl: RPC_URLS.optimism,
        provider: createProvider(optimism, RPC_URLS.optimism),
        nativeTokenSlug: 'ethereum',
        gasControls: {
          min: parseGwei('0.001'),
          max: parseGwei('500'),
          step: parseGwei('0.001'),
          gweiDecimals: 4,
        },
        icon: Icons.optimism,
      },
    },
  },
  /* ------------------------------- POLYGON ------------------------------- */
  {
    ...polygon,
    custom: {
      tech: {
        consensusMechanism: 'PoS',
        avgBlockTime: 2140,
        layer: 2,
        evmCompatible: true,
        hasPriorityFee: true,
      },
      config: {
        rpcUrl: RPC_URLS.polygon,
        provider: createProvider(polygon, RPC_URLS.polygon),
        nativeTokenSlug: 'polygon',
        gasControls: {
          min: parseGwei('0.001'),
          max: parseGwei('1000'),
          step: parseGwei('1'),
          gweiDecimals: 4,
        },
        icon: Icons.polygon,
      },
    },
  },
  CHAINS_LAYER_1.sepolia,
  /* ---------------------------------- ZORA ---------------------------------- */
  {
    ...zora,
    custom: {
      tech: {
        ...evmOptimisticRollupBase,
        avgBlockTime: 2000,
        hasPriorityFee: true,
        rollup: 'op-stack',
      },
      config: {
        rpcUrl: RPC_URLS.zora,
        provider: createProvider(zora, RPC_URLS.zora),
        nativeTokenSlug: 'ethereum',
        // TODO: Add gas controls
        icon: Icons.zora,
      },
    },
  },
];
