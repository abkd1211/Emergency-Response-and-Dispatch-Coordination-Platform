'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MapPin, AlertTriangle, BarChart3,
  Mic, Settings, LogOut, ChevronLeft, ChevronRight,
  Shield, Activity,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSocketStore } from '@/store/socket.store';
import { cn, roleConfig } from '@/lib/utils';
import type { Role } from '@/types';

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
  roles: Role[];
  badge?: number;
}

const ALL_ROLES: Role[] = [
  'SYSTEM_ADMIN','HOSPITAL_ADMIN','POLICE_ADMIN','FIRE_SERVICE_ADMIN','AMBULANCE_DRIVER'
];

const NAV_ITEMS: NavItem[] = [
  {
    href:  '/dashboard',
    label: 'Dashboard',
    icon:  <LayoutDashboard className="w-4 h-4" />,
    roles: ALL_ROLES,
  },
  {
    href:  '/dashboard/dispatch',
    label: 'Live Dispatch',
    icon:  <MapPin className="w-4 h-4" />,
    roles: ALL_ROLES,
  },
  {
    href:  '/dashboard/incidents',
    label: 'Incidents',
    icon:  <AlertTriangle className="w-4 h-4" />,
    roles: ['SYSTEM_ADMIN','HOSPITAL_ADMIN','POLICE_ADMIN','FIRE_SERVICE_ADMIN'],
  },
  {
    href:  '/dashboard/analytics',
    label: 'Analytics',
    icon:  <BarChart3 className="w-4 h-4" />,
    roles: ['SYSTEM_ADMIN','HOSPITAL_ADMIN','POLICE_ADMIN','FIRE_SERVICE_ADMIN'],
  },
  {
    href:  '/dashboard/agent',
    label: 'AI Call Agent',
    icon:  <Mic className="w-4 h-4" />,
    roles: ['SYSTEM_ADMIN'],
  },
];

export function Sidebar() {
  const pathname       = usePathname();
  const { user, logout } = useAuthStore();
  const { connected }  = useSocketStore();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role as Role)
  );

  const roleInfo = user ? roleConfig[user.role as Role] : null;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full z-20
                 bg-white/60 dark:bg-obsidian-800/80
                 border-r border-alabaster-200 dark:border-obsidian-600
                 backdrop-blur-glass"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-30 w-6 h-6 rounded-full
                   bg-white dark:bg-obsidian-600
                   border border-alabaster-200 dark:border-obsidian-500
                   flex items-center justify-center shadow-card
                   hover:bg-alabaster-100 dark:hover:bg-obsidian-500
                   transition-colors"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-secondary" />
          : <ChevronLeft  className="w-3 h-3 text-secondary" />
        }
      </button>

      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 h-16 border-b border-alabaster-200 dark:border-obsidian-600',
        collapsed && 'justify-center px-0'
      )}>
        <div className="w-8 h-8 rounded-lg bg-crimson/15 border border-crimson/30
                        flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-crimson" strokeWidth={1.5} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{    opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-sm font-semibold text-primary leading-tight">ERDCP</p>
              <p className="text-[10px] text-muted leading-tight">Emergency Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-crimson/10 dark:bg-crimson/15 text-crimson'
                    : 'text-secondary hover:bg-alabaster-100 dark:hover:bg-obsidian-600 hover:text-primary'
                )}
              >
                <span className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-crimson' : 'text-muted'
                )}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{    opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-crimson"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Connection status */}
      <div className={cn(
        'px-4 py-3 border-t border-alabaster-200 dark:border-obsidian-600',
        collapsed && 'flex justify-center px-0'
      )}>
        <AnimatePresence>
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Activity className="w-3 h-3 text-muted" />
              <span className="text-xs text-muted">Live</span>
              <div className={cn(
                'ml-auto w-2 h-2 rounded-full',
                connected
                  ? 'bg-emerald-light animate-pulse'
                  : 'bg-obsidian-300 dark:bg-obsidian-500'
              )} />
            </motion.div>
          ) : (
            <div className={cn(
              'w-2 h-2 rounded-full',
              connected ? 'bg-emerald-light animate-pulse' : 'bg-obsidian-300'
            )} />
          )}
        </AnimatePresence>
      </div>

      {/* User section */}
      <div className={cn(
        'p-3 border-t border-alabaster-200 dark:border-obsidian-600',
        collapsed && 'flex flex-col items-center'
      )}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              className="mb-2 px-1"
            >
              <p className="text-xs font-medium text-primary truncate">{user?.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: roleInfo?.color }}>
                {roleInfo?.label}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-muted',
            'hover:bg-crimson/10 hover:text-crimson transition-all duration-150',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{    opacity: 0 }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
