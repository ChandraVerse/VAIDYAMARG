import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerOrdersApi } from '@/services/api';
import { Badge, Button, Card, Empty, Spinner } from '@/components/ui';

const STATUS_OPTIONS = ['PENDING','CONFIRMED','PROCESSING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];

const statusVariant = (s: string) =>
  s === 'DELIVERED'          ? 'success'
  : s === 'CANCELLED'        ? 'error'
  : s === 'OUT_FOR_DELIVERY' ? 'info'
  : s === 'PROCESSING'       ? 'info'
  : s === 'CONFIRMED'        ? 'success'
  : 'warning';

export function OrdersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['partner-orders', statusFilter],
    queryFn:  () => partnerOrdersApi.list(statusFilter ? { status: statusFilter } : undefined),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => partnerOrdersApi.update(id, status),
    onSuccess: () => { toast.success('Order status updated'); qc.invalidateQueries({ queryKey: ['partner-orders'] }); },
    onError:   () => toast.error('Failed to update order'),
  });

  const orders: any[] = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text">Orders</h1>
          <p className="text-xs text-text-muted mt-0.5">Manage and update order statuses</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-text outline-none focus:border-primary"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Card>
        {isLoading ? <Spinner /> : orders.length === 0 ? (
          <Empty icon={ShoppingBag} title="No orders found" description="Orders assigned to your pharmacy will appear here." />
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order: any) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text">#{order.id.slice(-6).toUpperCase()}</p>
                    <Badge label={order.status} variant={statusVariant(order.status)} />
                    {order.prescriptionId && <Badge label="Rx" variant="warning" />}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {order.user?.name ?? 'Patient'} · ₹{Number(order.totalAmount).toFixed(0)}
                    {order.genericSavings ? ` · Saved ₹${Number(order.genericSavings).toFixed(0)}` : ''}
                  </p>
                  <p className="text-xs text-text-faint">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!['DELIVERED','CANCELLED'].includes(order.status) && (
                    <div className="relative">
                      <select
                        defaultValue=""
                        onChange={(e) => { if (e.target.value) updateMutation.mutate({ id: order.id, status: e.target.value }); }}
                        className="appearance-none pl-3 pr-7 py-1.5 text-xs border border-border rounded-lg bg-white text-text outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="" disabled>Update</option>
                        {STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    </div>
                  )}
                  <Button variant="ghost" size="sm" icon={<Eye size={13} />} onClick={() => navigate(`/orders/${order.id}`)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
