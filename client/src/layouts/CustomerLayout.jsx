import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineCalendar,
  HiOutlineHeart,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineCamera,
} from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import { useState } from 'react';

const asideStyle = {
  width: 260,
  flexShrink: 0,
  background: 'linear-gradient(180deg, #0c1418 0%, #080e12 100%)',
  borderRight: '1px solid rgba(210, 196, 149, 0.14)',
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--space-lg)',
  minHeight: '100vh',
};

const brandGold = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '1.15rem',
  background: 'linear-gradient(90deg, #dfcf9f, #b5a776)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

export default function CustomerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate('/');
  };

  const navClass = ({ isActive }) => `sidebar-link customer-dash-link ${isActive ? 'active' : ''}`;

  return (
    <div className="customer-dashboard-root" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div
        className={`customer-dashboard-backdrop ${menuOpen ? 'visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside className={`customer-dashboard-aside ${menuOpen ? 'is-open' : ''}`} style={asideStyle}>
        <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
          <NavLink
            to="/customer"
            onClick={closeMenu}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}
          >
            <span style={{ fontSize: '1.45rem' }}>🏨</span>
            <span style={brandGold}>Grand Paradise</span>
          </NavLink>
          <button
            type="button"
            className="customer-dashboard-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <HiOutlineX />
          </button>
        </div>

        <p
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            color: '#a8946a',
            marginBottom: 'var(--space-md)',
          }}
        >
          DASHBOARD
        </p>

        <nav className="flex flex-col gap-xs" style={{ flex: 1 }}>
          <NavLink to="/customer" end className={navClass} onClick={closeMenu}>
            <HiOutlineHome /> Home
          </NavLink>
          <NavLink to="/customer/bookings" className={navClass} onClick={closeMenu}>
            <HiOutlineCalendar /> Bookings
          </NavLink>
          <NavLink to="/customer/orders" className={navClass} onClick={closeMenu}>
            <HiOutlineShoppingBag /> Orders
          </NavLink>
          <NavLink to="/customer/scan" className={navClass} onClick={closeMenu}>
            <HiOutlineCamera /> Scan QR
          </NavLink>
          <NavLink to="/customer/loyalty" className={navClass} onClick={closeMenu}>
            <HiOutlineHeart /> Loyalty
          </NavLink>
        </nav>

        <div
          style={{
            marginTop: 'var(--space-lg)',
            paddingTop: 'var(--space-lg)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)',
          }}
        >
          {user ? (
            <>
              <NavLink to="/customer/profile" className={navClass} onClick={closeMenu}>
                <span
                  className="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #b5a776, #7a6b45)',
                  }}
                >
                  {user.name?.charAt(0)}
                </span>
                <span className="customer-dash-profile-label">
                  <span style={{ fontWeight: 600, color: '#f4f5ef' }}>Profile</span>
                  <span style={{ fontSize: '0.75rem', color: '#8a9690', display: 'block', marginTop: 2 }}>
                    {user.name}
                  </span>
                </span>
              </NavLink>
              <button
                type="button"
                className="customer-dash-logout"
                onClick={handleLogout}
              >
                <HiOutlineLogout /> Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="customer-dash-signin" onClick={closeMenu}>
              <HiOutlineUser /> Sign in
            </NavLink>
          )}
        </div>
      </aside>

      <div className="customer-dashboard-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header className="customer-dashboard-mobile-header">
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineMenu />
          </button>
          <span className="font-display font-bold" style={brandGold}>
            Grand Paradise
          </span>
          <span style={{ width: 40 }} />
        </header>

        <main style={{ padding: 'var(--space-xl)', maxWidth: 1280, width: '100%', margin: '0 auto', flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        .customer-dash-link {
          position: relative;
        }
        .customer-dashboard-aside .customer-dash-link.active {
          background: rgba(181, 167, 118, 0.12);
          color: #e9d9a8;
          font-weight: 600;
        }
        .customer-dashboard-aside .customer-dash-link.active::before {
          background: linear-gradient(180deg, #d4c27a, #8a7a4a);
        }
        .customer-dashboard-aside .customer-dash-link:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #f4f5ef;
        }
        .customer-dash-profile-label {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          min-width: 0;
        }
        .customer-dash-logout,
        .customer-dash-signin {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          width: 100%;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-lg);
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(210, 196, 149, 0.35);
          background: rgba(255, 255, 255, 0.04);
          color: #dfcf9f;
          text-decoration: none;
          transition: background var(--transition-fast);
        }
        .customer-dash-logout:hover,
        .customer-dash-signin:hover {
          background: rgba(181, 167, 118, 0.12);
          color: #f4ecd4;
        }
        .customer-dashboard-close {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.06);
          color: #c5cdc8;
          cursor: pointer;
        }
        .customer-dashboard-close:hover {
          background: rgba(255,255,255,0.1);
          color: #f4f5ef;
        }
        .customer-dashboard-mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-lg);
          border-bottom: 1px solid var(--border);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .customer-dashboard-backdrop {
          display: none;
        }
        @media (max-width: 768px) {
          .customer-dashboard-aside {
            position: fixed;
            left: 0;
            top: 0;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.22s ease;
            box-shadow: 8px 0 32px rgba(0,0,0,0.4);
          }
          .customer-dashboard-aside.is-open {
            transform: translateX(0);
          }
          .customer-dashboard-backdrop.visible {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 199;
            background: rgba(0,0,0,0.45);
          }
          .customer-dashboard-close {
            display: flex;
          }
          .customer-dashboard-mobile-header {
            display: flex;
          }
        }
        @media (min-width: 769px) {
          .customer-dashboard-aside {
            position: sticky;
            top: 0;
            align-self: flex-start;
            height: 100vh;
            transform: none !important;
          }
          .customer-dashboard-close {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
