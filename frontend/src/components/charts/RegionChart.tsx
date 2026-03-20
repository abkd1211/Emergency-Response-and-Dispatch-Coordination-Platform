'use client';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import type { RegionStat } from '@/types';

interface Props {
  data:       RegionStat[];
  isLoading?: boolean;
}

const REGION_COLORS = [
  '#FF2A55', '#00F0FF', '#CCFF00', '#FF8A00',
  '#A855F7', '#10B981', '#F59E0B', '#3B82F6',
];

export function RegionChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-muted">No regional data yet</p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const topRegions = data.slice(0, 8);

  return (
    <div className="space-y-3">
      {topRegions.map((region, i) => {
        const pct   = (region.total / maxTotal) * 100;
        const color = REGION_COLORS[i % REGION_COLORS.length];
        return (
          <div key={region.region} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary">{region.region}</span>
              <span className="text-xs font-semibold text-primary">{region.total}</span>
            </div>
            <div className="h-2 rounded-full bg-alabaster-200 dark:bg-obsidian-600 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
            {/* Type breakdown mini pills */}
            <div className="flex gap-1 flex-wrap">
              {Object.entries(region.byType).map(([type, count]) => (
                <span
                  key={type}
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {type.charAt(0)}: {count}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
