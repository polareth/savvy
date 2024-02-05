import { Chain } from './chains';
import { Address } from 'viem';

import { Icon } from '@/components/common/icons';

export type Token = { id: 'native' | 'ERC20' | 'ERC721' | 'ERC1155'; label: string };
export type AirdropMethod = {
  id: 'push' | 'merkle' | 'signature';
  label: string;
  icon?: Icon;
};

export type AirdropSolution = {
  name: string;
  description: string;
  tokens: Token[];
  method: AirdropMethod;
  sourceUrl: string;
  website: string;
  contract: string;
  deployments: {
    [chain: Chain['config']['id']]: Address;
  };
};

export type AirdropSolutionsList = {
  [token in Token['id']]: {
    [method in AirdropMethod['id']]: AirdropSolution;
  };
};
