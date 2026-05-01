import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminPartnersApi } from '@/api/partners.api';

type Earning = {
  id: string;
  orderId: string;
  orderAmount: number;
  commission: number;
  netEarning: number;
  settledAt: string | null;
  createdAt: string;
};

type Pharmacy = {
  id: string;
  name: string;
  status: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  drugLicenseNo: string;
  gstNo: string;
  commissionRate: number;
  deliveryRadius: number;
  operatingHours: string;
  isActive: boolean;
  createdAt: string;
  earnings: Earning[];
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  APPROVED:  'bg-green-100  text-green-800',
  REJECTED:  'bg-red-100    text-red-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
};

export function PartnerDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [suspendReason, setSuspendReason]     = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminPartnersApi.get(id!);
      setPharmacy(res.data?.pharmacy ?? res.data);
    } catch { alert('Could not load pharmacy'); navigate(-1); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const act = async (fn: () => Promise<any>) => {
    setActing(true);
    try { await fn(); await load(); }
    catch { alert('Action failed'); }
    finally { setActing(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!pharmacy) return null;

  const totalEarnings = pharmacy.earnings.reduce((s, e) => s + e.netEarning, 0);
  const unsettled     = pharmacy.earnings.filter((e) => !e.settledAt).reduce((s, e) => s + e.netEarning, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="text-sm text-teal-600 hover:underline">
        ← Back to Partners
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pharmacy.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{pharmacy.address}, {pharmacy.city}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[pharmacy.status] ?? ''}`}>
                {pharmacy.status}
              </span>
              <span className="text-xs text-gray-400">Commission: {pharmacy.commissionRate}%</span>
              <span className="text-xs text-gray-400">Radius: {pharmacy.deliveryRadius} km</span>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex flex-col gap-2 items-end">
            {pharmacy.status === 'PENDING' && (
              <>
                <button
                  disabled={acting}
                  onClick={() => act(() => adminPartnersApi.review(id!, 'APPROVED'))}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  ✓ Approve
                </button>
                <button
                  disabled={acting}
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </>
            )}
            {pharmacy.status === 'APPROVED' && (
              <button
                disabled={acting}
                onClick={() => setShowSuspendModal(true)}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                Suspend
              </button>
            )}
            {pharmacy.status === 'SUSPENDED' && (
              <button
                disabled={acting}
                onClick={() => act(() => adminPartnersApi.reinstate(id!))}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
              >
                Reinstate
              </button>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          {[
            ['Owner',          pharmacy.ownerName],
            ['Phone',          pharmacy.phone],
            ['Email',          pharmacy.email],
            ['Drug License',   pharmacy.drugLicenseNo],
            ['GST No.',        pharmacy.gstNo],
            ['Operating Hrs',  pharmacy.operatingHours ?? '—'],
            ['Active',         pharmacy.isActive ? 'Yes' : 'No'],
            ['Joined',         new Date(pharmacy.createdAt).toLocaleDateString('en-IN')],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings summary */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Earned',  value: `₹${totalEarnings.toFixed(2)}`, color: 'text-teal-700' },
          { label: 'Unsettled',     value: `₹${unsettled.toFixed(2)}`,     color: 'text-orange-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Earnings table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Earnings</h2>
        </div>
        {pharmacy.earnings.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No earnings yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {['Order', 'Order Amount', 'Commission', 'Net Earning', 'Date', 'Settled'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pharmacy.earnings.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{e.orderId.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3">₹{Number(e.orderAmount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-orange-600">₹{Number(e.commission).toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold text-teal-700">₹{Number(e.netEarning).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    {e.settledAt
                      ? <span className="text-green-600 font-semibold">Yes</span>
                      : <span className="text-orange-500">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 mb-3">Reject application</h3>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm h-24 resize-none"
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  act(() => adminPartnersApi.review(id!, 'REJECTED', rejectReason));
                  setShowRejectModal(false);
                }}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700"
              >
                Confirm rejection
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 mb-3">Suspend pharmacy</h3>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm h-24 resize-none"
              placeholder="Reason for suspension *"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                disabled={!suspendReason.trim()}
                onClick={() => {
                  act(() => adminPartnersApi.suspend(id!, suspendReason));
                  setShowSuspendModal(false);
                }}
                className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-40"
              >
                Confirm suspension
              </button>
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
