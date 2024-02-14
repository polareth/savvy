'use client';

import { FC, useState } from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { cn } from '@/lib/utils';

import { ColumnDataType } from '@/components/pages/solutions/airdrop/recipients-selection';
import DataTablePagination from '@/components/templates/table/pagination';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AirdropDataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  className?: string;
};

const AirdropDataTable: FC<AirdropDataTableProps<ColumnDataType>> = ({
  data,
  columns,
  className,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // md
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable<ColumnDataType>({
    data,
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
    <div className={cn('flex flex-col gap-2 rounded-md pb-2', className)}>
      <div className="flex items-center justify-between gap-4 p-2">
        {isDesktop ? (
          <>
            <span className="font-medium">Airdrop data</span>
            <span className="grow text-sm text-muted-foreground">
              ({data.length} recipient{data.length > 1 && 's'})
            </span>
          </>
        ) : (
          <div className="flex flex-col whitespace-nowrap">
            <span className="font-medium">Airdrop data</span>
            <span className="grow text-sm text-muted-foreground">
              ({data.length} recipient{data.length > 1 && 's'})
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
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="font-mono">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
};

export default AirdropDataTable;
