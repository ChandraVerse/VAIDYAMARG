type Variant = 'success'|'error'|'warning'|'info'|'default';
interface Props { label: string; variant?: Variant }

const V: Record<Variant,string> = {
  success: 'bg-success/10 text-success',
  error:   'bg-error/10 text-error',
  warning: 'bg-warning/10 text-warning',
  info:    'bg-primary/10 text-primary',
  default: 'bg-surface-offset text-text-muted',
};
export function Badge({ label, variant='default' }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${V[variant]}`}>
      {label.replace(/_/g,' ')}
    </span>
  );
}
