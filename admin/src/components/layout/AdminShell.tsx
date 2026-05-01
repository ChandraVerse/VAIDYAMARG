import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, FileText,
  Pill, Users, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders',       icon: ShoppingBag,     label: 'Orders' },
  { to: '/prescriptions',icon: FileText,        label: 'Prescriptions' },
  { to: '/medicines',    icon: Pill,            label: 'Medicines' },
  { to: '/users',        icon: Users,           label: 'Users' },
];

export function AdminShell() {
  const { user, logout, loadSession } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadSession(); }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f6f2]">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col w-56 bg-white border-r border-border
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">VM</span>
          </div>
          <div>
            <p className="text-sm font-bold text-text">VaidyaMarg</p>
            <p className="text-xs text-text-muted">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-muted hover:bg-surface-offset hover:text-text'
                }`
              }
            >
              <Icon size={16} strokeWidth={isActive => isActive ? 2.5 : 1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-border">
          <p className="text-xs font-semibold text-text truncate">{user?.name}</p>
          <p className="text-xs text-text-muted truncate mb-3">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-error transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-border">
          <button
            className="lg:hidden text-text-muted hover:text-text"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-sm font-semibold text-text-muted">VaidyaMarg Operations</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
