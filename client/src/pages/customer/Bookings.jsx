import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMinus, HiOutlinePlus, HiOutlineShoppingCart, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { getCustomerText } from '../../i18n/customerText';

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
  const navigate = useNavigate();
  const { isAuthenticated, user, preferredLang } = useAuthStore();
  const t = getCustomerText(user?.preferredLang || preferredLang);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [orderBooking, setOrderBooking] = useState(null);
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const loadBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || t('failed'));
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
      toast.success(t('bookingCancelled'));
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b)));
    } catch (err) {
      toast.error(err.response?.data?.message || t('failed'));
    } finally {
      setCancellingId(null);
    }
  };

  const copyBookingCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`${t('copied')} ${code}`);
    } catch {
      toast.error(t('copyFailed'));
    }
  };

  const openRoomOrder = async (booking) => {
    setOrderBooking(booking);
    setCart([]);
    setOrderSearch('');
    if (menu.length > 0) return;

    setMenuLoading(true);
    try {
      const { data } = await api.get('/menu', { params: { available: 'true' } });
      setMenu((data.items || []).filter((item) => item.isAvailable !== false && item.isDeleted !== true));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load menu');
    } finally {
      setMenuLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.menuItem._id === item._id);
      if (existing) {
        return prev.map((cartItem) => cartItem.menuItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem);
      }
      return [...prev, { menuItem: item, quantity: 1, notes: '', price: item.price }];
    });
  };

  const changeQty = (itemId, delta) => {
    setCart((prev) => prev
      .map((item) => item.menuItem._id === itemId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  };

  const submitRoomOrder = async () => {
    if (!orderBooking?.room?._id) return toast.error('Room is missing for this booking');
    if (cart.length === 0) return toast.error('Add at least one food item');

    setSubmittingOrder(true);
    try {
      await api.post('/orders', {
        roomId: orderBooking.room._id,
        bookingId: orderBooking._id,
        items: cart.map((item) => ({
          menuItemId: item.menuItem._id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      });
      toast.success('Room service order sent to kitchen');
      setOrderBooking(null);
      setCart([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place room order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const filteredMenu = menu.filter((item) => (item.name || '').toLowerCase().includes(orderSearch.toLowerCase()));
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        <h2 className="text-2xl mb-sm" style={{ color: '#f4f5ef' }}>{t('bookings')}</h2>
        <p className="text-muted mb-lg">{t('bookingsSignInHelp')}</p>
        <Link className="btn btn-primary" to="/login" style={goldButton}>{t('signIn')}</Link>
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
            {t('myBookings')}
          </p>
          <h1 className="font-bold" style={{ fontSize: 'clamp(1.25rem, 2.6vw, 1.9rem)', lineHeight: 1.2, margin: 0 }}>
            {t('bookingsHeading')}
          </h1>
        </div>
        <Link to="/customer/book-room" style={goldButton}>{t('bookNewRoom')}</Link>
      </div>

      {loading && (
        <div
          className="card"
          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#c5cdc8' }}
        >
          {t('loadingBookings')}
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
                {t('noBookings')}
              </p>
              <Link to="/customer/book-room" style={goldButton}>{t('bookRoom')}</Link>
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
                      ? `${t('room')} ${booking.room?.roomNumber || '-'}`
                      : `${t('table')} ${booking.table?.tableNumber || '-'}`}
                  </h3>
                  <span
                    className="badge"
                    style={{
                      textTransform: 'capitalize',
                      fontWeight: 700,
                      ...getStatusStyle(booking.status),
                    }}
                  >
                    {t(`status_${booking.status || 'pending'}`)}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#b7c1bb' }}>
                  {t('bookingId')}:{' '}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyBookingCode(booking.bookingCode)}
                    style={{ color: '#dfcf9f' }}
                  >
                    {booking.bookingCode || 'BKG-—'}
                  </button>
                </p>
                <p className="text-sm" style={{ color: '#9aa6a0' }}>
                  {t('type')}: <span style={{ textTransform: 'capitalize' }}>{booking.type === 'room' ? t('room') : t('table')}</span>
                </p>
                <p className="text-sm" style={{ color: '#9aa6a0' }}>
                  {t('checkIn')}: {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-IN') : 'N/A'}
                </p>
                <p className="text-sm" style={{ color: '#9aa6a0' }}>
                  {t('checkOut')}: {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-IN') : 'N/A'}
                </p>
                <p className="text-sm mb-sm" style={{ color: '#9aa6a0' }}>
                  {t('guests')}: {booking.guestCount || 0}
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
                    {cancellingId === booking._id ? t('cancelling') : t('cancelBooking')}
                  </button>
                )}
                {booking.type === 'room' && ['confirmed', 'checked_in'].includes(booking.status) && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/customer/room-order/${booking._id}`)}
                    style={{ marginLeft: 'var(--space-sm)', ...goldButton, padding: '0.48rem 1rem' }}
                  >
                    <HiOutlineShoppingCart /> Order Food
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {orderBooking && (
        <div className="modal-overlay" onClick={() => setOrderBooking(null)}>
          <div
            className="modal modal-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 920, maxHeight: '88vh', overflowY: 'auto', background: '#101a1d', color: '#f4f5ef' }}
          >
            <div className="modal-header">
              <div>
                <h2>Room {orderBooking.room?.roomNumber || '-'} Food Order</h2>
                <p className="text-sm" style={{ color: '#9aa6a0', marginTop: 4 }}>Choose from all currently available food items.</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setOrderBooking(null)}><HiOutlineX /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 'var(--space-lg)' }}>
              <div>
                <input
                  className="input"
                  placeholder="Search food..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{ ...inputDark, marginBottom: 'var(--space-md)' }}
                />

                {menuLoading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
                ) : filteredMenu.length === 0 ? (
                  <div className="card" style={{ background: 'rgba(255,255,255,0.03)', color: '#9aa6a0', textAlign: 'center' }}>No food items available</div>
                ) : (
                  <div className="grid grid-2 gap-md">
                    {filteredMenu.map((item) => (
                      <button
                        key={item._id}
                        className="card card-hover"
                        onClick={() => addToCart(item)}
                        style={{ textAlign: 'left', background: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f5ef' }}
                      >
                        {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />}
                        <div className="font-bold">{item.name}</div>
                        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                          <span style={{ color: '#e9bf47', fontWeight: 800 }}>₹{item.price}</span>
                          <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{item.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <aside className="card" style={{ background: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.1)', alignSelf: 'start' }}>
                <h3 className="font-bold mb-md" style={{ color: '#f4f5ef' }}>Order Cart</h3>
                {cart.length === 0 ? (
                  <p className="text-sm" style={{ color: '#9aa6a0' }}>Add food items from the menu.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                    {cart.map((item) => (
                      <div key={item.menuItem._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 'var(--space-sm)' }}>
                        <div className="flex items-center justify-between gap-sm">
                          <strong>{item.menuItem.name}</strong>
                          <button className="btn btn-ghost btn-icon" style={{ color: '#f0b2b2' }} onClick={() => setCart((prev) => prev.filter((cartItem) => cartItem.menuItem._id !== item.menuItem._id))}>
                            <HiOutlineTrash />
                          </button>
                        </div>
                        <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                          <div className="flex items-center gap-sm">
                            <button className="btn btn-ghost btn-icon" onClick={() => changeQty(item.menuItem._id, -1)}><HiOutlineMinus /></button>
                            <strong>{item.quantity}</strong>
                            <button className="btn btn-ghost btn-icon" onClick={() => changeQty(item.menuItem._id, 1)}><HiOutlinePlus /></button>
                          </div>
                          <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                        <input
                          className="input"
                          placeholder="Note"
                          value={item.notes}
                          onChange={(e) => setCart((prev) => prev.map((cartItem) => cartItem.menuItem._id === item.menuItem._id ? { ...cartItem, notes: e.target.value } : cartItem))}
                          style={{ ...inputDark, marginTop: 8, padding: '0.45rem 0.65rem' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="font-bold">Total</span>
                  <span className="font-bold" style={{ color: '#e9bf47' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <button className="btn btn-primary w-full" onClick={submitRoomOrder} disabled={submittingOrder || cart.length === 0} style={{ marginTop: 'var(--space-md)', ...goldButton, width: '100%' }}>
                  {submittingOrder ? 'Sending...' : 'Send to Kitchen'}
                </button>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
