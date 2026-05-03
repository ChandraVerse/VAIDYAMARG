import { ReactNode } from 'react';
interface Props { title?: string; action?: ReactNode; children: ReactNode; className?: string }
export function Card({ title, action, children, className='' }: Props) {
  return (
    <div className={`bg-white rounded-2xl border border-border shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-bold text-text">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
