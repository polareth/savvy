'use client';

import { FC, useEffect } from 'react';

import { useConfigStore } from '@/lib/store/use-config';
import { useProviderStore } from '@/lib/store/use-provider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CurrencyAmount from '@/components/common/currency-amount';
import ShrinkedAddress from '@/components/common/shrinked-address';
import TooltipResponsive from '@/components/common/tooltip-responsive';

type AccountStateProps = {
  initialSearchedAccount: string;
};

/**
 * @notice The state of the current account
 * @dev This will display the data about the current account.
 * @dev This will be updated after searching for an address or making a call.
 */
const AccountState: FC<AccountStateProps> = ({ initialSearchedAccount }) => {
  /* ---------------------------------- STATE --------------------------------- */
  const { chain, client, forkTime, initializing } = useProviderStore(
    (state) => ({
      chain: state.chain,
      client: state.client,
      forkTime: state.forkTime,
      initializing: state.initializing,
    }),
  );

  const { account, fetchingAccount, updateAccount } = useConfigStore(
    (state) => ({
      account: state.account,
      fetchingAccount: state.fetchingAccount,
      updateAccount: state.updateAccount,
    }),
  );

  const loading = initializing || fetchingAccount;

  /* --------------------------------- EFFECTS -------------------------------- */
  // Update the account:
  // - on chain change/reset
  // - on refresh (direct mount or search)
  useEffect(() => {
    if (client) {
      updateAccount(initialSearchedAccount, {
        updateAbi: true,
        chain,
        client,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, client, forkTime[chain.id]]);

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
        <div className="flex flex-col gap-x-4 sm:flex-row sm:items-center">
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
          ) : account.ens ? (
            <Badge
              variant="secondary"
              className="w-min whitespace-nowrap font-mono"
            >
              {account.ens}
            </Badge>
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
