'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Battery, Gauge, Navigation, Clock, AlertTriangle } from 'lucide-react';
import { vehicleApi } from '@/lib/services';
import { useSocketStore } from '@/store/socket.store';
import { cn, responderTypeConfig, formatSeconds } from '@/lib/utils';

interface Props {
  vehicleId: string;
  onClose:   () => void;
}

export function VehiclePanel({ vehicleId, onClose }: Props) {
  const { vehicles } = useSocketStore();
  const liveData     = vehicles[vehicleId];

  const { data } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn:  () => vehicleApi.getById(vehicleId).then((r) => r.data.data),
  });

  const vehicle = data;
  if (!vehicle) return null;

  const cfg   = responderTypeConfig[vehicle.type];
  const speed = liveData?.speedKmh ?? vehicle.speedKmh;
  const bat   = liveData?.batteryPct ?? vehicle.batteryPct;
  const eta   = liveData?.etaSec;

  const statusColors: Record<string, string> = {
    AVAILABLE:    '#10B981',
    DISPATCHED:   '#F59E0B',
    EN_ROUTE:     '#3B82F6',
    ON_SCENE:     '#8B5CF6',
    RETURNING:    '#6B7280',
    OFFLINE:      '#4B5563',
    UNRESPONSIVE: '#EF4444',
  };

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
            style={{ backgroundColor: `${cfg.mapColor}20`, color: cfg.mapColor }}
          >
            {vehicle.type.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">{vehicle.vehicleCode}</h3>
            <p className="text-xs text-muted">{vehicle.stationName}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status */}
      <div
        className="px-3 py-2 rounded-xl text-xs font-medium text-center"
        style={{
          color:           statusColors[vehicle.status],
          backgroundColor: `${statusColors[vehicle.status]}15`,
        }}
      >
        {vehicle.status.replace('_', ' ')}
        {vehicle.isUnresponsive && (
          <span className="ml-2 text-crimson">(Unresponsive)</span>
        )}
      </div>

      {/* Telemetry grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-alabaster-100 dark:bg-obsidian-700">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge className="w-3 h-3 text-muted" />
            <span className="text-[10px] text-muted uppercase tracking-wide">Speed</span>
          </div>
          <p className="text-lg font-semibold text-primary">{speed} <span className="text-xs font-normal text-muted">km/h</span></p>
        </div>

        <div className="p-3 rounded-xl bg-alabaster-100 dark:bg-obsidian-700">
          <div className="flex items-center gap-1.5 mb-1">
            <Navigation className="w-3 h-3 text-muted" />
            <span className="text-[10px] text-muted uppercase tracking-wide">Heading</span>
          </div>
          <p className="text-lg font-semibold text-primary">{liveData?.heading ?? vehicle.heading}</p>
        </div>

        {bat !== null && bat !== undefined && (
          <div className="p-3 rounded-xl bg-alabaster-100 dark:bg-obsidian-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Battery className="w-3 h-3 text-muted" />
              <span className="text-[10px] text-muted uppercase tracking-wide">Battery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-obsidian-500">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${bat}%`,
                    backgroundColor: bat > 30 ? '#10B981' : '#EF4444',
                  }}
                />
              </div>
              <span className="text-xs font-medium text-primary">{bat}%</span>
            </div>
          </div>
        )}

        {eta && (
          <div className="p-3 rounded-xl bg-alabaster-100 dark:bg-obsidian-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-muted" />
              <span className="text-[10px] text-muted uppercase tracking-wide">ETA</span>
            </div>
            <p className="text-lg font-semibold text-primary">{formatSeconds(eta)}</p>
          </div>
        )}
      </div>

      {/* Route deviation warning */}
      {vehicle.routeDeviation && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-500">Route deviation detected</p>
        </div>
      )}

      {/* Driver */}
      <div className="pt-2 border-t border-alabaster-200 dark:border-obsidian-600">
        <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Driver</p>
        <p className="text-sm text-primary">{vehicle.driverName}</p>
      </div>
    </motion.div>
  );
}
