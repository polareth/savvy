import { Abi, CallResult, createMemoryClient, encodeFunctionData, TevmClient } from 'tevm';

import { AirdropParams, AirdropUniqueId } from '@/lib/types/airdrop';
import { TxGasUsed } from '@/lib/types/estimate';
import { calculate } from '@/lib/utils/estimation/calculate';

type CallReturnData = {
  gasUsed: TxGasUsed;
  errors: string[];
};

export type CallToLocalChain = (
  id: AirdropUniqueId,
  forkUrl: string,
  contractAddress: `0x${string}`,
  abi: Abi,
  functionName: string,
  params: AirdropParams[typeof id],
  hasCustomStack: boolean,
) => Promise<CallReturnData>;

type CallToLocalChain_sub = (
  id: AirdropUniqueId,
  abi: Abi,
  functionName: string,
  params: AirdropParams[typeof id],
) => { value: bigint; encodedData: `0x${string}` };

/* -------------------------------------------------------------------------- */
/*                                   ROUTER                                   */
/* -------------------------------------------------------------------------- */

const alchemyId = process.env.ALCHEMY_ID || '';

export const callToLocalChain: CallToLocalChain = async (
  id,
  forkUrl,
  contractAddress,
  abi,
  functionName,
  params,
  hasCustomStack,
) => {
  const tevm: TevmClient = await createMemoryClient({
    fork: {
      url: `${forkUrl}${alchemyId}`,
    },
  });

  const caller = `0x${'01'.repeat(20)}` as const;
  const { value, encodedData } = mapIdToData(id, abi, functionName, params);

  if (encodedData === '0x') {
    return emptyCallDataWithError('Failed to encode call data');
  }

  if (id === 'push-ERC20') {
    const { args, ...custom } = params as AirdropParams['push-ERC20'];
    await mintAndApprove(
      tevm,
      custom.tokenAddress,
      custom.tokenOwner,
      caller,
      contractAddress,
      args[3],
    );
  }

  const callResult: CallResult = await tevm.call({
    caller,
    to: contractAddress,
    value,
    data: encodedData,
    skipBalance: true,
  });

  const submissionCost = hasCustomStack
    ? // TODO Calculate L1 submission cost
      calculate.l1SubmissionCost()
    : { deployment: '0', call: '0' };

  return {
    gasUsed: {
      deployment: { root: '0', l1submission: submissionCost.deployment },
      call: { root: callResult.executionGasUsed.toString(), l1submission: submissionCost.call },
    },
    errors: callResult.errors?.map((e) => e.message) || [],
  };
};

/* -------------------------------------------------------------------------- */
/*                                    CALLS                                   */
/* -------------------------------------------------------------------------- */

const mapIdToData: CallToLocalChain_sub = (
  id,
  abi,
  functionName,
  params,
): ReturnType<CallToLocalChain_sub> => {
  const aggregate = [id, abi, functionName, params] as const;

  return id === 'push-native'
    ? airdropEthParams(...aggregate)
    : id === 'push-ERC20'
    ? airdropERC20Params(...aggregate)
    : { value: BigInt(0), encodedData: '0x' as `0x${string}` };
};

const airdropEthParams: CallToLocalChain_sub = (id, abi, functionName, params) => {
  const { args, ...custom } = params as AirdropParams['push-native'];
  let callValue = BigInt(0);
  let encodedData = '0x' as `0x${string}`;

  try {
    callValue = BigInt(custom.totalAmount);
    encodedData = encodeFunctionData({ abi, functionName, args });

    return { value: callValue, encodedData };
  } catch (err) {
    console.error(err);
    return { value: BigInt(0), encodedData: '0x' };
  }
};

const airdropERC20Params: CallToLocalChain_sub = (id, abi, functionName, params) => {
  const { args, ...custom } = params as AirdropParams['push-ERC20'];
  let encodedData = '0x' as `0x${string}`;

  try {
    encodedData = encodeFunctionData({
      abi,
      functionName,
      args: [custom.tokenAddress, args[1], args[2], args[3]],
    });

    return { value: BigInt(0), encodedData };
  } catch (err) {
    console.error(err);
    return { value: BigInt(0), encodedData: '0x' };
  }
};

/* -------------------------------------------------------------------------- */
/*                                    UTILS                                   */
/* -------------------------------------------------------------------------- */

const emptyCallDataWithError = (message: string): CallReturnData => ({
  gasUsed: {
    deployment: { root: '0', l1submission: '0' },
    call: { root: '0', l1submission: '0' },
  },
  errors: [message],
});

const mintAndApprove = async (
  tevm: TevmClient,
  tokenAddress: `0x${string}`,
  tokenOwner: `0x${string}`,
  caller: `0x${string}`,
  spender: `0x${string}`,
  totalAmount: string,
) => {
  const mintResult: CallResult = await tevm.call({
    caller: tokenOwner,
    to: tokenAddress,
    data: encodeFunctionData({
      abi: [
        {
          constant: false,
          inputs: [
            {
              name: 'to',
              type: 'address',
            },
            {
              name: 'value',
              type: 'uint256',
            },
          ],
          name: 'mint',
          outputs: [],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'mint',
      args: [caller, BigInt(totalAmount)],
    }),
  });

  if (mintResult.errors) {
    console.error(mintResult.errors);
    throw new Error('Failed to mint tokens');
  }

  const approveResult: CallResult = await tevm.call({
    caller: caller,
    to: tokenAddress,
    data: encodeFunctionData({
      abi: [
        {
          constant: false,
          inputs: [
            {
              name: '_spender',
              type: 'address',
            },
            {
              name: '_value',
              type: 'uint256',
            },
          ],
          name: 'approve',
          outputs: [
            {
              name: '',
              type: 'bool',
            },
          ],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'approve',
      args: [spender, BigInt(totalAmount)],
    }),
  });

  if (approveResult.errors) {
    console.error(approveResult.errors);
    throw new Error('Failed to approve tokens');
  }
};
