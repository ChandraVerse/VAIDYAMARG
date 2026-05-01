import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminMedicinesApi } from '@/services/api';
import { Button, Card, Input } from '@/components/ui';

const schema = z.object({
  name:                 z.string().min(2),
  brand:                z.string().min(1),
  genericName:          z.string().optional(),
  category:             z.string().min(1),
  description:          z.string().optional(),
  price:                z.number({ coerce: true }).positive(),
  stock:                z.number({ coerce: true }).int().nonnegative(),
  unit:                 z.string().min(1),
  requiresPrescription: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function MedicineFormPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const isEdit   = Boolean(id);

  const { data } = useQuery({
    queryKey: ['medicine', id],
    queryFn:  () => adminMedicinesApi.detail(id!),
    enabled:  isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { requiresPrescription: false },
  });

  useEffect(() => {
    if (data?.data?.data) reset(data.data.data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (vals: FormData) =>
      isEdit ? adminMedicinesApi.update(id!, vals) : adminMedicinesApi.create(vals),
    onSuccess: () => {
      toast.success(`Medicine ${isEdit ? 'updated' : 'created'}`);
      qc.invalidateQueries({ queryKey: ['admin-medicines'] });
      navigate('/medicines');
    },
    onError: () => toast.error('Failed to save medicine'),
  });

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={15} /> Back
      </button>
      <h1 className="text-lg font-bold text-text">{isEdit ? 'Edit Medicine' : 'Add Medicine'}</h1>

      <Card>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="p-5 grid grid-cols-2 gap-4">
          <Input label="Name *"        {...register('name')}        error={errors.name?.message}      className="col-span-2" />
          <Input label="Brand *"       {...register('brand')}       error={errors.brand?.message} />
          <Input label="Generic Name"  {...register('genericName')} />
          <Input label="Category *"    {...register('category')}    error={errors.category?.message} />
          <Input label="Unit *"        {...register('unit')}        error={errors.unit?.message} />
          <Input label="Price (INR) *" {...register('price')}       error={errors.price?.message}     type="number" step="0.01" />
          <Input label="Stock *"       {...register('stock')}       error={errors.stock?.message}     type="number" />

          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-text">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <label className="col-span-2 flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('requiresPrescription')} className="accent-primary" />
            <span className="text-sm text-text">Requires prescription</span>
          </label>

          <div className="col-span-2 flex gap-3">
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? 'Save changes' : 'Add medicine'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
