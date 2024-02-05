import { createPublicClient, http, PublicClient } from 'viem';

import { CHAINS } from '@/lib/constants/chains';
import { ViemChain } from '@/lib/types/chains';

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID || '';

const createViemClient = (chain: ViemChain, rpc: string): PublicClient => {
  return createPublicClient({
    chain,
    transport: http(`${rpc}${alchemyId}`, {
      name: `Alchemy provider for ${chain.name}`,
    }),
  });
};

const clients = CHAINS.map((chain) => createViemClient(chain.config, chain.rpcUrl));

export const getClient = (chainId: number) => {
  const client = clients.find((client) => client.chain?.id === chainId);

  // We know that we won't attempt to get a client for a chain that doesn't exist
  // since we only infer the chainId from our CHAINS array
  if (!client) {
    throw new Error(`No client found for chainId: ${chainId}`);
  }

  return client;
};
