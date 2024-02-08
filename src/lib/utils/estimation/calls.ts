import { Abi, CallError, CallResult, createMemoryClient, encodeFunctionData, Tevm } from 'tevm';
import { ContractFunctionArgs } from 'viem';

import { AirdropMethod, Token } from '@/lib/types/airdrop';
import { TxGasUsed } from '@/lib/types/estimate';

type CallToLocalChainParams = {
  id: `${AirdropMethod['id']}-${Token['id']}`;
  forkUrl: string;
  contractAddress: `0x${string}`;
  abi: Abi[];
  functionName: string;
  args: ContractFunctionArgs;
  hasCustomStack: boolean;
};

type CallReturnData = {
  gasUsed: TxGasUsed;
  errors: CallError[];
};
type CallToLocalChain = (params: CallToLocalChainParams) => Promise<CallReturnData>;

type CallToLocalChain_subParams = Omit<CallToLocalChainParams, 'id' | 'forkUrl'> & {
  tevm: Tevm;
  caller: `0x${string}`;
};
type CallToLocalChain_sub = (params: CallToLocalChain_subParams) => Promise<CallReturnData>;

/* -------------------------------------------------------------------------- */
/*                                   ROUTER                                   */
/* -------------------------------------------------------------------------- */

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID || '';

export const callToLocalChain: CallToLocalChain = async (params) => {
  const { id, forkUrl, ...rest } = params;
  const tevm: Tevm = await createMemoryClient({
    fork: {
      url: `${forkUrl}${alchemyId}`,
    },
  });

  const caller = `0x${'01'.repeat(20)}` as const;
  const callParams = { tevm, caller, ...rest };

  return id === 'push-native' ? await airdropEth(callParams) : await airdropEth(callParams);
};

/* -------------------------------------------------------------------------- */
/*                                    CALLS                                   */
/* -------------------------------------------------------------------------- */

const airdropEth: CallToLocalChain_sub = async ({
  tevm,
  caller,
  contractAddress,
  abi,
  functionName,
  args,
  hasCustomStack,
}) => {
  let callValue = BigInt(0);
  let encodedData: `0x${string}` = '0x';

  try {
    const [recipients, amounts, value] = args;
    callValue = BigInt(value as string);
    encodedData = encodeFunctionData({ abi, functionName, args: [recipients, amounts] });
  } catch (err) {
    console.error(err);
  }

  const callResult: CallResult = await tevm.call({
    caller,
    to: contractAddress,
    value: callValue,
    data: encodedData,
    skipBalance: true,
  });

  const l1submission = { deployment: '0', call: '0' };
  if (hasCustomStack) {
    // Calculate cost of submission
  }

  return {
    gasUsed: {
      deployment: { root: '0', l1submission: l1submission.deployment },
      call: { root: callResult.executionGasUsed.toString(), l1submission: l1submission.call },
    },
    errors: callResult.errors || [],
  };
};

// const airdropERC20: CallToLocalChain_sub = async ({
//   tevm,
//   caller,
//   contractAddress,
//   abi,
//   functionName,
//   args,
//   hasCustomStack,
// }) => {
//   const totalAmount = args[2];
// };

/* -------------------------------------------------------------------------- */
/*                                    UTILS                                   */
/* -------------------------------------------------------------------------- */

const returnEmptyCallDataWithError = (message: string): CallReturnData => ({
  gasUsed: {
    deployment: { root: '0', l1submission: '0' },
    call: { root: '0', l1submission: '0' },
  },
  errors: [{ _tag: 'UnexpectedError', name: 'UnexpectedError', message }],
});
