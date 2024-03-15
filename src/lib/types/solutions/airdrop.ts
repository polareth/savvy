import { type Contract } from 'tevm';
import { Abi, Address } from 'viem';

import { Chain } from '@/lib/types/chains';
import { Icon } from '@/components/common/icons';

/* --------------------------------- GLOBAL --------------------------------- */
/**
 * @notice A token that can be airdropped using GasliteDrop
 * @param id The token standard (or native)
 * @param label The token label to display on the UI
 * @param iconColor The color to display on the UI (optional)
 * @param disabled Whether the token is disabled or not (optional)
 */
export type Token = {
  id: 'native' | 'ERC20' | 'ERC721' | 'ERC1155';
  label: string;
  iconColor?: string;
  disabled?: boolean;
};

// TODO Remove that and keep only push methods
// A method to airdrop tokens
export type AirdropMethod = {
  id: 'push' | 'merkle' | 'signature';
  label: string;
  icon?: Icon;
  disabled?: boolean;
};

/**
 * @notice A mock contract for local interaction
 * @param name The name of the contract to display on the UI
 * @param sepoliaAddress The address of the contract on Ethereum Sepolia
 * @param deployedBytecode The deployed bytecode of the contract on the chain
 * @param abi The ABI of the contract
 */
export type MockContract = {
  name: string;
  sepoliaAddress: `0x${string}`;
  deployedBytecode: `0x${string}`;
  abi: Abi;
};

// TODO Remove that and use directly the token id for unique id
export type AirdropUniqueId = `${AirdropMethod['id']}-${Token['id']}`;

/* -------------------------------- SOLUTIONS ------------------------------- */
/**
 * @notice The full metadata for an airdrop solution
 * @param id The unique id of the airdrop solution (token)
 * @param name The name of the airdrop solution to display on the UI
 * @param description A concise description of the solution
 * @param tokens The tokens that can be airdropped using this solution
 * @param method The method to use to airdrop the tokens
 * @param functionName The name of the function to call on the contract
 * @param sourceUrl The URL of the source code of the contract
 * @param website The URL of the website of the solution
 * @param contract The contract instance to interact with
 * @param deployments The addresses of the contract on each chain (by chain id)
 */
export type AirdropSolution<
  TContract extends Contract<string, string[]> = Contract<string, string[]>,
> = {
  id: AirdropUniqueId;
  name: string;
  description: string;
  tokens: Token[];
  // TODO Remove this
  method: AirdropMethod;
  functionName: string;
  sourceUrl: string;
  website: string;
  contract: TContract;
  deployments: {
    [chain: Chain['config']['id']]: Address;
  };
};

/**
 * @notice A list of airdrop solutions
 * @param token The token id
 */
export type AirdropSolutionsList = {
  [token in Token['id']]: {
    // TODO Remove this method
    [method in AirdropMethod['id']]: AirdropSolution;
  };
};

/* ---------------------------------- DATA ---------------------------------- */
/**
 * @notice The airdrop data to pass to the contract when calling the airdrop function
 * @param recipients The list of recipients to airdrop to
 * @param amounts The list of amounts to airdrop to each recipient (respectively)
 * @param ids The list of token ids to airdrop to each recipient (respectively)
 * @dev The `ids` list is only relevant for ERC721 and ERC1155 tokens
 */
export type AirdropData = {
  recipients: `0x${string}`[];
  amounts: string[];
  ids: string[]; // for ERC721 and ERC1155, empty if not relevant
};

/* ------------------------------- PARAMETERS ------------------------------- */
/**
 * @notice The parameters to pass to `GasliteDrop:airdropETH`
 * @param totalAmount The total amount of ETH to airdrop
 * @param args The args to pass to the function
 * @dev The `args` list is a tuple of two arrays: [recipients, amounts]
 */
type AirdropParamsPushNative = {
  totalAmount: string;
  args: [`0x${string}`[], string[]];
};

/**
 * @notice The parameters to pass to `GasliteDrop:airdropERC20`
 * @param tokenAddress The address of the token to airdrop
 * @param tokenOwnerOrHolder The address of the token owner or holder
 * @param args The args to pass to the function
 * @dev The `args` list is a tuple of four arrays: [token, recipients, amounts, totalAmount]
 */
type AirdropParamsPushERC20 = {
  tokenAddress: `0x${string}`;
  tokenOwnerOrHolder: `0x${string}`;
  // [token, recipients, amounts, totalAmount]
  args: [`0x${string}`, `0x${string}`[], string[], string];
};

/**
 * @notice The args to pass to the airdrop function depending on the token
 */
export type AirdropArgs =
  | AirdropParamsPushNative['args']
  | AirdropParamsPushERC20['args']
  | [];

/**
 * @notice A mapping from solution id to parameters
 * @param id The unique id of the airdrop solution
 */
export type AirdropParams = {
  [id in AirdropUniqueId]: id extends 'push-native'
    ? AirdropParamsPushNative
    : id extends 'push-ERC20'
    ? AirdropParamsPushERC20
    : never;
};
