'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, CheckCircle, AlertTriangle, Edit3 } from 'lucide-react';
import { agentApi } from '@/lib/services';
import { cn, confidenceColor } from '@/lib/utils';
import type { CallSession, Transcription, ExtractedIncident, FieldConfidence } from '@/types';

interface Props {
  sessionId: string;
  onClose:   () => void;
  onAction:  () => void;
}

interface ConfidenceTagProps {
  label:      string;
  field:      FieldConfidence;
  editable?:  boolean;
  editValue?: string;
  onEdit?:    (val: string) => void;
}

function ConfidenceTag({ label, field, editable, editValue, onEdit }: ConfidenceTagProps) {
  const [editing, setEditing] = useState(false);
  const color = confidenceColor(field.confidence);
  const pct   = Math.round(field.confidence * 100);

  return (
    <motion.div
      layout
      className="flex flex-col gap-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-12 h-1 rounded-full bg-obsidian-600"
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-[10px] font-mono font-medium" style={{ color }}>
            {pct}%
          </span>
          {editable && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-muted hover:text-primary transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <input
          defaultValue={String(field.value ?? '')}
          autoFocus
          onBlur={(e) => { onEdit?.(e.target.value); setEditing(false); }}
          onKeyDown={(e) => e.key === 'Enter' && (onEdit?.((e.target as HTMLInputElement).value), setEditing(false))}
          className="input-base py-1.5 text-xs"
        />
      ) : (
        <div
          className="px-3 py-2 rounded-lg text-xs font-medium border"
          style={{
            color,
            backgroundColor: `${color}10`,
            borderColor:     `${color}30`,
          }}
        >
          {String(field.value ?? 'Not detected')}
        </div>
      )}
    </motion.div>
  );
}

export function SessionDetail({ sessionId, onClose, onAction }: Props) {
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [replaying, setReplaying]     = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn:  () => agentApi.getSession(sessionId).then((r) => r.data.data as {
      session:       CallSession;
      transcription: Transcription;
      extraction:    ExtractedIncident;
    }),
  });

  const { session, transcription, extraction } = data ?? {};

  const handleReview = async () => {
    setSubmitting(true);
    try {
      await agentApi.reviewSession(sessionId, corrections);
      onAction();
      onClose();
    } catch {}
    finally { setSubmitting(false); }
  };

  const handleReplay = async () => {
    setReplaying(true);
    try {
      await agentApi.replayNlp(sessionId);
      onAction();
    } catch {}
    finally { setReplaying(false); }
  };

  const setCorrection = (field: string, value: string) => {
    setCorrections((prev) => ({ ...prev, [field]: value }));
  };

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
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass-card w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b
                        border-alabaster-200 dark:border-obsidian-600 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-primary">Call Session</h2>
            <p className="text-xs text-muted mt-0.5 font-mono">
              {sessionId.slice(0, 16)}&hellip;
            </p>
          </div>
          <div className="flex items-center gap-2">
            {session?.status === 'PENDING_REVIEW' && (
              <button
                onClick={handleReplay}
                disabled={replaying}
                className="btn-ghost text-xs gap-1.5"
              >
                <RotateCcw className={cn('w-3.5 h-3.5', replaying && 'animate-spin')} />
                Re-run NLP
              </button>
            )}
            <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Session metadata */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Status',    value: session?.status?.replace('_', ' ') ?? '—' },
                  { label: 'Language',  value: session?.languageName ?? '—' },
                  { label: 'Handled by', value: session?.handledBy ?? '—' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-alabaster-100 dark:bg-obsidian-700">
                    <p className="text-[10px] text-muted uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-xs font-medium text-primary capitalize">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Transcription */}
              {transcription && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-primary">Transcription</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">
                        {transcription.wordCount} words
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color:           confidenceColor(transcription.confidenceScore),
                          backgroundColor: `${confidenceColor(transcription.confidenceScore)}15`,
                        }}
                      >
                        {Math.round(transcription.confidenceScore * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-alabaster-50 dark:bg-obsidian-900
                                  border border-alabaster-200 dark:border-obsidian-600">
                    <p className="text-xs text-secondary leading-relaxed">
                      {transcription.cleanedText || transcription.rawText}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted mt-1.5">
                    Model: {transcription.whisperModel} &bull; Processed in {transcription.processingMs}ms
                  </p>
                </div>
              )}

              {/* Extracted fields */}
              {extraction && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-primary">Extracted Fields</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-20 h-1.5 rounded-full bg-obsidian-600"
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width:           `${extraction.overallConfidence * 100}%`,
                            backgroundColor: confidenceColor(extraction.overallConfidence),
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: confidenceColor(extraction.overallConfidence) }}
                      >
                        {Math.round(extraction.overallConfidence * 100)}% overall
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ConfidenceTag
                      label="Citizen Name"
                      field={extraction.citizenName}
                      editable={session?.status === 'PENDING_REVIEW'}
                      onEdit={(v) => setCorrection('citizenName', v)}
                    />
                    <ConfidenceTag
                      label="Incident Type"
                      field={extraction.incidentType}
                      editable={session?.status === 'PENDING_REVIEW'}
                      onEdit={(v) => setCorrection('incidentType', v)}
                    />
                    <ConfidenceTag
                      label="Location"
                      field={extraction.locationText}
                      editable={session?.status === 'PENDING_REVIEW'}
                      onEdit={(v) => setCorrection('locationText', v)}
                    />
                    <ConfidenceTag
                      label="Urgency"
                      field={extraction.urgencyLevel}
                    />
                    <ConfidenceTag
                      label="Latitude"
                      field={extraction.latitude}
                      editable={session?.status === 'PENDING_REVIEW'}
                      onEdit={(v) => setCorrection('latitude', v)}
                    />
                    <ConfidenceTag
                      label="Longitude"
                      field={extraction.longitude}
                      editable={session?.status === 'PENDING_REVIEW'}
                      onEdit={(v) => setCorrection('longitude', v)}
                    />
                  </div>

                  {/* Notes field — full width */}
                  <div className="mt-3">
                    <ConfidenceTag
                      label="Notes"
                      field={extraction.notes}
                      editable={session?.status === 'PENDING_REVIEW'}
                      onEdit={(v) => setCorrection('notes', v)}
                    />
                  </div>

                  {/* Corrections log */}
                  {extraction.corrections.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <p className="text-[10px] text-amber-500 font-medium uppercase tracking-wide mb-2">
                        Manual corrections applied
                      </p>
                      {extraction.corrections.map((c, i) => (
                        <p key={i} className="text-[10px] text-muted">
                          {c.field}: &quot;{c.oldValue}&quot; &rarr; &quot;{c.newValue}&quot;
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {session?.status === 'PENDING_REVIEW' && (
          <div className="p-5 border-t border-alabaster-200 dark:border-obsidian-600 shrink-0">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted flex-1">
                {Object.keys(corrections).length > 0
                  ? `${Object.keys(corrections).length} field(s) corrected — ready to submit`
                  : 'Review fields above, then confirm to dispatch'
                }
              </p>
              <button
                onClick={handleReview}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm and Dispatch
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
