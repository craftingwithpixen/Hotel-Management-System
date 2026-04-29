import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useState, useEffect } from 'react';
import {
  HiOutlineHome, HiOutlineShoppingCart, HiOutlineClipboardList,
  HiOutlineLogout, HiOutlineMenu, HiOutlineBell, HiOutlineCollection,
  HiOutlineOfficeBuilding, HiOutlineViewGrid, HiOutlineCurrencyRupee,
  HiOutlineKey, HiOutlineUsers,
} from 'react-icons/hi';

const roleMenus = {
  waiter: [
    { path: '/staff/waiter', icon: HiOutlineHome, label: 'Dashboard', end: true },
    { path: '/staff/waiter/order-pad', icon: HiOutlineShoppingCart, label: 'Order Pad' },
    { path: '/staff/waiter/history', icon: HiOutlineClipboardList, label: 'Order History' },
  ],
  chef: [
    { path: '/staff/chef', icon: HiOutlineHome, label: 'Dashboard', end: true },
    { path: '/staff/chef/kitchen', icon: HiOutlineCollection, label: 'Kitchen Board' },
  ],
  receptionist: [
    { path: '/staff/receptionist', icon: HiOutlineHome, label: 'Dashboard', end: true },
    { path: '/staff/receptionist/bookings', icon: HiOutlineClipboardList, label: 'Bookings' },
    { path: '/staff/receptionist/checkin', icon: HiOutlineKey, label: 'Check In / Out' },
    { path: '/staff/receptionist/billing', icon: HiOutlineCurrencyRupee, label: 'Billing' },
  ],
  manager: [
    { path: '/staff/manager', icon: HiOutlineHome, label: 'Dashboard', end: true },
    { path: '/staff/manager/hotel', icon: HiOutlineOfficeBuilding, label: 'Hotel Settings' },
    { path: '/staff/manager/rooms', icon: HiOutlineOfficeBuilding, label: 'Rooms' },
    { path: '/staff/manager/tables', icon: HiOutlineViewGrid, label: 'Tables' },
    { path: '/staff/manager/inventory', icon: HiOutlineCollection, label: 'Inventory' },
    { path: '/staff/manager/menu', icon: HiOutlineCollection, label: 'Menu' },
  ],
};

const roleColors = {
  waiter: 'var(--accent)',
  chef: 'var(--danger)',
  receptionist: 'var(--success)',
  manager: 'var(--info)',
};

export default function StaffLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = roleMenus[user?.role] || [];
  const roleColor = roleColors[user?.role] || 'var(--primary)';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex">
      {sidebarOpen && (
        <div className="modal-overlay" style={{ zIndex: 99 }} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{
            width: 36, height: 36, background: roleColor,
            borderRadius: 'var(--radius-lg)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
          }}>
            {user?.role === 'chef' ? '👨‍🍳' : user?.role === 'waiter' ? '🍽️' : user?.role === 'receptionist' ? '🏨' : '🏢'}
          </div>
          <div>
            <h1>HospitalityOS</h1>
            <span className="text-xs text-muted" style={{ textTransform: 'capitalize', WebkitTextFillColor: 'var(--text-tertiary)' }}>
              {user?.role} Portal
            </span>
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
            <div className="avatar">{user?.name?.charAt(0) || 'S'}</div>
            <div>
              <div className="text-sm font-semibold">{user?.name}</div>
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
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              id="staff-mobile-menu-btn"
              style={{ display: 'none' }}
            >
              <HiOutlineMenu style={{ fontSize: '1.25rem' }} />
            </button>
            <div>
              <h2 className="text-lg font-bold">
                Welcome, {user?.name?.split(' ')[0]} 👋
              </h2>
              <p className="text-xs text-muted">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
              <HiOutlineBell style={{ fontSize: '1.25rem' }} />
            </button>
            <div className="badge" style={{ background: roleColor, color: '#fff', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          #staff-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
