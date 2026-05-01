import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminPartnersApi } from '@/api/partners.api';

type PharmacyStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

type Pharmacy = {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  city: string;
  status: PharmacyStatus;
  commissionRate: number;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  APPROVED:  'bg-green-100  text-green-800',
  REJECTED:  'bg-red-100    text-red-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
};

const TABS: PharmacyStatus[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

export function PartnersPage() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState<PharmacyStatus>('ALL');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading]     = useState(true);
  const [acting, setActing]       = useState<string | null>(null);

  const load = async (status: PharmacyStatus) => {
    setLoading(true);
    try {
      const res = await adminPartnersApi.list(status === 'ALL' ? undefined : status);
      setPharmacies(res.data?.pharmacies ?? res.data ?? []);
    } catch { setPharmacies([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(tab); }, [tab]);

  const quickReview = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setActing(id);
    try {
      await adminPartnersApi.review(id, action);
      load(tab);
    } catch { alert('Action failed'); }
    finally { setActing(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Pharmacies</h1>
          <p className="text-sm text-gray-500 mt-1">Manage onboarding, approval and suspension</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pharmacies.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏥</p>
          <p className="text-lg font-medium">No pharmacies in this status</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                {['Pharmacy', 'Owner', 'City', 'Commission', 'Applied', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pharmacies.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/partners/${p.id}`)}
                >
                  <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.ownerName}</td>
                  <td className="px-4 py-3 text-gray-500">{p.city}</td>
                  <td className="px-4 py-3 text-gray-500">{p.commissionRate}%</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[p.status] ?? ''}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {p.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          disabled={acting === p.id}
                          onClick={() => quickReview(p.id, 'APPROVED')}
                          className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          disabled={acting === p.id}
                          onClick={() => quickReview(p.id, 'REJECTED')}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {p.status === 'APPROVED' && (
                      <button
                        onClick={() => navigate(`/partners/${p.id}`)}
                        className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
