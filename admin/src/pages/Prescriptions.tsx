import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminPrescriptionsApi } from '@/services/api';
import { Badge, Button, Card, Empty, Spinner, Table } from '@/components/ui';

export function PrescriptionsPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes,      setNotes]      = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rx'],
    queryFn:  () => adminPrescriptionsApi.pending(),
  });

  const verify = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes: string }) =>
      adminPrescriptionsApi.verify(id, { status, notes }),
    onSuccess: () => {
      toast.success('Prescription updated');
      setSelectedId(null);
      setNotes('');
      qc.invalidateQueries({ queryKey: ['admin-rx'] });
    },
    onError: () => toast.error('Failed to update prescription'),
  });

  const prescriptions = data?.data?.data ?? [];
  const selected      = prescriptions.find((p: Record<string, unknown>) => p.id === selectedId);

  const columns = [
    { key: 'id',       header: 'ID',       render: (r: Record<string, unknown>) => <span className="font-mono text-xs text-text-muted">{String(r.id).slice(0, 8)}</span> },
    { key: 'patient',  header: 'Patient',  render: (r: Record<string, unknown>) => <span>{(r.user as Record<string, unknown>)?.name as string}</span> },
    { key: 'uploaded', header: 'Uploaded', render: (r: Record<string, unknown>) => <span className="text-xs text-text-muted">{format(new Date(r.createdAt as string), 'dd MMM yy')}</span> },
    { key: 'status',   header: 'Status',   render: (r: Record<string, unknown>) => <Badge label={r.status as string} variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'error' : 'warning'} /> },
  ];

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-bold text-text">Prescriptions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-3">
          <Card title={`Pending (${prescriptions.length})`}>
            {isLoading ? <Spinner /> : prescriptions.length === 0
              ? <Empty icon={FileText} title="All clear" description="No pending prescriptions." />
              : <Table
                  columns={columns}
                  data={prescriptions}
                  onRowClick={(r) => setSelectedId((r as Record<string, unknown>).id as string)}
                />
            }
          </Card>
        </div>

        {/* Review panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card title="Review Prescription">
              <div className="p-5 space-y-4">
                <img
                  src={selected.imageUrl as string}
                  alt="Prescription"
                  className="w-full rounded-lg border border-border object-contain max-h-72"
                />
                <div>
                  <p className="text-xs text-text-muted mb-1">Patient</p>
                  <p className="text-sm font-medium">{(selected.user as Record<string, unknown>)?.name as string}</p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Pharmacist notes (optional)"
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle size={14} />}
                    loading={verify.isPending}
                    onClick={() => verify.mutate({ id: selectedId!, status: 'APPROVED', notes })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<XCircle size={14} />}
                    loading={verify.isPending}
                    onClick={() => verify.mutate({ id: selectedId!, status: 'REJECTED', notes })}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <Empty icon={FileText} title="Select a prescription" description="Click a row to review it." />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
