import { AirdropMethod, Token } from '@/lib/types/airdrop';
import { Chain } from '@/lib/types/chains';

import { Icon } from '@/components/common/icons';

export type ComboboxOption = {
  label: string;
  value: Chain['config']['id'] | Token['id'] | AirdropMethod['id'];
  icon?: Icon;
  iconColor?: string;
  disabled?: boolean;
};
