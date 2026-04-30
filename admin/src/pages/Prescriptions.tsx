import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';

const STATUS_TABS = ['ALL', 'PENDING', 'VERIFIED', 'REJECTED'];

export default function Prescriptions() {
  const navigate = useNavigate();
  const [tab,    setTab]    = useState('PENDING');
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-prescriptions', tab, search, page],
    queryFn:  () => api.get('/prescriptions/admin/list', {
      params: { status: tab === 'ALL' ? undefined : tab, search, page, limit: 20 },
    }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });

  const STATUS_COLOR: Record<string, string> = {
    PENDING:  'bg-amber-50 text-amber-700 border-amber-200',
    VERIFIED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50   text-red-700   border-red-200',
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#28251d]">Prescriptions</h1>
        <span className="text-[13px] text-[#7a7974]">{data?.total ?? 0} total</span>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bab9b4]" />
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by patient name or phone…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#dcd9d5] rounded-xl text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-white border border-[#dcd9d5] rounded-xl p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                tab === t ? 'bg-primary text-white' : 'text-[#7a7974] hover:text-[#28251d]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#dcd9d5] overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-[#7a7974] text-sm">Loading…</div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-[#7a7974] text-sm">No prescriptions found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#dcd9d5] bg-[#f7f6f2]">
                {['Patient', 'Submitted', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[#7a7974] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f0ec]">
              {data.items.map((rx: any) => (
                <tr key={rx.id} className="hover:bg-[#f9f8f5] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-semibold text-[#28251d]">{rx.user?.name || 'Unknown'}</p>
                    <p className="text-[11px] text-[#7a7974]">+91 {rx.user?.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[#7a7974]">
                    {formatDistanceToNow(new Date(rx.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      STATUS_COLOR[rx.status] || 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {rx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => navigate(`/prescriptions/${rx.id}`)}
                      className="text-[12px] text-primary font-semibold hover:underline"
                    >
                      {rx.status === 'PENDING' ? 'Review →' : 'View →'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
                p === page ? 'bg-primary text-white' : 'bg-white border border-[#dcd9d5] text-[#7a7974] hover:border-primary'
              }`}
            >{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
