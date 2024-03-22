'use client';

import { useMemo } from 'react';

import { useProviderStore } from '@/lib/store/use-provider';
import { useTxStore } from '@/lib/store/use-tx';
import TxHistoryTable from '@/components/core/tx-history/table';
import TotalFeesTable from '@/components/core/tx-history/total-fees';

/**
 * @notice The history of local transactions made on a chain (fork)
 */
const TxHistory = () => {
  // The current chain & fork time
  const { chain, forkTime } = useProviderStore((state) => ({
    chain: state.chain,
    forkTime: state.forkTime,
  }));

  const {
    globalTxHistory,
    globalTotalFees,
    pending,
    isHydrated,
    toggleIncludeTxInTotalFees,
    includeAllTxsInTotalFees,
    excludeAllTxsFromTotalFees,
  } = useTxStore((state) => ({
    // The tx history for all chains
    globalTxHistory: state.txHistory,
    // The total costs of all transactions (on all chains)
    globalTotalFees: state.totalFees,
    // The current transaction being processed
    pending: state.pending,
    // Whether the local storage is rehydrated
    isHydrated: state.isHydrated,
    // Toggle the inclusion of a tx in the total cost
    toggleIncludeTxInTotalFees: state.toggleIncludeTxInTotalFees,
    // Include/exclude all txs in the total cost
    includeAllTxsInTotalFees: state.includeAllTxsInTotalFees,
    excludeAllTxsFromTotalFees: state.excludeAllTxsFromTotalFees,
  }));

  // Remember the tx history & total costs for the current chain
  const { txHistory, totalFees } = useMemo(
    () => ({
      txHistory: globalTxHistory[chain.id] ?? [],
      totalFees: globalTotalFees[chain.id] ?? {},
    }),
    // Refetch when the chain or fork time changes (meaning reset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chain.id, globalTxHistory[chain.id], forkTime[chain.id]],
  );

  return (
    <>
      <TotalFeesTable
        totalFees={totalFees}
        txAmount={txHistory.length}
        hydrating={!isHydrated}
      />
      <TxHistoryTable
        data={txHistory}
        hydrating={!isHydrated}
        pending={pending}
        totalFees={{
          toggle: toggleIncludeTxInTotalFees,
          includeAll: includeAllTxsInTotalFees,
          excludeAll: excludeAllTxsFromTotalFees,
        }}
      />
    </>
  );
};

export default TxHistory;
