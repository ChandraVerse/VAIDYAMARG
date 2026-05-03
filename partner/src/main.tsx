import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';

import { PartnerShell }        from '@/components/layout/PartnerShell';
import { LoginPage }           from '@/pages/Login';
import { DashboardPage }       from '@/pages/Dashboard';
import { OrdersPage }          from '@/pages/Orders';
import { OrderDetailPage }     from '@/pages/OrderDetail';
import { PrescriptionsPage }   from '@/pages/Prescriptions';
import { InventoryPage }       from '@/pages/Inventory';
import { EarningsPage }        from '@/pages/Earnings';
import { ProfilePage }         from '@/pages/Profile';
import { useAuthStore }        from '@/stores/auth.store';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><PartnerShell /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"     element={<DashboardPage />} />
            <Route path="orders"        element={<OrdersPage />} />
            <Route path="orders/:id"    element={<OrderDetailPage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="inventory"     element={<InventoryPage />} />
            <Route path="earnings"      element={<EarningsPage />} />
            <Route path="profile"       element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '13px', borderRadius: '10px', border: '1px solid #d4d1ca' },
          success: { iconTheme: { primary: '#437a22', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#a12c7b', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  </StrictMode>
);
