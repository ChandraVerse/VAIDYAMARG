import { Loader2 } from 'lucide-react';

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center w-full py-16">
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  );
}
