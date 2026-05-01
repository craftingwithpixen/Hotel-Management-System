import { useState, useEffect } from 'react';
import { HiOutlineShoppingCart, HiOutlinePlus, HiOutlineMinus, HiOutlineTrash, HiOutlinePrinter, HiOutlineSearch } from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function OrderPad() {
  const { user } = useAuthStore();
  const [tables, setTables]   = useState([]);
  const [menu, setMenu]       = useState([]);
  const [selTable, setSelTable] = useState(null);
  const [cart, setCart]       = useState([]);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/tables'),
      api.get('/menu'),
    ]).then(([tRes, mRes]) => {
      setTables(tRes.data.tables || []);
      // Normalize menu payload from backend and keep only available, non-deleted items.
      const rawMenu = Array.isArray(mRes.data?.items)
        ? mRes.data.items
        : Array.isArray(mRes.data?.menuItems)
          ? mRes.data.menuItems
          : [];
      const availableMenu = rawMenu.filter((item) => item && item.isDeleted !== true && item.isAvailable !== false);
      setMenu(availableMenu);
      if (availableMenu.length === 0) {
        toast('No available menu items found in DB');
      }
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(menu.map(i => i.category))];

  const filtered = menu.filter(item => {
    const matchCat = category === 'all' || item.category === category;
    const matchSearch = (item.name || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const exist = prev.find(c => c.menuItem._id === item._id);
      if (exist) return prev.map(c => c.menuItem._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1, notes: '', price: item.price }];
    });
  };

  const changeQty = (itemId, delta) => {
    setCart(prev => prev
      .map(c => c.menuItem._id === itemId ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const submitOrder = async () => {
    if (!selTable) return toast.error('Select a table first');
    if (cart.length === 0) return toast.error('Add at least one item');
    setSubmitting(true);
    try {
      await api.post('/orders', {
        tableId: selTable._id,
        items: cart.map(c => ({ menuItemId: c.menuItem._id, quantity: c.quantity, notes: c.notes })),
      });
      toast.success(`Order sent to kitchen for Table ${selTable.tableNumber}!`);
      setCart([]);
      setSelTable(null);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || 'Failed to place order';
      toast.error(status ? `(${status}) ${message}` : message);
      // Helpful for debugging API payload/response mismatches.
      console.error('Order submit failed:', err?.response?.data || err);
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-lg)', height: 'calc(100vh - 140px)' }}>
      {/* Left — Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="page-header" style={{ flexShrink: 0 }}>
          <div><h1>Order Pad</h1><p className="text-muted">Select table, then add items</p></div>
        </div>

        {/* Table Select */}
        <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-md)', flexShrink: 0 }}>
          {tables.filter(t => t.status !== 'reserved').map(t => (
            <button
              key={t._id}
              onClick={() => setSelTable(t)}
              className={`btn btn-sm ${selTable?._id === t._id ? 'btn-primary' : 'btn-outline'}`}
              style={{ minWidth: 64 }}
            >
              {t.tableNumber}
              <span style={{ fontSize: '0.65rem', display: 'block', opacity: 0.8 }}>{t.status}</span>
            </button>
          ))}
        </div>

        {/* Search + Category Filter */}
        <div className="flex gap-sm" style={{ marginBottom: 'var(--space-md)', flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <HiOutlineSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <div className="tabs">
            {categories.map(c => (
              <button key={c} className={`tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)} style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-xl)' }}>
              {menu.length === 0
                ? 'No menu items available in database.'
                : 'No items match your search/filter.'}
            </div>
          ) : (
            <div className="grid grid-3 gap-md">
              {filtered.map(item => (
                <button
                  key={item._id}
                  onClick={() => addToCart(item)}
                  className="card card-hover"
                  style={{ textAlign: 'left', cursor: 'pointer', padding: 'var(--space-md)', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                >
                  {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-sm)' }} />}
                  <div className="font-semibold text-sm" style={{ marginBottom: 2 }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>₹{item.price}</span>
                    <span className={`badge ${item.category === 'veg' ? 'badge-success' : item.category === 'non_veg' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                      {item.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right — Cart */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h3 className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineShoppingCart />
            {selTable ? `Table ${selTable.tableNumber}` : 'No table selected'}
          </h3>
          <div className="text-xs text-muted">{cart.length} item(s) · ₹{cartTotal.toLocaleString('en-IN')}</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
              <HiOutlineShoppingCart style={{ fontSize: '2rem', marginBottom: 8 }} />
              <div className="text-sm">Cart is empty</div>
            </div>
          ) : cart.map(item => (
            <div key={item.menuItem._id} style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                <span className="text-sm font-medium">{item.menuItem.name}</span>
                <button onClick={() => setCart(prev => prev.filter(c => c.menuItem._id !== item.menuItem._id))} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)', padding: 2 }}>
                  <HiOutlineTrash style={{ fontSize: '0.875rem' }} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <button className="btn btn-ghost btn-icon" style={{ padding: 2 }} onClick={() => changeQty(item.menuItem._id, -1)}><HiOutlineMinus style={{ fontSize: '0.875rem' }} /></button>
                  <span className="font-bold" style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button className="btn btn-ghost btn-icon" style={{ padding: 2 }} onClick={() => changeQty(item.menuItem._id, 1)}><HiOutlinePlus style={{ fontSize: '0.875rem' }} /></button>
                </div>
                <span className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
              <input
                className="input"
                placeholder="Special note (optional)"
                value={item.notes}
                onChange={e => setCart(prev => prev.map(c => c.menuItem._id === item.menuItem._id ? { ...c, notes: e.target.value } : c))}
                style={{ marginTop: 4, fontSize: '0.8rem', padding: '4px 8px' }}
              />
            </div>
          ))}
        </div>

        <div style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={submitOrder}
            disabled={submitting}
          >
            <HiOutlinePrinter />
            {submitting ? 'Sending...' : 'Send to Kitchen'}
          </button>
          {!selTable && <div className="text-xs text-muted" style={{ marginTop: 8 }}>Select a table to send order.</div>}
          {cart.length === 0 && <div className="text-xs text-muted" style={{ marginTop: 4 }}>Add items to cart before sending.</div>}
        </div>
      </div>
    </div>
  );
}
