'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp,
  Activity, MapPin, Users, Shield,
} from 'lucide-react';
import { analyticsApi } from '@/lib/services';
import { StatCard } from '@/components/ui/StatCard';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';
import { formatSeconds, formatRelativeTime, incidentTypeConfig } from '@/lib/utils';
import { SlaGauge } from '@/components/charts/SlaGauge';
import { IncidentTypeChart } from '@/components/charts/IncidentTypeChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import type { IncidentType } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: dashRes, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => analyticsApi.getDashboard().then((r) => r.data.data),
    refetchInterval: 30_000,
  });

  const dash = dashRes;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold text-primary">
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-muted mt-0.5">
            Here is what is happening across the platform right now.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                        bg-emerald-light/10 border border-emerald-light/20">
          <span className="w-2 h-2 rounded-full bg-emerald-light animate-pulse" />
          <span className="text-xs font-medium text-emerald-light">System Online</span>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Incidents"
              value={dash?.totalIncidents ?? 0}
              subtitle="All time"
              icon={<AlertTriangle className="w-4 h-4" />}
              accent="#FF2A55"
              delay={0}
            />
            <StatCard
              label="Open Now"
              value={dash?.openIncidents ?? 0}
              subtitle="Needs attention"
              icon={<Activity className="w-4 h-4" />}
              accent="#FF8A00"
              delay={0.05}
            />
            <StatCard
              label="Resolved Today"
              value={dash?.resolvedToday ?? 0}
              subtitle="Since midnight"
              icon={<CheckCircle className="w-4 h-4" />}
              accent="#CCFF00"
              delay={0.1}
            />
            <StatCard
              label="Avg Response"
              value={formatSeconds(dash?.avgResponseTimeSec ?? 0)}
              subtitle="Dispatch time this week"
              icon={<Clock className="w-4 h-4" />}
              accent="#00F0FF"
              delay={0.15}
            />
          </>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA gauge */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-primary">SLA Compliance</h3>
              <p className="text-xs text-muted mt-0.5">8-minute dispatch target</p>
            </div>
            <TrendingUp className="w-4 h-4 text-muted" />
          </div>
          <SlaGauge value={dash?.slaComplianceRate ?? 0} isLoading={isLoading} />
        </div>

        {/* Incident type breakdown */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-primary">By Type</h3>
              <p className="text-xs text-muted mt-0.5">Incident distribution</p>
            </div>
            <Shield className="w-4 h-4 text-muted" />
          </div>
          <IncidentTypeChart
            data={dash?.incidentsByType ?? {}}
            isLoading={isLoading}
          />
        </div>

        {/* Top responders */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-primary">Top Responders</h3>
              <p className="text-xs text-muted mt-0.5">By dispatch count</p>
            </div>
            <Users className="w-4 h-4 text-muted" />
          </div>
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-obsidian-600 animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-32 bg-obsidian-600 rounded animate-pulse" />
                      <div className="h-2.5 w-20 bg-obsidian-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))
              : dash?.topResponders?.slice(0, 5).map((r, i) => (
                  <motion.div
                    key={r.responderId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-crimson/10 flex items-center justify-center
                                    text-crimson text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary truncate">
                        {r.responderName}
                      </p>
                      <p className="text-[10px] text-muted">
                        {r.totalDispatches} dispatches &bull; {formatSeconds(r.avgDispatchTimeSec)} avg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-emerald-light">
                        {r.slaComplianceRate}%
                      </p>
                      <p className="text-[10px] text-muted">SLA</p>
                    </div>
                  </motion.div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-primary">Recent Activity</h3>
            <p className="text-xs text-muted mt-0.5">Latest 10 incidents</p>
          </div>
          <MapPin className="w-4 h-4 text-muted" />
        </div>
        <ActivityFeed
          items={dash?.recentActivity ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
