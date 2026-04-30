import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Bookings() {
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    try {
      await api.put(`/bookings/${bookingId}/cancel`, { reason: 'Cancelled by customer' });
      toast.success('Booking cancelled');
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
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
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 className="text-2xl mb-sm">Your bookings</h2>
        <p className="text-muted mb-lg">Sign in to view and manage your room reservations.</p>
        <Link className="btn btn-primary" to="/login">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="mb-lg">
        <h1 className="font-display text-3xl">My Bookings</h1>
        <p className="text-muted">Track your stays and reservation status.</p>
      </div>

      {loading && <div className="card">Loading bookings...</div>}
      {!loading && error && <div className="card">{error}</div>}

      {!loading && !error && (
        <div className="grid gap-lg">
          {bookings.length === 0 ? (
            <div className="card">
              <p className="text-muted">You do not have any bookings yet.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="card">
                <div className="flex justify-between items-center mb-sm">
                  <h3 className="font-bold">
                    {booking.type === 'room'
                      ? `Room ${booking.room?.roomNumber || '-'}`
                      : `Table ${booking.table?.tableNumber || '-'}`}
                  </h3>
                  <span className="badge">{booking.status || 'pending'}</span>
                </div>
                <p className="text-sm text-muted">
                  Booking ID:{' '}
                  <button className="btn btn-ghost btn-sm" onClick={() => copyBookingCode(booking.bookingCode)}>
                    {booking.bookingCode || 'BKG-—'}
                  </button>
                </p>
                <p className="text-sm text-muted">
                  Type: <span style={{ textTransform: 'capitalize' }}>{booking.type}</span>
                </p>
                <p className="text-sm text-muted">
                  Check-in: {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-IN') : 'N/A'}
                </p>
                <p className="text-sm text-muted">
                  Check-out: {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-IN') : 'N/A'}
                </p>
                <p className="text-sm text-muted mb-sm">
                  Guests: {booking.guestCount || 0}
                </p>
                {['pending', 'confirmed'].includes(booking.status) && (
                  <button className="btn btn-outline btn-sm" onClick={() => cancelBooking(booking._id)}>
                    Cancel Booking
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
