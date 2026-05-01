import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Pill, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminMedicinesApi } from '@/services/api';
import { Badge, Button, Card, Empty, Input, Spinner, Table } from '@/components/ui';

export function MedicinesPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-medicines', search],
    queryFn:  () => adminMedicinesApi.list({ search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminMedicinesApi.delete(id),
    onSuccess: () => {
      toast.success('Medicine deleted');
      qc.invalidateQueries({ queryKey: ['admin-medicines'] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  const medicines = data?.data?.data ?? [];

  const columns = [
    { key: 'name',     header: 'Name',         render: (r: Record<string, unknown>) => <span className="font-medium">{r.name as string}</span> },
    { key: 'brand',    header: 'Brand',         render: (r: Record<string, unknown>) => <span className="text-text-muted">{r.brand as string}</span> },
    { key: 'category', header: 'Category',      render: (r: Record<string, unknown>) => <span className="text-xs">{r.category as string}</span> },
    { key: 'price',    header: 'Price',         render: (r: Record<string, unknown>) => <span className="tabular-nums">₹{Number(r.price).toFixed(2)}</span> },
    { key: 'stock',    header: 'Stock',         render: (r: Record<string, unknown>) => <span className={Number(r.stock) < 10 ? 'text-error font-semibold' : ''}>{r.stock as number}</span> },
    { key: 'rx',       header: 'Rx',            render: (r: Record<string, unknown>) => r.requiresPrescription ? <Badge label="Rx" variant="warning" /> : null },
    {
      key: 'actions', header: '',
      render: (r: Record<string, unknown>) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/medicines/${r.id}/edit`); }} className="text-text-muted hover:text-primary transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this medicine?')) deleteMutation.mutate(r.id as string); }} className="text-text-muted hover:text-error transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-text">Medicines</h1>
        <Button icon={<Plus size={14} />} size="sm" onClick={() => navigate('/medicines/new')}>
          Add medicine
        </Button>
      </div>

      <Input
        placeholder="Search by name, brand or category"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-72"
      />

      <Card>
        {isLoading ? <Spinner /> : medicines.length === 0
          ? <Empty icon={Pill} title="No medicines found" description="Add your first medicine." />
          : <Table columns={columns} data={medicines} />
        }
      </Card>
    </div>
  );
}
