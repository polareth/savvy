import { parseEther } from 'viem';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

import { AirdropData } from '@/lib/types/solutions/airdrop';

const MIN_AMOUNT = Number(parseEther('0.001'));
const MAX_AMOUNT = Number(parseEther('10'));

export const generateRandomAirdropData = (
  count: number,
): {
  recipients: `0x${string}`[];
  amounts: string[];
  ids: string[];
  totalAmount: string;
} => {
  const data: AirdropData & { totalAmount: string } = {
    recipients: [],
    amounts: [],
    ids: [],
    totalAmount: '0',
  };

  for (let i = 0; i < count; i++) {
    data.recipients.push(generateRandomAddress() as `0x${string}`);
    data.amounts.push(generateRandomAmount());
    data.ids.push(generateRandomId());
    data.totalAmount = (
      BigInt(data.totalAmount) + BigInt(data.amounts[i])
    ).toString();
  }

  return data;
};

const generateRandomAddress = (): string => {
  return privateKeyToAddress(generatePrivateKey());
};

const generateRandomAmount = (): string => {
  return Math.floor(
    Math.random() * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT,
  ).toString();
};

// TODO See how to generate ids
const generateRandomId = (): string => {
  return Math.floor(Math.random() * 100000).toString();
};
