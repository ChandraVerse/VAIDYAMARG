import { ElementType } from 'react';
interface Props { icon: ElementType; title: string; description?: string }
export function Empty({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-8">
      <Icon size={32} className="text-text-faint mb-4" strokeWidth={1.5} />
      <h3 className="text-sm font-bold text-text mb-1">{title}</h3>
      {description && <p className="text-xs text-text-muted max-w-xs">{description}</p>}
    </div>
  );
}
