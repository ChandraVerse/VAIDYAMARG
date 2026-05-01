type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold';

const MAP: Record<Variant, string> = {
  default: 'bg-surface-offset text-text-muted',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  error:   'bg-error-light text-error',
  info:    'bg-primary-highlight text-primary',
  gold:    'bg-gold-light/30 text-gold',
};

export function Badge({ label, variant = 'default' }: { label: string; variant?: Variant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${MAP[variant]}`}>
      {label}
    </span>
  );
}
