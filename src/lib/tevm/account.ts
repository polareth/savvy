import { MemoryClient } from 'tevm';
import { Address, isAddress } from 'tevm/utils';
import { normalize } from 'viem/ens';

import { Account } from '@/lib/types/config';
import { Chain } from '@/lib/types/providers';

/* ---------------------------------- TYPES --------------------------------- */
/**
 * @type {Function} GetAccount
 * @param {MemoryClient} client The client to get the account from
 * @param {Chain} chain The chain to get the account from
 * @param {Address | string} addressOrENS The address of the account (or ENS)
 * @returns {Promise<Account>} The account object
 */
type GetAccount = (
  client: MemoryClient,
  chain: Chain,
  addressOrENS: Address | string,
) => Promise<Account>;

/* -------------------------------- FUNCTIONS ------------------------------- */
/**
 * @notice Get the account for a given address using a Tevm client
 * @dev This will return the account object for the given address.
 * @dev If the action fails, an error will be displayed and it will still return an
 * account object with the address and an error message.
 */
export const getAccount: GetAccount = async (client, chain, addressOrENS) => {
  const emptyAccount: Account = {
    address: isAddress(addressOrENS) ? addressOrENS : '0x',
    ens: isAddress(addressOrENS) ? undefined : addressOrENS,
    balance: BigInt(0),
    deployedBytecode: '0x',
    nonce: BigInt(0),
    storageRoot: '0x',
    codeHash: '0x',
    isContract: false,
    isEmpty: false,
    errors: [],
  };

  try {
    // ENS
    // Grab the right provider, depending on the chain that can resolve ENS
    const resolver = chain.contracts?.ensUniversalResolver;
    const provider = resolver
      ? chain.custom.config.provider
      : chain.custom.tech.underlying?.custom.config.provider;

    console.log(provider);

    // If an ENS was provided and there is no provider, return an error
    if (!provider && !isAddress(addressOrENS)) {
      return {
        ...emptyAccount,
        errors: [
          {
            _tag: 'InvalidRequestError',
            name: 'InvalidRequestError',
            message: `Could not find an ENS resolver for ${chain.name}`,
          },
        ],
      };
    }

    // Find the address if an ENS was provided, and conversely for information purposes
    const address = isAddress(addressOrENS)
      ? addressOrENS
      : await provider?.getEnsAddress({
          name: normalize(addressOrENS),
        });
    const ens = isAddress(addressOrENS)
      ? ((await provider?.getEnsName({ address: addressOrENS })) as
          | string
          | undefined)
      : addressOrENS;

    // Make sure the user is clearly notified if there is something wrong with the address
    if (!address)
      return {
        ...emptyAccount,
        errors: [
          {
            _tag: 'InvalidAddressError',
            name: 'InvalidAddressError',
            message: `Invalid address or ENS: ${address}`,
          },
        ],
      };

    const accountResult = await client.getAccount({ address });
    return {
      ...accountResult,
      // This is a safeguard against an account being mislabeled as invalid
      // although very unlikely to happen
      address,
      ens,
      // TODO TEMP fix until RPC providers fix their eth_getProof method
      // (some returning address(0), some returning keccak256("no data")...)
      isContract: accountResult.deployedBytecode !== '0x',
      isEmpty:
        accountResult.codeHash ===
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    };
  } catch (err) {
    console.error(err);
    return {
      ...emptyAccount,
      errors: [
        {
          _tag: 'UnexpectedError',
          name: 'UnexpectedError',
          message:
            err instanceof Error
              ? err.message.split('.').slice(0, 1).join('.') + '...'
              : String(err),
        },
      ],
    };
  }
};
