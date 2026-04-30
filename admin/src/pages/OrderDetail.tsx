import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { format } from 'date-fns';

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'];

export default function OrderDetail() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn:  () => api.get(`/orders/${id}/admin`).then((r) => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated!');
    },
  });

  if (isLoading || !order) {
    return <div className="py-20 text-center text-[#7a7974] text-sm">Loading order…</div>;
  }

  const currentIdx  = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-[13px] text-[#7a7974] hover:text-[#28251d] font-medium mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Orders
      </button>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Order header */}
          <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#28251d]">Order #{order.id.slice(-6).toUpperCase()}</h2>
                <p className="text-[12px] text-[#7a7974] mt-0.5">{format(new Date(order.createdAt), 'dd MMM yyyy, h:mm a')}</p>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl ${
                isCancelled ? 'bg-red-50 text-red-700' : 'bg-teal-50 text-teal-700'
              }`}>{order.status}</span>
            </div>

            {/* Progress */}
            {!isCancelled && (
              <div className="flex items-center gap-0 mb-2">
                {STATUS_FLOW.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                        i < currentIdx  ? 'bg-primary border-primary text-white' :
                        i === currentIdx ? 'bg-primary border-primary text-white ring-2 ring-primary/30' :
                        'bg-white border-[#dcd9d5] text-[#bab9b4]'
                      }`}>
                        {i <= currentIdx ? '✓' : i + 1}
                      </div>
                      <p className="text-[9px] text-[#7a7974] mt-1 text-center w-14 leading-tight">{s}</p>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 ${
                        i < currentIdx ? 'bg-primary' : 'bg-[#dcd9d5]'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
            <h3 className="font-bold text-[14px] text-[#28251d] mb-3">Items ({order.items?.length})</h3>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#f3f0ec] last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-[#28251d]">{item.medicine?.name}</p>
                    <p className="text-[11px] text-[#7a7974]">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="text-[13px] font-bold text-[#28251d]">₹{item.totalPrice}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-3 border-t border-[#dcd9d5] mt-2">
              <span className="text-[14px] font-bold text-[#28251d]">Total</span>
              <span className="text-[14px] font-bold text-primary">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-2xl border border-[#dcd9d5] p-4">
            <h3 className="font-bold text-[13px] text-[#28251d] mb-2">Customer</h3>
            <p className="text-[13px] font-semibold text-[#28251d]">{order.user?.name || '—'}</p>
            <p className="text-[12px] text-[#7a7974]">+91 {order.user?.phone}</p>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-[#dcd9d5] p-4">
            <h3 className="font-bold text-[13px] text-[#28251d] mb-2">Delivery Address</h3>
            <p className="text-[12px] text-[#7a7974] leading-relaxed">
              {order.address?.line1}{order.address?.line2 ? `, ${order.address.line2}` : ''}<br />
              {order.address?.city}, {order.address?.state} {order.address?.pincode}
            </p>
          </div>

          {/* Advance status */}
          {!isCancelled && order.status !== 'DELIVERED' && (
            <div className="bg-white rounded-2xl border border-[#dcd9d5] p-4">
              <h3 className="font-bold text-[13px] text-[#28251d] mb-3">Update Status</h3>
              {STATUS_FLOW.slice(currentIdx + 1).map((s) => (
                <button
                  key={s}
                  onClick={() => updateMutation.mutate(s)}
                  disabled={updateMutation.isPending}
                  className="w-full mb-2 py-2 text-[12px] font-bold bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-60"
                >
                  Mark as {s}
                </button>
              ))}
              <button
                onClick={() => updateMutation.mutate('CANCELLED')}
                disabled={updateMutation.isPending}
                className="w-full py-2 text-[12px] font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
