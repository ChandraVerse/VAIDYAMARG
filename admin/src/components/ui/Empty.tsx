import type { LucideIcon } from 'lucide-react';

export function Empty({
  icon: Icon,
  title,
  description,
}: {
  icon:        LucideIcon;
  title:       string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <Icon size={36} className="text-text-faint" strokeWidth={1.25} />
      <p className="text-sm font-semibold text-text">{title}</p>
      {description && <p className="text-xs text-text-muted max-w-xs">{description}</p>}
    </div>
  );
}
