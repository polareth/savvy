import { isValidUint256 } from '.';
import { isAddress, isHex } from 'viem';

import { AirdropData, Token } from '@/lib/types/airdrop';

export function parseAirdropInput(
  input: string,
  type: Token['id'],
): { data: AirdropData; errors?: string[] } {
  const errors: string[] = [];

  // Attempt to parse JSON
  if (input.trim().startsWith('[')) {
    try {
      const jsonData = JSON.parse(input) as Array<any>;

      const formatted = jsonData.reduce<AirdropData>(
        (acc, item, index) => {
          const recipient: `0x${string}` = item.recipient || item.address;
          const amount: string = item.amount;
          const id: string = item.id || item.tokenId || item.tokenID || item.token_id;

          // Recipient
          recipient && isAddress(recipient)
            ? acc.recipients.push(recipient as `0x${string}`)
            : errors.push(`Invalid recipient address at index ${index}`);

          // Amount
          if (type === 'native' || type === 'ERC20' || type === 'ERC1155') {
            amount ? acc.amounts.push(amount) : errors.push(`Invalid amount at index ${index}`);
          }

          // Id
          if (type === 'ERC721' || type === 'ERC1155') {
            id ? acc.ids.push(id) : errors.push(`Invalid id at index ${index}`);
          }

          return acc;
        },
        {
          recipients: [],
          amounts: [],
          ids: [],
        },
      );

      if (errors.length) {
        return { data: formatted, errors };
      }

      return { data: formatted };
    } catch (err) {
      // Not JSON, continue to try other formats
    }
  }

  try {
    // Normalize newlines, split lines, and filter out empty lines
    const lines = input
      .replace(/\r\n?/g, '\n')
      .trim()
      .split('\n')
      .filter((line) => line);

    // Determine delimiter based on the presence of commas in the first line
    const delimiter = lines[0].includes(',') ? ',' : ' ';

    const formatted = lines.reduce<AirdropData>(
      (acc, line) => {
        const parts = line.split(delimiter).map((part) => part.trim());

        // Recipient
        isAddress(parts[0])
          ? acc.recipients.push(parts[0] as `0x${string}`)
          : errors.push(`Invalid recipient address at line ${line}`);

        // Amount
        if (type === 'native' || type === 'ERC20') {
          isValidUint256(parts[1])
            ? acc.amounts.push(parts[1])
            : errors.push(`Invalid amount at line ${line}`);
        }

        // Amount/Id
        if (type === 'ERC721' || type === 'ERC1155') {
          isValidUint256(parts[1])
            ? acc.ids.push(parts[1])
            : errors.push(`Invalid id at line ${line}`);
          isValidUint256(parts[2])
            ? acc.amounts.push(parts[2])
            : errors.push(`Invalid amount at line ${line}`);
        }

        return acc;
      },
      {
        recipients: [],
        amounts: [],
        ids: [],
      },
    );

    if (errors.length) {
      return { data: formatted, errors };
    }

    // if (
    //   ((type === 'native' || type === 'ERC20') &&
    //     formatted.recipients.length !== formatted.amounts.length) ||
    //   (type === 'ERC721' && formatted.recipients.length !== formatted.ids.length) ||
    //   (type === 'ERC1155' && formatted.recipients.length !== formatted.ids.length) ||
    //   formatted.recipients.length !== formatted.amounts.length
    // ) {
    //   errors.push('Mismatched recipient and amount counts');
    //   console.log(formatted, errors);
    //   return { data: formatted, errors };
    // }

    return { data: formatted };
  } catch (err) {
    return { data: { recipients: [], amounts: [], ids: [] }, errors: ['Invalid input'] };
  }
}
