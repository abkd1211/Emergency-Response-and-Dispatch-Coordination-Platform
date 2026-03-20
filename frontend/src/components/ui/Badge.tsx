import { cn, incidentTypeConfig, incidentStatusConfig } from '@/lib/utils';
import type { IncidentType, IncidentStatus } from '@/types';

interface BadgeProps {
  children:   React.ReactNode;
  color?:     string;
  bg?:        string;
  className?: string;
}

export function Badge({ children, color, bg, className }: BadgeProps) {
  return (
    <span
      className={cn('badge', className)}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

export function IncidentTypeBadge({ type }: { type: IncidentType }) {
  const cfg = incidentTypeConfig[type];
  return (
    <Badge
      color={cfg.darkColor}
      bg={cfg.bgDark}
      className="dark:inline-flex hidden"
    >
      {cfg.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const cfg = incidentStatusConfig[status];
  return (
    <span
      className="badge"
      style={{ color: cfg.color, backgroundColor: cfg.bgColor + '33' }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: number }) {
  const config = {
    1: { label: 'Normal',   color: '#6B7280', bg: '#F3F4F620' },
    2: { label: 'High',     color: '#F59E0B', bg: '#F59E0B20' },
    3: { label: 'Critical', color: '#EF4444', bg: '#EF444420' },
  }[priority] ?? { label: 'Unknown', color: '#6B7280', bg: '#F3F4F620' };

  return (
    <Badge color={config.color} bg={config.bg}>
      {config.label}
    </Badge>
  );
}
