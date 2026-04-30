import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import Layout       from './components/Layout';
import LoginPage    from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Prescriptions from './pages/Prescriptions';
import PrescriptionDetail from './pages/PrescriptionDetail';
import Orders       from './pages/Orders';
import OrderDetail  from './pages/OrderDetail';
import Medicines    from './pages/Medicines';
import Analytics    from './pages/Analytics';

function Guard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"            element={<Dashboard />} />
        <Route path="prescriptions"        element={<Prescriptions />} />
        <Route path="prescriptions/:id"    element={<PrescriptionDetail />} />
        <Route path="orders"               element={<Orders />} />
        <Route path="orders/:id"           element={<OrderDetail />} />
        <Route path="medicines"            element={<Medicines />} />
        <Route path="analytics"            element={<Analytics />} />
      </Route>
    </Routes>
  );
}
