import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layouts
import AdminLayout    from './layouts/AdminLayout';
import StaffLayout    from './layouts/StaffLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Auth Pages
import Login     from './pages/auth/Login';
import Register  from './pages/auth/Register';
import OTPVerify from './pages/auth/OTPVerify';

// Admin Pages
import Dashboard  from './pages/admin/Dashboard';
import Rooms      from './pages/admin/Rooms';
import Tables     from './pages/admin/Tables';
import Bookings   from './pages/admin/Bookings';
import Orders     from './pages/admin/Orders';
import MenuPage   from './pages/admin/MenuPage';
import Staff      from './pages/admin/Staff';
import Inventory  from './pages/admin/Inventory';
import Billing    from './pages/admin/Billing';
import Reports    from './pages/admin/Reports';
import Settings   from './pages/admin/Settings';

// Chef Pages
import KitchenBoard from './pages/chef/KitchenBoard';

// Waiter Pages
import OrderPad     from './pages/waiter/OrderPad';
import OrderHistory from './pages/waiter/OrderHistory';

// Receptionist Pages
import CheckIn              from './pages/receptionist/CheckIn';
import ReceptionistBookings from './pages/receptionist/Bookings';
import ReceptionistBilling  from './pages/receptionist/Billing';
import ReceptionistDash     from './pages/receptionist/Dashboard';

// Manager Pages
import ManagerHotel     from './pages/manager/Hotel';
import ManagerDashboard from './pages/manager/Dashboard';

// Customer Pages
import Browse          from './pages/customer/Browse';
import BookingsCustomer from './pages/customer/Bookings';
import OrdersCustomer  from './pages/customer/Orders';
import Loyalty         from './pages/customer/Loyalty';
import Profile         from './pages/customer/Profile';
import BookRoom        from './pages/customer/BookRoom';
import BookTable       from './pages/customer/BookTable';
import ScanTable       from './pages/customer/ScanTable';

// ────────────────────────────────────────────────────────────────────
// Role-based home route helper
const getRoleHome = (role) => {
  switch (role) {
    case 'admin':        return '/admin';
    case 'manager':      return '/staff/manager';
    case 'receptionist': return '/staff/receptionist';
    case 'waiter':       return '/staff/waiter';
    case 'chef':         return '/staff/chef';
    case 'customer':     return '/customer';
    default:             return '/login';
  }
};

// ────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return (
    <div className="loading-screen"><div className="spinner" /></div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getRoleHome(user?.role)} replace />;
  }
  return children;
};

// ────────────────────────────────────────────────────────────────────
// Smart root redirect — sends logged-in users to their home dashboard
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHome(user?.role)} replace />;
};

// ────────────────────────────────────────────────────────────────────
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
        {/* ── Auth ─────────────────────────────────────────────── */}
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/verify-otp"  element={<OTPVerify />} />

        {/* ── QR Scan (public, mobile-friendly) ─────────────── */}
        <Route path="/scan/table/:tableId" element={<ScanTable />} />

        {/* ── Admin (role: admin only) ──────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index           element={<Dashboard />} />
          <Route path="rooms"    element={<Rooms />} />
          <Route path="tables"   element={<Tables />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="orders"   element={<Orders />} />
          <Route path="menu"     element={<MenuPage />} />
          <Route path="staff"    element={<Staff />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="billing"  element={<Billing />} />
          <Route path="reports"  element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Staff: Manager ──────────────────────────────────── */}
        <Route path="/staff/manager" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <StaffLayout />
          </ProtectedRoute>
        }>
          <Route index          element={<ManagerDashboard />} />
          <Route path="hotel"   element={<ManagerHotel />} />
          <Route path="rooms"   element={<Rooms />} />
          <Route path="tables"  element={<Tables />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="menu"    element={<MenuPage />} />
        </Route>

        {/* ── Staff: Receptionist ─────────────────────────────── */}
        <Route path="/staff/receptionist" element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <StaffLayout />
          </ProtectedRoute>
        }>
          <Route index            element={<ReceptionistDash />} />
          <Route path="bookings"  element={<ReceptionistBookings />} />
          <Route path="checkin"   element={<CheckIn />} />
          <Route path="billing"   element={<ReceptionistBilling />} />
        </Route>

        {/* ── Staff: Waiter ───────────────────────────────────── */}
        <Route path="/staff/waiter" element={
          <ProtectedRoute allowedRoles={['waiter']}>
            <StaffLayout />
          </ProtectedRoute>
        }>
          <Route index           element={<OrderPad />} />
          <Route path="order-pad" element={<OrderPad />} />
          <Route path="history"  element={<OrderHistory />} />
        </Route>

        {/* ── Staff: Chef ─────────────────────────────────────── */}
        <Route path="/staff/chef" element={
          <ProtectedRoute allowedRoles={['chef']}>
            <StaffLayout />
          </ProtectedRoute>
        }>
          <Route index           element={<KitchenBoard />} />
          <Route path="kitchen"  element={<KitchenBoard />} />
        </Route>

        {/* ── Customer ────────────────────────────────────────── */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index             element={<Browse />} />
          <Route path="bookings"   element={<BookingsCustomer />} />
          <Route path="orders"     element={<OrdersCustomer />} />
          <Route path="loyalty"    element={<Loyalty />} />
          <Route path="profile"    element={<Profile />} />
          <Route path="book-room"  element={<BookRoom />} />
          <Route path="book-table" element={<BookTable />} />
        </Route>

        {/* ── Root: smart redirect based on role ──────────────── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── 404 fallback ────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
