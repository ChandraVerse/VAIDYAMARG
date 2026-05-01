import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-primary-highlight text-primary border border-primary hover:bg-primary/10',
  ghost:     'bg-transparent text-text border border-border hover:bg-surface-offset',
  danger:    'bg-error text-white hover:opacity-90',
};

const SIZE: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2   text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     React.ReactNode;
}

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled,
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 font-semibold rounded-lg
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT[variant]} ${SIZE[size]} ${className}
      `}
      {...rest}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
