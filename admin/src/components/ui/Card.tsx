import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?:   string;
  action?:  React.ReactNode;
}

export function Card({ title, action, children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-border shadow-sm ${className}`}
      {...rest}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          {title && <h2 className="text-sm font-semibold text-text">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
