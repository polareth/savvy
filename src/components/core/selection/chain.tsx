'use client';

import { FC } from 'react';
import { toast } from 'sonner';
import { extractChain } from 'viem';

import { CHAINS } from '@/lib/constants/providers';
import { useConfigStore } from '@/lib/store/use-config';
import { useProviderStore } from '@/lib/store/use-provider';
import { useTxStore } from '@/lib/store/use-tx';
import { resetClient } from '@/lib/tevm/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ElapsedTime from '@/components/common/elapsed-time';
import { Icons } from '@/components/common/icons';
import TooltipResponsive from '@/components/common/tooltip-responsive';
import ComboBoxResponsive from '@/components/templates/combobox-responsive';

type ChainSelectionProps = {
  hydrating?: boolean;
};

/**
 * @notice Select a chain from the list of supported chains
 * @dev This will create or retrieve a Tevm client in local storage
 * @dev The state of various chains can be saved/retrieved from local storage, each
 * on their own key
 * @param hydrating Whether the app is still hydrating or not
 */
const ChainSelection: FC<ChainSelectionProps> = ({ hydrating = false }) => {
  /* ---------------------------------- STATE --------------------------------- */
  // Get the account & abi (+ method to fetch & update)
  const { getLatestGasFeesData, getLatestNativeTokenPrice } = useConfigStore(
    (state) => ({
      getLatestGasFeesData: state.getLatestGasFeesData,
      getLatestNativeTokenPrice: state.getLatestNativeTokenPrice,
    }),
  );

  const { chain, client, forkTime, initializing, setProvider, setForkTime } =
    useProviderStore((state) => ({
      // Get the current chain (selected from the combobox)
      chain: state.chain,
      // Get the current Tevm client
      client: state.client,
      // The fork time for the current chain
      forkTime: state.forkTime,
      // Whether the client is still initializing
      initializing: state.initializing,
      // Set the current provider from the combobox (chain + Tevm client)
      setProvider: state.setProvider,
      // Set the fork time for the current chain
      setForkTime: state.setForkTime,
    }));

  // Reset the transaction history for a chain
  const resetTxs = useTxStore((state) => state.resetTxs);

  /* -------------------------------- HANDLERS -------------------------------- */
  // Reset the cache of the Tevm clients for this chain in local storage
  const resetCurrentClient = async () => {
    if (!client) return; // this should never happen since the button would not be rendered yet

    const loading = toast.loading('Forking chain...', {
      description: `Forking ${chain.name} to the latest block and resetting local transaction history...`,
    });
    // This will set forkTime to 0 (loading) and then to the current time (update)
    setForkTime(chain.id, 'loading');
    const { success, error } = await resetClient(client);
    setForkTime(chain.id, 'update');

    if (success) {
      // Reset the transaction history for the current chain
      resetTxs(chain.id);

      toast.success('Chain reset', {
        id: loading,
        description: `The client for ${chain.name} has been reset and the fork created at the latest block`,
      });
    } else {
      toast.error('Error', {
        id: loading,
        description: `The client for ${chain.name} could not be reset: ${error}`,
      });
    }
  };

  /* --------------------------------- RENDER --------------------------------- */
  return (
    <div className="grid grid-cols-[1fr_min-content] justify-between gap-1">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground md:text-sm">
        <Icons.bullet className="mr-0" /> Chain
        <TooltipResponsive
          trigger="info"
          content="Click 'fork chain' to fork it at the current block (you will lose the local state of the chain)"
        />
      </div>
      {initializing || hydrating ? (
        <Skeleton className="h-4 w-[85px]" />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-muted-foreground"
          onClick={resetCurrentClient}
        >
          fork chain
        </Button>
      )}
      {initializing || hydrating ? (
        <Skeleton className="col-span-2 h-[36px] w-full" />
      ) : (
        <ComboBoxResponsive
          items={CHAINS.map((chain) => ({
            value: chain.id.toString(),
            label: chain.name,
            icon: chain.custom.config.icon,
            disabled: chain.custom.config.disabled,
          }))}
          label="Chain"
          selected={{
            value: chain.id.toString(),
            label: chain.name,
            icon: chain.custom.config.icon,
            disabled: chain.custom.config.disabled,
          }}
          setSelected={async (chainOption) => {
            const selectedChain = extractChain({
              chains: CHAINS,
              id: Number(chainOption.value),
            });
            // Change the chain
            const newClient = await setProvider(selectedChain);
            // Catch any issue if the client could not be set
            if (!newClient) {
              toast.error('Failed to set provider', {
                description: `The provider for ${selectedChain.name} could not be retrieved`,
              });
              return;
            }

            // Fetch the latest gas fees and native token price
            Promise.all([getLatestGasFeesData(), getLatestNativeTokenPrice()]);
          }}
          header="Select a chain"
          className="col-span-2 w-full"
        />
      )}
      <div className="text-xs font-semibold text-gray-500 md:col-span-2">
        {!initializing && forkTime[chain.id] !== 0 ? (
          <TooltipResponsive
            trigger={
              <span>
                <ElapsedTime
                  start={forkTime[chain.id] as number}
                  prefix="Forked"
                  suffix="ago"
                />
              </span>
            }
            content={new Date(forkTime[chain.id] as number).toLocaleString()}
          />
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </div>
    </div>
  );
};

export default ChainSelection;
