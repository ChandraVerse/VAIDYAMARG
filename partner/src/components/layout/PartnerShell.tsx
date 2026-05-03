import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, FileText,
  Pill, IndianRupee, User, LogOut, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/orders',        icon: ShoppingBag,     label: 'Orders'        },
  { to: '/prescriptions', icon: FileText,        label: 'Prescriptions' },
  { to: '/inventory',     icon: Pill,            label: 'Inventory'     },
  { to: '/earnings',      icon: IndianRupee,     label: 'Earnings'      },
  { to: '/profile',       icon: User,            label: 'Profile'       },
];

export function PartnerShell() {
  const { user, logout, loadSession } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => { loadSession(); }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const pharmacy = user?.pharmacy;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f6f2]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-56 bg-white border-r border-border
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">VM</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-text">VaidyaMarg</p>
            <p className="text-xs text-text-muted truncate">Partner Portal</p>
          </div>
        </div>

        {/* Pharmacy badge */}
        {pharmacy && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs font-semibold text-primary truncate">{pharmacy.name}</p>
            <p className="text-xs text-text-muted truncate">{pharmacy.city}</p>
            <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              pharmacy.status === 'APPROVED'
                ? 'bg-success/10 text-success'
                : pharmacy.status === 'PENDING'
                ? 'bg-warning/10 text-warning'
                : 'bg-error/10 text-error'
            }`}>{pharmacy.status}</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-muted hover:bg-surface-offset hover:text-text'
                }`
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-border">
          <p className="text-xs font-semibold text-text truncate">{user?.name}</p>
          <p className="text-xs text-text-muted truncate mb-3">{user?.phone}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-text-muted hover:text-error transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-border">
          <button className="lg:hidden text-text-muted hover:text-text" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-sm font-semibold text-text-muted">VaidyaMarg Partner Portal</h1>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
