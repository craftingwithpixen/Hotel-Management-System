import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

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
    <div className="animate-fade">
      <div className="mb-lg">
        <h1 className="font-display text-3xl">Book a Room</h1>
        <p className="text-muted">Find available rooms and reserve your stay instantly.</p>
      </div>

      <div className="card mb-lg">
        <div className="grid grid-2 gap-md">
          <div className="input-group">
            <label>Check-in Date</label>
            <input className="input" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Check-out Date</label>
            <input className="input" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Room Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </div>
          <div className="input-group">
            <label>Guests</label>
            <input
              className="input"
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>Special Requests (optional)</label>
            <textarea
              className="input"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Late check-in, extra pillows, etc."
            />
          </div>
        </div>
        <div className="flex gap-sm" style={{ marginTop: 'var(--space-md)' }}>
          <button className="btn btn-primary" onClick={searchRooms} disabled={loading}>
            {loading ? 'Searching...' : 'Search Available Rooms'}
          </button>
          <Link to="/customer/bookings" className="btn btn-outline">My Bookings</Link>
        </div>
      </div>

      <div className="grid grid-auto gap-lg">
        {rooms.length === 0 ? (
          <div className="card">
            <p className="text-muted">No rooms loaded yet. Pick dates and search availability.</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room._id} className="card card-hover">
              {room.images?.[0] ? (
                <img
                  src={room.images[0]}
                  alt={`Room ${room.roomNumber}`}
                  style={{ width: '100%', height: 170, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-md)' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 170,
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-md)',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  No Image
                </div>
              )}

              <div className="flex justify-between items-center mb-sm">
                <h3 className="font-bold text-lg">Room {room.roomNumber}</h3>
                <span className="badge badge-success">{room.status}</span>
              </div>
              <p className="text-sm text-muted mb-xs" style={{ textTransform: 'capitalize' }}>
                {room.type} · {room.capacity} guest{room.capacity > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted mb-md">Check-in {room.checkInTime || '14:00'} · Check-out {room.checkOutTime || '11:00'}</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold">₹{room.pricePerNight}</span>
                  <span className="text-sm text-muted"> / night</span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleBook(room._id)}
                  disabled={bookingRoomId === room._id}
                >
                  {bookingRoomId === room._id ? 'Booking...' : 'Book Now'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
