'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PeakHourData } from '@/types';

interface Props {
  data:       PeakHourData[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 rounded-xl text-xs">
      <p className="text-muted">{label}</p>
      <p className="font-semibold text-primary">{payload[0].value} incidents</p>
    </div>
  );
};

export function PeakHoursChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-muted">No data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: '#6A6A78' }}
            tickFormatter={(v) => v % 6 === 0 ? `${v}h` : ''}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#6A6A78' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => {
              const intensity = entry.count / maxCount;
              const color = intensity > 0.7 ? '#FF2A55'
                : intensity > 0.4 ? '#F59E0B' : '#00F0FF';
              return <Cell key={entry.hour} fill={color} opacity={0.85} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
