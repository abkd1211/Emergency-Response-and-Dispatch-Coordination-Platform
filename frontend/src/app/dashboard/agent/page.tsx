'use client';
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Mic, Upload, CheckCircle, Clock, AlertTriangle,
  RefreshCw, Eye, RotateCcw, Activity,
} from 'lucide-react';
import { agentApi } from '@/lib/services';
import { cn, confidenceColor, formatRelativeTime } from '@/lib/utils';
import { SessionDetail } from '@/components/agent/SessionDetail';
import { AgentStatusCard } from '@/components/agent/AgentStatusCard';
import type { CallSession, SessionStatus } from '@/types';

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; icon: typeof Mic }> = {
  RECEIVED:       { label: 'Received',        color: '#6B7280', icon: Mic },
  TRANSCRIBING:   { label: 'Transcribing',    color: '#3B82F6', icon: Activity },
  EXTRACTING:     { label: 'Extracting',      color: '#8B5CF6', icon: Activity },
  PENDING_REVIEW: { label: 'Needs Review',    color: '#F59E0B', icon: AlertTriangle },
  AUTO_SUBMITTED: { label: 'Auto-Submitted',  color: '#10B981', icon: CheckCircle },
  REVIEWED:       { label: 'Reviewed',        color: '#10B981', icon: CheckCircle },
  DISCARDED:      { label: 'Discarded',       color: '#EF4444', icon: AlertTriangle },
  FAILED:         { label: 'Failed',          color: '#EF4444', icon: AlertTriangle },
};

