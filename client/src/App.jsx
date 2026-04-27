import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OTPVerify from './pages/auth/OTPVerify';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Rooms from './pages/admin/Rooms';
import Tables from './pages/admin/Tables';
import Bookings from './pages/admin/Bookings';
import Orders from './pages/admin/Orders';
import MenuPage from './pages/admin/MenuPage';
import Staff from './pages/admin/Staff';
import Inventory from './pages/admin/Inventory';
import Billing from './pages/admin/Billing';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// Customer Pages
import Browse from './pages/customer/Browse';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
      }} />
      
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerify />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'waiter', 'chef']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="tables" element={<Tables />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="orders" element={<Orders />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="staff" element={<Staff />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="billing" element={<Billing />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Browse />} />
          {/* Future customer routes can be added here */}
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/customer" replace />} />
      </Routes>
    </>
  );
}

export default App;
