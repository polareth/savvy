import { encodeFunctionData, parseEther } from 'viem';

import { GasliteDropAbi as gasliteDropAbi } from '@/lib/constants/solutions/airdrop/contracts/GasliteDrop';

export const testTevmNativeToken = async () => {
  const forkUrl = 'https://eth-mainnet.g.alchemy.com/v2/';
  const targetContract = '0x09350F89e2D7B6e96bA730783c2d76137B045FEF';
  const functionName = 'airdropETH';
  const args = [['0xAD285b5dF24BDE77A8391924569AF2AD2D4eE4A7'], [BigInt('1000000000000000000')]];
  const encodedData = encodeFunctionData({ abi: gasliteDropAbi, functionName, args });
  const value = parseEther('1000000000000000000').toString();

  const res = await fetch('/local-chain-estimate', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      type: 'airdrop-eth',
      forkUrl,
      targetContract,
      encodedData,
      value,
    }),
  });

  const data = await res.json();
  console.log(data);
};

export const testTevmERC20 = async () => {
  const forkUrl = 'https://eth-mainnet.g.alchemy.com/v2/';
  const targetContract = '0x09350F89e2D7B6e96bA730783c2d76137B045FEF';
  const functionName = 'airdropERC20';
  const args = [
    '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    ['0xAD285b5dF24BDE77A8391924569AF2AD2D4eE4A7', '0xAD285b5dF24BDE77A8391924569AF2AD2D4eE4A7'],
    [BigInt('1000000000000000000'), BigInt('1000000000000000000')],
    BigInt('2000000000000000000'),
  ];
  const encodedData = encodeFunctionData({ abi: gasliteDropAbi, functionName, args });

  const res = await fetch('/local-chain-test', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      type: 'airdrop-erc20',
      forkUrl,
      targetContract,
      encodedData,
    }),
  });

  const data = await res.json();
  console.log(data);
};
