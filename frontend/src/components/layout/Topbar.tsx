'use client';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSocketStore } from '@/store/socket.store';
import { cn } from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':           'Dashboard',
  '/dashboard/dispatch':  'Live Dispatch',
  '/dashboard/incidents': 'Incidents',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/agent':     'AI Call Agent',
};

export function Topbar() {
  const pathname       = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { user }       = useAuthStore();
  const { alerts }     = useSocketStore();

  const pageTitle = ROUTE_LABELS[pathname] ?? 'Dashboard';
  const now       = new Date();
  const timeStr   = now.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' });
  const dateStr   = now.toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <header className="h-16 flex items-center gap-4 px-6
                       bg-white/60 dark:bg-obsidian-800/60
                       border-b border-alabaster-200 dark:border-obsidian-600
                       backdrop-blur-glass shrink-0">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <motion.h1
          key={pageTitle}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-semibold text-primary"
        >
          {pageTitle}
        </motion.h1>
        <p className="text-xs text-muted">{dateStr} &mdash; {timeStr}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-xl flex items-center justify-center
                     text-muted hover:text-primary
                     hover:bg-alabaster-100 dark:hover:bg-obsidian-600
                     transition-colors"
        >
          {resolvedTheme === 'dark'
            ? <Sun  className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </motion.button>

        {/* Alerts bell */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center
                     text-muted hover:text-primary
                     hover:bg-alabaster-100 dark:hover:bg-obsidian-600
                     transition-colors"
        >
          <Bell className="w-4 h-4" />
          {alerts.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson"
            />
          )}
        </motion.button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-2 ml-1
                        border-l border-alabaster-200 dark:border-obsidian-600">
          <div className="w-8 h-8 rounded-xl bg-crimson/15 border border-crimson/25
                          flex items-center justify-center">
            <span className="text-xs font-semibold text-crimson">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-primary leading-tight">{user?.name}</p>
            <p className="text-[10px] text-muted leading-tight">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
