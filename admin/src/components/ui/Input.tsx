import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:  string;
  error?:  string;
  helper?: string;
}

export function Input({ label, error, helper, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-text">{label}</label>}
      <input
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white text-text
          placeholder:text-text-faint
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          disabled:opacity-50
          ${error ? 'border-error' : 'border-border'}
          ${className}
        `}
        {...rest}
      />
      {error  && <p className="text-xs text-error">{error}</p>}
      {helper && !error && <p className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}