export default function AgentPage() {
  const queryClient              = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ sessionId: string; status: string; message: string } | null>(null);
  const [callerPhone, setCallerPhone] = useState('');

  const { data: statusRes } = useQuery({
    queryKey: ['agent-status'],
    queryFn:  () => agentApi.getStatus().then((r) => r.data.data as {
      totalSessions: number; autoSubmitted: number; pendingReview: number;
      autoSubmitRate: number; avgConfidence: number; operatorsOnline: number;
      whisperAvailable: boolean; confidenceThreshold: number;
    }),
    refetchInterval: 30_000,
  });

  const { data: sessionsRes, isLoading: sessionsLoading } = useQuery({
    queryKey: ['agent-sessions'],
    queryFn:  () => agentApi.listSessions(1, 20).then((r) => r.data.data),
    refetchInterval: 15_000,
  });

  const sessions = sessionsRes?.data ?? [];

  // ── Dropzone ──────────────────────────────────────────────────────────────
  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('audio', file);
    if (callerPhone) formData.append('callerPhone', callerPhone);

    try {
      const res = await agentApi.ingestCall(formData);
      setUploadResult(res.data.data);
      queryClient.invalidateQueries({ queryKey: ['agent-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['agent-status'] });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Upload failed';
      setUploadResult({ sessionId: '', status: 'FAILED', message: msg });
    } finally {
      setUploading(false);
    }
  }, [callerPhone, queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.wav', '.mp3', '.mp4', '.m4a', '.ogg', '.flac', '.webm'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-primary">AI Call Agent</h2>
        <p className="text-sm text-muted mt-0.5">
          Automated emergency call transcription and incident extraction
        </p>
      </div>

      {/* Status cards */}
      <AgentStatusCard status={statusRes} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload panel */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-primary mb-1">Ingest Call Recording</h3>
            <p className="text-xs text-muted mb-4">
              Upload an emergency call audio file. The AI will transcribe, extract incident
              details, and auto-dispatch if confidence is high enough.
            </p>

            {/* Phone input */}
            <div className="mb-3">
              <label className="text-xs font-medium text-secondary uppercase tracking-wide block mb-1.5">
                Caller Phone (optional)
              </label>
              <input
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                placeholder="+233 XX XXX XXXX"
                className="input-base"
              />
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',
                'transition-all duration-200',
                isDragActive
                  ? 'border-crimson bg-crimson/5 scale-[1.01]'
                  : 'border-alabaster-300 dark:border-obsidian-500 hover:border-crimson/50',
                uploading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
                    <p className="text-sm text-secondary">Processing audio...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      isDragActive ? 'bg-crimson/20' : 'bg-alabaster-100 dark:bg-obsidian-700'
                    )}>
                      <Upload className={cn('w-5 h-5', isDragActive ? 'text-crimson' : 'text-muted')} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {isDragActive ? 'Drop audio file here' : 'Drop audio or click to upload'}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        WAV, MP3, M4A, OGG, FLAC, WebM up to 25MB
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Upload result */}
            <AnimatePresence>
              {uploadResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{    opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className={cn(
                    'p-3 rounded-xl text-xs border',
                    uploadResult.status === 'FAILED'
                      ? 'bg-crimson/10 border-crimson/20 text-crimson'
                      : 'bg-emerald-light/10 border-emerald-light/20 text-emerald-light'
                  )}>
                    <p className="font-medium mb-0.5">
                      {uploadResult.status === 'FAILED' ? 'Upload failed' : 'Call ingested'}
                    </p>
                    <p className="opacity-80">{uploadResult.message}</p>
                    {uploadResult.sessionId && (
                      <button
                        onClick={() => setSelectedSession(uploadResult.sessionId)}
                        className="mt-2 underline underline-offset-2 hover:opacity-70 transition-opacity"
                      >
                        View session
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pipeline explanation */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-primary mb-3">How it works</p>
            <div className="space-y-2">
              {[
                { step: 1, label: 'Whisper STT', desc: 'Transcribes audio — supports EN, Twi, Ga, Hausa' },
                { step: 2, label: 'NLP Extraction', desc: 'Extracts name, type, location with per-field confidence' },
                { step: 3, label: 'Geocoding', desc: 'Converts location text to GPS via OpenStreetMap' },
                { step: 4, label: 'Auto-dispatch', desc: 'Score ≥85% auto-submits to incident service' },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-crimson/15 flex items-center justify-center
                                  text-[10px] font-bold text-crimson shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary">{s.label}</p>
                    <p className="text-[10px] text-muted">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sessions panel */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b
                          border-alabaster-200 dark:border-obsidian-600">
            <div>
              <h3 className="text-sm font-semibold text-primary">Call Sessions</h3>
              <p className="text-xs text-muted mt-0.5">{sessionsRes?.total ?? 0} total sessions</p>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['agent-sessions'] })}
              className="btn-ghost p-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-alabaster-100 dark:divide-obsidian-700 overflow-y-auto max-h-[480px]">
            {sessionsLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-obsidian-600 animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-40 bg-obsidian-600 rounded animate-pulse" />
                      <div className="h-2.5 w-24 bg-obsidian-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))
              : sessions.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Mic className="w-8 h-8 text-muted" strokeWidth={1.5} />
                    <p className="text-sm text-muted">No call sessions yet</p>
                  </div>
                )
              : sessions.map((session, i) => {
                  const cfg = STATUS_CONFIG[session.status];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={session.sessionId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedSession(session.sessionId)}
                      className={cn(
                        'flex items-center gap-3 p-4 cursor-pointer transition-colors',
                        'hover:bg-alabaster-50 dark:hover:bg-obsidian-700/50',
                        selectedSession === session.sessionId &&
                          'bg-crimson/5 border-l-2 border-crimson'
                      )}
                    >
                      {/* Status icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cfg.color}15` }}
                      >
                        <Icon
                          className={cn('w-4 h-4', session.status === 'TRANSCRIBING' && 'animate-pulse')}
                          style={{ color: cfg.color }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary truncate">
                          {session.callerPhone || 'Unknown caller'}
                        </p>
                        <p className="text-[10px] text-muted mt-0.5">
                          {session.audioFileName} &bull; {formatRelativeTime(session.createdAt)}
                        </p>
                        {session.languageName && (
                          <p className="text-[10px] text-muted">
                            {session.languageName}
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            color:           cfg.color,
                            backgroundColor: `${cfg.color}15`,
                          }}
                        >
                          {cfg.label}
                        </span>
                        {session.status === 'PENDING_REVIEW' && (
                          <span className="text-[9px] text-amber-500">
                            Needs review
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
            }
          </div>
        </div>
      </div>

      {/* Session detail modal */}
      <AnimatePresence>
        {selectedSession && (
          <SessionDetail
            sessionId={selectedSession}
            onClose={() => setSelectedSession(null)}
            onAction={() => {
              queryClient.invalidateQueries({ queryKey: ['agent-sessions'] });
              queryClient.invalidateQueries({ queryKey: ['agent-status'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
