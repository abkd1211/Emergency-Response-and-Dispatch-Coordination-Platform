'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertTriangle, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { incidentApi } from '@/lib/services';
import { useAuthStore } from '@/store/auth.store';
import { cn, incidentTypeConfig } from '@/lib/utils';
import type { IncidentType, NearbyIncident } from '@/types';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const schema = z.object({
  citizenName:  z.string().min(2, 'Name is required'),
  citizenPhone: z.string().optional(),
  incidentType: z.enum(['MEDICAL', 'FIRE', 'CRIME', 'ACCIDENT', 'OTHER']),
  latitude:     z.number({ required_error: 'Pick a location on the map' }),
  longitude:    z.number({ required_error: 'Pick a location on the map' }),
  address:      z.string().optional(),
  notes:        z.string().optional(),
  priority:     z.number().min(1).max(3).default(1),
});
type FormData = z.infer<typeof schema>;

const STEPS = ['Caller Info', 'Incident Details', 'Location', 'Review'];

interface Props {
  onClose:   () => void;
  onSuccess: () => void;
}

export function IncidentForm({ onClose, onSuccess }: Props) {
  const { user }       = useAuthStore();
  const [step, setStep]       = useState(0);
  const [nearby, setNearby]   = useState<NearbyIncident[]>([]);
  const [showNearby, setShowNearby] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]     = useState('');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map          = useRef<mapboxgl.Map | null>(null);
  const marker       = useRef<mapboxgl.Marker | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { incidentType: 'MEDICAL', priority: 1 },
  });

  const [lat, lng] = [watch('latitude'), watch('longitude')];

  // ── Map initialisation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 2 || !mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:     'mapbox://styles/mapbox/streets-v12',
      center:    [-0.187, 5.603],
      zoom:      12,
    });

    map.current.on('click', async (e) => {
      const { lat, lng } = e.lngLat;
      setValue('latitude',  lat, { shouldValidate: true });
      setValue('longitude', lng, { shouldValidate: true });

      // Update marker
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      } else {
        marker.current = new mapboxgl.Marker({ color: '#FF2A55' })
          .setLngLat([lng, lat])
          .addTo(map.current!);
      }

      // Check for nearby incidents
      try {
        const res = await incidentApi.getNearby(lat, lng, 200);
        if (res.data.data.length > 0) {
          setNearby(res.data.data);
          setShowNearby(true);
        }
      } catch {}
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [step, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError('');
    try {
      await incidentApi.create(data);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg || 'Failed to create incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkToExisting = async (parentId: string) => {
    try {
      await incidentApi.linkReport({
        parentIncidentId: parentId,
        citizenName: watch('citizenName') || 'Unknown',
        citizenPhone: watch('citizenPhone'),
        notes: watch('notes'),
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg || 'Failed to link report');
    }
  };

  const incidentType = watch('incidentType') as IncidentType;
  const typeCfg      = incidentTypeConfig[incidentType];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{    opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass-card w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b
                        border-alabaster-200 dark:border-obsidian-600 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-primary">New Incident</h2>
            <p className="text-xs text-muted mt-0.5">Step {step + 1} of {STEPS.length}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex px-5 pt-4 gap-2 shrink-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={cn(
                'h-1 rounded-full transition-all duration-300',
                i <= step ? 'bg-crimson' : 'bg-alabaster-200 dark:bg-obsidian-600'
              )} />
              <p className="text-[10px] text-muted mt-1 hidden sm:block">{s}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 0 — Caller Info */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x: -20 }}
                  className="p-5 space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                      Caller Name *
                    </label>
                    <input
                      {...register('citizenName')}
                      placeholder="Full name of caller"
                      className={cn('input-base', errors.citizenName && 'border-crimson/50')}
                    />
                    {errors.citizenName && (
                      <p className="text-xs text-crimson">{errors.citizenName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                      Phone Number
                    </label>
                    <input
                      {...register('citizenPhone')}
                      placeholder="+233 XX XXX XXXX"
                      className="input-base"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 1 — Incident Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x: -20 }}
                  className="p-5 space-y-4"
                >
                  {/* Type selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                      Incident Type *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(incidentTypeConfig) as IncidentType[]).map((type) => {
                        const cfg     = incidentTypeConfig[type];
                        const isActive = incidentType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setValue('incidentType', type)}
                            className={cn(
                              'px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-150',
                              isActive
                                ? 'border-current'
                                : 'border-alabaster-200 dark:border-obsidian-600 text-muted'
                            )}
                            style={isActive ? {
                              color:           cfg.darkColor,
                              backgroundColor: cfg.bgDark,
                              borderColor:     cfg.darkColor,
                            } : undefined}
                          >
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {([1, 2, 3] as const).map((p) => {
                        const labels = { 1: 'Normal', 2: 'High', 3: 'Critical' };
                        const colors = { 1: '#6B7280', 2: '#F59E0B', 3: '#EF4444' };
                        const active = watch('priority') === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setValue('priority', p)}
                            className={cn(
                              'flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-150',
                              active ? 'border-current' : 'border-alabaster-200 dark:border-obsidian-600 text-muted'
                            )}
                            style={active ? {
                              color: colors[p], backgroundColor: `${colors[p]}15`, borderColor: colors[p]
                            } : undefined}
                          >
                            {labels[p]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                      Additional Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      placeholder="Any additional details about the emergency..."
                      className="input-base resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2 — Location */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x: -20 }}
                  className="p-5 space-y-4"
                >
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <MapPin className="w-3.5 h-3.5 text-crimson" />
                    Click anywhere on the map to set the incident location
                  </div>

                  {/* Map picker */}
                  <div ref={mapContainer} className="h-56 rounded-xl overflow-hidden border
                                                      border-alabaster-200 dark:border-obsidian-600" />

                  {/* Coords display */}
                  {lat && lng && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl
                                 bg-crimson/10 border border-crimson/20"
                    >
                      <MapPin className="w-3.5 h-3.5 text-crimson shrink-0" />
                      <p className="text-xs text-crimson font-mono">
                        {lat.toFixed(5)}, {lng.toFixed(5)}
                      </p>
                    </motion.div>
                  )}

                  {errors.latitude && (
                    <p className="text-xs text-crimson">Please click on the map to select a location</p>
                  )}
                </motion.div>
              )}

              {/* Step 3 — Review */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x: -20 }}
                  className="p-5 space-y-3"
                >
                  <div className="glass rounded-xl p-4 space-y-3">
                    {[
                      { label: 'Caller',   value: watch('citizenName') },
                      { label: 'Phone',    value: watch('citizenPhone') || '—' },
                      { label: 'Type',     value: incidentTypeConfig[incidentType]?.label },
                      { label: 'Priority', value: ['Normal','High','Critical'][watch('priority') - 1] },
                      { label: 'Location', value: lat ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '—' },
                      { label: 'Notes',    value: watch('notes') || '—' },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between gap-4">
                        <span className="text-xs text-muted">{row.label}</span>
                        <span className="text-xs font-medium text-primary text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl
                                    bg-crimson/10 border border-crimson/20 text-crimson text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {error}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nearby incident warning */}
            <AnimatePresence>
              {showNearby && nearby.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{    opacity: 0, height: 0 }}
                  className="mx-5 mb-4 overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-xs font-semibold text-amber-500">
                        Active incident {nearby[0].distanceMetres}m away
                      </p>
                    </div>
                    <p className="text-xs text-secondary">
                      A {nearby[0].incidentType} incident is already active nearby, 
                      handled by {nearby[0].assignedUnit?.name ?? 'unknown unit'}.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => linkToExisting(nearby[0].incidentId)}
                        className="flex-1 py-2 rounded-xl text-xs font-medium
                                   bg-amber-500/20 text-amber-500 border border-amber-500/30
                                   hover:bg-amber-500/30 transition-colors"
                      >
                        Link to Existing
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNearby(false)}
                        className="flex-1 py-2 rounded-xl text-xs font-medium btn-outline"
                      >
                        Create Separate
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer navigation */}
            <div className="flex items-center justify-between p-5 border-t
                            border-alabaster-200 dark:border-obsidian-600 shrink-0">
              <button
                type="button"
                onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
                className="btn-ghost"
              >
                <ChevronLeft className="w-4 h-4" />
                {step === 0 ? 'Cancel' : 'Back'}
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  className="btn-primary"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Incident
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
