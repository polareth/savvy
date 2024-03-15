import { ABI, ABIFunction } from '@shazow/whatsabi/lib.types/abi';
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import {
  Address,
  getAddress,
  Hex,
  isAddress,
  isHex,
  parseEther,
} from 'tevm/utils';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

// import { AirdropData, Token } from '@/lib/types/solutions/airdrop';
import { ExpectedType } from '@/lib/types/tx';
import { METADATA_EXTRA } from '@/lib/constants/site';

/* -------------------------------------------------------------------------- */
/*                                MISCELLANEOUS                               */
/* -------------------------------------------------------------------------- */
// Merge Tailwind CSS classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Display a toast error with a contact button
export const toastErrorWithContact = (
  title: string,
  message: string,
  toastId?: string | number,
) => {
  toast.error(title, {
    id: toastId || undefined,
    description: `${message} Please let us know about this issue.`,
    action: {
      label: 'Contact',
      onClick: () => {
        window.open(METADATA_EXTRA.links.twitter, '_blank');
      },
    },
    icon: null,
  });
};

/* -------------------------------------------------------------------------- */
/*                                 FORMATTING                                 */
/* -------------------------------------------------------------------------- */
// Format an input filled by the user into a valid argument for a Tevm contract call
// Throw an error if the input is invalid
export const formatInputValue = (
  type: string,
  value: string | number,
): ExpectedType => {
  // Check if it should be parsed as an array
  const isArray = type.includes('[]');
  // Check the type
  const isUint = type.includes('uint');
  const isAddress = type.includes('address');
  const isBytes = type.includes('bytes');
  const isBool = type.includes('bool');

  // Transform into array for easier manipulation
  const array = isArray ? parseArrayInput(value) : [value];
  // Format each input (which will validate it)
  const formatted = array.map((input) => {
    if (isUint) return formatUint(input);
    if (isBytes) return getHex(input);
    if (isAddress) return getAddress(input.toString());
    if (isBool) return formatBool(input);
    // Let Tevm handle the error if the type is not recognized
    return input;
  });

  return isArray ? formatted : formatted[0];
};

// Format a string or number into a valid uint
const formatUint = (value: string | number): bigint => {
  return BigInt(value.toString()); // this will throw an error if the value is not a valid bigint
};

// Verify an hexadecimal valud and type it correctly
const getHex = (value: string | number): Hex => {
  // Just check if it's a valid hex value and let Tevm handle the rest
  if (!isHex(value.toString())) throw new Error('Invalid bytes');
  return value as Hex;
};

// Format a string into a valid boolean
const formatBool = (value: string | number): boolean => {
  if (value.toString() === 'true' || value.toString() === '1') return true;
  if (value.toString() === 'false' || value.toString() === '0') return false;
  throw new Error('Invalid boolean');
};

// Parse an input supposed to be an array into a javascript array
const parseArrayInput = (input: string | number) => {
  return input.toString().split(/,| /);
};

/* -------------------------------------------------------------------------- */
/*                                   PARSING                                  */
/* -------------------------------------------------------------------------- */

// export function parseAirdropInput(
//   input: string,
//   type: Token['id'],
// ): { data: AirdropData; errors?: string[] } {
//   const errors: string[] = [];

//   // Attempt to parse JSON
//   if (input.trim().startsWith('[')) {
//     try {
//       const jsonData = JSON.parse(input) as Array<Record<string, unknown>>;

//       const formatted = jsonData.reduce<AirdropData>(
//         (acc, item, index) => {
//           const recipient = (item.recipient || item.address) as Address;
//           const amount = BigInt(item.amount as string);
//           const id = BigInt(
//             (item.id ||
//               item.tokenId ||
//               item.tokenID ||
//               item.token_id) as string,
//           );

//           // Recipient
//           recipient && isAddress(recipient)
//             ? acc.recipients.push(recipient as Address)
//             : errors.push(`Invalid recipient address at index ${index}`);

//           // Amount
//           if (type === 'native' || type === 'ERC20' || type === 'ERC1155') {
//             amount
//               ? acc.amounts.push(amount)
//               : errors.push(`Invalid amount at index ${index}`);
//           }

//           // Id
//           if (type === 'ERC721' || type === 'ERC1155') {
//             id ? acc.ids.push(id) : errors.push(`Invalid id at index ${index}`);
//           }

//           return acc;
//         },
//         {
//           recipients: [],
//           amounts: [],
//           ids: [],
//         },
//       );

//       if (errors.length) {
//         return { data: formatted, errors };
//       }

