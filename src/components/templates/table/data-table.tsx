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
};

const AirdropDataTable: FC<AirdropDataTableProps<ColumnDataType>> = ({ data, columns }) => {
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
    <div className="flex flex-col gap-2 rounded-md pb-2">
      <div className="flex items-center justify-between p-2">
        <span className="font-medium text-muted-foreground">Airdrop data</span>
        <div className="relative">
          <Input
            placeholder="Filter recipients..."
            value={(table.getColumn('recipient')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('recipient')?.setFilterValue(e.target.value)}
            className="max-w-sm pr-10"
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
                  <TableCell key={cell.id}>
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
