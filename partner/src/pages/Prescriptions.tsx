import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerRxApi } from '@/services/api';
import { Badge, Button, Card, Empty, Spinner } from '@/components/ui';

export function PrescriptionsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['partner-rx'],
    queryFn:  () => partnerRxApi.pending(),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      partnerRxApi.verify(id, { status, notes }),
    onSuccess: () => { toast.success('Prescription updated'); qc.invalidateQueries({ queryKey: ['partner-rx'] }); },
    onError:   () => toast.error('Failed to update prescription'),
  });

  const prescriptions: any[] = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-text">Prescriptions</h1>
        <p className="text-xs text-text-muted mt-0.5">Review and verify pending prescriptions</p>
      </div>

      <Card>
        {isLoading ? <Spinner /> : prescriptions.length === 0 ? (
          <Empty icon={FileText} title="No pending prescriptions" description="Prescription verification requests will appear here." />
        ) : (
          <div className="divide-y divide-border">
            {prescriptions.map((rx: any) => (
              <div key={rx.id} className="px-5 py-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-text">{rx.patientName ?? rx.user?.name ?? 'Patient'}</p>
                      <Badge
                        label={rx.status}
                        variant={rx.status==='VERIFIED'?'success':rx.status==='REJECTED'?'error':'warning'}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {rx.fileName} · {(rx.fileSize / 1024).toFixed(0)} KB
                    </p>
                    <p className="text-xs text-text-faint">
                      {new Date(rx.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                    {rx.doctorName && <p className="text-xs text-text-muted mt-1">Dr. {rx.doctorName}</p>}
                  </div>

                  {rx.imageUrl && (
                    <a href={rx.imageUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={rx.imageUrl}
                        alt="Prescription"
                        className="w-16 h-16 object-cover rounded-lg border border-border flex-shrink-0 hover:opacity-80 transition-opacity"
                      />
                    </a>
                  )}
                </div>

                {rx.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<CheckCircle size={13} />}
                      onClick={() => verifyMutation.mutate({ id: rx.id, status: 'VERIFIED' })}
                      loading={verifyMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={<XCircle size={13} />}
                      onClick={() => verifyMutation.mutate({ id: rx.id, status: 'REJECTED', notes: 'Rejected by pharmacist' })}
                    >
                      Reject
                    </Button>
                    {rx.imageUrl && (
                      <a href={rx.imageUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" icon={<Eye size={13} />}>Full view</Button>
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
