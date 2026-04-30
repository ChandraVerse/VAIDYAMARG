import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ShoppingBag,
  Pill, BarChart3, LogOut, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/prescriptions', icon: FileText,         label: 'Prescriptions'  },
  { to: '/orders',        icon: ShoppingBag,      label: 'Orders'         },
  { to: '/medicines',     icon: Pill,             label: 'Medicines'      },
  { to: '/analytics',     icon: BarChart3,        label: 'Analytics'      },
];

export default function Layout() {
  const navigate = useNavigate();
  const logout   = useAuthStore((s) => s.logout);
  const admin    = useAuthStore((s) => s.admin);
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f6f2]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-[#dcd9d5]
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#dcd9d5]">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="VaidyaMarg">
            <rect width="32" height="32" rx="8" fill="#01696f"/>
            <path d="M8 10h4l4 10 4-10h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="16" cy="24" r="2" fill="white"/>
          </svg>
          <div>
            <p className="font-bold text-[15px] text-[#28251d] leading-tight">VaidyaMarg</p>
            <p className="text-[10px] text-[#7a7974] font-medium uppercase tracking-wide">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-[#7a7974] hover:bg-[#f3f0ec] hover:text-[#28251d]'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-[#dcd9d5]">
          <p className="text-[12px] font-semibold text-[#28251d] truncate">{admin?.name || 'Pharmacist'}</p>
          <p className="text-[11px] text-[#7a7974] mt-0.5">{admin?.role || 'PHARMACIST'}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-[12px] text-[#a12c7b] hover:text-[#7d1e5e] font-medium transition-colors"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#dcd9d5] lg:hidden">
          <button onClick={() => setOpen(true)} className="p-1 rounded-lg hover:bg-[#f3f0ec]">
            <Menu size={20} />
          </button>
          <p className="font-bold text-[15px]">VaidyaMarg Admin</p>
          <div className="w-7" />
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
