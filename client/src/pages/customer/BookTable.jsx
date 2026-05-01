import { useEffect, useState } from 'react';
import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineViewGrid,
} from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { getCustomerText } from '../../i18n/customerText';

export default function BookTable() {
  const { user, preferredLang } = useAuthStore();
  const t = getCustomerText(user?.preferredLang || preferredLang);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selected, setSelected] = useState(null);
  const [guestCount, setGuests] = useState(2);
  const [requests, setRequests] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingResult, setResult] = useState(null);

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
    setTime('19:00');
  }, []);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    const params = new URLSearchParams({ date });
    if (time) params.set('time', time);
    if (capacity) params.set('capacity', capacity);
    api.get(`/bookings/available-tables?${params}`)
      .then(({ data }) => setTables(data.tables || []))
      .catch(() => api.get('/tables').then(({ data }) => setTables(data.tables || [])).catch(() => {}))
      .finally(() => setLoading(false));
  }, [date, time, capacity]);

  const filtered = tables.filter((table) => (
    table.tableNumber?.toLowerCase().includes(search.toLowerCase()) ||
    table.location?.toLowerCase().includes(search.toLowerCase())
  ));

  const handleBook = async () => {
    if (!selected) return toast.error(t('selectTableFirst'));
    if (!date) return toast.error(t('pickDate'));
    if (!time) return toast.error(t('pickTime'));
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
      toast.success(t('tableBookedSuccess'));
    } catch (err) {
      toast.error(err?.response?.data?.message || t('bookingFailed'));
    } finally {
      setBooking(false);
    }
  };

  if (booked && bookingResult) {
    return (
      <div className="animate-fade" style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div className="card" style={{ maxWidth: 440, textAlign: 'center' }}>
          <HiOutlineSparkles style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', color: 'var(--success)' }} />
          <h2 className="font-bold mb-sm">{t('tableBooked')}</h2>
          <p className="text-muted mb-lg">{t('tableBookedMessage')}</p>
          <div className="card" style={{ background: 'var(--bg-tertiary)', textAlign: 'left', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', fontSize: '0.875rem' }}>
              <span className="text-muted">{t('table')}</span>
              <span className="font-bold">{bookingResult.table?.tableNumber || selected?.tableNumber}</span>
              <span className="text-muted">{t('date')}</span>
              <span className="font-bold">{new Date(bookingResult.bookingDate).toLocaleDateString('en-IN')}</span>
              <span className="text-muted">{t('time')}</span>
              <span className="font-bold">{bookingResult.timeSlot}</span>
              <span className="text-muted">{t('guests')}</span>
              <span className="font-bold">{bookingResult.guestCount}</span>
              <span className="text-muted">{t('status')}</span>
              <span className="badge badge-warning" style={{ display: 'inline-flex' }}>{t('pendingConfirmation')}</span>
            </div>
          </div>
          <div className="flex gap-md">
            <button className="btn btn-outline flex-1" onClick={() => { setBooked(false); setSelected(null); }}>
              {t('bookAnother')}
            </button>
            <a href="/customer/bookings" className="btn btn-primary flex-1">{t('myBookings')}</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>{t('bookTable')}</h1>
          <p className="text-muted">{t('bookTableIntro')}</p>
        </div>
      </div>

      <div className="card mb-lg">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 'var(--space-md)', alignItems: 'end' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineCalendar /> {t('date')}</label>
            <input type="date" className="input" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineClock /> {t('time')}</label>
            <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineUsers /> {t('minSeats')}</label>
            <select className="input" value={capacity} onChange={(e) => setCapacity(e.target.value)}>
              <option value="">{t('any')}</option>
              {[2, 4, 6, 8].map((count) => <option key={count} value={count}>{count}+</option>)}
            </select>
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineSearch /> {t('search')}</label>
            <input className="input" placeholder={t('tableOrLocation')} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-lg)', alignItems: 'start' }}>
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <HiOutlineViewGrid style={{ fontSize: '2.5rem', marginBottom: 12 }} />
              <div>{t('noTablesAvailable')}</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
              {filtered.map((table) => {
                const isAvail = table.status === 'available';
                const isSel = selected?._id === table._id;
                return (
                  <button
                    key={table._id}
                    disabled={!isAvail}
                    onClick={() => isAvail && setSelected(table)}
                    className={`card ${isAvail ? 'card-hover' : ''}`}
                    style={{
                      textAlign: 'left',
                      cursor: isAvail ? 'pointer' : 'not-allowed',
                      opacity: isAvail ? 1 : 0.5,
                      border: isSel ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSel ? 'var(--bg-tertiary)' : undefined,
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    {isSel && <HiOutlineCheckCircle style={{ position: 'absolute', top: 12, right: 12, color: 'var(--primary)', fontSize: '1.25rem' }} />}
                    <HiOutlineCube style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }} />
                    <div className="font-bold text-lg">{table.tableNumber}</div>
                    <div className="text-xs text-muted mb-sm">{table.location || 'Indoor'}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm"><HiOutlineUsers style={{ display: 'inline', marginRight: 4 }} />{table.capacity} {t('seats')}</span>
                      <span className={`badge badge-${isAvail ? 'success' : table.status === 'reserved' ? 'warning' : 'danger'}`} style={{ fontSize: '0.65rem' }}>
                        {t(`status_${table.status}`) || table.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="card" style={{ position: 'sticky', top: 100 }}>
          <h3 className="font-bold mb-lg">{t('yourReservation')}</h3>

          {!selected ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              <HiOutlineViewGrid style={{ fontSize: '2rem', marginBottom: 8 }} />
              <div className="text-sm">{t('selectTableContinue')}</div>
            </div>
          ) : (
            <>
              <div className="card" style={{ background: 'var(--bg-tertiary)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', fontSize: '0.875rem' }}>
                  <span className="text-muted">{t('table')}</span><span className="font-bold">{selected.tableNumber}</span>
                  <span className="text-muted">{t('location')}</span><span className="font-bold">{selected.location || 'Indoor'}</span>
                  <span className="text-muted">{t('capacity')}</span><span className="font-bold">{selected.capacity} {t('seats')}</span>
                  <span className="text-muted">{t('date')}</span><span className="font-bold">{date ? new Date(date).toLocaleDateString('en-IN') : '-'}</span>
                  <span className="text-muted">{t('time')}</span><span className="font-bold">{time || '-'}</span>
                </div>
              </div>

              <div className="input-group mb-md">
                <label>{t('numberOfGuests')}</label>
                <input type="number" className="input" min={1} max={selected.capacity} value={guestCount} onChange={(e) => setGuests(e.target.value)} />
                <div className="text-xs text-muted">{t('maxGuests')}: {selected.capacity}</div>
              </div>
              <div className="input-group mb-lg">
                <label>{t('specialRequests')}</label>
                <textarea className="input" rows={2} placeholder={t('specialRequestsPlaceholder')} value={requests} onChange={(e) => setRequests(e.target.value)} />
              </div>

              <button className="btn btn-primary w-full" onClick={handleBook} disabled={booking || !date || !time}>
                {booking ? t('booking') : <><HiOutlineCheckCircle /> {t('confirmReservation')}</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
