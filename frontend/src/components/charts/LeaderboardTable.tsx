'use client';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatSeconds, responderTypeConfig } from '@/lib/utils';
import type { ResponderType } from '@/types';

interface ResponderRow {
  responderId:        string;
  responderName:      string;
  responderType:      string;
  totalDispatches:    number;
  avgDispatchTimeSec: number;
  slaComplianceRate:  number;
  currentStreak:      number;
  bestStreak:         number;
}

interface Props {
  data:       ResponderRow[];
  isLoading?: boolean;
}

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export function LeaderboardTable({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="flex-1 h-4" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted">No responder data yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-alabaster-200 dark:border-obsidian-600">
            {['Rank', 'Responder', 'Type', 'Dispatches', 'Avg Response', 'SLA', 'Streak'].map((h) => (
              <th
                key={h}
                className="pb-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider
                           first:pl-0 px-3"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-alabaster-100 dark:divide-obsidian-700">
          {data.map((row, i) => {
            const typeCfg   = responderTypeConfig[row.responderType as ResponderType];
            const rankColor = RANK_COLORS[i] ?? '#6B7280';
            const slaColor  = row.slaComplianceRate >= 80 ? '#10B981'
              : row.slaComplianceRate >= 60 ? '#F59E0B' : '#EF4444';

            return (
              <motion.tr
                key={row.responderId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-alabaster-50 dark:hover:bg-obsidian-700/50 transition-colors"
              >
                {/* Rank */}
                <td className="py-3 pl-0 pr-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: `${rankColor}20`,
                      color:            rankColor,
                    }}
                  >
                    {i < 3 ? <Trophy className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                </td>

                {/* Name */}
                <td className="py-3 px-3">
                  <p className="text-xs font-medium text-primary">{row.responderName}</p>
                </td>

                {/* Type */}
                <td className="py-3 px-3">
                  <span
                    className="badge text-[10px]"
                    style={{
                      color:           typeCfg?.darkColor ?? '#6B7280',
                      backgroundColor: `${typeCfg?.darkColor ?? '#6B7280'}15`,
                    }}
                  >
                    {typeCfg?.label ?? row.responderType}
                  </span>
                </td>

                {/* Dispatches */}
                <td className="py-3 px-3">
                  <span className="text-xs font-semibold text-primary">
                    {row.totalDispatches}
                  </span>
                </td>

                {/* Avg response */}
                <td className="py-3 px-3">
                  <span className="text-xs text-secondary font-mono">
                    {formatSeconds(row.avgDispatchTimeSec)}
                  </span>
                </td>

                {/* SLA */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 rounded-full bg-alabaster-200 dark:bg-obsidian-600">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width:           `${row.slaComplianceRate}%`,
                          backgroundColor: slaColor,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: slaColor }}>
                      {row.slaComplianceRate}%
                    </span>
                  </div>
                </td>

                {/* Streak */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    {row.currentStreak > 0 && (
                      <Flame className="w-3 h-3 text-amber-500" />
                    )}
                    <span className="text-xs text-secondary">
                      {row.currentStreak}
                      {row.bestStreak > 0 && (
                        <span className="text-muted ml-1">(best: {row.bestStreak})</span>
                      )}
                    </span>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
