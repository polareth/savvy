import { CHAINS } from '@/lib/constants/chains';
import { AIRDROP_METHODS, AIRDROP_TOKENS } from '@/lib/constants/solutions/airdrop';

export const DEFAULTS = {
  chain: CHAINS.find((c) => c.config.id === 1) || CHAINS[0],
  airdropToken: AIRDROP_TOKENS.find((t) => t.id === 'ERC20') || AIRDROP_TOKENS[0],
  airdropMethod: AIRDROP_METHODS.find((m) => m.id === 'push') || AIRDROP_METHODS[0],
  airdropRecipients: {
    count: 1,
    min: 1,
    max: 1000,
    step: 1,
  },
  gasLimit: BigInt(30_000_000), // 30M
  maxGasDecimals: 9,
};
