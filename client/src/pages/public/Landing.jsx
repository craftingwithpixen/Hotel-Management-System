import { Link } from 'react-router-dom';
import { HiOutlineOfficeBuilding, HiOutlineCurrencyRupee, HiOutlineQrcode, HiOutlineBell, HiOutlineChartBar, HiOutlineShieldCheck } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';

const features = [
  {
    icon: HiOutlineOfficeBuilding,
    title: 'Hotel + Restaurant Ops',
    description: 'Manage rooms, tables, bookings, and staff from one unified platform.',
  },
  {
    icon: HiOutlineCurrencyRupee,
    title: 'Billing & Payments',
    description: 'Generate invoices, accept online/cash payments, and track payment status.',
  },
  {
    icon: HiOutlineQrcode,
    title: 'QR-based Ordering',
    description: 'Let guests scan table QR codes and place orders directly from mobile.',
  },
  {
    icon: HiOutlineBell,
    title: 'Real-time Notifications',
    description: 'Get live alerts for bookings, payments, and low-stock inventory events.',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Actionable Reports',
    description: 'Monitor daily revenue, occupancy, and operations with role-based dashboards.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Role-based Security',
    description: 'Separate access for admin, manager, receptionist, waiter, chef, and customer.',
  },
];

export default function Landing() {
  const { isAuthenticated, user } = useAuthStore();
  const loggedInHome = user?.role ? '/home' : '/login';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}>
        <div className="container flex items-center justify-between" style={{ height: 72 }}>
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: '1.6rem' }}>🏨</span>
            <span className="font-display font-bold text-xl">HospitalityOS</span>
          </div>
          <div className="flex items-center gap-sm">
            <Link to="/customer" className="btn btn-outline btn-sm">Customer Area</Link>
            <Link to={isAuthenticated ? loggedInHome : '/login'} className="btn btn-primary btn-sm">
              {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      </header>

      <section className="container" style={{ padding: '5rem 1rem 4rem' }}>
        <div style={{ maxWidth: 820 }}>
          <div className="badge badge-info" style={{ marginBottom: 16 }}>Public Platform Overview</div>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)', lineHeight: 1.1, marginBottom: 16 }}>
            One smart platform for modern
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> hotel and restaurant operations</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '1.05rem', maxWidth: 700, marginBottom: 24 }}>
            HospitalityOS helps teams run front desk, rooms, dining, kitchen, billing, and customer experiences in one connected system.
          </p>
          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? loggedInHome : '/register'} className="btn btn-primary">Get Started</Link>
            <Link to="/customer" className="btn btn-outline">Explore Customer View</Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '0 1rem 4rem' }}>
        <div className="grid grid-3 gap-lg">
          {features.map((f) => (
            <div key={f.title} className="card card-hover">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'grid', placeItems: 'center', marginBottom: 12 }}>
                <f.icon style={{ fontSize: '1.25rem' }} />
              </div>
              <h3 className="font-bold" style={{ marginBottom: 8 }}>{f.title}</h3>
              <p className="text-sm text-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

