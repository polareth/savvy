import { CHAINS } from '@/lib/constants/chains';
import { AIRDROP_METHODS, AIRDROP_TOKENS } from '@/lib/constants/solutions/airdrop';

export const DEFAULTS = {
  chain: CHAINS.find((c) => c.config.id === 1) || null,
  airdropToken: AIRDROP_TOKENS.find((t) => t.id === 'ERC20') || null,
  airdropMethod: AIRDROP_METHODS.find((m) => m.id === 'push') || null,
  airdropRecipients: {
    count: 1,
    min: 1,
    max: 1000,
    step: 1,
  },
};
