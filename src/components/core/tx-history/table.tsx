'use client';

import { FC, Fragment, ReactNode, useCallback, useMemo, useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { TxEntry, TxPending } from '@/lib/types/tx';
import { CHAINS } from '@/lib/constants/providers';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useProviderStore } from '@/lib/store/use-provider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import CurrencyAmount from '@/components/common/currency-amount';
import ElapsedTime from '@/components/common/elapsed-time';
import GweiAmount from '@/components/common/gwei-amount';
import { Icons } from '@/components/common/icons';
import ShrinkedAddress from '@/components/common/shrinked-address';
import TooltipResponsive from '@/components/common/tooltip-responsive';
import TxHistoryCollapsibleMobile from '@/components/core/tx-history/collapsible-mobile';
import { DataTableColumnHeader } from '@/components/templates/table/column-header';
import DataTableExpandable from '@/components/templates/table/data-table-expandable';
import { DataTableFacetedFilter } from '@/components/templates/table/faceted-filter';
import { DataTableViewOptions } from '@/components/templates/table/view';

/* ---------------------------------- TYPES --------------------------------- */
type TxHistoryTableProps = {
  data: TxEntry[] | undefined;
  hydrating: boolean;
  pending: TxPending | undefined;
  totalFees: {
    toggle: (chainId: number, id: string) => void;
    includeAll: (chainId: number) => void;
    excludeAll: (chainId: number) => void;
  };
};

type CellNodeContext = {
  id: string;
  pendingId: string | undefined;
};

/* --------------------------------- HELPERS -------------------------------- */
// The loading row with mock data (just to display a skeleton)
const getLoadingRow = (pending: TxPending): TxEntry => ({
  ...pending,
  utils: { includedInTotalFees: false },
  gasCosts: {
    costUsd: { root: '0' },
    costNative: { root: '0' },
  },
  gasUsed: '0',
  data: '',
  decoded: false,
  status: 'pending',
  logs: null,
  errors: null,
  timestamp: Date.now(),
});

// Render a loading skeleton if it's the latest transaction being processed or the original data if it's not
const getCellNode = (
  cell: ReactNode | string,
  context: CellNodeContext,
  skeletonClass?: string,
) =>
  context.id === context.pendingId ? (
    <Skeleton className={cn('h-4 w-16', skeletonClass)} />
  ) : (
    cell
  );

/* -------------------------------------------------------------------------- */
/*                              TX HISTORY TABLE                              */
/* -------------------------------------------------------------------------- */

/**
 * @notice A table to display the history of transactions made on a chain (fork)
 * @dev This will display both successful and failed transactions made locally after forking a chain,
 * whether they modified the state or not (read/write).
 * @param data The history of transactions fetched from local storage
 * @param hydrating Whether the local storage is still being hydrated or not
 * @param pending Whether a transaction is currently being processed
 * @param totalFees Utility functions to include/exclude txs from the total fees
 * @returns A table with the history of transactions
 */
