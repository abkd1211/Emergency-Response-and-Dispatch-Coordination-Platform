'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, MapPin, Clock, User, Phone } from 'lucide-react';
import { incidentApi } from '@/lib/services';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { incidentTypeConfig, formatRelativeTime, formatSeconds } from '@/lib/utils';
import type { IncidentType } from '@/types';

interface Props {
  incidentId: string;
  onClose:    () => void;
}

export function IncidentPanel({ incidentId, onClose }: Props) {
  const { data } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn:  () => incidentApi.getById(incidentId).then((r) => r.data.data),
  });

  const incident = data;
  if (!incident) return null;

  const typeCfg = incidentTypeConfig[incident.incidentType as IncidentType];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: typeCfg?.bgDark, color: typeCfg?.darkColor }}
          >
            {incident.incidentType.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">
              {typeCfg?.label ?? incident.incidentType}
            </h3>
            <p className="text-xs text-muted">{formatRelativeTime(incident.createdAt)}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={incident.status} />
        <PriorityBadge priority={incident.priority} />
      </div>

      {/* Caller info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <User className="w-3.5 h-3.5 text-muted shrink-0" />
          <p className="text-xs text-primary">{incident.citizenName}</p>
        </div>
        {incident.citizenPhone && (
          <div className="flex items-center gap-2.5">
            <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
            <p className="text-xs text-primary">{incident.citizenPhone}</p>
          </div>
        )}
        <div className="flex items-start gap-2.5">
          <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-primary leading-relaxed">
            {incident.address ?? `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}
          </p>
        </div>
      </div>

      {/* Notes */}
      {incident.notes && (
        <div className="p-3 rounded-xl bg-alabaster-100 dark:bg-obsidian-700">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Notes</p>
          <p className="text-xs text-primary leading-relaxed">{incident.notes}</p>
        </div>
      )}

      {/* Assigned unit */}
      {incident.responder && (
        <div className="p-3 rounded-xl bg-alabaster-100 dark:bg-obsidian-700">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-1.5">Assigned Unit</p>
          <p className="text-xs font-medium text-primary">{incident.responder.name}</p>
          <p className="text-[10px] text-muted">{incident.responder.stationName}</p>
        </div>
      )}

      {/* Status timeline */}
      {incident.statusHistory && incident.statusHistory.length > 0 && (
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wide mb-2">Status Timeline</p>
          <div className="space-y-2">
            {incident.statusHistory.slice(0, 4).map((h, i) => (
              <div key={h.id} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-crimson mt-1.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-primary font-medium">
                    {h.oldStatus} &rarr; {h.newStatus}
                  </p>
                  <p className="text-[10px] text-muted">{formatRelativeTime(h.changedAt)}</p>
                  {h.note && <p className="text-[10px] text-muted italic">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
