import { ABI } from '@shazow/whatsabi/lib.types/abi';
import { Address } from 'tevm/utils';

import { Chain } from '@/lib/types/providers';
import { getFunctionName } from '@/lib/utils';

/* ---------------------------------- TYPES --------------------------------- */
/**
 * @type {Object} FetchAbiResponse
 * @property {boolean} success Whether the fetch was successful
 * @property {Object} data The fetched data (abi and resolved address, useful if it's a proxy)
 */
type FetchAbiResponse = {
  success: boolean;
  data: { abi: ABI | null; resolvedAddress: Address };
};

/**
 * @type {Function} FetchAbi
 * @param {Address} contractAddress The address of the contract
 * @param {Chain} chain The chain the contract is deployed on
 * @returns {Promise<FetchAbiResponse>}
 */
type FetchAbi = (
  contractAddress: Address,
  chain: Chain,
) => Promise<FetchAbiResponse>;

/* -------------------------------- FUNCTIONS ------------------------------- */
/**
 * @notice Fetch the abi of a given contract
 * @dev This will pass the public client (Viem) to the WhatsABI function to fetch the abi.
 * @dev We need to do this using an api route because of the Sourcify strict CORS policy.
 * @see https://github.com/shazow/whatsabi
 */
export const fetchAbi: FetchAbi = async (contractAddress, chain) => {
  // Get the default api url for the chain (if it exists)
  const apiUrl = chain.blockExplorers?.default.apiUrl;

  const response = await fetch('/abi', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      chainId: chain.id,
      contractAddress,
      rpcUrl: chain.rpcUrls.default.http,
      apiUrl,
    }),
  });

  const resJson = response.ok
    ? ((await response.json()) as FetchAbiResponse)
    : undefined;

  if (!resJson || !resJson.success) {
    console.error('Failed to fetch abi:', response);
    return {
      success: false,
      data: { abi: null, resolvedAddress: contractAddress },
    };
  }

  const data = resJson.data;
  if (!data.abi) {
    return {
      success: true,
      data: { abi: null, resolvedAddress: contractAddress },
    };
  }

  return {
    success: true,
    // If a function doesn't have a name, use its selector or its signature for easier calling
    data: {
      abi: data.abi.map((funcOrEvent) => ({
        ...funcOrEvent,
        name: getFunctionName(funcOrEvent, data.abi!.indexOf(funcOrEvent)),
      })),
      resolvedAddress: data.resolvedAddress,
    },
  };
};
