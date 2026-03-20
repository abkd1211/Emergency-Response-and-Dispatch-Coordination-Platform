'use client';
import { motion } from 'framer-motion';
import { Mic, Zap, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  status?: {
    totalSessions:       number;
    autoSubmitted:       number;
    pendingReview:       number;
    autoSubmitRate:      number;
    avgConfidence:       number;
    operatorsOnline:     number;
    whisperAvailable:    boolean;
    confidenceThreshold: number;
  };
}

export function AgentStatusCard({ status }: Props) {
  const stats = [
    {
      label:   'Total Sessions',
      value:   status?.totalSessions ?? 0,
      sub:     `${status?.autoSubmitted ?? 0} auto-submitted`,
      color:   '#00F0FF',
      icon:    Mic,
    },
    {
      label:   'Auto-Submit Rate',
      value:   `${status?.autoSubmitRate ?? 0}%`,
      sub:     `Threshold: ${((status?.confidenceThreshold ?? 0.85) * 100).toFixed(0)}%`,
      color:   '#CCFF00',
      icon:    Zap,
    },
    {
      label:   'Avg Confidence',
      value:   `${((status?.avgConfidence ?? 0) * 100).toFixed(0)}%`,
      sub:     `${status?.pendingReview ?? 0} awaiting review`,
      color:   '#A855F7',
      icon:    Target,
    },
    {
      label:   'Operators Online',
      value:   status?.operatorsOnline ?? 0,
      sub:     status?.operatorsOnline ? 'AI on standby' : 'AI active',
      color:   status?.operatorsOnline ? '#10B981' : '#FF2A55',
      icon:    Users,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 relative overflow-hidden"
          >
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-15"
              style={{ background: stat.color }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium text-muted uppercase tracking-wide">
                  {stat.label}
                </p>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-xl font-semibold text-primary">{stat.value}</p>
              <p className="text-[10px] text-muted mt-0.5">{stat.sub}</p>
            </div>
          </motion.div>
        );
      })}

      {/* Whisper status banner */}
      <div className={cn(
        'col-span-2 lg:col-span-4 flex items-center gap-3 px-4 py-2.5 rounded-xl',
        status?.whisperAvailable
          ? 'bg-emerald-light/10 border border-emerald-light/20'
          : 'bg-amber-500/10 border border-amber-500/20'
      )}>
        <div className={cn(
          'w-2 h-2 rounded-full',
          status?.whisperAvailable ? 'bg-emerald-light animate-pulse' : 'bg-amber-500'
        )} />
        <p className={cn(
          'text-xs font-medium',
          status?.whisperAvailable ? 'text-emerald-light' : 'text-amber-500'
        )}>
          {status?.whisperAvailable
            ? 'Groq Whisper API connected — using whisper-large-v3 model'
            : 'Whisper not connected — using simulated transcripts (development mode)'
          }
        </p>
      </div>
    </div>
  );
}
