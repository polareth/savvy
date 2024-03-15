import { Network, PenLine, SendHorizonal } from 'lucide-react';

import {
  AirdropMethod,
  AirdropSolution,
  AirdropSolutionsList,
  Token,
} from '@/lib/types/solutions/airdrop';
// @ts-ignore
import { GasliteDrop } from '@/lib/constants/solutions/airdrop/contracts/GasliteDrop.sol';
// @ts-ignore
import { GasliteDrop1155 } from '@/lib/constants/solutions/airdrop/contracts/GasliteDrop1155.sol';
import { Icon } from '@/components/common/icons';

export const AIRDROP_TOKENS: Token[] = [
  { id: 'native', label: 'Native token', iconColor: 'currentColor' },
  { id: 'ERC20', label: 'ERC20', iconColor: 'hsl(var(--blue))' },
  { id: 'ERC721', label: 'ERC721', iconColor: 'hsl(var(--green))' },
  { id: 'ERC1155', label: 'ERC1155', iconColor: 'hsl(var(--rose))' },
];

export const AIRDROP_METHODS: AirdropMethod[] = [
  {
    id: 'push',
    label: 'Airdrop (direct transfer)',
    icon: SendHorizonal as Icon,
  },
  {
    id: 'merkle',
    label: 'Claim (merkle tree)',
    icon: Network as Icon,
    disabled: true,
  },
  {
    id: 'signature',
    label: 'Claim (signature)',
    icon: PenLine as Icon,
    disabled: true,
  },
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

const gasliteDrop = {
  name: 'GasliteDrop',
  description: 'Bulk transfers for ERC20, ERC721, and Native Network Tokens',
  tokens: [findToken('native'), findToken('ERC20'), findToken('ERC721')],
  method: findMethod('push'),
  sourceUrl:
    'https://github.com/PopPunkLLC/gaslite-core/blob/main/src/GasliteDrop.sol',
  website: 'https://drop.gaslite.org',
  contract: GasliteDrop,
  deployments: {
    1: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Ethereum
    10: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Optimism
    137: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Polygon
    8453: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Base
    42161: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Arbitrum
    11155111: '0x09350F89e2D7B6e96bA730783c2d76137B045FEF', // Ethereum Sepolia
  },
} as const satisfies Omit<AirdropSolution, 'id' | 'functionName'>;

const gasliteDrop1155 = {
  name: 'GasliteDrop1155',
  description: 'Bulk transfers for ERC1155',
  tokens: [findToken('ERC1155')],
  method: findMethod('push'),
  sourceUrl:
    'https://github.com/PopPunkLLC/gaslite-core/blob/main/src/GasliteDrop1155.sol',
  website: 'https://drop.gaslite.org',
  contract: GasliteDrop1155,
  deployments: {
    1: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Ethereum
    10: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Optimism
    137: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Polygon
    8453: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Base
    42161: '0x1155D79afC98dad97Ee4b0c747398DcF5b631155', // Arbitrum
  },
} as const satisfies Omit<AirdropSolution, 'id' | 'functionName'>;

/* -------------------------------------------------------------------------- */
/*                                 CLAIM-BASED                                */
/* -------------------------------------------------------------------------- */

const gasliteMerkle = {
  name: 'GasliteMerkle',
  description: 'Merkle tree-based airdrop solution',
  tokens: [
    findToken('native'),
    findToken('ERC20'),
    findToken('ERC721'),
    findToken('ERC1155'),
  ],
  method: findMethod('merkle'),
  sourceUrl: '',
  website: '',
  contract: GasliteDrop, // TODO CHANGE
  deployments: {
    1: '0x', // Ethereum
    10: '0x', // Optimism
    137: '0x', // Polygon
    8453: '0x', // Base
    42161: '0x', // Arbitrum
  },
} as const satisfies Omit<AirdropSolution, 'id' | 'functionName'>;

const gasliteSignature = {
  name: 'GasliteSignature',
  description: 'Signature-based airdrop solution',
  tokens: [
    findToken('native'),
    findToken('ERC20'),
    findToken('ERC721'),
    findToken('ERC1155'),
  ],
  method: findMethod('signature'),
  sourceUrl: '',
  website: '',
  contract: GasliteDrop, // TODO CHANGE
  deployments: {
    1: '0x', // Ethereum
    10: '0x', // Optimism
    137: '0x', // Polygon
    8453: '0x', // Base
    42161: '0x', // Arbitrum
  },
} as const satisfies Omit<AirdropSolution, 'id' | 'functionName'>;

/* -------------------------------------------------------------------------- */
/*                                    LIST                                    */
/* -------------------------------------------------------------------------- */

export const AIRDROP_SOLUTIONS: AirdropSolutionsList = {
  native: {
    push: {
      ...gasliteDrop,
      id: 'push-native',
      functionName: 'airdropETH',
    },
    merkle: { ...gasliteMerkle, id: 'merkle-native', functionName: '' },
    signature: {
      ...gasliteSignature,
      id: 'signature-native',
      functionName: '',
    },
  },
  ERC20: {
    push: {
      ...gasliteDrop,
      id: 'push-ERC20',
      functionName: 'airdropERC20',
    },
    merkle: { ...gasliteMerkle, id: 'merkle-ERC20', functionName: '' },
    signature: { ...gasliteSignature, id: 'signature-ERC20', functionName: '' },
  },
  ERC721: {
    push: {
      ...gasliteDrop,
      id: 'push-ERC721',
      functionName: 'airdropERC721',
    },
    merkle: { ...gasliteMerkle, id: 'merkle-ERC721', functionName: '' },
    signature: {
      ...gasliteSignature,
      id: 'signature-ERC721',
      functionName: '',
    },
  },
  ERC1155: {
    push: {
      ...gasliteDrop1155,
      id: 'push-ERC1155',
      functionName: 'airdropERC1155',
    },
    merkle: { ...gasliteMerkle, id: 'merkle-ERC1155', functionName: '' },
    signature: {
      ...gasliteSignature,
      id: 'signature-ERC1155',
      functionName: '',
    },
  },
};
