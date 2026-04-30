import { useState, useEffect } from 'react';
import { HiOutlineOfficeBuilding, HiOutlineKey, HiOutlineClipboardList, HiOutlineCurrencyRupee, HiOutlineRefresh } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ReceptionistDashboard() {
  const [stats, setStats]         = useState(null);
  const [recentBkgs, setRecent]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api.get(`/reports/daily?date=${today}`).catch(() => ({ data: null })),
      api.get('/bookings?type=room&status=confirmed&limit=5').catch(() => ({ data: {} })),
    ]).then(([statRes, bkgRes]) => {
      setStats(statRes.data);
      setRecent(bkgRes.data?.bookings || []);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: color || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', flexShrink: 0 }}>
        <Icon />
      </div>
      <div>
        <div className="text-xs text-muted font-bold uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>🏨 Reception Dashboard</h1>
          <p className="text-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}><HiOutlineRefresh /> Refresh</button>
      </div>

      <div className="grid grid-4 gap-lg mb-xl">
        <StatCard icon={HiOutlineOfficeBuilding} label="Room Revenue Today" value={`₹${Number(stats?.roomRevenue || 0).toLocaleString('en-IN')}`} color="var(--primary)" />
        <StatCard icon={HiOutlineKey} label="Check-Ins Today" value={stats?.checkInsToday ?? 0} color="var(--success)" />
        <StatCard icon={HiOutlineClipboardList} label="Check-Outs Today" value={stats?.checkOutsToday ?? 0} color="var(--info)" />
        <StatCard icon={HiOutlineCurrencyRupee} label="Paid Bills Today" value={stats?.paidCount ?? 0} color="var(--accent)" />
      </div>

      {/* Upcoming check-ins */}
      <div className="card">
        <h3 className="font-bold" style={{ marginBottom: 'var(--space-lg)' }}>Upcoming Confirmed Bookings</h3>
        {recentBkgs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No confirmed bookings</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Guest</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Guests</th></tr></thead>
            <tbody>
              {recentBkgs.map(b => (
                <tr key={b._id}>
                  <td>
                    <div className="flex items-center gap-sm">
                      <div className="avatar avatar-sm">{b.customer?.name?.charAt(0)}</div>
                      <div>
                        <div className="font-semibold">{b.customer?.name}</div>
                        <div className="text-xs text-muted">{b.customer?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-bold" style={{ color: 'var(--primary)' }}>{b.room?.roomNumber}</span></td>
                  <td>{new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
                  <td>{new Date(b.checkOut).toLocaleDateString('en-IN')}</td>
                  <td>{b.guestCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
