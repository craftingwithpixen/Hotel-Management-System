import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlineSearch, HiOutlinePlus, HiOutlineRefresh,
  HiOutlineCheckCircle, HiOutlineX,
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending: 'warning', confirmed: 'info', checked_in: 'success', checked_out: 'danger', cancelled: 'danger' };

const EMPTY_FORM = {
  type: 'room', roomId: '', tableId: '', checkIn: '', checkOut: '',
  bookingDate: '', timeSlot: '', guestCount: 1, specialRequests: '', isWalkIn: true,
};

export default function ReceptionistBookings() {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [typeFilter, setType]       = useState('all');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const LIMIT = 20;

  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [rooms, setRooms]           = useState([]);
  const [tables, setTables]         = useState([]);
  const [saving, setSaving]         = useState(false);
  const [acting, setActing]         = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all')   params.set('type', typeFilter);
      const { data } = await api.get(`/bookings?${params}`);
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    if (showForm) {
      Promise.all([api.get('/rooms'), api.get('/tables')])
        .then(([r, t]) => { setRooms(r.data.rooms || []); setTables(t.data.tables || []); })
        .catch(() => {});
    }
  }, [showForm]);

  const filtered = bookings.filter(b =>
    b.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.room?.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.table?.tableNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const doAction = async (id, action) => {
    setActing(id + action);
    try {
      await api.put(`/bookings/${id}/${action}`);
      toast.success(`Booking ${action.replace('-', ' ')} successful`);
      fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Action failed'); }
    finally { setActing(null); }
  };

  const saveBooking = async () => {
    setSaving(true);
    try {
      const endpoint = form.type === 'room' ? '/bookings/room' : '/bookings/table';
      const payload = form.type === 'room'
        ? { roomId: form.roomId, checkIn: form.checkIn, checkOut: form.checkOut, guestCount: Number(form.guestCount), specialRequests: form.specialRequests, isWalkIn: true }
        : { tableId: form.tableId, bookingDate: form.bookingDate, timeSlot: form.timeSlot, guestCount: Number(form.guestCount), specialRequests: form.specialRequests, isWalkIn: true };
      await api.post(endpoint, payload);
      toast.success('Booking created!');
      setShowForm(false); setForm(EMPTY_FORM); fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create booking'); }
    finally { setSaving(false); }
  };

  const copyBookingCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied ${code}`);
    } catch {
      toast.error('Failed to copy booking code');
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p className="text-muted">Manage room and table reservations</p>
        </div>
        <div className="flex gap-md">
          <button className="btn btn-outline" onClick={fetchBookings}><HiOutlineRefresh /></button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><HiOutlinePlus /> New Booking</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-md mb-lg" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search guest, room or table…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="tabs">
          {['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map(s => (
            <button key={s} className={`tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatus(s); setPage(1); }} style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="tabs">
          {['all', 'room', 'table'].map(t => (
            <button key={t} className={`tab ${typeFilter === t ? 'active' : ''}`}
              onClick={() => { setType(t); setPage(1); }} style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Guest</th><th>Booking ID</th><th>Type</th><th>Room / Table</th><th>Dates / Slot</th><th>Guests</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No bookings found</td></tr>
              )}
              {filtered.map(b => (
                <tr key={b._id}>
                  <td>
                    <div className="flex items-center gap-sm">
                      <div className="avatar avatar-sm">{b.customer?.name?.charAt(0) || 'G'}</div>
                      <div>
                        <div className="font-semibold">{b.customer?.name || 'Walk-in'}</div>
                        <div className="text-xs text-muted">{b.customer?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyBookingCode(b.bookingCode)} title="Copy booking code">
                      {b.bookingCode || 'BKG-—'}
                    </button>
                  </td>
                  <td><span className={`badge badge-${b.type === 'room' ? 'primary' : 'accent'}`} style={{ textTransform: 'capitalize' }}>{b.type}</span></td>
                  <td className="font-bold" style={{ color: 'var(--primary)' }}>
                    {b.room?.roomNumber || b.table?.tableNumber || '—'}
                  </td>
                  <td className="text-sm">
                    {b.type === 'room' && b.checkIn
                      ? `${new Date(b.checkIn).toLocaleDateString('en-IN')} → ${new Date(b.checkOut).toLocaleDateString('en-IN')}`
                      : b.bookingDate ? `${new Date(b.bookingDate).toLocaleDateString('en-IN')} @ ${b.timeSlot}` : '—'}
                  </td>
                  <td>{b.guestCount}</td>
                  <td>
                    <span className={`badge badge-${STATUS_BADGE[b.status] || 'info'}`} style={{ textTransform: 'capitalize' }}>
                      {b.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-xs">
                      {b.status === 'pending' && (
                        <button className="btn btn-primary btn-sm" disabled={acting === b._id + 'confirm'} onClick={() => doAction(b._id, 'confirm')}>
                          <HiOutlineCheckCircle /> Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button className="btn btn-success btn-sm" disabled={acting === b._id + 'checkin'} onClick={() => doAction(b._id, 'checkin')}>
                          Check In
                        </button>
                      )}
                      {b.status === 'checked_in' && (
                        <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          disabled={acting === b._id + 'checkout'} onClick={() => doAction(b._id, 'checkout')}>
                          Check Out
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(b.status) && (
                        <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }}
                          disabled={acting === b._id + 'cancel'} onClick={() => doAction(b._id, 'cancel')}>
                          <HiOutlineX />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {total > LIMIT && (
          <div className="flex items-center justify-between" style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
            <span className="text-xs text-muted">{total} total</span>
            <div className="flex gap-sm">
              <button className="btn btn-sm btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <button className="btn btn-sm btn-outline" disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal card animate-fade" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <h2 className="font-bold" style={{ marginBottom: 'var(--space-lg)' }}>New Walk-in Booking</h2>

            <div className="tabs mb-lg">
              <button className={`tab ${form.type === 'room' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: 'room' }))}>Room</button>
              <button className={`tab ${form.type === 'table' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: 'table' }))}>Table</button>
            </div>

            {form.type === 'room' ? (
              <>
                <div className="input-group mb-md">
                  <label>Room</label>
                  <select className="input" value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}>
                    <option value="">Select room…</option>
                    {rooms.filter(r => r.status === 'available').map(r => (
                      <option key={r._id} value={r._id}>{r.roomNumber} — {r.type} (₹{r.pricePerNight}/night)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-2 gap-md mb-md">
                  <div className="input-group"><label>Check In</label><input type="date" className="input" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} /></div>
                  <div className="input-group"><label>Check Out</label><input type="date" className="input" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} /></div>
                </div>
              </>
            ) : (
              <>
                <div className="input-group mb-md">
                  <label>Table</label>
                  <select className="input" value={form.tableId} onChange={e => setForm(f => ({ ...f, tableId: e.target.value }))}>
                    <option value="">Select table…</option>
                    {tables.filter(t => t.status === 'available').map(t => (
                      <option key={t._id} value={t._id}>{t.tableNumber} — {t.location} (seats {t.capacity})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-2 gap-md mb-md">
                  <div className="input-group"><label>Date</label><input type="date" className="input" value={form.bookingDate} onChange={e => setForm(f => ({ ...f, bookingDate: e.target.value }))} /></div>
                  <div className="input-group"><label>Time Slot</label><input type="time" className="input" value={form.timeSlot} onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))} /></div>
                </div>
              </>
            )}

            <div className="input-group mb-md">
              <label>No. of Guests</label>
              <input type="number" className="input" min={1} value={form.guestCount} onChange={e => setForm(f => ({ ...f, guestCount: e.target.value }))} />
            </div>
            <div className="input-group mb-lg">
              <label>Special Requests</label>
              <textarea className="input" rows={2} placeholder="Optional…" value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} />
            </div>

            <div className="flex gap-md">
              <button className="btn btn-outline flex-1" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={saveBooking} disabled={saving}>{saving ? 'Saving…' : 'Create Booking'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
