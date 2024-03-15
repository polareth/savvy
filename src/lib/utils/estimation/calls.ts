import { Abi, createMemoryClient, TevmClient } from 'tevm';
import { ContractError } from 'tevm/errors';
import { encodeFunctionData, serializeTransaction } from 'viem';

import { CustomStackSupport } from '@/lib/types/chains';
import { TxGasUsed } from '@/lib/types/gas';
import {
  AirdropArgs,
  AirdropParams,
  AirdropUniqueId,
  Token,
} from '@/lib/types/solutions/airdrop';
import { DEFAULTS } from '@/lib/constants/defaults';
import { MOCKS } from '@/lib/constants/solutions/airdrop/mocks';

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
  customStack: CustomStackSupport | undefined,
) => Promise<CallReturnData>;

type CallToLocalChain_sub = (
  id: AirdropUniqueId,
  abi: Abi,
  functionName: string,
  params: AirdropParams[typeof id],
  tokenAddress: `0x${string}`,
) => { value: bigint; args: AirdropArgs };

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
  customStack,
) => {
  const errors: ContractError[] = [];
  const tevm = await createMemoryClient({
    fork: {
      url: `${forkUrl}${alchemyId}`,
    },
  });

  let caller: `0x${string}` = `0x${'01'.repeat(20)}`;
  let tokenAddress: `0x${string}` = '0x';

  // If it's a token we need to mint and approve
  // If the user provided a token, and the owner (able to mint tokens), it will mint and approve
  // If the user provided a token, and a holder, it will only approve
  // If the user didn't provide a token, it will use a mock token and return its address
  if (id === 'push-ERC20') {
    const { args: prevArgs, ...custom } = params as AirdropParams['push-ERC20'];
    // The returned token address is either the provided token or a mock token
    // The returned caller is either the default (mock one) or the provided holder if any
    [caller, tokenAddress] = await mintAndApprove(
      'ERC20',
      tevm,
      caller,
      contractAddress,
      prevArgs[3], // totalAmount
      custom.tokenAddress,
      custom.tokenOwnerOrHolder,
    );
  }

  const { value, args } = mapIdToArgs(
    id,
    abi,
    functionName,
    params,
    tokenAddress,
  );
  const {
    executionGasUsed,
    errors: txErrors,
    logs,
  } = await tevm.contract({
    caller,
    to: contractAddress,
    value,
    abi,
    functionName,
    args,
    gas: DEFAULTS.gasLimit,
    createTransaction: true,
  });
  if (txErrors) errors.push(...txErrors);

  let submissionCost = { deployment: '0', call: '0' };
  if (customStack && customStack.oracle) {
    const { rawData: l1submissionGasUsed, errors: l1submissionErrors } =
      await tevm.contract({
        caller,
        to: customStack.oracle,
        value: BigInt(0),
        abi: [
          {
            inputs: [{ internalType: 'bytes', name: '_data', type: 'bytes' }],
            name: 'getL1GasUsed',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'getL1GasUsed',
        args: [
          serializeTransaction({
            data: encodeFunctionData({ abi, functionName, args }),
            type: 'eip1559',
          }),
        ],
        gas: DEFAULTS.gasLimit,
      });

    submissionCost = {
      deployment: '0', // TODO Not implemented yet
      call: l1submissionGasUsed.toString(),
    };

    if (l1submissionErrors) errors.push(...l1submissionErrors);
  } else if (customStack) {
    // Handle calculation without needing to call the oracle
  }

  return {
    gasUsed: {
      deployment: { root: '0', l1Submission: '0' }, // TODO Not implemented yet
      call: {
        root: executionGasUsed.toString(),
        l1Submission: submissionCost.call,
      },
    },
    errors: errors?.map((e) => e.message) || [],
  };
};

/* -------------------------------------------------------------------------- */
/*                                    CALLS                                   */
/* -------------------------------------------------------------------------- */

const mapIdToArgs: CallToLocalChain_sub = (
  id,
  abi,
  functionName,
  params,
  tokenAddress,
) => {
  if (id === 'push-native') {
    const p = params as AirdropParams['push-native'];
    return { value: BigInt(p.totalAmount || '0'), args: p.args };
  } else if (id == 'push-ERC20') {
    const { args: prevArgs } = params as AirdropParams['push-ERC20'];
    return {
      value: BigInt(0),
      args: [tokenAddress, prevArgs[1], prevArgs[2], prevArgs[3]],
    };
  } else {
    return { value: BigInt(0), args: [] };
  }
};

/* -------------------------------------------------------------------------- */
/*                                    MOCKS                                   */
/* -------------------------------------------------------------------------- */

const mintAndApprove = async (
  token: Token['id'],
  tevm: TevmClient,
  mockCaller: `0x${string}`,
  spender: `0x${string}`,
  totalAmount: string,
  providedTokenAddress: `0x${string}`,
  providedtokenOwnerOrHolder: `0x${string}`,
): Promise<[`0x${string}`, `0x${string}`]> => {
  // TODO Is it better to just use the mock if any of the actions on provided tokens fail,
  // and tell the user? Or let them choose?
  const tokenProvided =
    providedTokenAddress !== '0x' && providedtokenOwnerOrHolder !== '0x';
  const tokenAddress = tokenProvided
    ? providedTokenAddress
    : MOCKS[token].sepoliaAddress;
  const caller = tokenProvided ? providedtokenOwnerOrHolder : mockCaller;
  let callerBalance = BigInt(0);

  // If we're using a mock token, set its bytecode
  if (!tokenProvided) {
    // TODO Handle errors
    const { errors } = await tevm.setAccount({
      address: tokenAddress,
      deployedBytecode: MOCKS.ERC20.deployedBytecode,
    });
  }

  // If a token is provided, check the balance (to see if it's the owner or a holder,
  // and at the same time if they have enough tokens)
  if (tokenProvided) {
    const { rawData, errors } = await tevm.contract({
      caller,
      to: tokenAddress,
      abi: MOCKS[token].abi,
      functionName: 'balanceOf',
      args: [caller],
      createTransaction: true,
    });

    // TODO If it throws DecodeFunctionDataError because rawData is 0x, it might be because
    // the provided token is not deployed on this chain
    if (errors) {
      console.error(errors);
      throw new Error('Failed to check balance');
    }

    callerBalance = BigInt(rawData.toString());
  }

  // Try to mint tokens if the balance is not enough
  // case 1: token not provided, so we're just minting tokens from the mock contract
  // case 2: token provided, and the provided address was not a holder, so they might be able to mint tokens
  if (callerBalance < BigInt(totalAmount)) {
    const { errors } = await tevm.contract({
      caller,
      to: tokenAddress,
      abi: MOCKS[token].abi,
      functionName: 'mint',
      args: [caller, BigInt(totalAmount) - callerBalance],
      createTransaction: true,
    });

    if (errors) {
      console.error(errors);
      throw new Error('Failed to mint tokens');
    }
  }

  // At this point the caller has the tokens, so they can approve the spender (GasliteDrop) to spend them
  const { errors } = await tevm.contract({
    caller,
    to: tokenAddress,
    abi: MOCKS.ERC20.abi,
    functionName: 'approve',
    args: [spender, BigInt(totalAmount)],
    createTransaction: true,
  });

  if (errors) {
    console.error(errors);
    throw new Error('Failed to approve tokens');
  }

  return [caller, tokenAddress];
};

/* -------------------------------------------------------------------------- */
/*                                    UTILS                                   */
/* -------------------------------------------------------------------------- */

const emptyCallDataWithError = (message: string): CallReturnData => ({
  gasUsed: {
    deployment: { root: '0', l1Submission: '0' },
    call: { root: '0', l1Submission: '0' },
  },
  errors: [message],
});
