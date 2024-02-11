import { Abi, CallResult, createMemoryClient, encodeFunctionData, TevmClient } from 'tevm';

import { MOCKS } from '@/lib/constants/solutions/airdrop/mocks';
import { AirdropParams, AirdropUniqueId, Token } from '@/lib/types/airdrop';
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
  tokenAddress: `0x${string}`,
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
  let caller: `0x${string}` = `0x${'01'.repeat(20)}`;
  let tokenAddress: `0x${string}` = '0x';
  const tevm = await createMemoryClient({
    fork: {
      url: `${forkUrl}${alchemyId}`,
    },
  });

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

  const { value, encodedData } = mapIdToData(id, abi, functionName, params, tokenAddress);

  if (encodedData === '0x') {
    return emptyCallDataWithError('Failed to encode call data');
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

const mapIdToData: CallToLocalChain_sub = (id, abi, functionName, params, tokenAddress) => {
  const aggregate = [id, abi, functionName, params, tokenAddress] as const;

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

const airdropERC20Params: CallToLocalChain_sub = (id, abi, functionName, params, tokenAddress) => {
  const { args, ...custom } = params as AirdropParams['push-ERC20'];
  let encodedData = '0x' as `0x${string}`;

  try {
    const token = custom.tokenAddress ?? tokenAddress;
    encodedData = encodeFunctionData({
      abi,
      functionName,
      args: [token, args[1], args[2], args[3]],
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
  const tokenProvided = providedTokenAddress !== '0x' && providedtokenOwnerOrHolder !== '0x';
  const tokenAddress = tokenProvided ? providedTokenAddress : MOCKS[token].sepoliaAddress;
  const caller = tokenProvided ? providedtokenOwnerOrHolder : mockCaller;
  let callerBalance = BigInt(0);

  // If we're using a mock token, set its bytecode
  if (!tokenProvided) {
    await tevm.setAccount({
      address: tokenAddress,
      balance: BigInt(0),
      deployedBytecode: MOCKS.ERC20.deployedBytcode,
    });
  }

  // If a token is provided, check the balance (to see if it's the owner or a holder,
  // and at the same time if they have enough tokens)
  if (tokenProvided) {
    const balanceResult: CallResult = await tevm.call({
      caller,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: MOCKS[token].abi,
        functionName: 'balanceOf',
        args: [caller],
      }),
    });

    if (balanceResult.errors) {
      console.error(balanceResult.errors);
      throw new Error('Failed to check balance');
    }

    callerBalance = BigInt(balanceResult.rawData.toString());
  }

  // Try to mint tokens if the balance is not enough
  // case 1: token not provided, so we're just minting tokens from the mock contract
  // case 2: token provided, and the provided address was not a holder, so they might be able to mint tokens
  if (callerBalance < BigInt(totalAmount)) {
    const mintResult: CallResult = await tevm.call({
      caller,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: MOCKS[token].abi,
        functionName: 'mint',
        args: [caller, BigInt(totalAmount) - callerBalance],
      }),
    });

    if (mintResult.errors) {
      console.error(mintResult.errors);
      throw new Error('Failed to mint tokens');
    }
  }

  // At this point the caller has the tokens, so they can approve the spender (GasliteDrop) to spend them
  const approveResult: CallResult = await tevm.call({
    caller,
    to: tokenAddress,
    data: encodeFunctionData({
      abi: MOCKS.ERC20.abi,
      functionName: 'approve',
      args: [spender, BigInt(totalAmount)],
    }),
  });

  if (approveResult.errors) {
    console.error(approveResult.errors);
    throw new Error('Failed to approve tokens');
  }

  return [caller, tokenAddress];
};
