import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { format } from 'date-fns';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

const STATUS_COLOR: Record<string, string> = {
  PENDING:    'bg-amber-50 text-amber-700',
  CONFIRMED:  'bg-teal-50 text-teal-700',
  PACKED:     'bg-blue-50 text-blue-700',
  DISPATCHED: 'bg-purple-50 text-purple-700',
  DELIVERED:  'bg-green-50 text-green-700',
  CANCELLED:  'bg-red-50   text-red-700',
};

const NEXT_STATUS: Record<string, string> = {
  PENDING:    'CONFIRMED',
  CONFIRMED:  'PACKED',
  PACKED:     'DISPATCHED',
  DISPATCHED: 'DELIVERED',
};

export default function Orders() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const [tab,    setTab]    = useState('ALL');
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', tab, search, page],
    queryFn:  () => api.get('/orders/admin/list', {
      params: { status: tab === 'ALL' ? undefined : tab, search, page, limit: 20 },
    }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });

  const advanceMutation = useMutation({
    mutationFn: ({ orderId, status }: any) =>
      api.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated!');
    },
    onError: () => toast.error('Update failed'),
  });

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#28251d]">Orders</h1>
        <span className="text-[13px] text-[#7a7974]">{data?.total ?? 0} total</span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bab9b4]" />
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by customer name or order ID…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#dcd9d5] rounded-xl text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_TABS.map((t) => (
          <button
            key={t} onClick={() => { setTab(t); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-colors ${
              tab === t ? 'bg-primary text-white' : 'bg-white border border-[#dcd9d5] text-[#7a7974] hover:border-primary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#dcd9d5] overflow-x-auto">
        {isLoading ? (
          <div className="py-16 text-center text-[#7a7974] text-sm">Loading…</div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-[#7a7974] text-sm">No orders found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#dcd9d5] bg-[#f7f6f2]">
                {['Order ID', 'Customer', 'Date', 'Amount', 'Payment', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-[#7a7974] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f0ec]">
              {data.items.map((order: any) => (
                <tr key={order.id} className="hover:bg-[#f9f8f5] transition-colors">
                  <td className="px-4 py-3 text-[12px] font-mono text-[#7a7974]">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold text-[#28251d]">{order.user?.name || '—'}</p>
                    <p className="text-[11px] text-[#7a7974]">+91 {order.user?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#7a7974] whitespace-nowrap">
                    {format(new Date(order.createdAt), 'dd MMM, h:mm a')}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-[#28251d]">₹{order.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                      order.paymentMethod === 'COD' ? 'bg-gray-100 text-gray-600' : 'bg-teal-50 text-teal-700'
                    }`}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      STATUS_COLOR[order.status] || 'bg-gray-50 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="text-[11px] text-primary font-semibold hover:underline"
                      >
                        View
                      </button>
                      {NEXT_STATUS[order.status] && (
                        <button
                          onClick={() => advanceMutation.mutate({ orderId: order.id, status: NEXT_STATUS[order.status] })}
                          disabled={advanceMutation.isPending}
                          className="text-[11px] font-bold text-white bg-primary px-2.5 py-1 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60 whitespace-nowrap"
                        >
                          → {NEXT_STATUS[order.status]}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
