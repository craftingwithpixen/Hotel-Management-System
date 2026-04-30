import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HiOutlineHome, HiOutlineUsers, HiOutlineClipboardList, HiOutlineChartBar, HiOutlineCog, HiOutlineLogout, HiOutlineOfficeBuilding, HiOutlineViewGrid, HiOutlineCollection, HiOutlineShoppingCart, HiOutlineCurrencyRupee, HiOutlineBell, HiOutlineMenu } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import { useState } from 'react';

const menuItems = [
  { path: '/admin', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { path: '/admin/rooms', icon: HiOutlineOfficeBuilding, label: 'Rooms' },
  { path: '/admin/tables', icon: HiOutlineViewGrid, label: 'Tables' },
  { path: '/admin/bookings', icon: HiOutlineClipboardList, label: 'Bookings' },
  { path: '/admin/orders', icon: HiOutlineShoppingCart, label: 'Orders' },
  { path: '/admin/menu', icon: HiOutlineCollection, label: 'Menu' },
  { path: '/admin/staff', icon: HiOutlineUsers, label: 'Staff' },
  { path: '/admin/inventory', icon: HiOutlineViewGrid, label: 'Inventory' },
  { path: '/admin/billing', icon: HiOutlineCurrencyRupee, label: 'Billing' },
  { path: '/admin/reports', icon: HiOutlineChartBar, label: 'Reports' },
  { path: '/admin/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="modal-overlay" style={{ zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ width: 36, height: 36, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
            🏨
          </div>
          <div>
            <h1>HospitalityOS</h1>
            <span className="text-xs text-muted" style={{ WebkitTextFillColor: 'var(--text-tertiary)' }}>Management Suite</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
          <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div>
              <div className="text-sm font-semibold">{user?.name || 'Admin'}</div>
              <div className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost w-full" onClick={handleLogout} style={{ justifyContent: 'flex-start' }}>
            <HiOutlineLogout /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="flex items-center gap-md">
            <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }} id="mobile-menu-btn">
              <HiOutlineMenu style={{ fontSize: '1.25rem' }} />
            </button>
            <div>
              <h2 className="text-lg font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋</h2>
              <p className="text-xs text-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
              <HiOutlineBell style={{ fontSize: '1.25rem' }} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%' }} />
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              <HiOutlineLogout /> Logout
            </button>
          </div>
        </div>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
