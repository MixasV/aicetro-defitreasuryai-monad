'use client';

import { useState } from 'react';
import { PoolRow } from './PoolRow';
import { ArrowUpDown } from 'lucide-react';

export interface Pool {
  id: string;
  protocol: string;
  chain: string;
  asset: string;
  address: string;
  category: string;
  apy: number;
  tvl: number;
  volume24h?: number;
  riskScore: number | null;
  aiScore: number | null;
  aiReason: string | null;
  source: string;
  isActive: boolean;
}

interface Column {
  key: string;
  label: string;
  sortable: boolean;
  className: string;
  mobileHidden?: boolean;
}

const columns: Column[] = [
  { key: 'rank', label: '#', sortable: false, className: 'w-12 text-center' },
  { key: 'pool', label: 'Pool', sortable: true, className: 'min-w-[200px]' },
  { key: 'chain', label: 'Chain', sortable: true, className: 'w-24 hidden md:table-cell' },
  { key: 'apy', label: 'APY', sortable: true, className: 'w-28' },
  { key: 'tvl', label: 'TVL', sortable: true, className: 'w-28 hidden md:table-cell' },
  { key: 'volume24h', label: '24h Vol', sortable: true, className: 'w-28 hidden lg:table-cell', mobileHidden: true },
  { key: 'risk', label: 'Risk', sortable: true, className: 'w-24 hidden lg:table-cell', mobileHidden: true },
  { key: 'aiScore', label: 'AI Score', sortable: true, className: 'w-24 hidden xl:table-cell', mobileHidden: true },
  { key: 'chart', label: '7d Chart', sortable: false, className: 'w-32 hidden xl:table-cell', mobileHidden: true },
  { key: 'actions', label: 'Actions', sortable: false, className: 'w-40' },
];

interface PoolTableProps {
  pools: Pool[];
  onSort?: (column: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onDetailClick?: (pool: Pool) => void;
  onAddToWhitelist?: (poolId: string) => void;
  currentPage?: number;
  hasActiveDelegation?: boolean;
  whitelistedPoolIds?: string[];
}

export function PoolTable({
  pools,
  onSort,
  sortBy,
  sortOrder,
  onDetailClick,
  onAddToWhitelist,
  currentPage = 1,
  hasActiveDelegation = false,
  whitelistedPoolIds = [],
}: PoolTableProps) {
  const startRank = (currentPage - 1) * 50;

  const handleSort = (columnKey: string) => {
    if (onSort && columns.find(c => c.key === columnKey)?.sortable) {
      onSort(columnKey);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
          <tr className="border-b border-white/10">
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ${col.className}`}
                onClick={() => handleSort(col.key)}
                style={{ cursor: col.sortable ? 'pointer' : 'default' }}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <ArrowUpDown 
                      className={`h-3 w-3 ${sortBy === col.key ? 'text-primary-400' : 'text-slate-600'}`}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {pools.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                No pools found
              </td>
            </tr>
          ) : (
            pools.map((pool, idx) => (
              <PoolRow
                key={pool.id}
                pool={pool}
                rank={startRank + idx + 1}
                onDetailClick={onDetailClick}
                onAddToWhitelist={onAddToWhitelist}
                hasActiveDelegation={hasActiveDelegation}
                isInWhitelist={whitelistedPoolIds.includes(pool.id)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
