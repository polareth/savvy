'use client';

import { FC, useMemo, useState } from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { AirdropData } from '@/lib/types/airdrop';
import { AirdropDataType } from '@/lib/types/templates';
import { cn } from '@/lib/utils';

import DataTable from '@/components/templates/table/data-table';
import { Input } from '@/components/ui/input';

type DataTableRecipientsProps = {
  data: AirdropData;
  keys: string[];
};

const DataTableRecipients: FC<DataTableRecipientsProps> = ({ data, keys }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<AirdropDataType>[] = useMemo(
    () =>
      keys.map((value) => ({
        accessorKey: value,
        header: () => (
          <span className="font-semibold">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        ),
      })),
    [keys],
  );

  const dataMemoized = useMemo(
    () =>
      data.recipients.map((recipient, i) => {
        return {
          recipient,
          tokenId: data.ids[i] || '',
          amount: data.amounts[i] || '',
        };
      }),
    [data],
  );

  const table = useReactTable<AirdropDataType>({
    data: dataMemoized,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <DataTable<AirdropDataType>
      table={table}
      className="rounded-md border-x border-primary px-2"
      pagination
      header={
        <>
          {isDesktop ? (
            <>
              <span className="font-medium">Airdrop data</span>
              <span className="grow text-sm text-muted-foreground">
                ({data.recipients.length} recipient{data.recipients.length > 1 && 's'})
              </span>
            </>
          ) : (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-medium">Airdrop data</span>
              <span className="grow text-sm text-muted-foreground">
                ({data.recipients.length} recipient{data.recipients.length > 1 && 's'})
              </span>
            </div>
          )}
          <div className="relative">
            <Input
              placeholder="Filter recipients..."
              value={(table.getColumn('recipient')?.getFilterValue() as string) ?? ''}
              onChange={(e) => table.getColumn('recipient')?.setFilterValue(e.target.value)}
              className="max-w-[200px] pr-10 font-mono text-xs md:max-w-sm md:text-sm"
            />
            <Search
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 transform opacity-70 transition-opacity',
                !table.getColumn('recipient')?.getFilterValue() && 'opacity-50',
              )}
            />
          </div>
        </>
      }
    />
  );
};

export default DataTableRecipients;
