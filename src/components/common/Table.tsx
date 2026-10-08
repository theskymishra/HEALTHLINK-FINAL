import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | string | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/80">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none ${
                  col.headerClassName || ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, idx) => {
                  let content: React.ReactNode = null;
                  if (typeof col.accessor === 'function') {
                    content = col.accessor(row);
                  } else if (col.accessor) {
                    content = ((row as Record<string, unknown>)[col.accessor as string] as React.ReactNode) ?? null;
                  }
                  return (
                    <td
                      key={idx}
                      className={`px-4 py-3.5 text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap ${
                        col.className || ''
                      }`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
