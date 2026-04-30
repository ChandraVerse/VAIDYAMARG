import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ZoomIn, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { formatDistanceToNow, format } from 'date-fns';

export default function PrescriptionDetail() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const [notes, setNotes]   = useState('');
  const [zoom,  setZoom]    = useState(false);

  const { data: rx, isLoading } = useQuery({
    queryKey: ['rx-detail', id],
    queryFn:  () => api.get(`/prescriptions/${id}`).then((r) => r.data.data),
  });

  const verifyMutation = useMutation({
    mutationFn: (payload: { status: 'VERIFIED' | 'REJECTED'; notes?: string }) =>
      api.patch(`/prescriptions/${id}/verify`, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-rx'] });
      toast.success(vars.status === 'VERIFIED' ? '✅ Prescription verified!' : '❌ Prescription rejected');
      navigate('/prescriptions');
    },
    onError: () => toast.error('Action failed. Please try again.'),
  });

  if (isLoading || !rx) {
    return <div className="py-20 text-center text-[#7a7974] text-sm">Loading prescription…</div>;
  }

  const alreadyActioned = rx.status !== 'PENDING';

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate('/prescriptions')}
        className="flex items-center gap-2 text-[13px] text-[#7a7974] hover:text-[#28251d] font-medium mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Prescriptions
      </button>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Image panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-[#dcd9d5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#dcd9d5]">
              <h2 className="font-bold text-[15px] text-[#28251d]">Prescription Image</h2>
              <button
                onClick={() => setZoom(true)}
                className="flex items-center gap-1.5 text-[12px] text-primary font-medium hover:underline"
              >
                <ZoomIn size={14} /> Full screen
              </button>
            </div>
            {rx.imageUrl ? (
              <img
                src={rx.imageUrl}
                alt="Prescription"
                className="w-full object-contain max-h-[500px] bg-[#f3f0ec] cursor-zoom-in"
                onClick={() => setZoom(true)}
              />
            ) : (
              <div className="h-64 flex items-center justify-center bg-[#f3f0ec]">
                <p className="text-sm text-[#7a7974]">Image not available</p>
              </div>
            )}
          </div>

          {/* OCR extracted text if available */}
          {rx.ocrText && (
            <div className="mt-4 bg-white rounded-2xl border border-[#dcd9d5] p-5">
              <h3 className="font-bold text-[13px] text-[#28251d] mb-2">🤖 OCR Extracted Text</h3>
              <pre className="text-[12px] text-[#7a7974] whitespace-pre-wrap leading-relaxed font-mono bg-[#f7f6f2] rounded-xl p-4">
                {rx.ocrText}
              </pre>
            </div>
          )}
        </div>

        {/* Detail + action panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient info */}
          <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
            <h3 className="font-bold text-[14px] text-[#28251d] mb-3">Patient Info</h3>
            <dl className="space-y-2">
              <Row label="Name"     value={rx.user?.name || '—'} />
              <Row label="Phone"    value={`+91 ${rx.user?.phone}`} />
              <Row label="Submitted" value={formatDistanceToNow(new Date(rx.createdAt), { addSuffix: true })} />
              <Row label="Date"     value={format(new Date(rx.createdAt), 'dd MMM yyyy, h:mm a')} />
              <Row label="Status"   value={rx.status} bold />
            </dl>
          </div>

          {/* Action card */}
          {!alreadyActioned ? (
            <div className="bg-white rounded-2xl border border-[#dcd9d5] p-5">
              <h3 className="font-bold text-[14px] text-[#28251d] mb-3">Pharmacist Decision</h3>
              <label className="block text-[12px] font-semibold text-[#7a7974] mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add rejection reason or verification note…"
                className="w-full px-3 py-2.5 text-sm bg-[#f3f0ec] border border-[#dcd9d5] rounded-xl outline-none focus:border-primary resize-none transition-colors"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => verifyMutation.mutate({ status: 'VERIFIED', notes })}
                  disabled={verifyMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-60"
                >
                  <CheckCircle size={15} /> Approve
                </button>
                <button
                  onClick={() => {
                    if (!notes) { toast.error('Please add a rejection reason'); return; }
                    verifyMutation.mutate({ status: 'REJECTED', notes });
                  }}
                  disabled={verifyMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-60"
                >
                  <XCircle size={15} /> Reject
                </button>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl border p-5 ${
              rx.status === 'VERIFIED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <p className="text-[14px] font-bold ${
                rx.status === 'VERIFIED' ? 'text-green-700' : 'text-red-600'
              }">
                {rx.status === 'VERIFIED' ? '✅ Prescription Verified' : '❌ Prescription Rejected'}
              </p>
              {rx.pharmacistNotes && (
                <p className="mt-2 text-[13px] text-[#7a7974]">{rx.pharmacistNotes}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zoom modal */}
      {zoom && rx.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoom(false)}
        >
          <img src={rx.imageUrl} alt="Prescription" className="max-h-full max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-[12px] gap-4">
      <span className="text-[#7a7974] font-medium">{label}</span>
      <span className={`text-[#28251d] text-right ${bold ? 'font-bold' : ''}`}>{value}</span>
    </div>
  );
}
