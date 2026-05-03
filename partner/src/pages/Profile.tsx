import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Store } from 'lucide-react';
import { partnerProfileApi } from '@/services/api';
import { Button, Card, Input, Spinner } from '@/components/ui';

const schema = z.object({
  operatingHours: z.string().min(1, 'Required'),
  phone:          z.string().min(10, 'Required'),
  email:          z.string().email('Invalid email').optional().or(z.literal('')),
  address:        z.string().min(5, 'Required'),
  city:           z.string().min(2, 'Required'),
  state:          z.string().min(2, 'Required'),
  pincode:        z.string().length(6, 'Must be 6 digits'),
  deliveryRadius: z.coerce.number().min(1).max(50),
});
type FormData = z.infer<typeof schema>;

export function ProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['partner-profile'],
    queryFn:  () => partnerProfileApi.get(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const pharmacy = data?.data?.data?.pharmacy ?? data?.data?.pharmacy;

  useEffect(() => {
    if (pharmacy) {
      reset({
        operatingHours: pharmacy.operatingHours ?? '',
        phone:          pharmacy.phone          ?? '',
        email:          pharmacy.email          ?? '',
        address:        pharmacy.address        ?? '',
        city:           pharmacy.city           ?? '',
        state:          pharmacy.state          ?? '',
        pincode:        pharmacy.pincode        ?? '',
        deliveryRadius: pharmacy.deliveryRadius ?? 5,
      });
    }
  }, [pharmacy, reset]);

  const updateMutation = useMutation({
    mutationFn: (body: FormData) => partnerProfileApi.update(body),
    onSuccess:  () => toast.success('Profile updated'),
    onError:    () => toast.error('Failed to update profile'),
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-text">Pharmacy Profile</h1>
        <p className="text-xs text-text-muted mt-0.5">Update your pharmacy details</p>
      </div>

      {pharmacy && (
        <Card title="Registration Info">
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Pharmacy Name',    value: pharmacy.name },
              { label: 'Drug License No.', value: pharmacy.licenseNumber },
              { label: 'GST Number',       value: pharmacy.gstNumber },
              { label: 'Status',           value: pharmacy.status },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-text-muted">{label}</p>
                <p className="text-sm font-semibold text-text mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Operational Details" action={<Store size={15} className="text-text-muted" />}>
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Contact Phone"      {...register('phone')}          error={errors.phone?.message} />
            <Input label="Contact Email"      {...register('email')}          error={errors.email?.message} />
            <Input label="Operating Hours"    placeholder="09:00-21:00" {...register('operatingHours')} error={errors.operatingHours?.message} />
            <Input label="Delivery Radius (km)" type="number" {...register('deliveryRadius')} error={errors.deliveryRadius?.message} />
          </div>
          <Input label="Address"  {...register('address')} error={errors.address?.message} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="City"    {...register('city')}    error={errors.city?.message} />
            <Input label="State"   {...register('state')}   error={errors.state?.message} />
            <Input label="Pincode" {...register('pincode')} error={errors.pincode?.message} />
          </div>
          <div className="pt-2">
            <Button type="submit" loading={isSubmitting || updateMutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
