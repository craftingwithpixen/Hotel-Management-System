import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const goldButton = {
  border: '1px solid #d2c495',
  background: 'linear-gradient(90deg, #b5a776, #958657)',
  color: '#fdfbf5',
  borderRadius: 999,
  padding: '0.66rem 1.35rem',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
  cursor: 'pointer',
  fontSize: '0.875rem',
};

const inputDark = {
  background: 'rgba(255,255,255,0.08)',
  borderColor: 'rgba(255,255,255,0.12)',
  color: '#f4f5ef',
};

export default function BookRoom() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [type, setType] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingRoomId, setBookingRoomId] = useState(null);

  const canSearch = useMemo(() => Boolean(checkIn && checkOut), [checkIn, checkOut]);

  const searchRooms = async () => {
    if (!canSearch) {
      toast.error('Please choose check-in and check-out dates');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out must be after check-in');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/bookings/available-rooms', {
        params: { checkIn, checkOut, type: type || undefined },
      });
      setRooms(data.rooms || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch available rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (roomId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Please select your stay dates first');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out must be after check-in');
      return;
    }

    setBookingRoomId(roomId);
    try {
      await api.post('/bookings/room', {
        roomId,
        checkIn,
        checkOut,
        guestCount: Number(guestCount),
        specialRequests,
      });
      toast.success('Room booked successfully');
      navigate('/customer/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingRoomId(null);
    }
  };

  return (
    <div
      className="animate-fade"
      style={{
        margin: 'calc(-1 * var(--space-xl)) calc(-1 * var(--space-xl)) 0',
        padding: 'var(--space-xl)',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 'var(--space-xl)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: "linear-gradient(110deg, rgba(8,12,14,0.92), rgba(8,12,14,0.75)), url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=80') center/cover",
          boxShadow: '0 18px 38px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ padding: '2rem 1.75rem', maxWidth: 720 }}>
          <div className="flex items-center gap-sm" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{ fontSize: '0.8rem', color: '#d8c69b', textDecoration: 'none' }}
            >
              ← Home
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
            <Link
              to="/customer"
              style={{ fontSize: '0.8rem', color: '#d8c69b', textDecoration: 'none' }}
            >
              Home
            </Link>
          </div>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>
            BOOK YOUR PERFECT STAY
          </p>
          <h1 className="font-bold" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.1, marginBottom: 10 }}>
            Comfortable Stays, Just a Click Away
          </h1>
          <p style={{ color: '#c5cdc8', maxWidth: 520, fontSize: '1.02rem' }}>
            Find available rooms, compare rates, and reserve your stay with instant confirmation.
          </p>
        </div>
      </div>

      <div
        className="card-glass"
        style={{
          marginBottom: 'var(--space-xl)',
          borderColor: 'rgba(255,255,255,0.12)',
          background: 'linear-gradient(120deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        }}
      >
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#d8c69b', marginBottom: 14 }}>
          SEARCH AVAILABILITY
        </p>
        <div className="grid grid-2 gap-md">
          <div className="input-group">
            <label style={{ color: '#b8c2bd' }}>Check-in Date</label>
            <input
              className="input"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              style={inputDark}
            />
          </div>
          <div className="input-group">
            <label style={{ color: '#b8c2bd' }}>Check-out Date</label>
            <input
              className="input"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              style={inputDark}
            />
          </div>
          <div className="input-group">
            <label style={{ color: '#b8c2bd' }}>Room Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)} style={inputDark}>
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </div>
          <div className="input-group">
            <label style={{ color: '#b8c2bd' }}>Guests</label>
            <input
              className="input"
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              style={inputDark}
            />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ color: '#b8c2bd' }}>Special Requests (optional)</label>
            <textarea
              className="input"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Late check-in, extra pillows, etc."
              style={inputDark}
            />
          </div>
        </div>
        <div className="flex gap-sm" style={{ marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{ ...goldButton, opacity: loading ? 0.75 : 1 }}
            onClick={searchRooms}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Available Rooms'}
          </button>
          <Link
            to="/customer/bookings"
            className="btn btn-outline"
            style={{
              borderRadius: 999,
              borderColor: 'rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.06)',
              color: '#f4f5ef',
            }}
          >
            My Bookings
          </Link>
        </div>
      </div>

      <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#d8c69b', marginBottom: 12 }}>
        AVAILABLE ROOMS
      </p>
      <div className="grid grid-auto gap-lg">
        {rooms.length === 0 ? (
          <div
            className="card"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              textAlign: 'center',
              padding: 'var(--space-2xl)',
            }}
          >
            <p className="text-muted" style={{ margin: 0 }}>
              No rooms loaded yet. Pick dates and search availability.
            </p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room._id}
              className="card card-hover"
              style={{
                overflow: 'hidden',
                padding: 0,
                borderColor: 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
                boxShadow: '0 14px 26px rgba(0,0,0,0.25)',
              }}
            >
              {room.images?.[0] ? (
                <img
                  src={room.images[0]}
                  alt={`Room ${room.roomNumber}`}
                  style={{ width: '100%', height: 178, objectFit: 'cover', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 178,
                    background: "linear-gradient(0deg, rgba(8,10,12,0.4), rgba(8,10,12,0.4)), url('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80') center/cover",
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9aa6a0',
                    fontSize: '0.875rem',
                  }}
                >
                  Room {room.roomNumber}
                </div>
              )}

              <div style={{ padding: 'var(--space-lg)' }}>
                <div className="flex justify-between items-center mb-sm">
                  <h3 className="font-bold text-lg" style={{ color: '#f4f5ef' }}>
                    Room {room.roomNumber}
                  </h3>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(181,167,118,0.2)',
                      color: '#dfcf9f',
                      fontWeight: 700,
                    }}
                  >
                    {room.status}
                  </span>
                </div>
                <p className="text-sm mb-xs" style={{ color: '#a8b3ad', textTransform: 'capitalize' }}>
                  {room.type} · {room.capacity} guest{room.capacity > 1 ? 's' : ''}
                </p>
                <p className="text-sm mb-md" style={{ color: '#8a9690' }}>
                  Check-in {room.checkInTime || '14:00'} · Check-out {room.checkOutTime || '11:00'}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xl font-bold" style={{ color: '#e9bf47' }}>
                      ₹{room.pricePerNight}
                    </span>
                    <span className="text-sm" style={{ color: '#8a9690' }}>
                      {' '}
                      / night
                    </span>
                  </div>
                  <button
                    type="button"
                    style={{ ...goldButton, padding: '0.5rem 1.1rem', fontSize: '0.8125rem' }}
                    onClick={() => handleBook(room._id)}
                    disabled={bookingRoomId === room._id}
                  >
                    {bookingRoomId === room._id ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
