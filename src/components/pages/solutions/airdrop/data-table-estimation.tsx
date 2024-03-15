'use client';

import { FC, Fragment, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { GasCostEstimation } from '@/lib/types/gas';
import {
  EstimationConfigDataType,
  EstimationCostsDataType,
} from '@/lib/types/templates';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CurrencyAmount from '@/components/common/currency-amount';
import GweiAmount from '@/components/common/gwei-amount';
import { Icons } from '@/components/common/icons';
import TooltipResponsive from '@/components/common/tooltip-responsive';
import DataTable from '@/components/templates/table/data-table';

type DataTableEstimationProps = {
  data: GasCostEstimation | null;
  loading?: boolean;
};

const SkeletonCell = () => <Skeleton className="h-4 w-16" />;

const DataTableEstimation: FC<DataTableEstimationProps> = ({
  data,
  loading,
}) => {
  const isLargeScreen = useMediaQuery('(min-width: 1400px)');

  /* -------------------------------------------------------------------------- */
  /*                                  GAS COSTS                                 */
  /* -------------------------------------------------------------------------- */

  const columnsCosts: ColumnDef<EstimationCostsDataType>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Type',
        cell: ({ row }) => (loading ? <SkeletonCell /> : row.original.name),
      },
      {
        accessorKey: 'gasUsed',
        header: () => (
          <div className="flex items-center gap-2">
            Gas used{' '}
            {data?.config.chain.customStack ? (
              <TooltipResponsive
                trigger="info"
                content="Greyed out: tx gas + submission to L1 gas"
              />
            ) : null}
          </div>
        ),
        cell: ({ row }) => {
          if (loading) return <SkeletonCell />;
          return (
            <div className="flex flex-col gap-1">
              <span>
                {Number(row.original.gasUsed.root) +
                  Number(row.original.gasUsed.l1Submission || 0)}
              </span>
              {row.original.gasUsed.l1Submission !== '0' ? (
                <span className="text-muted-foreground">
                  {row.original.gasUsed.root} +{' '}
                  {row.original.gasUsed.l1Submission}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'costNative',
        header: () => (
          <div className="flex items-center gap-2">
            Cost (
            {data?.config.chain.config.nativeCurrency.symbol || 'Native token'})
            {data?.config.chain.customStack ? (
              <TooltipResponsive
                trigger="info"
                content="Greyed out: tx cost + submission to L1 cost"
              />
            ) : null}
          </div>
        ),
        cell: ({ row }) => {
          if (loading) return <SkeletonCell />;
          return (
            <div className="flex flex-col gap-1">
              <span>
                <CurrencyAmount
                  amount={
                    Number(row.original.costNative.root) +
                    Number(row.original.costNative.l1Submission || 0)
                  }
                  symbol={
                    data?.config.chain.config.nativeCurrency.symbol ||
                    'Native token'
                  }
                />
              </span>
              {row.original.costNative.l1Submission !== '0' ? (
                <span className="text-muted-foreground">
                  <CurrencyAmount
                    amount={Number(row.original.costNative.root)}
                    symbol={
                      data?.config.chain.config.nativeCurrency.symbol ||
                      'Native token'
                    }
                    icon={false}
                  />{' '}
                  +{' '}
                  <CurrencyAmount
                    amount={Number(row.original.costNative.l1Submission || 0)}
                    symbol={
                      data?.config.chain.config.nativeCurrency.symbol ||
                      'Native token'
                    }
                    icon={false}
                  />
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'costUsd',
        header: () => (
          <div className="flex items-center gap-2">
            Cost (USD)
            {data?.config.chain.customStack ? (
              <TooltipResponsive
                trigger="info"
                content="Greyed out: tx cost + submission to L1 cost"
              />
            ) : null}
          </div>
        ),
        cell: ({ row }) => {
          if (loading) return <SkeletonCell />;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                <CurrencyAmount
                  amount={
                    Number(row.original.costUsd.root) +
                    Number(row.original.costUsd.l1Submission || 0)
                  }
                  symbol="USD"
                />
              </span>
              {row.original.costUsd.l1Submission !== '0' ? (
                <span className="text-muted-foreground">
                  <CurrencyAmount
                    amount={Number(row.original.costUsd.root)}
                    symbol="USD"
                  />{' '}
                  +{' '}
                  <CurrencyAmount
                    amount={Number(row.original.costUsd.l1Submission || 0)}
                    symbol="USD"
                  />
                </span>
              ) : null}
            </div>
          );
        },
      },
    ],
    [data, loading],
  );

  const dataCostsMemoized = useMemo(() => {
    const rows: EstimationCostsDataType[] = [];
    if (loading) return Array(2).fill({});
    if (!data) return rows;

    if (Number(data.gasUsed.deployment.root) > 0) {
      rows.push({
        name: 'Deployment',
        gasUsed: {
          root: data.gasUsed.deployment.root,
          l1Submission: data.gasUsed.deployment.l1Submission,
        },
        costNative: {
          root: data.gasCostsNative.deployment.root,
          l1Submission: data.gasCostsNative.deployment.l1Submission,
        },
        costUsd: {
          root: data.gasCostsUsd.deployment.root,
          l1Submission: data.gasCostsUsd.deployment.l1Submission,
        },
      });
    }

    rows.push({
      name: 'Call',
      gasUsed: {
        root: data.gasUsed.call.root,
        l1Submission: data.gasUsed.call.l1Submission,
      },
      costNative: {
        root: data.gasCostsNative.call.root,
        l1Submission: data.gasCostsNative.call.l1Submission,
      },
      costUsd: {
        root: data.gasCostsUsd.call.root,
        l1Submission: data.gasCostsUsd.call.l1Submission,
      },
    });

    return rows;
  }, [data, loading]);

  const tableCosts = useReactTable<EstimationCostsDataType>({
    data: dataCostsMemoized,
    columns: columnsCosts,
    getCoreRowModel: getCoreRowModel(),
  });

  /* -------------------------------------------------------------------------- */
  /*                                   CONFIG                                   */
  /* -------------------------------------------------------------------------- */

  const columnsConfig: ColumnDef<EstimationConfigDataType>[] = useMemo(
    () => [
      {
        accessorKey: 'chainName',
        header: 'Chain',
        cell: ({ row }) =>
          loading ? <SkeletonCell /> : row.original.chainName,
      },
      {
        accessorKey: 'feePerGas',
        header: () => <span className="whitespace-nowrap">Fee per gas</span>,
        cell: ({ row }) => {
          if (loading) return <SkeletonCell />;
          return (
            <span
              className={cn('flex gap-2', isLargeScreen && 'flex-col gap-1')}
            >
              {data?.config.gasFeesData.hasChainPriorityFee ? (
                <>
                  <span className="whitespace-nowrap">
                    <GweiAmount
                      amount={
                        row.original.baseFeePerGas +
                        row.original.priorityFeePerGas
                      }
                    />
                  </span>
                  <span className="text-muted-foreground">
                    {isLargeScreen ? '' : '('}
                    <GweiAmount
                      amount={row.original.baseFeePerGas}
                      noUnit
                    /> +{' '}
                    <GweiAmount
                      amount={row.original.priorityFeePerGas}
                      noUnit
                    />
                    {isLargeScreen ? '' : ')'}
                  </span>
                </>
              ) : (
                <GweiAmount amount={row.original.baseFeePerGas} />
              )}
            </span>
          );
        },
      },
      {
        accessorKey: 'nativeTokenPrice',
        header: `${
          data?.config.chain.config.nativeCurrency.symbol || 'Native token'
        } price`,
        cell: ({ row }) =>
          loading ? (
            <SkeletonCell />
          ) : (
            <CurrencyAmount
              amount={row.original.nativeTokenPrice}
              symbol="USD"
            />
          ),
      },
      {
        accessorKey: 'contract',
        header: 'Contract',
        cell: ({ row }) => {
          if (loading) return <SkeletonCell />;
          return (
            <div className="flex items-center gap-1">
              {row.original.contractName}
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={row.original.githubLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icons.gitHub className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={row.original.explorerLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icons.explorer className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: 'functionName',
        header: 'Function',
        cell: ({ row }) =>
          loading ? <SkeletonCell /> : <pre>{row.original.functionName}</pre>,
      },
      {
        accessorKey: 'website',
        header: 'Website',
        cell: ({ row }) => {
          if (loading) return <SkeletonCell />;
          return (
            <Link
              href={row.original.website}
              rel="noopener noreferrer"
              target="_blank"
              className="underline"
            >
              {row.original.website.replace(/(^\w+:|^)\/\//, '')}
            </Link>
          );
        },
      },
    ],
    [data, loading, isLargeScreen],
  );

  const dataConfigMemoized = useMemo(() => {
    if (loading) return Array(1).fill({});
    if (!data) return [];

    return [
      {
        chainName: data.config.chain.config.name,
        baseFeePerGas: Number(data.config.gasFeesData.nextBaseFeePerGas),
        priorityFeePerGas: Number(data.config.gasFeesData.priorityFeePerGas),
        nativeTokenPrice: data.config.nativeTokenPrice,
        contractName: data.config.solution.contract.name,
        functionName: data.config.solution.functionName,
        githubLink: data.config.solution.sourceUrl,
        explorerLink: `${data.config.chain.explorerUrl}address/${
          data.config.solution.deployments[data.config.chain.config.id]
        }`,
        website: data.config.solution.website,
      },
    ];
  }, [data, loading]);

  const tableConfig = useReactTable<EstimationConfigDataType>({
    data: dataConfigMemoized,
    columns: columnsConfig,
    getCoreRowModel: getCoreRowModel(),
  });

  /* -------------------------------------------------------------------------- */
  /*                                     DOM                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col gap-2">
      {isLargeScreen ? (
        <DataTable<EstimationConfigDataType>
          table={tableConfig}
          className="rounded-md border-x border-primary px-2"
          header={<span className="font-medium">Configuration</span>}
        />
      ) : (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="configuration" className="border-none">
            <AccordionTrigger className="hover:no-underline">
              Configuration
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent>
              {tableConfig.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[auto,1fr] items-center gap-x-4 gap-y-2"
                >
                  {row.getVisibleCells().map((cell) => (
                    <Fragment key={cell.id}>
                      <span className="font-medium text-muted-foreground">
                        {flexRender<any>(cell.column.columnDef.header, {})}
                      </span>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Fragment>
                  ))}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <DataTable<EstimationCostsDataType>
        table={tableCosts}
        className="rounded-md border-x border-primary px-2"
        header={<span className="font-medium">Gas costs results</span>}
      />
    </div>
  );
};

export default DataTableEstimation;
