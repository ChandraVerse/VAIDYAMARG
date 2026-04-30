import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, ShoppingBag, IndianRupee, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  () => api.get('/admin/stats').then((r) => r.data.data),
    refetchInterval: 60_000,
  });

  const { data: pendingRx } = useQuery({
    queryKey: ['pending-rx'],
    queryFn:  () => api.get('/prescriptions/admin/pending?limit=5').then((r) => r.data.data),
    refetchInterval: 30_000,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders-admin'],
    queryFn:  () => api.get('/orders/admin/recent?limit=5').then((r) => r.data.data),
  });

  const KPI_CARDS = [
    { label: 'Pending Prescriptions', value: stats?.pendingPrescriptions ?? '—', icon: FileText,     color: 'text-warning',  bg: 'bg-amber-50',    action: () => navigate('/prescriptions') },
    { label: 'Orders Today',          value: stats?.ordersToday          ?? '—', icon: ShoppingBag,  color: 'text-primary',  bg: 'bg-teal-50',    action: () => navigate('/orders') },
    { label: 'Revenue Today',         value: stats?.revenueToday ? `₹${stats.revenueToday.toLocaleString('en-IN')}` : '—', icon: IndianRupee, color: 'text-success', bg: 'bg-green-50', action: null },
    { label: 'Generic Savings (all)', value: stats?.totalSavings  ? `₹${stats.totalSavings.toLocaleString('en-IN')}`  : '—', icon: TrendingUp,   color: 'text-purple-600', bg: 'bg-purple-50', action: null },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[#28251d]">Dashboard</h1>
        <p className="text-sm text-[#7a7974] mt-0.5">Real-time overview · auto-refreshes every 60s</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            onClick={kpi.action || undefined}
            className={`bg-white rounded-2xl border border-[#dcd9d5] p-5 ${
              kpi.action ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
          >
            <div className={`inline-flex p-2 rounded-xl ${kpi.bg} mb-3`}>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <p className="text-2xl font-bold text-[#28251d]">{kpi.value}</p>
            <p className="text-[12px] text-[#7a7974] mt-0.5 font-medium">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {stats?.revenueChart && (
        <div className="bg-white rounded-2xl border border-[#dcd9d5] p-6">
          <h2 className="text-[15px] font-bold text-[#28251d] mb-4">Revenue — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.revenueChart}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#01696f" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#01696f" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7a7974' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7a7974' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #dcd9d5', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#01696f" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pending Rx queue */}
        <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#28251d]">Pending Prescriptions</h2>
            <button onClick={() => navigate('/prescriptions')} className="text-[12px] text-primary font-semibold hover:underline">View all →</button>
          </div>
          {!pendingRx?.items?.length ? (
            <div className="text-center py-6">
              <CheckCircle size={28} className="text-success mx-auto mb-2" />
              <p className="text-sm text-[#7a7974]">All caught up! No pending prescriptions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRx.items.map((rx: any) => (
                <button
                  key={rx.id}
                  onClick={() => navigate(`/prescriptions/${rx.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f3f0ec] transition-colors text-left"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock size={14} className="text-warning" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#28251d] truncate">{rx.user?.name || '+91 ' + rx.user?.phone}</p>
                    <p className="text-[11px] text-[#7a7974]">{formatDistanceToNow(new Date(rx.createdAt), { addSuffix: true })}</p>
                  </div>
                  <span className="text-[11px] font-bold text-warning bg-amber-50 px-2.5 py-1 rounded-lg">Review →</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#28251d]">Recent Orders</h2>
            <button onClick={() => navigate('/orders')} className="text-[12px] text-primary font-semibold hover:underline">View all →</button>
          </div>
          <div className="space-y-2">
            {recentOrders?.map((order: any) => (
              <button
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f3f0ec] transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#28251d]">{order.user?.name || 'Customer'}</p>
                  <p className="text-[11px] text-[#7a7974]">₹{order.totalAmount} · {order.items?.length} items</p>
                </div>
                <StatusPill status={order.status} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:    'bg-amber-50 text-amber-700',
    CONFIRMED:  'bg-teal-50 text-teal-700',
    PACKED:     'bg-blue-50 text-blue-700',
    DISPATCHED: 'bg-purple-50 text-purple-700',
    DELIVERED:  'bg-green-50 text-green-700',
    CANCELLED:  'bg-red-50 text-red-700',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
