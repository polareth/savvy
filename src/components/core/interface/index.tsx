'use client';

import { useConfigStore } from '@/lib/store/use-config';
import InterfaceTable from '@/components/core/interface/table';

/**
 * @notice The interface of the contract after it's been retrieved
 */
const Interface = () => {
  const { abi, fetchingAccount, fetchingAbi } = useConfigStore((state) => ({
    // Get the abi of the current contract (null if not fetched yet)
    abi: state.abi,
    // Get the loading (fetching) status
    fetchingAccount: state.fetchingAccount,
    fetchingAbi: state.fetchingAbi,
  }));

  if (!abi && !fetchingAccount && !fetchingAbi) return null;
  return <InterfaceTable abi={abi} loading={fetchingAbi} />;
};

export default Interface;
