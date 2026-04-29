import { useEffect, useState } from 'react';
import { HiOutlineSearch, HiOutlineCheck, HiOutlineX, HiOutlineLogin, HiOutlineLogout } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function Bookings() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [search, setSearch] = useState('');
  const canApproveReject = ['admin', 'manager'].includes(user?.role);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (bookingId, action) => {
    try {
      const endpointMap = {
        confirm: `/bookings/${bookingId}/confirm`,
        reject: `/bookings/${bookingId}/reject`,
        checkin: `/bookings/${bookingId}/checkin`,
        checkout: `/bookings/${bookingId}/checkout`,
        cancel: `/bookings/${bookingId}/cancel`,
      };
      const body = action === 'reject' ? { reason: 'Rejected by admin' } : {};
      await api.put(endpointMap[action], body);
      const actionLabel = {
        confirm: 'approved',
        reject: 'rejected',
        checkin: 'checked in',
        checkout: 'checked out',
        cancel: 'cancelled',
      };
      toast.success(`Booking ${actionLabel[action]}`);
      setBookings((prev) =>
        prev.map((b) => {
          if (b._id !== bookingId) return b;
          const statusMap = {
            confirm: 'confirmed',
            reject: 'rejected',
            checkin: 'checked_in',
            checkout: 'checked_out',
            cancel: 'cancelled',
          };
          return { ...b, status: statusMap[action] || b.status };
        })
      );
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} booking`);
    }
  };

  const filtered = bookings.filter(b =>
    (!filter.type || b.type === filter.type) && (!filter.status || b.status === filter.status) &&
    (!search || b.customer?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const statusBadge = { pending: 'warning', confirmed: 'success', checked_in: 'info', checked_out: 'primary', cancelled: 'danger', rejected: 'danger' };

  return (
    <div className="animate-fade">
      <div className="page-header"><div><h1>Bookings</h1><p className="text-muted">Manage all reservations</p></div></div>

      <div className="flex items-center gap-md flex-wrap mb-lg">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search by guest name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="tabs">
          <button className={`tab ${filter.type === '' ? 'active' : ''}`} onClick={() => setFilter({...filter, type: ''})}>All</button>
          <button className={`tab ${filter.type === 'room' ? 'active' : ''}`} onClick={() => setFilter({...filter, type: 'room'})}>Rooms</button>
          <button className={`tab ${filter.type === 'table' ? 'active' : ''}`} onClick={() => setFilter({...filter, type: 'table'})}>Tables</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && <div style={{ padding: 'var(--space-lg)' }}>Loading bookings...</div>}
        <table className="data-table">
          <thead><tr>
            <th>Guest</th><th>Type</th><th>Room/Table</th><th>Date</th><th>Guests</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b._id}>
                <td><div className="flex items-center gap-sm"><div className="avatar avatar-sm">{b.customer?.name?.charAt(0) || 'G'}</div><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{b.customer?.name || 'Guest'}</span></div></td>
                <td><span className={`badge badge-${b.type === 'room' ? 'primary' : 'info'}`}>{b.type}</span></td>
                <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{b.room?.roomNumber || b.table?.tableNumber}</td>
                <td>
                  {b.checkIn
                    ? `${new Date(b.checkIn).toLocaleDateString('en-IN')} → ${new Date(b.checkOut).toLocaleDateString('en-IN')}`
                    : `${b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-IN') : ''} ${b.timeSlot || ''}`}
                </td>
                <td>{b.guestCount}</td>
                <td><span className={`badge badge-${statusBadge[b.status]}`}>{b.status.replace('_', ' ')}</span></td>
                <td>
                  <div className="flex gap-xs">
                    {b.status === 'pending' && canApproveReject && (
                      <>
                        <button className="btn btn-success btn-sm btn-icon" onClick={() => updateStatus(b._id, 'confirm')} title="Approve">
                          <HiOutlineCheck />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => updateStatus(b._id, 'reject')} title="Reject">
                          <HiOutlineX />
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button className="btn btn-primary btn-sm btn-icon" onClick={() => updateStatus(b._id, 'checkin')} title="Check In">
                        <HiOutlineLogin />
                      </button>
                    )}
                    {b.status === 'checked_in' && (
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => updateStatus(b._id, 'checkout')} title="Check Out">
                        <HiOutlineLogout />
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(b.status) && (
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} title="Cancel" onClick={() => updateStatus(b._id, 'cancel')}>
                        <HiOutlineX />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
