import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminOrdersApi } from '@/services/api';
import { Badge, Button, Card, Spinner } from '@/components/ui';

const STATUSES = ['PENDING','CONFIRMED','PACKED','DISPATCHED','DELIVERED','CANCELLED'];

export function OrderDetailPage() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const qc      = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn:  () => adminOrdersApi.detail(id!),
  });

  const mutation = useMutation({
    mutationFn: (status: string) => adminOrdersApi.update(id!, { status }),
    onSuccess: () => {
      toast.success('Order status updated');
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (isLoading) return <Spinner />;

  const order = data?.data?.data;
  if (!order) return null;

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors"
      >
        <ArrowLeft size={15} /> Back to orders
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-text">Order #{String(order.id).slice(0, 8)}</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Placed {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
          </p>
        </div>
        <Badge label={order.status} variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'error' : 'info'} />
      </div>

      {/* Status update */}
      <Card title="Update Status">
        <div className="px-5 py-4 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={order.status === s ? 'primary' : 'ghost'}
              loading={mutation.isPending && mutation.variables === s}
              onClick={() => mutation.mutate(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </Card>

      {/* Items */}
      <Card title="Items">
        <div className="divide-y divide-border">
          {order.items?.map((item: Record<string, unknown>) => (
            <div key={String(item.id)} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-text">{(item.medicine as Record<string, unknown>)?.name as string}</p>
                <p className="text-xs text-text-muted">Qty: {item.quantity as number}</p>
              </div>
              <p className="text-sm tabular-nums">₹{Number(item.price).toFixed(2)}</p>
            </div>
          ))}
          <div className="flex justify-between px-5 py-3">
            <p className="text-sm font-semibold">Total</p>
            <p className="text-sm font-bold tabular-nums">₹{Number(order.total).toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Customer */}
      <Card title="Customer">
        <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-text-muted">Name</p><p>{order.user?.name}</p></div>
          <div><p className="text-xs text-text-muted">Phone</p><p>{order.user?.phone}</p></div>
        </div>
      </Card>
    </div>
  );
}
