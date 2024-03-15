import { Coins } from 'lucide-react';

import { Chain } from '@/lib/types/chains';
import { AirdropMethod, Token } from '@/lib/types/solutions/airdrop';
import { ComboboxOption } from '@/lib/types/templates';
import { Icon } from '@/components/common/icons';

export const toChainOption = (chain: Chain): ComboboxOption => ({
  label: chain?.config.name || '',
  value: chain?.config.id || 0,
  icon: chain?.icon,
  disabled: chain?.disabled || false,
});

export const toTokenOption = (token: Token): ComboboxOption => ({
  label: token?.label || '',
  value: token?.id || 'native',
  icon: Coins as Icon,
  iconColor: token?.iconColor,
  disabled: token?.disabled || false,
});

export const toMethodOption = (method: AirdropMethod): ComboboxOption => ({
  label: method?.label || '',
  value: method?.id || 'push',
  icon: method?.icon,
  disabled: method?.disabled || false,
});
