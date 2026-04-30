import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Medicines() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-medicines', search, page],
    queryFn:  () => api.get('/medicines/admin/list', {
      params: { search, page, limit: 20 },
    }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, inStock }: any) => api.patch(`/medicines/${id}`, { inStock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-medicines'] });
      toast.success('Medicine updated!');
    },
  });

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#28251d]">Medicines</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded-xl hover:bg-primary-hover transition-colors">
          <Plus size={15} /> Add Medicine
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bab9b4]" />
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search medicines…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#dcd9d5] rounded-xl text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#dcd9d5] overflow-x-auto">
        {isLoading ? (
          <div className="py-16 text-center text-[#7a7974] text-sm">Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#dcd9d5] bg-[#f7f6f2]">
                {['Name', 'Generic Name', 'Price', 'MRP', 'Category', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-[#7a7974] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f0ec]">
              {data?.items?.map((med: any) => (
                <tr key={med.id} className="hover:bg-[#f9f8f5] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold text-[#28251d]">{med.name}</p>
                    <p className="text-[10px] text-[#bab9b4] font-mono">{med.id.slice(-6)}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#7a7974]">{med.genericName}</td>
                  <td className="px-4 py-3 text-[13px] font-bold text-primary">₹{med.price}</td>
                  <td className="px-4 py-3 text-[12px] text-[#7a7974] line-through">₹{med.mrp}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold bg-[#f3f0ec] text-[#7a7974] px-2 py-0.5 rounded-md">
                      {med.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate({ id: med.id, inStock: !med.inStock })}
                      className="transition-colors"
                    >
                      {med.inStock
                        ? <ToggleRight size={22} className="text-success" />
                        : <ToggleLeft  size={22} className="text-[#bab9b4]" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-[#f3f0ec] text-[#7a7974] hover:text-[#28251d] transition-colors">
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
