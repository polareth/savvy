'use client';

import { useMemo } from 'react';

import { useProviderStore } from '@/lib/store/use-provider';
import { useTxStore } from '@/lib/store/use-tx';
import TxHistoryTable from '@/components/core/tx-history/table';

/**
 * @notice The history of local transactions made on a chain (fork)
 */
const TxHistory = () => {
  // The current chain & fork time
  const { chain, forkTime } = useProviderStore((state) => ({
    chain: state.chain,
    forkTime: state.forkTime,
  }));

  const { globalTxHistory, processing, isHydrated } = useTxStore((state) => ({
    // The tx history for all chains
    globalTxHistory: state.txHistory,
    // The current transaction being processed
    processing: state.processing,
    // Whether the local storage is rehydrated
    isHydrated: state.isHydrated,
  }));

  // Remember the tx history for the current chain
  const txHistory = useMemo(
    () => globalTxHistory[chain.id] ?? [],
    // Refetch the tx history when the chain or fork time changes (meaning reset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chain.id, globalTxHistory[chain.id], forkTime[chain.id]],
  );

  return (
    <TxHistoryTable
      data={txHistory}
      loading={!isHydrated || processing !== ''}
    />
  );
};

export default TxHistory;
