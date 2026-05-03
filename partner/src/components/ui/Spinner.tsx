import { Loader2 } from 'lucide-react';
interface Props { size?: number }
export function Spinner({ size=20 }: Props) {
  return (
    <div className="flex items-center justify-center p-12">
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  );
}
