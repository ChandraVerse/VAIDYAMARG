import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pill, AlertTriangle, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerMedicinesApi } from '@/services/api';
import { Badge, Button, Card, Empty, Input, Spinner } from '@/components/ui';

export function InventoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Record<string, number>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['partner-inventory', search],
    queryFn:  () => partnerMedicinesApi.list(search ? { search } : undefined),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      partnerMedicinesApi.update(id, { stock }),
    onSuccess: () => {
      toast.success('Stock updated');
      setEditing({});
      qc.invalidateQueries({ queryKey: ['partner-inventory'] });
    },
    onError: () => toast.error('Failed to update stock'),
  });

  const medicines: any[] = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text">Inventory</h1>
          <p className="text-xs text-text-muted mt-0.5">Update medicine stock levels</p>
        </div>
        <div className="w-64">
          <Input
            placeholder="Search medicines…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {medicines.filter((m) => m.stock < 10).length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20 text-sm text-warning">
          <AlertTriangle size={16} strokeWidth={2} />
          <span className="font-semibold">{medicines.filter((m) => m.stock < 10).length} items</span> are low in stock (under 10 units)
        </div>
      )}

      <Card>
        {isLoading ? <Spinner /> : medicines.length === 0 ? (
          <Empty icon={Pill} title="No medicines found" description="Try a different search term." />
        ) : (
          <div className="divide-y divide-border">
            {medicines.map((med: any) => {
              const editVal = editing[med.id];
              const isEditing = editVal !== undefined;
              const isLow = med.stock < 10;

              return (
                <div key={med.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Pill size={14} className="text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-text">{med.name}</p>
                      {med.requiresRx && <Badge label="Rx" variant="warning" />}
                      {isLow && <Badge label="Low Stock" variant="error" />}
                    </div>
                    <p className="text-xs text-text-muted">{med.genericName} · {med.category}</p>
                    <p className="text-xs text-text-muted">MRP ₹{med.mrp} · Generic ₹{med.genericPrice}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          min={0}
                          value={editVal}
                          onChange={(e) => setEditing((prev) => ({ ...prev, [med.id]: Number(e.target.value) }))}
                          className="w-20 px-2 py-1.5 text-sm border border-primary rounded-lg outline-none text-center tabular-nums"
                        />
                        <Button
                          size="sm"
                          icon={<Save size={13} />}
                          loading={updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ id: med.id, stock: editVal })}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing((prev) => { const n={...prev}; delete n[med.id]; return n; })}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className={`text-sm font-bold tabular-nums ${isLow ? 'text-error' : 'text-text'}`}>
                          {med.stock} units
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditing((prev) => ({ ...prev, [med.id]: med.stock }))}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
