'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Radio, Filter } from 'lucide-react';
import { vehicleApi, incidentApi } from '@/lib/services';
import { useSocketStore } from '@/store/socket.store';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { DispatchMap } from '@/components/map/DispatchMap';
import { VehiclePanel } from '@/components/map/VehiclePanel';
import { IncidentPanel } from '@/components/map/IncidentPanel';

export default function DispatchPage() {
  const { accessToken }         = useAuthStore();
  const { connect, connected }  = useSocketStore();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'AMBULANCE' | 'POLICE' | 'FIRE_TRUCK'>('ALL');

  // Ensure socket is connected
  useEffect(() => {
    if (accessToken && !connected) connect(accessToken);
  }, [accessToken, connected, connect]);

  const { data: vehiclesRes } = useQuery({
    queryKey: ['vehicles', filter],
    queryFn:  () => vehicleApi.list(filter !== 'ALL' ? { type: filter } : undefined)
      .then((r) => r.data.data),
    refetchInterval: 10_000,
  });

  const { data: incidentsRes } = useQuery({
    queryKey: ['incidents-open'],
    queryFn:  () => incidentApi.getOpen().then((r) => r.data.data),
    refetchInterval: 15_000,
  });

  const vehicles  = vehiclesRes  ?? [];
  const incidents = incidentsRes ?? [];

  return (
    <div className="relative h-full flex overflow-hidden">
      {/* Map — full bleed */}
      <div className="flex-1 relative">
        <DispatchMap
          vehicles={vehicles}
          incidents={incidents}
          onVehicleClick={setSelectedVehicleId}
          onIncidentClick={setSelectedIncidentId}
        />

        {/* Map controls overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {/* Connection status */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl glass text-xs font-medium',
            connected ? 'text-emerald-light' : 'text-crimson'
          )}>
            <Radio className="w-3.5 h-3.5" />
            {connected ? 'Live Tracking Active' : 'Disconnected'}
          </div>

          {/* Vehicle count */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-xs text-secondary">
            <Layers className="w-3.5 h-3.5" />
            {vehicles.length} vehicles &bull; {incidents.length} open incidents
          </div>
        </div>

        {/* Filter bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-1 p-1 rounded-xl glass">
            {(['ALL', 'AMBULANCE', 'POLICE', 'FIRE_TRUCK'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                  filter === f
                    ? 'bg-crimson text-white shadow-crimson'
                    : 'text-secondary hover:bg-alabaster-100 dark:hover:bg-obsidian-600'
                )}
              >
                {f === 'ALL' ? 'All' : f === 'FIRE_TRUCK' ? 'Fire' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {(selectedVehicleId || selectedIncidentId) && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0,   opacity: 1 }}
            exit={{   x: 320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-80 shrink-0 border-l border-alabaster-200 dark:border-obsidian-600
                       bg-white/80 dark:bg-obsidian-800/90 backdrop-blur-glass overflow-y-auto"
          >
            {selectedVehicleId && (
              <VehiclePanel
                vehicleId={selectedVehicleId}
                onClose={() => setSelectedVehicleId(null)}
              />
            )}
            {selectedIncidentId && !selectedVehicleId && (
              <IncidentPanel
                incidentId={selectedIncidentId}
                onClose={() => setSelectedIncidentId(null)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
