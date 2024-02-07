import { Coins } from 'lucide-react';

import { AirdropMethod, Token } from '@/lib/types/airdrop';
import { Chain } from '@/lib/types/chains';
import { ComboboxOption } from '@/lib/types/templates';

import { Icon } from '@/components/common/icons';

export const toChainOption = (chain: Chain | null): ComboboxOption => ({
  label: chain?.config.name || '',
  value: chain?.config.id.toString() || '',
  icon: chain?.icon,
  disabled: chain?.disabled || false,
});

export const toTokenOption = (token: Token | null): ComboboxOption => ({
  label: token?.label || '',
  value: token?.id || '',
  icon: Coins as Icon,
  iconColor: token?.iconColor,
  disabled: token?.disabled || false,
});

export const toMethodOption = (method: AirdropMethod | null): ComboboxOption => ({
  label: method?.label || '',
  value: method?.id || '',
  icon: method?.icon,
  disabled: method?.disabled || false,
});
