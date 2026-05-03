import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Phone, KeyRound, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { partnerAuthApi } from '@/services/api';
import { Button, Input } from '@/components/ui';

const phoneSchema = z.object({ phone: z.string().min(10, 'Enter valid phone').regex(/^\+?[0-9]{10,13}$/, 'Invalid phone') });
const otpSchema   = z.object({ otp: z.string().length(6, 'OTP must be 6 digits') });

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm   = z.infer<typeof otpSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { verifyOtp, isLoading } = useAuthStore();
  const [step,  setStep]  = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const otpForm   = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const onSendOtp = async ({ phone: p }: PhoneForm) => {
    try {
      const formatted = p.startsWith('+') ? p : `+91${p}`;
      await partnerAuthApi.sendOtp(formatted);
      setPhone(formatted);
      setStep('otp');
      toast.success('OTP sent');
    } catch {
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const onVerifyOtp = async ({ otp }: OtpForm) => {
    try {
      await verifyOtp(phone, otp);
      navigate('/dashboard');
    } catch {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">VM</span>
          </div>
          <h1 className="text-xl font-bold text-text">VaidyaMarg</h1>
          <p className="text-sm text-text-muted mt-1">Partner Portal</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          {step === 'phone' ? (
            <>
              <div className="mb-6">
                <h2 className="text-base font-bold text-text">Sign in</h2>
                <p className="text-xs text-text-muted mt-1">Enter your registered phone number</p>
              </div>
              <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="space-y-4">
                <Input
                  label="Phone Number"
                  placeholder="+91 9XXXXXXXXX"
                  icon={<Phone size={14} />}
                  {...phoneForm.register('phone')}
                  error={phoneForm.formState.errors.phone?.message}
                />
                <Button type="submit" className="w-full justify-center" loading={phoneForm.formState.isSubmitting} icon={<ArrowRight size={14} />}>
                  Send OTP
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-base font-bold text-text">Enter OTP</h2>
                <p className="text-xs text-text-muted mt-1">Sent to <span className="font-semibold text-text">{phone}</span></p>
              </div>
              <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
                <Input
                  label="6-digit OTP"
                  placeholder="123456"
                  maxLength={6}
                  inputMode="numeric"
                  {...otpForm.register('otp')}
                  error={otpForm.formState.errors.otp?.message}
                />
                <Button type="submit" className="w-full justify-center" loading={isLoading} icon={<KeyRound size={14} />}>
                  Verify & Sign in
                </Button>
                <button type="button" onClick={() => setStep('phone')} className="w-full text-xs text-text-muted hover:text-text transition-colors text-center">
                  ← Change phone number
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-xs text-text-faint mt-6">Only registered pharmacy partners can log in.</p>
      </div>
    </div>
  );
}
