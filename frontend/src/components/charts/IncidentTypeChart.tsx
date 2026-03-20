'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { incidentTypeConfig } from '@/lib/utils';
import type { IncidentType } from '@/types';

interface Props {
  data:       Record<string, number>;
  isLoading?: boolean;
}

export function IncidentTypeChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-32 h-32 rounded-full border-4 border-obsidian-600 animate-pulse" />
      </div>
    );
  }

  const chartData = Object.entries(data).map(([type, count]) => {
    const cfg = incidentTypeConfig[type as IncidentType];
    return { name: cfg?.label ?? type, value: count, color: cfg?.darkColor ?? '#6B7280' };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-muted">No data yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%" cy="50%"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.9} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(18,18,22,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-muted truncate">{item.name}</span>
            <span className="text-[10px] font-medium text-primary ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
