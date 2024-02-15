'use client';

import { ReactNode } from 'react';

import { flexRender, Table as TableInterface } from '@tanstack/react-table';

import { cn } from '@/lib/utils';

import DataTablePagination from '@/components/templates/table/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DataTableProps<TData> = {
  table: TableInterface<TData>;
  header: ReactNode;
  pagination?: boolean;
  className?: string;
};

const DataTable = <TData,>({
  table,
  header,
  pagination = false,
  className,
}: DataTableProps<TData>) => {
  return (
    <div className={cn('flex flex-col gap-2 rounded-md pb-2', className)}>
      <div className="flex items-center justify-between gap-4 p-2">{header}</div>
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
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination ? <DataTablePagination table={table} /> : null}
    </div>
  );
};

// type DataTableSkeletonProps = {
//   columns: ColumnDef<>[];
//   rows: number;
//   className?: string;
// };

// export const DataTableSkeleton = ({ columns, rows, className }: DataTableSkeletonProps) => {
//   return (
//     <div className={cn('flex flex-col gap-2 rounded-md pb-2', className)}>
//       <div className="flex items-center justify-between gap-4 p-2">
//         {columns.map((column) => (
//           <Skeleton key={column.id} className="h-8 w-full" />
//         ))}
//       </div>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             {columns.map((column) => (
//               <TableHead key={column.id}>
//                 <Skeleton className="h-8 w-full" />
//               </TableHead>
//             ))}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {Array.from({ length: rows }).map((_, index) => (
//             <TableRow key={index}>
//               {columns.map((column) => (
//                 <TableCell key={column.id} className="h-8">
//                   <Skeleton className="h-8 w-full" />
//                 </TableCell>
//               ))}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

export default DataTable;
