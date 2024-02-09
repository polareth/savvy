import { createPublicClient, http, PublicClient } from 'viem';

import { CHAINS } from '@/lib/constants/chains';
import { Chain } from '@/lib/types/chains';

type PublicClientCustomParams = PublicClient & {
  chain: {
    custom: Omit<Chain, 'config'>;
  };
};

const alchemyId = process.env.ALCHEMY_ID || '';

// Extend public client with chain.custom types
const createViemClient = (chain: Chain): PublicClientCustomParams => {
  const { config, ...rest } = chain;
  return createPublicClient({
    chain: {
      ...config,
      custom: {
        ...rest,
      },
    },
    transport: http(`${chain.rpcUrl}${alchemyId}`, {
      name: `Alchemy provider for ${chain.config.name}`,
    }),
  });
};

const clients = CHAINS.map((chain) => createViemClient(chain));

export const getClient = (chainId: number) => {
  const client = clients.find((client) => client.chain?.id === chainId);

  // We know that we won't attempt to get a client for a chain that doesn't exist
  // since we only infer the chainId from our CHAINS array
  if (!client) {
    throw new Error(`No client found for chainId: ${chainId}`);
  }

  return client;
};
