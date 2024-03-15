import { GetAccountResult, MemoryClient } from 'tevm';
import { Address, isAddress } from 'tevm/utils';

/* ---------------------------------- TYPES --------------------------------- */
/**
 * @type {Function} GetAccount
 * @param {MemoryClient} client The client to get the account from
 * @param {Address} address The address of the account
 * @returns {Promise<GetAccountResult>} The account object
 */
type GetAccount = (
  client: MemoryClient,
  address: Address,
) => Promise<GetAccountResult>;

/* -------------------------------- FUNCTIONS ------------------------------- */
/**
 * @notice Get the account for a given address using a Tevm client
 * @dev This will return the account object for the given address.
 * @dev If the action fails, an error will be displayed and it will still return an
 * account object with the address and an error message.
 */
export const getAccount: GetAccount = async (client, address) => {
  const emptyAccount: GetAccountResult = {
    address: address ?? '0x',
    balance: BigInt(0),
    deployedBytecode: '0x',
    nonce: BigInt(0),
    storageRoot: '0x',
    codeHash: '0x',
    isContract: false,
    isEmpty: false,
    errors: [],
  };

  // Make sure the user is clearly notified if there is something wrong with the address
  if (!isAddress(address))
    return {
      ...emptyAccount,
      errors: [
        {
          _tag: 'InvalidAddressError',
          name: 'InvalidAddressError',
          message: `Invalid address: ${address}`,
        },
      ],
    };

  try {
    const accountResult = await client.getAccount({ address });
    return {
      ...accountResult,
      // This is a safeguard against an account being mislabeled as invalid
      // although very unlikely to happen
      address,
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
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      ],
    };
  }
};
