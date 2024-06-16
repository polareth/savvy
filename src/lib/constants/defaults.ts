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
    id: Number(8453), // Base
  }),
  // The gas limit for Tevm calls
  gasLimit: BigInt(30_000_000), // 30M
  // The precision to add before divisions for better accuracy
  precision: BigInt(1e18),
  // The decimals specific to usd values; we need minimum 12 for Coinmarketcap
  decimalsUsd: 18,
  // The default gas controls, if not provided/available yet for a chain
  gasControls: {
    min: parseGwei('0'),
    max: parseGwei('1000'),
    step: parseGwei('0.001'),
    gweiDecimals: 2,
  },
  // The default caller for any calls
  caller: `0x73767679${'0'.repeat(24)}73767679` as const,
  // Empty total fees
  totalFees: {
    costUsd: { root: '0', l1Submission: '0' },
    costNative: { root: '0', l1Submission: '0' },
    gasUsed: '0',
  },
};

/* -------------------------------------------------------------------------- */
/*                                   EXAMPLE                                  */
/* -------------------------------------------------------------------------- */

// The default example contract address
export const EXAMPLE_VALUES = {
  chain: extractChain({
    chains: CHAINS,
    id: Number(8453), // Base
  }),
  contract: '0x4200000000000000000000000000000000000006' as const, // WETH
};