const TxHistoryTable: FC<TxHistoryTableProps> = ({
  data,
  hydrating,
  pending,
  totalFees,
}) => {
  /* ---------------------------------- STATE --------------------------------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const chain = useProviderStore((state) => state.chain);

  // Display table layout from md (large layout) to lg (sidebar appeared), then again from xl
  const isMediumOrLarge = useMediaQuery(
    '(min-width: 768px) and (max-width: 1024px)',
  ); // md to lg
  const isExtraLarge = useMediaQuery('(min-width: 1280px)'); // xl
  const largeDisplay = isMediumOrLarge || isExtraLarge;

  /* --------------------------------- HELPERS -------------------------------- */
  // The context to pass to the cell node to figure out if it's a loading tx or a processed one
  const cellNodeContext = useCallback(
    (id: string) => ({ id, pendingId: pending?.id }),
    [pending],
  );

  /* --------------------------------- COLUMNS -------------------------------- */
  // Id, type, function/selector (if relevant), timestamp, status
  const columns: ColumnDef<TxEntry>[] = useMemo(() => {
    return [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="#" />
        ),
        cell: ({ row }) => {
          const index = data
            ?.sort((a, b) => a.timestamp - b.timestamp)
            .indexOf(row.original);
          return (
            <span className="mr-2 text-muted-foreground lg:mr-0">
              {!index || index === -1 ? data?.length || 1 : index + 1}
            </span>
          );
        },
      },
      {
        accessorKey: 'call',
        header: () => <span className="text-xs">Call</span>,
        cell: ({ row }) =>
          getCellNode(
            row.original.context.target.isContract ? (
              <Badge>contract</Badge>
            ) : row.original.context.target.isContract !== undefined ? (
              <Badge className="secondary">EOA</Badge>
            ) : (
              <Badge variant="outline">?</Badge>
            ),
            cellNodeContext(row.original.id),
          ),
      },
      {
        accessorKey: 'name',
        header: () => <span className="text-xs">Function</span>,
        cell: ({ row }) =>
          getCellNode(
            <pre className="text-left">
              {row.original.context.functionName ? (
                <div className="flex items-center gap-2">
                  {row.original.context.functionName}{' '}
                  {row.original.context.stateMutability === 'pure' ||
                  row.original.context.stateMutability === 'view' ? (
                    <Badge variant="secondary">
                      {row.original.context.stateMutability}
                    </Badge>
                  ) : null}
                </div>
              ) : (
                <span className="text-left text-muted-foreground">
                  arbitrary call
                </span>
              )}
            </pre>,
            cellNodeContext(row.original.id),
          ),
        filterFn: (row, id, value) => {
          return row.original.context.functionName?.includes(value) || false;
        },
      },
      {
        accessorKey: 'fee',
        header: () => <span className="text-xs">Fee</span>,
        cell: ({ row }) =>
          getCellNode(
            <div className="flex flex-wrap items-center gap-x-1">
              <CurrencyAmount
                amount={
                  BigInt(row.original.gasCosts.costNative.root) +
                  BigInt(row.original.gasCosts.costNative.l1Submission || 0)
                }
                symbol={
                  CHAINS.find((c) => c.id === row.original.context.chainId)
                    ?.nativeCurrency.symbol
                }
                decimals={
                  CHAINS.find((c) => c.id === row.original.context.chainId)
                    ?.nativeCurrency.decimals
                }
                className="flex items-center"
              />
              <div className="text-muted-foreground">
                <div className="flex items-center gap-1">
                  (
                  <CurrencyAmount
                    amount={
                      Number(row.original.gasCosts.costUsd.root) +
                      Number(row.original.gasCosts.costUsd.l1Submission || 0)
                    }
                    symbol="USD"
                  />
                  )
                  {row.original.gasCosts.error ? (
                    <TooltipResponsive
                      trigger="error"
                      content={`Error during fee estimation: ${row.original.gasCosts.error}`}
                      classNameTrigger="w-min ml-1"
                    />
                  ) : null}
                </div>
              </div>
            </div>,
            cellNodeContext(row.original.id),
          ),
      },
      {
        accessorKey: 'timestamp',
        header: () => <span className="text-xs">Date</span>,
        cell: ({ row }) =>
          getCellNode(
            <TooltipResponsive
              trigger={
                <span>
                  <ElapsedTime start={row.original.timestamp} suffix="ago" />
                </span>
              }
              content={new Date(row.original.timestamp).toLocaleString()}
            />,
            cellNodeContext(row.original.id),
          ),
      },
      {
        accessorKey: 'status',
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        header: () => <span className="text-xs">Status</span>,
        cell: ({ row }) =>
          getCellNode(
            row.original.status === 'success' ? (
              <Badge variant="outline">Success</Badge>
            ) : row.original.status === 'revert' ? (
              <Badge variant="destructive">Reverted</Badge>
            ) : (
              <Badge variant="destructive">Error</Badge>
            ),
            cellNodeContext(row.original.id),
          ),
      },
      {
        accessorKey: 'included',
        header: () => (
          <div className="flex items-center gap-2 text-xs">
            Include
            <TooltipResponsive
              trigger="info"
              content="Include this tx in the total fees"
            />{' '}
          </div>
        ),
        cell: ({ row }) =>
          getCellNode(
            <Toggle
              aria-label="Include in total fees"
              size="sm"
              onClick={(e) => {
                totalFees.toggle(row.original.context.chainId, row.original.id);
                e.stopPropagation();
              }}
              defaultPressed={row.original.utils.includedInTotalFees}
              className="h-6 w-6 p-1 data-[state=on]:bg-primary data-[state=on]:text-background"
            >
              {row.original.utils.includedInTotalFees ? (
                <Icons.check className="h-3 w-3" />
              ) : (
                <Icons.close className="h-3 w-3" />
              )}
            </Toggle>,
            cellNodeContext(row.original.id),
          ),
      },
    ];
  }, [data, cellNodeContext, totalFees]);

  /* ------------------------------- EXPANDABLE ------------------------------- */
  // context (chain, target, caller, inputValues), data (decoded?), logs, errors, gasUsed
  const expandableCell = (row: Row<TxEntry>) => {
    const txChain = CHAINS.find((c) => c.id === row.original.context.chainId);
    const hasUnderlying = !!txChain?.custom.tech.underlying;

    return (
      <>
        <TxDetailsSubTable
          tx={row.original}
          largeDisplay={largeDisplay}
          cellNodeContext={cellNodeContext}
        />
        <div className="grid grid-cols-[min-content_1fr] justify-between gap-x-4 gap-y-2 p-2">
          <span className="whitespace-nowrap text-xs font-medium">
            {row.original.data && row.original.data !== '0x'
              ? row.original.decoded
                ? 'Decoded data'
                : 'Raw data'
              : 'Data'}
          </span>
          {getCellNode(
            row.original.data && row.original.data !== '0x' ? (
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs">
                {row.original.data}
              </pre>
            ) : (
              <span className="text-xs text-muted-foreground">No data</span>
            ),
            cellNodeContext(row.original.id),
            'h-4 w-full',
          )}
          <Separator className="col-span-2 my-2 w-8" />
          <span className="flex items-center whitespace-nowrap text-xs font-medium">
            {hasUnderlying ? 'L2 fee' : 'Fee'}
          </span>
          <div className="flex flex-col gap-1 lg:flex-row lg:items-center">
            {getCellNode(
              <CurrencyAmount
                amount={row.original.gasCosts.costNative.root}
                symbol={txChain?.nativeCurrency.symbol}
                decimals={txChain?.nativeCurrency.decimals}
                full
              />,
              cellNodeContext(row.original.id),
              'h-4 w-full',
            )}
            {getCellNode(
              <span className="text-xs text-muted-foreground">
                (
                <CurrencyAmount
                  amount={row.original.gasCosts.costUsd.root}
                  symbol="USD"
                  full
                />
                )
              </span>,
              cellNodeContext(row.original.id),
              'h-4 w-full',
            )}
          </div>

          {hasUnderlying ? (
            <>
              <span className="flex items-center whitespace-nowrap text-xs font-medium">
                L1 fee
              </span>
              {row.original.gasCosts.error ? (
                <TooltipResponsive
                  trigger="error"
                  content={`Error during fee estimation: ${row.original.gasCosts.error}`}
                  classNameTrigger="w-min"
                />
              ) : (
                <div className="flex flex-col gap-1 lg:flex-row lg:items-center">
                  {getCellNode(
                    <CurrencyAmount
                      amount={
                        row.original.gasCosts.costNative.l1Submission || 0
                      }
                      symbol={txChain?.nativeCurrency.symbol}
                      decimals={txChain?.nativeCurrency.decimals}
                      full
                    />,
                    cellNodeContext(row.original.id),
                    'h-4 w-full',
                  )}
                  {getCellNode(
                    <span className="text-xs text-muted-foreground">
                      (
                      <CurrencyAmount
                        amount={row.original.gasCosts.costUsd.l1Submission || 0}
                        symbol="USD"
                        full
                      />
                      )
                    </span>,
                    cellNodeContext(row.original.id),
                    'h-4 w-full',
                  )}
                </div>
              )}
            </>
          ) : null}
          <Separator className="col-span-2 my-2 w-8" />
          <span className="text-xs font-medium">Errors</span>
          {getCellNode(
            row.original.errors ? (
              <ScrollArea className="max-h-48 rounded-sm border border-secondary p-2">
                <div className="grid grid-cols-[min-content_1fr] gap-x-2 gap-y-1 text-xs">
                  {row.original.errors.map((e, i) => (
                    <Fragment key={i}>
                      <span className="text-muted-foreground">{i + 1}.</span>
                      {e.message.replace('\n\n', '\n')}
                    </Fragment>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <span className="text-xs text-muted-foreground">No errors</span>
            ),
            cellNodeContext(row.original.id),
          )}
          <span className="text-xs font-medium">Logs</span>
          {getCellNode(
            row.original.logs && row.original.logs.length > 0 ? (
              <ScrollArea className="max-h-48 rounded-sm border border-secondary p-2">
                <div className="text-wrap grid grid-cols-[min-content_1fr_1fr_1fr] gap-x-2 gap-y-1 text-xs">
                  <span />
                  <span className="text-muted-foreground">Address</span>
                  <span className="text-muted-foreground">Data</span>
                  <span className="text-muted-foreground">Topics</span>
                  {row.original.logs.map((l, i) => (
                    <Fragment key={i}>
                      <pre className="text-muted-foreground">{i + 1}.</pre>
                      <pre>{l.address}</pre>
                      <pre>{l.data}</pre>
                      <pre>{l.topics.join(', ')}</pre>
                    </Fragment>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <span className="text-xs text-muted-foreground">No logs</span>
            ),
            cellNodeContext(row.original.id),
          )}
          <Separator className="col-span-2 my-2 w-8" />
          <span className="whitespace-nowrap text-xs font-medium">Inputs</span>
          {getCellNode(
            row.original.context.inputValues.length > 0 &&
              !(
                row.original.context.inputValues.length === 1 &&
                row.original.context.inputValues[0].value === '0x'
              ) ? (
              <ScrollArea className="max-h-48 rounded-sm border border-secondary p-2">
                <div className="text-wrap grid grid-cols-[min-content_1fr] gap-x-2 gap-y-1 text-xs">
                  {row.original.context.inputValues.map((input, i) => (
                    <Fragment key={i}>
                      <pre className="text-muted-foreground">
                        {input.name !== '' ? input.name : `arg ${i + 1}`}
                      </pre>
                      <pre className="flex flex-col gap-1">
                        {Array.isArray(input.value)
                          ? input.value.map((v, j) => (
                              <span key={j} className="text-xs">
                                {v.toString()}
                              </span>
                            ))
                          : input.value.toString()}
                      </pre>
                    </Fragment>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <span className="text-xs text-muted-foreground">No inputs</span>
            ),
            cellNodeContext(row.original.id),
          )}
        </div>
      </>
    );
  };

  /* ---------------------------------- DATA ---------------------------------- */
  // Sort the data by id (latest first)
  const dataMemoized = useMemo(() => {
    const sorted = data?.sort((a, b) => b.timestamp - a.timestamp) || [];

    if (hydrating) return [];

    // If a tx is pending, add a loading entry
    if (pending) {
      return [getLoadingRow(pending), ...sorted];
    }

    return sorted;
  }, [data, hydrating, pending]);

  /* ---------------------------------- TABLE --------------------------------- */
  const table = useReactTable<TxEntry>({
    data: dataMemoized,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    // Pagination
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: largeDisplay ? 10 : 5,
      },
    },
    // Sorting
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    // Filtering
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  /* --------------------------------- HEADER --------------------------------- */
  const header = useMemo(
    () => (
      <>
        <div className="flex grow items-center gap-2 whitespace-nowrap font-medium">
          <Separator orientation="vertical" className="mr-2 h-4" />
          Local transactions
        </div>
        {largeDisplay ? (
          <Input
            placeholder="Filter transactions..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) =>
              table.getColumn('name')?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        ) : null}
        {table.getColumn('status') ? (
          <>
            <div
              className={cn(
                'flex items-center gap-2',
                !largeDisplay && 'justify-end',
              )}
            >
              <DataTableFacetedFilter
                className="ml-2"
                column={table.getColumn('status')}
                title="Status"
                options={[
                  { value: 'success', label: 'Success' },
                  { value: 'revert', label: 'Reverted' },
                  { value: 'failure', label: 'Error' },
                ]}
              />
              {largeDisplay ? (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <span className="text-xs text-muted-foreground">include</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6"
                    onClick={() => totalFees.includeAll(chain.id)}
                  >
                    all
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6"
                    onClick={() => totalFees.excludeAll(chain.id)}
                  >
                    none
                  </Button>
                </>
              ) : null}
            </div>
          </>
        ) : null}
        {largeDisplay ? null : (
          <>
            <Input
              placeholder="Filter transactions..."
              value={
                (table.getColumn('name')?.getFilterValue() as string) ?? ''
              }
              onChange={(e) =>
                table.getColumn('name')?.setFilterValue(e.target.value)
              }
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">include</span>
              <Button
                variant="secondary"
                size="sm"
                className="h-6"
                onClick={() => totalFees.includeAll(chain.id)}
              >
                all
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-6"
                onClick={() => totalFees.excludeAll(chain.id)}
              >
                none
              </Button>
            </div>
          </>
        )}
      </>
    ),
    [table, chain.id, largeDisplay, totalFees],
  );

  /* ---------------------------- RENDER HYDRATING ---------------------------- */
  // Just render the header with a skeleton to avoid flashing the table layout + data
  if (hydrating)
    return (
      <div className="grid grid-cols-[1fr] gap-4">
        <div className="flex w-full items-center gap-4">{header}</div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );

  /* ----------------------------- RENDER DESKTOP ----------------------------- */
  if (largeDisplay)
    return (
      <DataTableExpandable<TxEntry>
        table={table}
        expandableRender={expandableCell}
        pagination={dataMemoized.length > 10}
        className="rounded-none border-secondary"
        noDataLabel="No transactions yet."
        header={
          <div className="flex w-full items-center justify-between gap-4">
            {header}
            <DataTableViewOptions table={table} />
          </div>
        }
      />
    );

  /* -------------------------- RENDER MOBILE/TABLET -------------------------- */
  return (
    <TxHistoryCollapsibleMobile
      table={table}
      expandableRender={expandableCell}
      header={
        <div className="grid grid-cols-[1fr_min-content] items-center gap-4">
          {header}
        </div>
      }
      noDataLabel="No transactions yet."
      pagination={dataMemoized.length > 5}
    />
  );
};

/* -------------------------------------------------------------------------- */
/*                              TX DETAILS TABLE                              */
/* -------------------------------------------------------------------------- */

type TxSubTableProps = {
  tx: TxEntry;
  cellNodeContext: (id: string) => CellNodeContext;
  largeDisplay?: boolean;
};

/**
 * @notice A sub-table to display the details of a transaction
 * @dev This will display the context of the transaction (chain, target, caller, tx value, gas used),
 * as well as the gas configuration at the time of the transaction (base fee, priority fee, underlying
 * base fee, blob base fee, native token price).
 * @dev We don't need anything fancy here, just a simple grid with the details
 * @param tx The transaction to display
 * @param largeDisplay Whether the table is displayed in a large layout (screen size)
 * @returns A sub-table with the details of the transaction
 */
const TxDetailsSubTable: FC<TxSubTableProps> = ({
  tx,
  cellNodeContext,
  largeDisplay,
}) => {
  const txChain = CHAINS.find((c) => c.id === tx.context.chainId);

  const gasConfig = tx.context.gasConfig;
  const hasPriorityFee = gasConfig.hasChainPriorityFee;
  const hasUnderlying = !!gasConfig.stack;

  /* ---------------------------------- TABLE --------------------------------- */
  const table = useMemo(
    () => [
      // 1st row
      {
        header: () => 'Chain',
        cell: () =>
          getCellNode(
            txChain?.name || tx.context.chainId,
            cellNodeContext(tx.id),
          ),
      },
      {
        header: () => 'Account',
        cell: () =>
          getCellNode(
            <ShrinkedAddress
              address={tx.context.target.address}
              explorer={txChain?.blockExplorers?.default.url}
              adapt={false}
            />,
            cellNodeContext(tx.id),
          ),
      },
      {
        header: () => 'Caller',
        cell: () =>
          getCellNode(
            <ShrinkedAddress
              address={tx.context.caller}
              explorer={txChain?.blockExplorers?.default.url}
              adapt={false}
            />,
            cellNodeContext(tx.id),
          ),
      },
      {
        header: () => 'Tx value',
        cell: () =>
          getCellNode(
            <CurrencyAmount
              amount={tx.context.value}
              symbol={txChain?.nativeCurrency.symbol}
              icon={tx.context.value !== '0'}
            />,
            cellNodeContext(tx.id),
          ),
      },
      {
        header: () => 'Gas used',
        cell: () =>
          getCellNode(
            <span className="font-mono">{tx.gasUsed}</span>,
            cellNodeContext(tx.id),
          ),
      },
      // 2nd row
      {
        header: () => 'Base fee',
        cell: () =>
          getCellNode(
            <GweiAmount
              amount={gasConfig.baseFee}
              decimals={txChain?.custom.config.gasControls?.gweiDecimals}
            />,
            cellNodeContext(tx.id),
          ),
      },
      {
        header: () => 'Priority fee',
        cell: () =>
          getCellNode(
            <GweiAmount
              amount={gasConfig.priorityFee || BigInt(0)}
              decimals={txChain?.custom.config.gasControls?.gweiDecimals}
            />,
            cellNodeContext(tx.id),
          ),
      },
      {
        header: () =>
          `${txChain?.custom.tech.underlying?.name || 'Underlying'} base fee`,
        cell: () =>
          getCellNode(
            <GweiAmount
              amount={gasConfig.underlyingBaseFee || BigInt(0)}
              decimals={
                txChain?.custom.tech.underlying?.custom.config.gasControls
                  ?.gweiDecimals
              }
            />,
            cellNodeContext(tx.id),
          ),
      },
      {
        header: () =>
          `${txChain?.custom.tech.underlying?.name || 'Underlying'} blob base fee`,
        cell: () =>
          getCellNode(
            // It might just be 1 wei
            gasConfig.underlyingBlobBaseFee?.toString() === '1' ? (
              <span className="font-mono">1 wei</span>
            ) : (
              <GweiAmount
                amount={gasConfig.underlyingBlobBaseFee || BigInt(0)}
                decimals={
                  txChain?.custom.tech.underlying?.custom.config.gasControls
                    ?.gweiDecimals
                }
              />
            ),
            cellNodeContext(tx.id),
          ),
      },
      {
        header: () => `${txChain?.nativeCurrency.symbol} price`,
        cell: () =>
          getCellNode(
            <CurrencyAmount
              amount={tx.context.nativeTokenPrice}
              symbol="USD"
              scaled
            />,
            cellNodeContext(tx.id),
          ),
      },
    ],
    [tx, gasConfig, txChain, cellNodeContext],
  );

  // Filter the items to display
  const tableAvailable = useMemo(
    () =>
      table.filter(
        (_, i) =>
          // priority fee
          (i === 6 && hasPriorityFee) ||
          // underlying base fee
          (i === 7 && hasUnderlying) ||
          // blob base fee
          (i === 8 && hasUnderlying) ||
          (i !== 6 && i !== 7 && i !== 8),
      ),
    [table, hasPriorityFee, hasUnderlying],
  );

  /* --------------------------------- RENDER --------------------------------- */
  return (
    <div
      className={cn(
        'grid grid-cols-[150px_1fr] items-center gap-x-4 gap-y-2 p-2',
        largeDisplay && 'grid-cols-[auto_1fr_1fr_auto_auto] gap-x-16',
      )}
    >
      {tableAvailable.map((row, i) =>
        largeDisplay ? (
          <div key={i} className="flex flex-col gap-2">
            <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
              {row.header()}
            </span>
            {row.cell()}
          </div>
        ) : (
          <Fragment key={i}>
            <span className="whitespace-nowrap pt-[3px] text-xs font-medium text-muted-foreground">
              {row.header()}
            </span>
            {row.cell()}
          </Fragment>
        ),
      )}
    </div>
  );
};

export default TxHistoryTable;
