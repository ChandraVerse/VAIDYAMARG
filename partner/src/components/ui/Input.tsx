import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?:  ReactNode;
}
export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, icon, className='', ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="text-xs font-semibold text-text-muted">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint">{icon}</span>}
        <input
          ref={ref}
          {...props}
          className={`
            w-full ${icon ? 'pl-8' : 'pl-3'} pr-3 py-2 text-sm bg-white border rounded-lg outline-none
            text-text placeholder:text-text-faint
            border-border focus:border-primary transition-colors
            ${error ? 'border-error focus:border-error' : ''}
            ${className}
          `}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
);
