import { Client, createPublicClient, http } from 'viem';

import { CHAINS } from '@/lib/constants/chains';
import { ViemChain } from '@/lib/types/chains';

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID || '';

const getViemClient = (chain: ViemChain, rpc: string): Client => {
  return createPublicClient({
    chain,
    transport: http(`${rpc}${alchemyId}`, {
      name: `Alchemy provider for ${chain.name}`,
    }),
  });
};

export const clients = CHAINS.map((chain) => getViemClient(chain.config, chain.rpcUrl));

/* -------------------------------------------------------------------------- */
/*                                    STORE                                   */
/* -------------------------------------------------------------------------- */
