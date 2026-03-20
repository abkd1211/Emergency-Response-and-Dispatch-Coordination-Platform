'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatSeconds } from '@/lib/utils';

interface Props {
  dispatchSec:   number;
  arrivalSec:    number;
  resolutionSec: number;
  isLoading?:    boolean;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 rounded-xl text-xs space-y-1">
      <p className="text-muted font-medium">{label}</p>
      <p className="text-primary font-semibold">{formatSeconds(payload[0].value)}</p>
    </div>
  );
};

export function ResponseTimeChart({ dispatchSec, arrivalSec, resolutionSec, isLoading }: Props) {
  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  const data = [
    { label: 'Dispatch',   value: dispatchSec,   color: '#00F0FF' },
    { label: 'Arrival',    value: arrivalSec,     color: '#CCFF00' },
    { label: 'Resolution', value: resolutionSec,  color: '#A855F7' },
  ];

  return (
    <div className="space-y-4">
      {/* Visual bars */}
      <div className="space-y-3">
        {data.map((item) => {
          const max = Math.max(dispatchSec, arrivalSec, resolutionSec, 1);
          const pct = (item.value / max) * 100;
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">{item.label} time</span>
                <span
                  className="text-xs font-semibold font-mono"
                  style={{ color: item.color }}
                >
                  {formatSeconds(item.value)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-alabaster-200 dark:bg-obsidian-600 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA reference line */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl
                      bg-alabaster-100 dark:bg-obsidian-700">
        <div className="w-2 h-2 rounded-full bg-crimson" />
        <p className="text-xs text-muted">
          SLA target: <span className="font-medium text-primary">8 min (480s)</span> for dispatch
        </p>
      </div>
    </div>
  );
}
