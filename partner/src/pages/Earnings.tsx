import { useQuery } from '@tanstack/react-query';
import { IndianRupee, TrendingUp, Clock } from 'lucide-react';
import { partnerAnalyticsApi } from '@/services/api';
import { Badge, Card, Empty, Spinner } from '@/components/ui';

export function EarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['partner-earnings'],
    queryFn:  () => partnerAnalyticsApi.earnings(),
  });

  const earnings: any[] = data?.data?.data ?? data?.data ?? [];

  const total     = earnings.reduce((s, e) => s + Number(e.netEarning), 0);
  const unsettled = earnings.filter((e) => !e.settledAt).reduce((s, e) => s + Number(e.netEarning), 0);
  const settled   = total - unsettled;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-text">Earnings</h1>
        <p className="text-xs text-text-muted mt-0.5">Your commission and settlement history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned',  value: total,     icon: TrendingUp,  color: 'text-success'  },
          { label: 'Settled',       value: settled,   icon: IndianRupee, color: 'text-primary'   },
          { label: 'Pending',       value: unsettled, icon: Clock,       color: 'text-warning'  },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted">{label}</p>
                <p className="text-xl font-bold text-text mt-1 tabular-nums">₹{value.toFixed(2)}</p>
              </div>
              <span className={`mt-1 ${color}`}><Icon size={20} strokeWidth={1.75} /></span>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Transaction History">
        {isLoading ? <Spinner /> : earnings.length === 0 ? (
          <Empty icon={IndianRupee} title="No earnings yet" description="Completed orders will appear here." />
        ) : (
          <div className="divide-y divide-border">
            {earnings.map((e: any) => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text">Order #{e.orderId?.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(e.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="text-sm font-bold text-text tabular-nums">₹{Number(e.netEarning).toFixed(2)}</p>
                  <p className="text-xs text-text-muted tabular-nums">Commission: ₹{Number(e.commission).toFixed(2)}</p>
                  <Badge
                    label={e.settledAt ? 'Settled' : 'Pending'}
                    variant={e.settledAt ? 'success' : 'warning'}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
