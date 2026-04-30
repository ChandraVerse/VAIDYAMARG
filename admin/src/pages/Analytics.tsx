import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../api/axios';

const COLORS = ['#01696f', '#437a22', '#964219', '#006494', '#7a39bb'];

export default function Analytics() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn:  () => api.get('/admin/analytics').then((r) => r.data.data),
    staleTime: 5 * 60_000,
  });

  if (!analytics) {
    return <div className="py-20 text-center text-[#7a7974] text-sm">Loading analytics…</div>;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#28251d]">Analytics</h1>
        <p className="text-sm text-[#7a7974] mt-0.5">All-time platform statistics</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',     value: `₹${(analytics.totalRevenue || 0).toLocaleString('en-IN')}` },
          { label: 'Generic Savings',   value: `₹${(analytics.totalSavings || 0).toLocaleString('en-IN')}` },
          { label: 'Total Orders',      value: analytics.totalOrders     || 0 },
          { label: 'Active Users',      value: analytics.activeUsers     || 0 },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
            <p className="text-2xl font-bold text-[#28251d]">{kpi.value}</p>
            <p className="text-[12px] text-[#7a7974] mt-1 font-medium">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Orders per day */}
        {analytics.ordersPerDay?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
            <h2 className="text-[14px] font-bold text-[#28251d] mb-4">Orders — Last 30 Days</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.ordersPerDay}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #dcd9d5', fontSize: 11 }} />
                <Bar dataKey="count" fill="#01696f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top medicines */}
        {analytics.topMedicines?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
            <h2 className="text-[14px] font-bold text-[#28251d] mb-4">Top 5 Medicines</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.topMedicines} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#7a7974' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #dcd9d5', fontSize: 11 }} />
                <Bar dataKey="orders" fill="#437a22" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue vs Savings */}
        {analytics.revenueVsSavings?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
            <h2 className="text-[14px] font-bold text-[#28251d] mb-4">Revenue vs Generic Savings</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.revenueVsSavings}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#7a7974' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #dcd9d5', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" stroke="#01696f" strokeWidth={2} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="savings" stroke="#437a22" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order status breakdown */}
        {analytics.orderStatusBreakdown?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
            <h2 className="text-[14px] font-bold text-[#28251d] mb-4">Order Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.orderStatusBreakdown}
                  dataKey="count" nameKey="status"
                  cx="50%" cy="50%" outerRadius={75}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {analytics.orderStatusBreakdown.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #dcd9d5', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
