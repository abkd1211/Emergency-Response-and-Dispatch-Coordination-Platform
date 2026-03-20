'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, WifiOff, X } from 'lucide-react';
import { useSocketStore } from '@/store/socket.store';
import { cn } from '@/lib/utils';

const ALERT_CONFIG = {
  deviation:    { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-500/10  border-amber-500/20'  },
  unresponsive: { icon: WifiOff,       color: 'text-crimson',    bg: 'bg-crimson/10    border-crimson/20'    },
  arrived:      { icon: CheckCircle,   color: 'text-emerald-light', bg: 'bg-emerald-light/10 border-emerald-light/20' },
} as const;

export function AlertBanner() {
  const { alerts, clearAlert } = useSocketStore();

  // Show at most 3 alerts
  const visible = alerts.slice(-3);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visible.map((alert) => {
          const cfg  = ALERT_CONFIG[alert.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 48, scale: 0.95 }}
              animate={{ opacity: 1, x: 0,  scale: 1 }}
              exit={{    opacity: 0, x: 48, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl',
                'glass border shadow-glass-dark text-sm max-w-xs',
                cfg.bg
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', cfg.color)} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary text-xs">{alert.vehicleCode}</p>
                <p className="text-muted text-xs mt-0.5 leading-snug">{alert.message}</p>
              </div>
              <button
                onClick={() => clearAlert(alert.id)}
                className="shrink-0 text-muted hover:text-primary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
