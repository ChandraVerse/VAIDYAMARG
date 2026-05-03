import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary'|'secondary'|'ghost'|'danger';
type Size    = 'sm'|'md'|'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?:    Size;
  loading?: boolean;
  icon?:    ReactNode;
}

const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none';

const V: Record<Variant,string> = {
  primary:   'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
  secondary: 'bg-success/10 text-success border border-success/20 hover:bg-success/20',
  ghost:     'bg-transparent text-text-muted hover:bg-surface-offset hover:text-text',
  danger:    'bg-error/10 text-error border border-error/20 hover:bg-error/20',
};

const S: Record<Size,string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-sm px-5 py-2.5',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant='primary', size='md', loading=false, icon, children, ...props }, ref) => (
    <button ref={ref} {...props} disabled={loading || props.disabled} className={`${base} ${V[variant]} ${S[size]} ${props.className??''}`}>
      {loading ? <Loader2 size={13} className="animate-spin" /> : icon}
      {children}
    </button>
  )
);
