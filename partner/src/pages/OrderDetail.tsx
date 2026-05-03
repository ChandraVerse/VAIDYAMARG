import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerOrdersApi } from '@/services/api';
import { Badge, Button, Card, Spinner } from '@/components/ui';

const STATUS_OPTIONS = ['PENDING','CONFIRMED','PROCESSING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['partner-order', id],
    queryFn:  () => partnerOrdersApi.detail(id!),
    enabled:  !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (status: string) => partnerOrdersApi.update(id!, status),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['partner-order', id] }); },
    onError:   () => toast.error('Failed to update'),
  });

  if (isLoading) return <Spinner />;
  const order = data?.data?.data ?? data?.data;
  if (!order) return <div className="p-6 text-sm text-text-muted">Order not found.</div>;

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/orders')}>Back</Button>
        <div>
          <h1 className="text-lg font-bold text-text">Order #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card title="Status & Payment">
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Order Status</span>
              <Badge label={order.status} variant={order.status==='DELIVERED'?'success':order.status==='CANCELLED'?'error':'warning'} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Payment</span>
              <Badge label={order.paymentStatus} variant={order.paymentStatus==='PAID'?'success':'warning'} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Total</span>
              <span className="text-sm font-bold text-text tabular-nums">₹{Number(order.totalAmount).toFixed(2)}</span>
            </div>
            {order.genericSavings > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Generic Savings</span>
                <span className="text-xs font-semibold text-success">₹{Number(order.genericSavings).toFixed(2)}</span>
              </div>
            )}
            {!['DELIVERED','CANCELLED'].includes(order.status) && (
              <div className="pt-2 border-t border-border">
                <label className="text-xs font-medium text-text-muted block mb-1.5">Update Status</label>
                <select
                  defaultValue={order.status}
                  onChange={(e) => updateMutation.mutate(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-text outline-none focus:border-primary"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
            )}
          </div>
        </Card>

        <Card title="Patient">
          <div className="px-5 py-4 space-y-2">
            <p className="text-sm font-semibold text-text">{order.user?.name}</p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Phone size={12} /> {order.user?.phone}
            </div>
            {order.deliveryAddress && (
              <div className="flex items-start gap-2 text-xs text-text-muted mt-2">
                <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                <span>{order.deliveryAddress}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="Order Items">
        <div className="divide-y divide-border">
          {(order.items ?? []).map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Pill size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text">{item.medicine?.name}</p>
                <p className="text-xs text-text-muted">{item.medicine?.genericName} · Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text tabular-nums">₹{Number(item.totalPrice).toFixed(2)}</p>
                <p className="text-xs text-text-muted">@ ₹{Number(item.unitPrice).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
