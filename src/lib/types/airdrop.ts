import { Chain } from './chains';
import { type Contract } from 'tevm';
import { Address } from 'viem';

import { Icon } from '@/components/common/icons';

export type Token = {
  id: 'native' | 'ERC20' | 'ERC721' | 'ERC1155';
  label: string;
  iconColor?: string;
  disabled?: boolean;
};
export type AirdropMethod = {
  id: 'push' | 'merkle' | 'signature';
  label: string;
  icon?: Icon;
  disabled?: boolean;
};

export type AirdropSolution<
  TContract extends Contract<string, string[]> = Contract<string, string[]>,
> = {
  id: `${AirdropMethod['id']}-${Token['id']}`;
  name: string;
  description: string;
  tokens: Token[];
  method: AirdropMethod;
  functionName: string;
  sourceUrl: string;
  website: string;
  contract: TContract;
  deployments: {
    [chain: Chain['config']['id']]: Address;
  };
};

export type AirdropSolutionsList = {
  [token in Token['id']]: {
    [method in AirdropMethod['id']]: AirdropSolution;
  };
};

export type AirdropData = {
  recipients: `0x${string}`[];
  amounts: string[];
  ids: string[]; // for ERC721 and ERC1155, empty if not relevant
};
