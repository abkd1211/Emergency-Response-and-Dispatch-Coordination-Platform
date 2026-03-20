'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, MapPin, Clock, Users, Target } from 'lucide-react';
import { analyticsApi } from '@/lib/services';
import { StatCard } from '@/components/ui/StatCard';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { SlaGauge } from '@/components/charts/SlaGauge';
import { PeakHoursChart } from '@/components/charts/PeakHoursChart';
import { RegionChart } from '@/components/charts/RegionChart';
import { ResponseTimeChart } from '@/components/charts/ResponseTimeChart';
import { LeaderboardTable } from '@/components/charts/LeaderboardTable';
import { cn, formatSeconds } from '@/lib/utils';

type Period = 'today' | 'week' | 'month' | 'year';

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Today',       value: 'today' },
  { label: 'This Week',   value: 'week'  },
  { label: 'This Month',  value: 'month' },
  { label: 'This Year',   value: 'year'  },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('week');

  const { data: slaRes, isLoading: slaLoading } = useQuery({
    queryKey: ['sla', period],
    queryFn:  () => analyticsApi.getSla(period).then((r) => r.data.data),
    refetchInterval: 60_000,
  });

  const { data: responseRes, isLoading: respLoading } = useQuery({
    queryKey: ['response-times', period],
    queryFn:  () => analyticsApi.getResponseTimes(period).then((r) => r.data.data as {
      avgDispatchTimeSec: number; avgArrivalTimeSec: number;
      avgResolutionTimeSec: number; totalIncidents: number;
    }),
    refetchInterval: 60_000,
  });

  const { data: peakRes, isLoading: peakLoading } = useQuery({
    queryKey: ['peak-hours', period],
    queryFn:  () => analyticsApi.getPeakHours(period).then((r) => r.data.data),
    refetchInterval: 120_000,
  });

  const { data: regionRes, isLoading: regionLoading } = useQuery({
    queryKey: ['regions', period],
    queryFn:  () => analyticsApi.getIncidentsByRegion(period).then((r) => r.data.data),
    refetchInterval: 120_000,
  });

  const { data: topRes, isLoading: topLoading } = useQuery({
    queryKey: ['top-responders'],
    queryFn:  () => analyticsApi.getTopResponders(10).then((r) => r.data.data as {
      responderId: string; responderName: string; responderType: string;
      totalDispatches: number; avgDispatchTimeSec: number;
      slaComplianceRate: number; currentStreak: number; bestStreak: number;
    }[]),
    refetchInterval: 60_000,
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary">Analytics</h2>
          <p className="text-sm text-muted mt-0.5">
            Operational performance and incident intelligence
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl glass">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                period === p.value
                  ? 'bg-crimson text-white shadow-sm'
                  : 'text-secondary hover:bg-alabaster-100 dark:hover:bg-obsidian-600'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {respLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Incidents"
              value={responseRes?.totalIncidents ?? 0}
              subtitle={`This ${period}`}
              icon={<BarChart3 className="w-4 h-4" />}
              accent="#FF2A55"
              delay={0}
            />
            <StatCard
              label="Avg Dispatch Time"
              value={formatSeconds(responseRes?.avgDispatchTimeSec ?? 0)}
              subtitle="Time to first response"
              icon={<Clock className="w-4 h-4" />}
              accent="#00F0FF"
              delay={0.05}
            />
            <StatCard
              label="Avg Arrival Time"
              value={formatSeconds(responseRes?.avgArrivalTimeSec ?? 0)}
              subtitle="Time to reach scene"
              icon={<MapPin className="w-4 h-4" />}
              accent="#CCFF00"
              delay={0.1}
            />
            <StatCard
              label="SLA Compliance"
              value={`${slaRes?.complianceRate ?? 0}%`}
              subtitle={`${slaRes?.withinSla ?? 0} of ${slaRes?.totalIncidents ?? 0} within target`}
              icon={<Target className="w-4 h-4" />}
              accent="#A855F7"
              delay={0.15}
            />
          </>
        )}
      </div>

      {/* Main charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Gauge */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-primary">SLA Compliance</h3>
              <p className="text-xs text-muted mt-0.5">8-minute dispatch target</p>
            </div>
            <Target className="w-4 h-4 text-muted" />
          </div>
          <SlaGauge value={slaRes?.complianceRate ?? 0} isLoading={slaLoading} />

          {/* SLA breakdown by type */}
          {slaRes?.byType && (
            <div className="mt-4 space-y-2 border-t border-alabaster-200 dark:border-obsidian-600 pt-4">
              <p className="text-[10px] text-muted uppercase tracking-wide">By incident type</p>
              {Object.entries(slaRes.byType).map(([type, stats]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-secondary w-20 shrink-0">{type}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-alabaster-200 dark:bg-obsidian-600">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.rate}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: stats.rate >= 80 ? '#10B981'
                          : stats.rate >= 60 ? '#F59E0B' : '#FF2A55'
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-primary w-10 text-right">
                    {stats.rate}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peak Hours */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-primary">Peak Hours</h3>
              <p className="text-xs text-muted mt-0.5">Incident volume by hour of day</p>
            </div>
            <Clock className="w-4 h-4 text-muted" />
          </div>
          <PeakHoursChart data={peakRes ?? []} isLoading={peakLoading} />
        </div>

        {/* Regional breakdown */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-primary">By Region</h3>
              <p className="text-xs text-muted mt-0.5">Ghana administrative regions</p>
            </div>
            <MapPin className="w-4 h-4 text-muted" />
          </div>
          <RegionChart data={regionRes ?? []} isLoading={regionLoading} />
        </div>

        {/* Response time trend */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-primary">Response Times</h3>
              <p className="text-xs text-muted mt-0.5">Dispatch vs arrival breakdown</p>
            </div>
            <TrendingUp className="w-4 h-4 text-muted" />
          </div>
          <ResponseTimeChart
            dispatchSec={responseRes?.avgDispatchTimeSec ?? 0}
            arrivalSec={responseRes?.avgArrivalTimeSec ?? 0}
            resolutionSec={responseRes?.avgResolutionTimeSec ?? 0}
            isLoading={respLoading}
          />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-primary">Responder Leaderboard</h3>
            <p className="text-xs text-muted mt-0.5">
              Ranked by dispatches, response time, and SLA compliance
            </p>
          </div>
          <Users className="w-4 h-4 text-muted" />
        </div>
        <LeaderboardTable data={topRes ?? []} isLoading={topLoading} />
      </div>
    </div>
  );
}
