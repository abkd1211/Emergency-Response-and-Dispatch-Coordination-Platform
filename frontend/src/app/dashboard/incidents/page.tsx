'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { incidentApi } from '@/lib/services';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { IncidentForm } from '@/components/forms/IncidentForm';
import { useAuthStore } from '@/store/auth.store';
import {
  incidentTypeConfig, formatRelativeTime, cn,
} from '@/lib/utils';
import type { IncidentStatus, IncidentType } from '@/types';

const STATUS_FILTERS: { label: string; value: IncidentStatus | 'ALL' }[] = [
  { label: 'All',         value: 'ALL' },
  { label: 'Open',        value: 'CREATED' },
  { label: 'Dispatched',  value: 'DISPATCHED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved',    value: 'RESOLVED' },
];

export default function IncidentsPage() {
  const { user }      = useAuthStore();
  const queryClient   = useQueryClient();
  const [showForm, setShowForm]     = useState(false);
  const [statusFilter, setStatus]   = useState<IncidentStatus | 'ALL'>('ALL');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['incidents', statusFilter, page],
    queryFn:  () => incidentApi.list({
      page,
      limit: 20,
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
    }).then((r) => r.data.data),
  });

  const incidents = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  const isAdmin = ['SYSTEM_ADMIN'].includes(user?.role ?? '');

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Incidents</h2>
          <p className="text-sm text-muted mt-0.5">
            {data?.total ?? 0} total incidents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['incidents'] })}
            className={cn('btn-ghost', isFetching && 'opacity-50')}
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              New Incident
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl glass">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                statusFilter === f.value
                  ? 'bg-crimson text-white'
                  : 'text-secondary hover:bg-alabaster-100 dark:hover:bg-obsidian-600'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location..."
            className="input-base pl-9 py-2 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-alabaster-200 dark:border-obsidian-600">
                {['Type', 'Citizen', 'Location', 'Status', 'Priority', 'Responder', 'Time'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold
                                          text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-alabaster-100 dark:divide-obsidian-700">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={7} />
                  ))
                : incidents
                    .filter((inc) =>
                      !search ||
                      inc.citizenName.toLowerCase().includes(search.toLowerCase()) ||
                      (inc.address ?? '').toLowerCase().includes(search.toLowerCase())
                    )
                    .map((incident, i) => {
                      const typeCfg = incidentTypeConfig[incident.incidentType as IncidentType];
                      return (
                        <motion.tr
                          key={incident.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-alabaster-50 dark:hover:bg-obsidian-700/50
                                     transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <span
                              className="badge text-xs"
                              style={{ color: typeCfg?.darkColor, backgroundColor: typeCfg?.bgDark }}
                            >
                              {typeCfg?.label ?? incident.incidentType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium text-primary">{incident.citizenName}</p>
                            {incident.citizenPhone && (
                              <p className="text-[10px] text-muted">{incident.citizenPhone}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-[160px]">
                            <p className="text-xs text-secondary truncate">
                              {incident.address ?? `${incident.latitude.toFixed(3)}, ${incident.longitude.toFixed(3)}`}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={incident.status} />
                          </td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={incident.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-secondary">
                              {incident.responder?.name ?? '—'}
                            </p>
                            {incident.responder && (
                              <p className="text-[10px] text-muted">{incident.responder.stationName}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-muted">{formatRelativeTime(incident.createdAt)}</p>
                          </td>
                        </motion.tr>
                      );
                    })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3
                          border-t border-alabaster-100 dark:border-obsidian-700">
            <p className="text-xs text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident form modal */}
      <AnimatePresence>
        {showForm && (
          <IncidentForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['incidents'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
