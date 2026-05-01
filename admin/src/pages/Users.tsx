import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users as UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import { adminUsersApi } from '@/services/api';
import { Card, Empty, Input, Spinner, Table } from '@/components/ui';

export function UsersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn:  () => adminUsersApi.list({ search: search || undefined }),
  });

  const users = data?.data?.data ?? [];

  const columns = [
    { key: 'name',    header: 'Name',     render: (r: Record<string, unknown>) => <span className="font-medium">{r.name as string}</span> },
    { key: 'phone',   header: 'Phone',    render: (r: Record<string, unknown>) => <span className="tabular-nums text-text-muted">{r.phone as string}</span> },
    { key: 'email',   header: 'Email',    render: (r: Record<string, unknown>) => <span className="text-text-muted">{r.email as string ?? '—'}</span> },
    { key: 'orders',  header: 'Orders',   render: (r: Record<string, unknown>) => <span>{(r._count as Record<string, unknown>)?.orders as number ?? 0}</span> },
    { key: 'joined',  header: 'Joined',   render: (r: Record<string, unknown>) => <span className="text-xs text-text-muted">{format(new Date(r.createdAt as string), 'dd MMM yyyy')}</span> },
  ];

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-bold text-text">Users</h1>

      <Input
        placeholder="Search by name or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-72"
      />

      <Card>
        {isLoading ? <Spinner /> : users.length === 0
          ? <Empty icon={UsersIcon} title="No users found" />
          : <Table columns={columns} data={users} />
        }
      </Card>
    </div>
  );
}
