import { useState, useEffect } from 'react';
import {
  HiOutlineViewGrid, HiOutlineSearch, HiOutlineCalendar, HiOutlineClock,
  HiOutlineUsers, HiOutlineCheckCircle,
} from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function BookTable() {
  const { user } = useAuthStore();
  const [tables, setTables]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [date, setDate]           = useState('');
  const [time, setTime]           = useState('');
  const [capacity, setCapacity]   = useState('');
  const [selected, setSelected]   = useState(null);
  const [guestCount, setGuests]   = useState(2);
  const [requests, setRequests]   = useState('');
  const [booking, setBooking]     = useState(false);
  const [booked, setBooked]       = useState(false);
  const [bookingResult, setResult]= useState(null);

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
    setTime('19:00');
  }, []);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    const params = new URLSearchParams({ date });
    if (time)     params.set('time', time);
    if (capacity) params.set('capacity', capacity);
    api.get(`/bookings/available-tables?${params}`)
      .then(({ data }) => setTables(data.tables || []))
      .catch(() => api.get('/tables').then(({ data }) => setTables(data.tables || [])).catch(() => {}))
      .finally(() => setLoading(false));
  }, [date, time, capacity]);

  const filtered = tables.filter(t =>
    t.tableNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = async () => {
    if (!selected) return toast.error('Select a table first');
    if (!date)     return toast.error('Pick a date');
    if (!time)     return toast.error('Pick a time slot');
    setBooking(true);
    try {
      const { data } = await api.post('/bookings/table', {
        tableId: selected._id,
        bookingDate: date,
        timeSlot: time,
        guestCount: Number(guestCount),
        specialRequests: requests,
      });
      setResult(data.booking);
      setBooked(true);
      toast.success('Table booked successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  if (booked && bookingResult) {
    return (
      <div className="animate-fade" style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div className="card" style={{ maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎉</div>
          <h2 className="font-bold mb-sm">Table Booked!</h2>
          <p className="text-muted mb-lg">Your reservation is confirmed. We look forward to seeing you!</p>
          <div className="card" style={{ background: 'var(--bg-tertiary)', textAlign: 'left', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', fontSize: '0.875rem' }}>
              <span className="text-muted">Table</span>
              <span className="font-bold">{bookingResult.table?.tableNumber || selected?.tableNumber}</span>
              <span className="text-muted">Date</span>
              <span className="font-bold">{new Date(bookingResult.bookingDate).toLocaleDateString('en-IN')}</span>
              <span className="text-muted">Time</span>
              <span className="font-bold">{bookingResult.timeSlot}</span>
              <span className="text-muted">Guests</span>
              <span className="font-bold">{bookingResult.guestCount}</span>
              <span className="text-muted">Status</span>
              <span className="badge badge-warning" style={{ display: 'inline-flex' }}>Pending Confirmation</span>
            </div>
          </div>
          <div className="flex gap-md">
            <button className="btn btn-outline flex-1" onClick={() => { setBooked(false); setSelected(null); }}>Book Another</button>
            <a href="/customer/bookings" className="btn btn-primary flex-1">My Bookings</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>🪑 Book a Table</h1>
          <p className="text-muted">Reserve your dining spot — pick a table and time</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-lg">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-md)', alignItems: 'end' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineCalendar /> Date</label>
            <input type="date" className="input" value={date} min={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)} />
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineClock /> Time</label>
            <input type="time" className="input" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineUsers /> Min Seats</label>
            <select className="input" value={capacity} onChange={e => setCapacity(e.target.value)}>
              <option value="">Any</option>
              {[2, 4, 6, 8].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineSearch /> Search</label>
            <input className="input" placeholder="Table or location…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-lg)', alignItems: 'start' }}>
        {/* Table grid */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <HiOutlineViewGrid style={{ fontSize: '2.5rem', marginBottom: 12 }} />
              <div>No tables available for selected criteria</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
              {filtered.map(table => {
                const isAvail = table.status === 'available';
                const isSel   = selected?._id === table._id;
                return (
                  <button
                    key={table._id}
                    disabled={!isAvail}
                    onClick={() => isAvail && setSelected(table)}
                    className={`card ${isAvail ? 'card-hover' : ''}`}
                    style={{
                      textAlign: 'left', cursor: isAvail ? 'pointer' : 'not-allowed',
                      opacity: isAvail ? 1 : 0.5,
                      border: isSel ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSel ? 'var(--bg-tertiary)' : undefined,
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    {isSel && (
                      <HiOutlineCheckCircle style={{ position: 'absolute', top: 12, right: 12, color: 'var(--primary)', fontSize: '1.25rem' }} />
                    )}
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🪑</div>
                    <div className="font-bold text-lg">{table.tableNumber}</div>
                    <div className="text-xs text-muted mb-sm">{table.location || 'Indoor'}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm"><HiOutlineUsers style={{ display: 'inline', marginRight: 4 }} />{table.capacity} seats</span>
                      <span className={`badge badge-${isAvail ? 'success' : table.status === 'reserved' ? 'warning' : 'danger'}`} style={{ fontSize: '0.65rem' }}>
                        {table.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Booking panel */}
        <div className="card" style={{ position: 'sticky', top: 100 }}>
          <h3 className="font-bold mb-lg">Your Reservation</h3>

          {!selected ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              <HiOutlineViewGrid style={{ fontSize: '2rem', marginBottom: 8 }} />
              <div className="text-sm">Select a table to continue</div>
            </div>
          ) : (
            <>
              <div className="card" style={{ background: 'var(--bg-tertiary)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', fontSize: '0.875rem' }}>
                  <span className="text-muted">Table</span><span className="font-bold">{selected.tableNumber}</span>
                  <span className="text-muted">Location</span><span className="font-bold">{selected.location || 'Indoor'}</span>
                  <span className="text-muted">Capacity</span><span className="font-bold">{selected.capacity} seats</span>
                  <span className="text-muted">Date</span><span className="font-bold">{date ? new Date(date).toLocaleDateString('en-IN') : '—'}</span>
                  <span className="text-muted">Time</span><span className="font-bold">{time || '—'}</span>
                </div>
              </div>

              <div className="input-group mb-md">
                <label>Number of Guests</label>
                <input type="number" className="input" min={1} max={selected.capacity}
                  value={guestCount} onChange={e => setGuests(e.target.value)} />
                <div className="text-xs text-muted">Max {selected.capacity} guests for this table</div>
              </div>
              <div className="input-group mb-lg">
                <label>Special Requests</label>
                <textarea className="input" rows={2} placeholder="Birthday setup, dietary requirements, high chair…"
                  value={requests} onChange={e => setRequests(e.target.value)} />
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={handleBook}
                disabled={booking || !date || !time}
              >
                {booking ? 'Booking…' : '✓ Confirm Reservation'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
