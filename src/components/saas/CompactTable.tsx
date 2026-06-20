'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
  accessor?: (row: T) => ReactNode;
}

interface CompactTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  emptyText?: string;
  density?: 'compact' | 'normal' | 'comfortable';
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  className?: string;
}

const densityPadding: Record<string, string> = {
  compact: 'px-3 py-1.5',
  normal: 'px-4 py-2.5',
  comfortable: 'px-4 py-3.5',
};

const alignClasses: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * CompactTable — SaaS 紧凑数据表格
 *
 * 支持信息密度调节、行点击、斑马纹、粘性表头等。
 * 泛型设计，适用于任意数据结构。
 */
export function CompactTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  emptyText = '暂无数据',
  density = 'normal',
  striped = false,
  hoverable = true,
  stickyHeader = false,
  className,
}: CompactTableProps<T>) {
  const padding = densityPadding[density];

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead
            className={cn(
              'bg-gray-50/80 border-b border-gray-200',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'font-medium text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap',
                    padding,
                    alignClasses[col.align || 'left']
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-400 text-sm"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const key = rowKey ? rowKey(row, rowIndex) : String(rowIndex);
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                    className={cn(
                      hoverable && 'hover:bg-gray-50/60 transition-colors',
                      striped && rowIndex % 2 === 1 && 'bg-gray-50/40',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'text-gray-700 whitespace-nowrap',
                          padding,
                          alignClasses[col.align || 'left']
                        )}
                      >
                        {col.render
                          ? col.render(row, rowIndex)
                          : col.accessor
                          ? col.accessor(row)
                          : (row as Record<string, unknown>)[col.key] as ReactNode}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
