import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlinePlus, HiOutlineMinus, HiOutlineCheckCircle } from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { veg: '🥗', non_veg: '🍗', drinks: '🥤', dessert: '🍰', combo: '🎁' };

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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="spinner" />
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 'var(--space-xl)' }}>
      <HiOutlineCheckCircle style={{ fontSize: '5rem', color: 'var(--success)', marginBottom: 'var(--space-lg)' }} />
      <h2 className="font-bold text-xl" style={{ marginBottom: 'var(--space-sm)' }}>Order Placed!</h2>
      <p className="text-muted" style={{ textAlign: 'center' }}>
        Your order for <strong>{tableData?.hotel?.name}</strong> · Table <strong>{tableData?.tableNumber}</strong> is being prepared.
      </p>
      <button className="btn btn-outline" style={{ marginTop: 'var(--space-xl)' }} onClick={() => { setSubmitted(false); setCart([]); }}>
        Order More
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--gradient-primary)', padding: 'var(--space-xl)', textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: '2rem', marginBottom: 4 }}>🍽️</div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
          {tableData?.hotel?.name || 'HospitalityOS'}
        </h1>
        <div style={{ opacity: 0.85, fontSize: '0.875rem' }}>Table {tableData?.tableNumber} · Scan & Order</div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0,
              background: category === c ? 'var(--primary)' : 'var(--bg-primary)',
              color: category === c ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
            {CATEGORY_ICONS[c] || ''} {c === 'all' ? 'All' : c.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, padding: 'var(--space-md)', overflowY: 'auto' }}>
        {filtered.map(item => (
          <div key={item._id} className="card card-hover" style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', alignItems: 'center', padding: 'var(--space-md)' }}>
            {item.image && <img src={item.image} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-semibold text-sm">{item.name}</div>
              {item.description && <div className="text-xs text-muted" style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <span className="font-bold" style={{ color: 'var(--primary)' }}>₹{item.price}</span>
                {cart.find(c => c.menuItem._id === item._id) ? (
                  <div className="flex items-center gap-sm">
                    <button className="btn btn-ghost btn-icon" style={{ padding: 4 }} onClick={() => changeQty(item._id, -1)}><HiOutlineMinus /></button>
                    <span className="font-bold">{cart.find(c => c.menuItem._id === item._id)?.quantity}</span>
                    <button className="btn btn-ghost btn-icon" style={{ padding: 4 }} onClick={() => changeQty(item._id, 1)}><HiOutlinePlus /></button>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)} style={{ padding: '4px 12px' }}>
                    <HiOutlinePlus /> Add
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="flex items-center gap-sm">
              <HiOutlineShoppingCart />
              <span className="font-semibold">{cart.reduce((s, c) => s + c.quantity, 0)} items</span>
            </div>
            <span className="font-bold text-lg">₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
          <button className="btn btn-primary w-full" onClick={placeOrder} disabled={submitting} style={{ fontSize: '1rem', padding: '0.875rem' }}>
            {submitting ? 'Placing Order...' : '🍳 Place Order'}
          </button>
          {!isAuthenticated && (
            <div className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 8 }}>
              You need to be logged in to place an order. <a href="/login" style={{ color: 'var(--primary)' }}>Login</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
