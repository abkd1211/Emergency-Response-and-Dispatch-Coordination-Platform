'use client';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface SlaGaugeProps {
  value:     number;  // 0-100
  isLoading?:boolean;
}

export function SlaGauge({ value, isLoading }: SlaGaugeProps) {
  const color = value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#FF2A55';

  const data = [
    { value: 100, fill: '#ffffff08' },
    { value,      fill: color       },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <div className="w-32 h-32 rounded-full border-4 border-obsidian-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="70%"
            innerRadius="60%" outerRadius="90%"
            startAngle={180} endAngle={0}
            data={data}
          >
            <RadialBar dataKey="value" cornerRadius={8} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Centre value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-bold text-primary"
            style={{ color }}
          >
            {value}%
          </motion.p>
          <p className="text-xs text-muted">Compliance rate</p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-1">
        {[
          { label: 'On target', color: '#10B981' },
          { label: 'Warning',   color: '#F59E0B' },
          { label: 'Below SLA', color: '#FF2A55' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
