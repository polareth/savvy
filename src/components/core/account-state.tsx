'use client';

import { FC, useEffect } from 'react';
import { Address, isAddress } from 'tevm/utils';

import { useConfigStore } from '@/lib/store/use-config';
import { useProviderStore } from '@/lib/store/use-provider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CurrencyAmount from '@/components/common/currency-amount';
import ShrinkedAddress from '@/components/common/shrinked-address';
import TooltipResponsive from '@/components/common/tooltip-responsive';

type AccountStateProps = {
  initialAddress: string;
};

/**
 * @notice The state of the current account
 * @dev This will display the data about the current account.
 * @dev This will be updated after searching for an address or making a call.
 */
const AccountState: FC<AccountStateProps> = ({ initialAddress }) => {
  /* ---------------------------------- STATE --------------------------------- */
  const { chain, client, initializing } = useProviderStore((state) => ({
    chain: state.chain,
    client: state.client,
    initializing: state.initializing,
  }));

  const { account, fetchingAccount, updateAccount } = useConfigStore(
    (state) => ({
      account: state.account,
      fetchingAccount: state.fetchingAccount,
      updateAccount: state.updateAccount,
    }),
  );

  const loading = initializing || fetchingAccount;

  /* --------------------------------- EFFECTS -------------------------------- */
  // Update the account if the address in the URL changes (on search, reload, or navigation)
  useEffect(() => {
    if (
      client &&
      isAddress(initialAddress) &&
      (!account || account.address !== initialAddress)
    )
      updateAccount(initialAddress as Address, {
        updateAbi: true,
        chain,
        client,
      });
  }, [initialAddress, account, chain, client, updateAccount]);

  /* --------------------------------- RENDER --------------------------------- */
  if (!account && !fetchingAccount) return null;

  // We know that if account is undefined but loading is true, the components
  // accessing account will be rendered as skeletons; if it's false, this won't be rendered at all
  return (
    <div className="grid grid-cols-[min-content_min-content] items-center gap-x-4 gap-y-2 text-sm sm:gap-x-8 sm:text-base">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {!account || account.isEmpty
            ? 'Account'
            : account.isContract
              ? 'Contract'
              : 'EOA'}
        </span>
        {account?.errors && account.errors.length > 0 ? (
          <TooltipResponsive
            trigger="error"
            content={account.errors[0].message}
          />
        ) : null}
      </div>
      {loading || !account ? (
        <Skeleton className="h-6 w-24" />
      ) : (
        <div className="flex items-center gap-2 md:gap-4">
          <ShrinkedAddress
            address={account.address}
            explorer={chain.blockExplorers?.default.url}
          />
          {account.isEmpty ? (
            <TooltipResponsive
              trigger={
                <Badge variant="secondary" className="whitespace-nowrap">
                  <span className="hidden md:block">not initialized</span>
                  <span className="md:hidden">empty</span>
                </Badge>
              }
              content="This account has never been initialized (0 balance, 0 nonce, no deployed bytecode)"
              classNameTrigger="flex items-center"
            />
          ) : null}
        </div>
      )}
      <span className="text-sm text-gray-500">Balance</span>
      {loading || !account ? (
        <Skeleton className="h-6 w-24" />
      ) : (
        <CurrencyAmount
          amount={account!.balance}
          symbol={chain.nativeCurrency.symbol}
          decimals={chain.nativeCurrency.decimals}
        />
      )}
      {!account?.isContract && !account?.isEmpty ? (
        <>
          <span className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-500">
            Transactions
            <TooltipResponsive
              trigger="info"
              content="The number of transactions sent from this account on this chain"
            />
          </span>
          {loading || !account ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <span>{account.nonce.toString()}</span>
          )}
        </>
      ) : null}
    </div>
  );
};

export default AccountState;
