'use client';
import { motion } from 'framer-motion';
import { incidentTypeConfig, incidentStatusConfig, formatRelativeTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { IncidentType, IncidentStatus } from '@/types';

interface ActivityItem {
  incidentId: string;
  type:       string;
  region:     string;
  status:     string;
  createdAt:  string;
}

interface Props {
  items:     ActivityItem[];
  isLoading?:boolean;
}

export function ActivityFeed({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-2.5 w-32" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const typeCfg = incidentTypeConfig[item.type as IncidentType];
        return (
          <motion.div
            key={item.incidentId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                       hover:bg-alabaster-100 dark:hover:bg-obsidian-700
                       transition-colors cursor-pointer group"
          >
            {/* Type icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
              style={{
                backgroundColor: typeCfg?.bgDark ?? '#ffffff10',
                color:           typeCfg?.darkColor ?? '#6B7280',
              }}
            >
              {item.type.charAt(0)}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary">
                {typeCfg?.label ?? item.type} &mdash; {item.region}
              </p>
              <p className="text-[10px] text-muted mt-0.5">
                {item.incidentId.slice(0, 8)}&hellip; &bull; {formatRelativeTime(item.createdAt)}
              </p>
            </div>

            {/* Status */}
            <StatusBadge status={item.status as IncidentStatus} />
          </motion.div>
        );
      })}
    </div>
  );
}
