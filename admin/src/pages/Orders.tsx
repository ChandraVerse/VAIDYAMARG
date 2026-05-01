import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { adminOrdersApi } from '@/services/api';
import { Badge, Card, Empty, Input, Spinner, Table } from '@/components/ui';

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  PENDING:    'warning',
  CONFIRMED:  'info',
  PACKED:     'info',
  DISPATCHED: 'gold' as never,
  DELIVERED:  'success',
  CANCELLED:  'error',
};

export function OrdersPage() {
  const navigate  = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, status],
    queryFn:  () => adminOrdersApi.list({ search: search || undefined, status: status || undefined }),
  });

  const orders = data?.data?.data ?? [];

  const columns = [
    { key: 'id',     header: 'Order ID',  render: (r: Record<string, unknown>) => <span className="font-mono text-xs text-text-muted">{String(r.id).slice(0, 8)}</span> },
    { key: 'user',   header: 'Customer',  render: (r: Record<string, unknown>) => <span className="text-sm">{(r.user as Record<string, unknown>)?.name as string}</span> },
    { key: 'items',  header: 'Items',     render: (r: Record<string, unknown>) => <span>{(r.items as unknown[])?.length ?? 0}</span> },
    { key: 'total',  header: 'Total',     render: (r: Record<string, unknown>) => <span className="tabular-nums">₹{Number(r.total).toFixed(2)}</span> },
    { key: 'status', header: 'Status',    render: (r: Record<string, unknown>) => <Badge label={r.status as string} variant={STATUS_VARIANT[r.status as string] ?? 'default'} /> },
    { key: 'date',   header: 'Placed',    render: (r: Record<string, unknown>) => <span className="text-xs text-text-muted">{format(new Date(r.createdAt as string), 'dd MMM yy, hh:mm a')}</span> },
  ];

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-bold text-text">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by order ID or customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-white text-text focus:outline-none"
        >
          <option value="">All statuses</option>
          {['PENDING','CONFIRMED','PACKED','DISPATCHED','DELIVERED','CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <Card>
        {isLoading ? <Spinner /> : orders.length === 0
          ? <Empty icon={ShoppingBag} title="No orders found" description="Try adjusting your filters." />
          : <Table
              columns={columns}
              data={orders}
              onRowClick={(r) => navigate(`/orders/${(r as Record<string, unknown>).id}`)}
            />
        }
      </Card>
    </div>
  );
}
