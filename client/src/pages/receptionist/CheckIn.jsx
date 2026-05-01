import { useState, useEffect, useCallback } from 'react';
import { HiOutlineKey, HiOutlineSearch, HiOutlineCheckCircle, HiOutlineLogout, HiOutlineRefresh } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending: 'warning', confirmed: 'info', checked_in: 'success', checked_out: 'danger', cancelled: 'danger' };

export default function CheckIn() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('confirmed');
  const [acting, setActing] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/bookings?type=room&status=${filter}&limit=50`);
      setBookings(data.bookings || []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const doAction = async (bookingId, action) => {
    setActing(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/${action}`);
      toast.success(`${action === 'checkin' ? 'Checked in' : 'Checked out'} successfully!`);
      fetchBookings();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${action}`);
    } finally { setActing(null); }
  };

  const filtered = bookings.filter(b =>
    b.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.room?.roomNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const nightCount = (b) => b.checkIn && b.checkOut
    ? Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000)
    : 0;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Check In / Out</h1>
          <p className="text-muted">Manage room arrivals and departures</p>
        </div>
        <button className="btn btn-outline" onClick={fetchBookings}><HiOutlineRefresh /> Refresh</button>
      </div>

      {/* Filters */}
      <div className="flex gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search guest or room..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="tabs">
          {['confirmed', 'checked_in', 'checked_out', 'pending'].map(s => (
            <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)} style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
              No {filter.replace('_', ' ')} bookings
            </div>
          )}
          {filtered.map(b => (
            <div key={b._id} className="card card-hover" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-lg)', alignItems: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                {/* Guest */}
                <div>
                  <div className="text-xs text-muted">Guest</div>
                  <div className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="avatar avatar-sm">{b.customer?.name?.charAt(0) || 'G'}</div>
                    {b.customer?.name || 'Walk-in'}
                  </div>
                  <div className="text-xs text-muted">{b.customer?.phone}</div>
                </div>
                {/* Room */}
                <div>
                  <div className="text-xs text-muted">Room</div>
                  <div className="font-bold text-lg" style={{ color: 'var(--primary)' }}>{b.room?.roomNumber}</div>
                  <div className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>{b.room?.type}</div>
                </div>
                {/* Dates */}
                <div>
                  <div className="text-xs text-muted">Check In → Check Out</div>
                  <div className="text-sm font-medium">
                    {new Date(b.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} →{' '}
                    {new Date(b.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className="text-xs text-muted">{nightCount(b)} night{nightCount(b) !== 1 ? 's' : ''} · {b.guestCount} guest(s)</div>
                </div>
                {/* Status */}
                <div>
                  <div className="text-xs text-muted">Status</div>
                  <span className={`badge badge-${STATUS_BADGE[b.status] || 'info'}`} style={{ textTransform: 'capitalize' }}>
                    {b.status.replace('_', ' ')}
                  </span>
                  {b.isWalkIn && <div className="text-xs text-muted" style={{ marginTop: 4 }}>Walk-in</div>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {b.status === 'confirmed' && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => doAction(b._id, 'checkin')}
                    disabled={acting === b._id}
                  >
                    <HiOutlineKey /> {acting === b._id ? '...' : 'Check In'}
                  </button>
                )}
                {b.status === 'checked_in' && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    onClick={() => doAction(b._id, 'checkout')}
                    disabled={acting === b._id}
                  >
                    <HiOutlineLogout /> {acting === b._id ? '...' : 'Check Out'}
                  </button>
                )}
                {b.status === 'pending' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => doAction(b._id, 'confirm')}
                    disabled={acting === b._id}
                  >
                    <HiOutlineCheckCircle /> Confirm
                  </button>
                )}
                {b.status === 'checked_out' && (
                  <span className="badge badge-success"><HiOutlineCheckCircle /> Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
