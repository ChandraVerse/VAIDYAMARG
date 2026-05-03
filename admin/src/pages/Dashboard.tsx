import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, ShoppingBag, FileText, Users, IndianRupee,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { dashboardApi } from '@/services/api';
import { Card, Spinner } from '@/components/ui';

const fmt = (n: number) =>
  n >= 100_000
    ? `₹${(n / 100_000).toFixed(1)}L`
    : n >= 1_000
    ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n}`;

export function DashboardPage() {
  const { data: stats,   isLoading: l1 } = useQuery({ queryKey: ['dash-stats'],   queryFn: () => dashboardApi.stats() });
  const { data: revenue, isLoading: l2 } = useQuery({ queryKey: ['dash-revenue'], queryFn: () => dashboardApi.revenueChart() });
  const { data: orders,  isLoading: l3 } = useQuery({ queryKey: ['dash-orders'],  queryFn: () => dashboardApi.orderChart() });

  const s = stats?.data?.data ?? {};
  const revData = revenue?.data?.data ?? [];
  const ordData = orders?.data?.data  ?? [];

  const KPI = [
    { label: 'Total Revenue',    value: fmt(s.totalRevenue          ?? 0), icon: IndianRupee, color: 'text-primary'  },
    { label: 'Total Orders',     value: s.totalOrders               ?? 0,  icon: ShoppingBag, color: 'text-blue-600' },
    // Backend field: pendingPrescriptions (not pendingRx)
    { label: 'Pending Rx',       value: s.pendingPrescriptions      ?? 0,  icon: FileText,    color: 'text-warning'  },
    { label: 'Registered Users', value: s.totalUsers                ?? 0,  icon: Users,       color: 'text-success'  },
  ];

  if (l1 && l2 && l3) return <Spinner />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-text">Dashboard</h1>
        <p className="text-xs text-text-muted mt-0.5">Platform overview — updated in real time</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted">{label}</p>
                <p className="text-2xl font-bold text-text mt-1 tabular-nums">{value}</p>
              </div>
              <span className={`mt-1 ${color}`}><Icon size={20} strokeWidth={1.75} /></span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue (last 30 days)">
          <div className="px-4 pb-4 pt-2">
            {l2 ? <Spinner size={16} /> : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#01696f" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#01696f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4d1ca" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderColor: '#d4d1ca', borderRadius: 8 }}
                    formatter={(v: number) => [fmt(v), 'Revenue']}
                  />
                  <Area dataKey="revenue" stroke="#01696f" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="Orders per day">
          <div className="px-4 pb-4 pt-2">
            {l3 ? <Spinner size={16} /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ordData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4d1ca" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderColor: '#d4d1ca', borderRadius: 8 }} />
                  <Bar dataKey="orders" fill="#cedcd8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
