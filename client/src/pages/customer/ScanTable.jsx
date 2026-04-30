import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlinePlus, HiOutlineMinus, HiOutlineCheckCircle } from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { veg: '🥗', non_veg: '🍗', drinks: '🥤', dessert: '🍰', combo: '🎁' };
const goldButton = {
  border: '1px solid #d2c495',
  background: 'linear-gradient(90deg, #b5a776, #958657)',
  color: '#fdfbf5',
  borderRadius: 999,
  padding: '0.5rem 1rem',
  fontWeight: 700,
  boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
  cursor: 'pointer',
  fontSize: '0.82rem',
};

export default function ScanTable() {
  const { tableId } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [tableData, setTableData] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/customer/scan/table/${tableId}`)
      .then(({ data }) => { setTableData(data.table); setMenu(data.menu || []); })
      .catch(() => toast.error('Invalid table QR code'))
      .finally(() => setLoading(false));
  }, [tableId]);

  const categories = ['all', ...new Set(menu.map(i => i.category))];
  const filtered = menu.filter(i => category === 'all' || i.category === category);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.menuItem._id === item._id);
      if (ex) return prev.map(c => c.menuItem._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1, notes: '' }];
    });
  };

  const changeQty = (id, d) => setCart(prev => prev.map(c => c.menuItem._id === id ? { ...c, quantity: c.quantity + d } : c).filter(c => c.quantity > 0));
  const cartTotal = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return toast.error('Add at least one item');
    if (!isAuthenticated) return toast.error('Please login to place an order');
    setSubmitting(true);
    try {
      await api.post('/orders', {
        tableId,
        items: cart.map(c => ({ menuItemId: c.menuItem._id, quantity: c.quantity, notes: c.notes })),
        isQROrder: true,
        customerId: user?._id,
      });
      setSubmitted(true);
      toast.success('Order placed! Kitchen is preparing your food 🍳');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
          padding: 'var(--space-xl)',
          color: '#f4f5ef',
        }}
      >
        <HiOutlineCheckCircle style={{ fontSize: '5rem', color: '#8dd7b5', marginBottom: 'var(--space-lg)' }} />
        <h2 className="font-bold text-xl" style={{ marginBottom: 'var(--space-sm)' }}>Order Placed!</h2>
        <p style={{ textAlign: 'center', color: '#b7c1bb', maxWidth: 520 }}>
          Your order for <strong>{tableData?.hotel?.name}</strong> · Table <strong>{tableData?.tableNumber}</strong> is being prepared.
        </p>
        <button
          type="button"
          style={{ ...goldButton, marginTop: 'var(--space-xl)', padding: '0.66rem 1.35rem' }}
          onClick={() => { setSubmitted(false); setCart([]); }}
        >
          Order More
        </button>
      </div>
    );
  }

  return (
    <div
      className="animate-fade"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
        padding: 'var(--space-lg)',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 'var(--space-lg)',
            border: '1px solid rgba(255,255,255,0.1)',
            background:
              "linear-gradient(110deg, rgba(8,12,14,0.92), rgba(8,12,14,0.75)), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80') center/cover",
            boxShadow: '0 18px 38px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ padding: '1.75rem' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.24em', color: '#d8c69b', marginBottom: 8 }}>
              SCAN & ORDER
            </p>
            <h1 className="font-bold" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', lineHeight: 1.15, marginBottom: 8 }}>
              {tableData?.hotel?.name || 'Grand Paradise'}
            </h1>
            <p style={{ color: '#c5cdc8' }}>
              Table {tableData?.tableNumber} · Fresh food, quick service, and real-time kitchen updates.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-md)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                fontWeight: 600,
                flexShrink: 0,
                background: category === c ? 'rgba(181,167,118,0.22)' : 'rgba(255,255,255,0.04)',
                color: category === c ? '#e9d9a8' : '#a8b3ad',
                transition: 'all 0.2s',
              }}
            >
              {CATEGORY_ICONS[c] || ''} {c === 'all' ? 'All' : c.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="scan-table-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-md)' }}>
          <div>
            {filtered.length === 0 ? (
              <div
                className="card"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  textAlign: 'center',
                  color: '#b7c1bb',
                }}
              >
                No menu items found in this category.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-md)',
                    alignItems: 'center',
                    borderColor: 'rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 84,
                        height: 84,
                        borderRadius: 'var(--radius-md)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#8a9690',
                        fontSize: '0.8rem',
                      }}
                    >
                      No image
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold text-sm" style={{ color: '#f4f5ef' }}>{item.name}</div>
                    {item.description && (
                      <div
                        className="text-xs"
                        style={{
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#8a9690',
                        }}
                      >
                        {item.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <span className="font-bold" style={{ color: '#e9bf47' }}>₹{item.price}</span>
                      {cart.find((c) => c.menuItem._id === item._id) ? (
                        <div className="flex items-center gap-sm">
                          <button
                            className="btn btn-ghost btn-icon"
                            style={{ padding: 4, borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
                            onClick={() => changeQty(item._id, -1)}
                            type="button"
                          >
                            <HiOutlineMinus />
                          </button>
                          <span className="font-bold" style={{ color: '#e9d9a8' }}>
                            {cart.find((c) => c.menuItem._id === item._id)?.quantity}
                          </span>
                          <button
                            className="btn btn-ghost btn-icon"
                            style={{ padding: 4, borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
                            onClick={() => changeQty(item._id, 1)}
                            type="button"
                          >
                            <HiOutlinePlus />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => addToCart(item)} style={goldButton}>
                          <HiOutlinePlus /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <div
              style={{
                position: 'sticky',
                top: 'var(--space-md)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                padding: 'var(--space-lg)',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
                <div className="flex items-center gap-sm">
                  <HiOutlineShoppingCart style={{ color: '#dfcf9f' }} />
                  <span className="font-semibold">Your Cart</span>
                </div>
                <span style={{ color: '#8a9690', fontSize: '0.85rem' }}>
                  {cart.reduce((s, c) => s + c.quantity, 0)} items
                </span>
              </div>

              {cart.length === 0 ? (
                <p style={{ color: '#8a9690', fontSize: '0.9rem', marginBottom: 0 }}>
                  Add menu items to start your order.
                </p>
              ) : (
                <>
                  <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 'var(--space-md)' }}>
                    {cart.map((c) => (
                      <div key={c.menuItem._id} className="flex items-center justify-between" style={{ padding: '0.45rem 0' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, color: '#dfe6e1', fontSize: '0.88rem' }}>{c.menuItem.name}</p>
                          <p style={{ margin: 0, color: '#8a9690', fontSize: '0.75rem' }}>
                            ₹{c.menuItem.price} x {c.quantity}
                          </p>
                        </div>
                        <span style={{ color: '#e9bf47', fontWeight: 700 }}>
                          ₹{(c.menuItem.price * c.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg" style={{ color: '#e9bf47' }}>
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}

              <button
                className="w-full"
                type="button"
                onClick={placeOrder}
                disabled={submitting || cart.length === 0}
                style={{ ...goldButton, width: '100%', justifyContent: 'center', opacity: submitting || cart.length === 0 ? 0.6 : 1 }}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
              {!isAuthenticated && (
                <div className="text-xs" style={{ textAlign: 'center', marginTop: 8, color: '#8a9690' }}>
                  You need to be logged in to place an order.{' '}
                  <a href="/login" style={{ color: '#dfcf9f' }}>Login</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .scan-table-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
