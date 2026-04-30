import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HiOutlineHome, HiOutlineShoppingBag, HiOutlineCalendar, HiOutlineHeart, HiOutlineStar, HiOutlineLogout, HiOutlineUser, HiOutlineMenu, HiOutlineCamera } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import { useState } from 'react';

export default function CustomerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Navigation */}
      <header style={{
        background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
        padding: '0 var(--space-xl)',
      }}>
        <div className="container flex items-center justify-between" style={{ height: 64 }}>
          <NavLink to="/customer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span style={{ fontSize: '1.5rem' }}>🏨</span>
            <span className="font-display font-bold text-lg" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HospitalityOS</span>
          </NavLink>

          <nav className="flex items-center gap-lg hide-mobile">
            <NavLink to="/customer" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ padding: '0.5rem 0.75rem' }}>
              <HiOutlineHome /> Browse
            </NavLink>
            <NavLink to="/customer/bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ padding: '0.5rem 0.75rem' }}>
              <HiOutlineCalendar /> Bookings
            </NavLink>
            <NavLink to="/customer/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ padding: '0.5rem 0.75rem' }}>
              <HiOutlineShoppingBag /> Orders
            </NavLink>
            <NavLink to="/customer/scan" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ padding: '0.5rem 0.75rem' }}>
              <HiOutlineCamera /> Scan QR
            </NavLink>
            <NavLink to="/customer/loyalty" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ padding: '0.5rem 0.75rem' }}>
              <HiOutlineHeart /> Loyalty
            </NavLink>
          </nav>

          <div className="flex items-center gap-md">
            {user ? (
              <div className="flex items-center gap-sm">
                <NavLink to="/customer/profile" className="avatar" style={{ textDecoration: 'none' }}>
                  {user.name?.charAt(0)}
                </NavLink>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}><HiOutlineLogout /></button>
              </div>
            ) : (
              <NavLink to="/login" className="btn btn-primary btn-sm">Sign In</NavLink>
            )}
            <button className="btn btn-ghost btn-icon" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none' }} id="customer-menu-btn">
              <HiOutlineMenu />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="flex-col gap-sm animate-slide-up" style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
            <NavLink to="/customer" onClick={() => setMenuOpen(false)} className="sidebar-link"><HiOutlineHome /> Browse</NavLink>
            <NavLink to="/customer/bookings" onClick={() => setMenuOpen(false)} className="sidebar-link"><HiOutlineCalendar /> Bookings</NavLink>
            <NavLink to="/customer/orders" onClick={() => setMenuOpen(false)} className="sidebar-link"><HiOutlineShoppingBag /> Orders</NavLink>
            <NavLink to="/customer/scan" onClick={() => setMenuOpen(false)} className="sidebar-link"><HiOutlineCamera /> Scan QR</NavLink>
            <NavLink to="/customer/loyalty" onClick={() => setMenuOpen(false)} className="sidebar-link"><HiOutlineHeart /> Loyalty</NavLink>
          </nav>
        )}
      </header>

      <main style={{ padding: 'var(--space-xl)', maxWidth: 1280, margin: '0 auto' }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          #customer-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
