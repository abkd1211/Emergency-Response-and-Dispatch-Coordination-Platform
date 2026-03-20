import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { IncidentType, IncidentStatus, ResponderType, Role } from '@/types';

// ─── Class merger ─────────────────────────────────────────────────────────────
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// ─── Incident type colours ────────────────────────────────────────────────────
export const incidentTypeConfig: Record<IncidentType, {
  label:     string;
  darkColor: string;   // neon accent for dark mode
  lightColor:string;   // jewel tone for light mode
  bgDark:    string;
  bgLight:   string;
  icon:      string;
}> = {
  MEDICAL:  { label: 'Medical',  darkColor: '#CCFF00', lightColor: '#D4A017', bgDark: '#CCFF0015', bgLight: '#FDF6E3', icon: 'cross' },
  FIRE:     { label: 'Fire',     darkColor: '#FF2A55', lightColor: '#C0392B', bgDark: '#FF2A5515', bgLight: '#FDECEA', icon: 'flame' },
  CRIME:    { label: 'Crime',    darkColor: '#00F0FF', lightColor: '#1A5276', bgDark: '#00F0FF15', bgLight: '#EAF2FB', icon: 'shield' },
  ACCIDENT: { label: 'Accident', darkColor: '#FF8A00', lightColor: '#9A6C00', bgDark: '#FF8A0015', bgLight: '#FFF8E7', icon: 'car' },
  OTHER:    { label: 'Other',    darkColor: '#A855F7', lightColor: '#6B21A8', bgDark: '#A855F715', bgLight: '#F5F3FF', icon: 'alert' },
};

// ─── Status colours ───────────────────────────────────────────────────────────
export const incidentStatusConfig: Record<IncidentStatus, {
  label: string; color: string; bgColor: string;
}> = {
  CREATED:     { label: 'Created',     color: '#6B7280', bgColor: '#F3F4F6' },
  DISPATCHED:  { label: 'Dispatched',  color: '#F59E0B', bgColor: '#FFFBEB' },
  IN_PROGRESS: { label: 'In Progress', color: '#3B82F6', bgColor: '#EFF6FF' },
  RESOLVED:    { label: 'Resolved',    color: '#10B981', bgColor: '#ECFDF5' },
  CANCELLED:   { label: 'Cancelled',   color: '#EF4444', bgColor: '#FEF2F2' },
};

// ─── Responder type colours ───────────────────────────────────────────────────
export const responderTypeConfig: Record<ResponderType, {
  label: string; darkColor: string; lightColor: string; mapColor: string;
}> = {
  AMBULANCE: { label: 'Ambulance', darkColor: '#CCFF00', lightColor: '#D4A017', mapColor: '#CCFF00' },
  POLICE:    { label: 'Police',    darkColor: '#00F0FF', lightColor: '#1A5276', mapColor: '#00F0FF' },
  FIRE_TRUCK:{ label: 'Fire',      darkColor: '#FF2A55', lightColor: '#C0392B', mapColor: '#FF2A55' },
};

// ─── Role labels ──────────────────────────────────────────────────────────────
export const roleConfig: Record<Role, { label: string; color: string }> = {
  SYSTEM_ADMIN:       { label: 'System Admin',       color: '#FF2A55' },
  HOSPITAL_ADMIN:     { label: 'Hospital Admin',     color: '#CCFF00' },
  POLICE_ADMIN:       { label: 'Police Admin',       color: '#00F0FF' },
  FIRE_SERVICE_ADMIN: { label: 'Fire Service Admin', color: '#FF8A00' },
  AMBULANCE_DRIVER:   { label: 'Ambulance Driver',   color: '#A855F7' },
};

// ─── Format helpers ───────────────────────────────────────────────────────────
export const formatSeconds = (sec: number): string => {
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`;
};

export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

export const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec  = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

// ─── Confidence score colour ──────────────────────────────────────────────────
export const confidenceColor = (score: number): string => {
  if (score >= 0.85) return '#10B981'; // green
  if (score >= 0.60) return '#F59E0B'; // amber
  return '#EF4444';                    // red
};

// ─── Heading to degrees ───────────────────────────────────────────────────────
export const headingToDegrees: Record<string, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
};

// ─── Priority label ───────────────────────────────────────────────────────────
export const priorityConfig = {
  1: { label: 'Normal',   color: '#6B7280' },
  2: { label: 'High',     color: '#F59E0B' },
  3: { label: 'Critical', color: '#EF4444' },
} as const;
