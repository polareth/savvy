import { parseGwei } from 'tevm';
import { extractChain } from 'viem';

import { CHAINS } from '@/lib/constants/providers';

/* -------------------------------------------------------------------------- */
/*                                  DEFAULTS                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULTS = {
  /* --------------------------------- GLOBAL --------------------------------- */
  // The initial chain
  chain: extractChain({
    chains: CHAINS,
    id: Number(1),
  }),
  // The gas limit for Tevm calls
  gasLimit: BigInt(30_000_000), // 30M
  // The precision to add before divisions for better accuracy
  precision: BigInt(1e18),
  // The default gas controls, if not provided/available yet for a chain
  gasControls: {
    min: parseGwei('0'),
    max: parseGwei('1000'),
    step: parseGwei('0.001'),
    gweiDecimals: 2,
  },
  // The default caller for any calls
  caller: `0x${'1'.repeat(40)}` as const,
};

/* -------------------------------------------------------------------------- */
/*                                   EXAMPLE                                  */
/* -------------------------------------------------------------------------- */

// The default example contract address
export const EXAMPLE_VALUES = {
  chain: extractChain({
    chains: CHAINS,
    id: Number(11155111), // Ethereum Sepolia
  }),
  contract: '0x1823FbFF49f731061E8216ad2467112C0469cBFD' as const,
};
