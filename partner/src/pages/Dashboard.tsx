import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag, IndianRupee, FileText, Package,
  TrendingUp, Clock,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { partnerAnalyticsApi } from '@/services/api';
import { Card, Spinner } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';

const fmt = (n: number) =>
  n >= 100_000 ? `₹${(n/100_000).toFixed(1)}L`
  : n >= 1_000 ? `₹${(n/1_000).toFixed(1)}K`
  : `₹${n}`;

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: analytics, isLoading: l1 } = useQuery({
    queryKey: ['partner-analytics'],
    queryFn:  () => partnerAnalyticsApi.overview(),
  });
  const { data: earnings, isLoading: l2 } = useQuery({
    queryKey: ['partner-earnings'],
    queryFn:  () => partnerAnalyticsApi.earnings(),
  });

  const s = analytics?.data?.data ?? {};
  const earningsList: any[] = earnings?.data?.data ?? [];

  const chartData = (() => {
    const map: Record<string, number> = {};
    earningsList.forEach((e) => {
      const d = new Date(e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      map[d] = (map[d] ?? 0) + Number(e.netEarning);
    });
    return Object.entries(map).slice(-7).map(([date, earning]) => ({ date, earning }));
  })();

  const KPI = [
    { label: "Today's Orders",    value: s.todayOrders   ?? 0,          icon: ShoppingBag,  color: 'text-primary'   },
    { label: 'Total Revenue',      value: fmt(s.totalRevenue ?? 0),       icon: IndianRupee,  color: 'text-success'   },
    { label: 'Pending Rx',         value: s.pendingRx     ?? 0,          icon: FileText,     color: 'text-warning'   },
    { label: 'Low Stock Items',    value: s.lowStock      ?? 0,          icon: Package,      color: 'text-error'     },
  ];

  if (l1 && l2) return <Spinner />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-text">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          {user?.pharmacy?.name} · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Earnings — last 7 days">
          <div className="px-4 pb-4 pt-2">
            {l2 ? <Spinner size={16} /> : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-xs text-text-muted">No earnings data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#01696f" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#01696f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4d1ca" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: '#7a7974' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderColor: '#d4d1ca', borderRadius: 8 }} formatter={(v: number) => [fmt(v), 'Earnings']} />
                  <Area dataKey="earning" stroke="#01696f" strokeWidth={2} fill="url(#earn)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="Quick Stats">
          <div className="divide-y divide-border">
            {[
              { label: 'Orders Delivered', value: s.deliveredOrders ?? 0, icon: TrendingUp },
              { label: 'Pending Orders',   value: s.pendingOrders   ?? 0, icon: Clock      },
              { label: 'Total Medicines',  value: s.totalMedicines  ?? 0, icon: Package    },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <Icon size={15} strokeWidth={1.75} /> {label}
                </div>
                <span className="text-sm font-bold text-text tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
