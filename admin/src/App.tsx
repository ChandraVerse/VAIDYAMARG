import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { AdminShell } from '@/components/layout/AdminShell';
import { LoginPage }           from '@/pages/Login';
import { DashboardPage }       from '@/pages/Dashboard';
import { OrdersPage }          from '@/pages/Orders';
import { OrderDetailPage }     from '@/pages/OrderDetail';
import { PrescriptionsPage }   from '@/pages/Prescriptions';
import { MedicinesPage }       from '@/pages/Medicines';
import { MedicineFormPage }    from '@/pages/MedicineForm';
import { UsersPage }           from '@/pages/Users';
import { PartnersPage }        from '@/pages/Partners';
import { PartnerDetailPage }   from '@/pages/PartnerDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"          element={<DashboardPage />} />
        <Route path="orders"             element={<OrdersPage />} />
        <Route path="orders/:id"         element={<OrderDetailPage />} />
        <Route path="prescriptions"      element={<PrescriptionsPage />} />
        <Route path="medicines"          element={<MedicinesPage />} />
        <Route path="medicines/new"      element={<MedicineFormPage />} />
        <Route path="medicines/:id/edit" element={<MedicineFormPage />} />
        <Route path="users"              element={<UsersPage />} />
        {/* Phase 4 — Partner management */}
        <Route path="partners"           element={<PartnersPage />} />
        <Route path="partners/:id"       element={<PartnerDetailPage />} />
      </Route>
    </Routes>
  );
}
