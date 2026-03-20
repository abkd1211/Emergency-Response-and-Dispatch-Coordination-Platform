'use client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label:      string;
  value:      string | number;
  subtitle?:  string;
  trend?:     'up' | 'down' | 'neutral';
  trendLabel?:string;
  accent?:    string;
  icon?:      React.ReactNode;
  className?: string;
  delay?:     number;
}

export function StatCard({
  label, value, subtitle, trend, trendLabel,
  accent, icon, className, delay = 0,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up'
    ? 'text-emerald-light'
    : trend === 'down'
    ? 'text-crimson'
    : 'text-muted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={cn('glass-card p-5 relative overflow-hidden', className)}
    >
      {/* Accent glow */}
      {accent && (
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20"
          style={{ background: accent }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
          {icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: accent ? `${accent}20` : undefined }}
            >
              <span style={{ color: accent }}>{icon}</span>
            </div>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
          className="text-2xl font-semibold text-primary tracking-tight"
        >
          {value}
        </motion.p>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5">
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
            {trend && (
              <div className={cn('flex items-center gap-0.5 text-xs', trendColor)}>
                <TrendIcon className="w-3 h-3" />
                {trendLabel && <span>{trendLabel}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
