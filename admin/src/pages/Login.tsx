import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);
  const [phone,  setPhone]  = useState('');
  const [otp,    setOtp]    = useState('');
  const [step,   setStep]   = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (phone.length !== 10) { toast.error('Enter a valid 10-digit phone number'); return; }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone, role: 'PHARMACIST' });
      setStep('otp');
      toast.success('OTP sent!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      await login(phone, otp);
      navigate('/dashboard');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2] px-4">
      <div className="bg-white rounded-2xl border border-[#dcd9d5] shadow-sm p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#01696f"/>
            <path d="M8 10h4l4 10 4-10h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="16" cy="24" r="2" fill="white"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-center text-[#28251d] mb-1">Admin Login</h1>
        <p className="text-sm text-center text-[#7a7974] mb-6">VaidyaMarg Pharmacist Portal</p>

        {step === 'phone' ? (
          <>
            <label className="block text-[13px] font-semibold text-[#28251d] mb-1.5">Phone number</label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-[#f3f0ec] border border-[#dcd9d5] rounded-xl text-sm font-medium text-[#7a7974]">+91</span>
              <input
                type="tel" maxLength={10}
                value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                placeholder="98XXXXXXXX"
                className="flex-1 px-4 py-2.5 bg-[#f3f0ec] border border-[#dcd9d5] rounded-xl text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={sendOtp} disabled={loading}
              className="mt-4 w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <p className="text-[13px] text-[#7a7974] mb-3">OTP sent to +91 {phone}</p>
            <label className="block text-[13px] font-semibold text-[#28251d] mb-1.5">Enter OTP</label>
            <input
              type="text" maxLength={6}
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
              placeholder="······"
              className="w-full px-4 py-2.5 text-center tracking-[0.5em] text-lg font-bold bg-[#f3f0ec] border border-[#dcd9d5] rounded-xl outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={verifyOtp} disabled={loading}
              className="mt-4 w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>
            <button onClick={() => setStep('phone')} className="mt-2 w-full py-2 text-[13px] text-[#7a7974] hover:text-[#28251d] transition-colors">
              ← Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
