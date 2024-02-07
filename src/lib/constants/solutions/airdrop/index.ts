import { GasliteDropContract as gasliteDropContract } from './contracts/GasliteDrop';
import { GasliteDrop1155 as gasliteDrop1155Contract } from './contracts/GasliteDrop1155';
import { Network, PenLine, SendHorizonal } from 'lucide-react';

import { AirdropMethod, AirdropSolution, AirdropSolutionsList, Token } from '@/lib/types/airdrop';

import { Icon } from '@/components/common/icons';

export const AIRDROP_TOKENS: Token[] = [
  { id: 'native', label: 'Native token', iconColor: 'currentColor' },
  { id: 'ERC20', label: 'ERC20', iconColor: 'hsl(var(--blue))' },
  { id: 'ERC721', label: 'ERC721', iconColor: 'hsl(var(--green))' },
  { id: 'ERC1155', label: 'ERC1155', iconColor: 'hsl(var(--rose))' },
];

export const AIRDROP_METHODS: AirdropMethod[] = [
  { id: 'push', label: 'Airdrop (direct transfer)', icon: SendHorizonal as Icon },
  { id: 'merkle', label: 'Claim (merkle tree)', icon: Network as Icon, disabled: true },
  { id: 'signature', label: 'Claim (signature)', icon: PenLine as Icon, disabled: true },
];

const findToken = (id: Token['id']): Token => {
  return AIRDROP_TOKENS.find((token) => token.id === id) as Token;
};

const findMethod = (id: AirdropMethod['id']): AirdropMethod => {
  return AIRDROP_METHODS.find((method) => method.id === id) as AirdropMethod;
};

/* -------------------------------------------------------------------------- */
/*                                 PUSH-BASED                                 */
/* -------------------------------------------------------------------------- */

const gasliteDrop: Omit<AirdropSolution, 'functionSig'> = {
  name: 'GasliteDrop',
  description: 'Bulk transfers for ERC20, ERC721, and Native Network Tokens',
  tokens: [findToken('native'), findToken('ERC20'), findToken('ERC721')],
  method: findMethod('push'),
  sourceUrl: 'https://github.com/PopPunkLLC/gaslite-core/blob/main/src/GasliteDrop.sol',
  website: 'https://drop.gaslite.org',
  contract: gasliteDropContract,
  deployments: {
    1: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Ethereum
    10: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Optimism
    137: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Polygon
    8453: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Base
    42161: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Arbitrum
  },
};

const gasliteDrop1155: Omit<AirdropSolution, 'functionSig'> = {
  name: 'GasliteDrop1155',
  description: 'Bulk transfers for ERC1155',
  tokens: [findToken('ERC1155')],
  method: findMethod('push'),
  sourceUrl: 'https://github.com/PopPunkLLC/gaslite-core/blob/main/src/GasliteDrop1155.sol',
  website: 'https://drop.gaslite.org',
  contract: gasliteDrop1155Contract,
  deployments: {
    1: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Ethereum
    10: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Optimism
    137: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Polygon
    8453: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Base
    42161: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Arbitrum
  },
};

/* -------------------------------------------------------------------------- */
/*                                 CLAIM-BASED                                */
/* -------------------------------------------------------------------------- */

const gasliteMerkle: Omit<AirdropSolution, 'functionSig'> = {
  name: 'GasliteMerkle',
  description: 'Merkle tree-based airdrop solution',
  tokens: [findToken('native'), findToken('ERC20'), findToken('ERC721'), findToken('ERC1155')],
  method: findMethod('merkle'),
  sourceUrl: '',
  website: '',
  contract: '',
  deployments: {
    1: '0x', // Ethereum
    10: '0x', // Optimism
    137: '0x', // Polygon
    8453: '0x', // Base
    42161: '0x', // Arbitrum
  },
};

const gasliteSignature: Omit<AirdropSolution, 'functionSig'> = {
  name: 'GasliteSignature',
  description: 'Signature-based airdrop solution',
  tokens: [findToken('native'), findToken('ERC20'), findToken('ERC721'), findToken('ERC1155')],
  method: findMethod('signature'),
  sourceUrl: '',
  website: '',
  contract: '',
  deployments: {
    1: '0x', // Ethereum
    10: '0x', // Optimism
    137: '0x', // Polygon
    8453: '0x', // Base
    42161: '0x', // Arbitrum
  },
};

/* -------------------------------------------------------------------------- */
/*                                    LIST                                    */
/* -------------------------------------------------------------------------- */

export const AIRDROP_SOLUTIONS: AirdropSolutionsList = {
  native: {
    push: {
      ...gasliteDrop,
      functionSig: 'airdropETH(address[],uint256[])',
    },
    merkle: { ...gasliteMerkle, functionSig: '' },
    signature: { ...gasliteSignature, functionSig: '' },
  },
  ERC20: {
    push: {
      ...gasliteDrop,
      functionSig: 'airdropERC20(address,address[],uint256[],uint256)',
    },
    merkle: { ...gasliteMerkle, functionSig: '' },
    signature: { ...gasliteSignature, functionSig: '' },
  },
  ERC721: {
    push: {
      ...gasliteDrop,
      functionSig: 'airdropERC721(address,address[],uint256[])',
    },
    merkle: { ...gasliteMerkle, functionSig: '' },
    signature: { ...gasliteSignature, functionSig: '' },
  },
  ERC1155: {
    push: {
      ...gasliteDrop1155,
      functionSig: 'airdropERC1155(address,(uint256,(uint256,address[])[])[])',
    },
    merkle: { ...gasliteMerkle, functionSig: '' },
    signature: { ...gasliteSignature, functionSig: '' },
  },
};