//       return { data: formatted };
//     } catch (err) {
//       // Not JSON, continue to try other formats
//     }
//   }

//   try {
//     // Normalize newlines, split lines, and filter out empty lines
//     const lines = input
//       .replace(/\r\n?/g, '\n')
//       .trim()
//       .split('\n')
//       .filter((line) => line);

//     // Determine delimiter based on the presence of commas in the first line
//     const delimiter = lines[0].includes(',') ? ',' : ' ';

//     const formatted = lines.reduce<AirdropData>(
//       (acc, line) => {
//         const parts = line.split(delimiter).map((part) => part.trim());

//         // Recipient
//         isAddress(parts[0])
//           ? acc.recipients.push(parts[0] as Address)
//           : errors.push(`Invalid recipient address at line ${line}`);

//         // Amount
//         if (type === 'native' || type === 'ERC20') {
//           !isNaN(Number(parts[1]))
//             ? acc.amounts.push(BigInt(parts[1]))
//             : errors.push(`Invalid amount at line ${line}`);
//         }

//         // Amount/Id
//         if (type === 'ERC721' || type === 'ERC1155') {
//           !isNaN(Number(parts[1]))
//             ? acc.ids.push(BigInt(parts[1]))
//             : errors.push(`Invalid id at line ${line}`);
//           !isNaN(Number(parts[2]))
//             ? acc.amounts.push(BigInt(parts[2]))
//             : errors.push(`Invalid amount at line ${line}`);
//         }

//         return acc;
//       },
//       {
//         recipients: [],
//         amounts: [],
//         ids: [],
//       },
//     );

//     if (errors.length) {
//       return { data: formatted, errors };
//     }

//     // if (
//     //   ((type === 'native' || type === 'ERC20') &&
//     //     formatted.recipients.length !== formatted.amounts.length) ||
//     //   (type === 'ERC721' && formatted.recipients.length !== formatted.ids.length) ||
//     //   (type === 'ERC1155' && formatted.recipients.length !== formatted.ids.length) ||
//     //   formatted.recipients.length !== formatted.amounts.length
//     // ) {
//     //   errors.push('Mismatched recipient and amount counts');
//     //   console.log(formatted, errors);
//     //   return { data: formatted, errors };
//     // }

//     return { data: formatted };
//   } catch (err) {
//     return {
//       data: { recipients: [], amounts: [], ids: [] },
//       errors: ['Invalid input'],
//     };
//   }
// }

/* -------------------------------------------------------------------------- */
/*                                     ABI                                    */
/* -------------------------------------------------------------------------- */

// Make sure to get a name for any function, so we can call it with Tevm
export const getFunctionName = (funcOrEvent: ABI[number], index: number) => {
  return funcOrEvent.type === 'event'
    ? funcOrEvent.name
    : funcOrEvent.name ||
        funcOrEvent.sig ||
        funcOrEvent.selector ||
        `function-${index.toString()}`;
};

// Get a unique id for each function in the abi
export const getFunctionId = (abi: ABI, func: ABIFunction) => {
  // We have this function from the abi so it will always be there
  return abi
    .filter((funcOrEvent) => funcOrEvent.type === 'function')
    .indexOf(func)
    .toString();
};

/* -------------------------------------------------------------------------- */
/*                                   RANDOM                                   */
/* -------------------------------------------------------------------------- */

// const MIN_AMOUNT = Number(parseEther('0.001'));
// const MAX_AMOUNT = Number(parseEther('10'));

// export const generateRandomAirdropData = (
//   count: number,
// ): {
//   recipients: Address[];
//   amounts: bigint[];
//   ids: bigint[];
//   totalAmount: bigint;
// } => {
//   const data: AirdropData & { totalAmount: bigint } = {
//     recipients: [],
//     amounts: [],
//     ids: [],
//     totalAmount: BigInt(0),
//   };

//   for (let i = 0; i < count; i++) {
//     data.recipients.push(generateRandomAddress() as Address);
//     data.amounts.push(generateRandomAmount());
//     data.ids.push(generateRandomId());
//     data.totalAmount = BigInt(data.totalAmount) + BigInt(data.amounts[i]);
//   }

//   return data;
// };

// const generateRandomAddress = (): Address => {
//   return privateKeyToAddress(generatePrivateKey());
// };

// const generateRandomAmount = (): bigint => {
//   return BigInt(
//     Math.floor(Math.random() * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT),
//   );
// };

// // TODO See how to generate ids
// const generateRandomId = (): bigint => {
//   return BigInt(Math.floor(Math.random() * 100000));
// };
