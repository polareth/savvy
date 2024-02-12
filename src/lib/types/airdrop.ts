import { Chain } from './chains';
import { type Contract } from 'tevm';
import { Abi, Address } from 'viem';

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

export type MockContract = {
  name: string;
  sepoliaAddress: `0x${string}`;
  deployedBytcode: `0x${string}`;
  abi: Abi;
};

export type AirdropUniqueId = `${AirdropMethod['id']}-${Token['id']}`;

export type AirdropSolution<
  TContract extends Contract<string, string[]> = Contract<string, string[]>,
> = {
  id: AirdropUniqueId;
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

/* ---------------------------------- ARGS ---------------------------------- */

type AirdropParamsPushNative = {
  totalAmount: string;
  // [recipients, amounts]
  args: [`0x${string}`[], string[]];
};

type AirdropParamsPushERC20 = {
  tokenAddress: `0x${string}`;
  tokenOwnerOrHolder: `0x${string}`;
  // [token, recipients, amounts, totalAmount]
  args: [`0x${string}`, `0x${string}`[], string[], string];
};

export type AirdropArgs = AirdropParamsPushNative['args'] | AirdropParamsPushERC20['args'] | [];

export type AirdropParams = {
  [id in AirdropUniqueId]: id extends 'push-native'
    ? AirdropParamsPushNative
    : id extends 'push-ERC20'
    ? AirdropParamsPushERC20
    : never;
};
