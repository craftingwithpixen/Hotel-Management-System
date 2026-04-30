import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const goldButton = {
  border: '1px solid #d2c495',
  background: 'linear-gradient(90deg, #b5a776, #958657)',
  color: '#fdfbf5',
  borderRadius: 999,
  padding: '0.58rem 1.2rem',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
  cursor: 'pointer',
  fontSize: '0.84rem',
};

const getStatusStyle = (status) => {
  const value = (status || 'pending').toLowerCase();
  if (value === 'confirmed') {
    return {
      background: 'rgba(181,167,118,0.2)',
      color: '#dfcf9f',
      border: '1px solid rgba(181,167,118,0.35)',
    };
  }
  if (value === 'checked_in') {
    return {
      background: 'rgba(94, 180, 140, 0.18)',
      color: '#8dd7b5',
      border: '1px solid rgba(94, 180, 140, 0.35)',
    };
  }
  if (value === 'cancelled') {
    return {
      background: 'rgba(228, 94, 94, 0.14)',
      color: '#f0adad',
      border: '1px solid rgba(228, 94, 94, 0.3)',
    };
  }
  return {
    background: 'rgba(120, 131, 144, 0.22)',
    color: '#c4cbd2',
    border: '1px solid rgba(120, 131, 144, 0.32)',
  };
};

export default function Bookings() {
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const cancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`, { reason: 'Cancelled by customer' });
      toast.success('Booking cancelled');
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
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

  if (!isAuthenticated) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          borderColor: 'rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <h2 className="text-2xl mb-sm" style={{ color: '#f4f5ef' }}>Your bookings</h2>
        <p className="text-muted mb-lg">Sign in to view and manage your room reservations.</p>
        <Link className="btn btn-primary" to="/login" style={goldButton}>Sign In</Link>
      </div>
    );
  }

  return (
    <div
      className="animate-fade"
      style={{
        margin: 'calc(-1 * var(--space-xl)) calc(-1 * var(--space-xl)) 0',
        padding: 'var(--space-xl)',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
      }}
    >
      <div className="flex items-center justify-between mb-lg" style={{ gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 8 }}>
            MY BOOKINGS
          </p>
          <h1 className="font-bold" style={{ fontSize: 'clamp(1.25rem, 2.6vw, 1.9rem)', lineHeight: 1.2, margin: 0 }}>
            Track your stays and reservation status
          </h1>
        </div>
        <Link to="/customer/book-room" style={goldButton}>Book New Room</Link>
      </div>

      {loading && (
        <div
          className="card"
          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#c5cdc8' }}
        >
          Loading bookings...
        </div>
      )}
      {!loading && error && (
        <div
          className="card"
          style={{ borderColor: 'rgba(220,80,80,0.35)', background: 'rgba(220,80,80,0.08)', color: '#f0b2b2' }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-lg">
          {bookings.length === 0 ? (
            <div
              className="card"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                textAlign: 'center',
                padding: 'var(--space-2xl)',
              }}
            >
              <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                You do not have any bookings yet.
              </p>
              <Link to="/customer/book-room" style={goldButton}>Book a Room</Link>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking._id}
                className="card card-hover"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  boxShadow: '0 14px 26px rgba(0,0,0,0.25)',
                }}
              >
                <div className="flex justify-between items-center mb-sm">
                  <h3 className="font-bold" style={{ color: '#f4f5ef' }}>
                    {booking.type === 'room'
                      ? `Room ${booking.room?.roomNumber || '-'}`
                      : `Table ${booking.table?.tableNumber || '-'}`}
                  </h3>
                  <span
                    className="badge"
                    style={{
                      textTransform: 'capitalize',
                      fontWeight: 700,
                      ...getStatusStyle(booking.status),
                    }}
                  >
                    {(booking.status || 'pending').replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#b7c1bb' }}>
                  Booking ID:{' '}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyBookingCode(booking.bookingCode)}
                    style={{ color: '#dfcf9f' }}
                  >
                    {booking.bookingCode || 'BKG-—'}
                  </button>
                </p>
                <p className="text-sm" style={{ color: '#9aa6a0' }}>
                  Type: <span style={{ textTransform: 'capitalize' }}>{booking.type}</span>
                </p>
                <p className="text-sm" style={{ color: '#9aa6a0' }}>
                  Check-in: {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-IN') : 'N/A'}
                </p>
                <p className="text-sm" style={{ color: '#9aa6a0' }}>
                  Check-out: {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-IN') : 'N/A'}
                </p>
                <p className="text-sm mb-sm" style={{ color: '#9aa6a0' }}>
                  Guests: {booking.guestCount || 0}
                </p>
                {['pending', 'confirmed'].includes(booking.status) && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => cancelBooking(booking._id)}
                    disabled={cancellingId === booking._id}
                    style={{
                      borderColor: 'rgba(220,100,100,0.4)',
                      background: 'rgba(220,100,100,0.08)',
                      color: '#f0b2b2',
                    }}
                  >
                    {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
