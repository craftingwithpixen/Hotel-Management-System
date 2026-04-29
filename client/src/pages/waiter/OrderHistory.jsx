import { useState, useEffect, useCallback } from 'react';
import { HiOutlineRefresh, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending:   'warning',
  preparing: 'info',
  ready:     'success',
  served:    'success',
  billed:    'danger',
};

export default function OrderHistory() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data.orders || []);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(o =>
    o.table?.tableNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o._id.includes(search)
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>📋 Order History</h1>
          <p className="text-muted">{orders.length} total orders</p>
        </div>
        <button className="btn btn-outline" onClick={fetchOrders}><HiOutlineRefresh /> Refresh</button>
      </div>

      <div style={{ position: 'relative', marginBottom: 'var(--space-lg)' }}>
        <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" placeholder="Search by table number or order ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order._id}>
                  <td className="text-xs text-muted font-mono">#{order._id.slice(-8)}</td>
                  <td><span className="badge badge-info">T{order.table?.tableNumber || '—'}</span></td>
                  <td className="text-sm">
                    {order.items?.slice(0, 2).map(i => `${i.quantity}× ${i.menuItem?.name || 'Item'}`).join(', ')}
                    {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                  </td>
                  <td className="font-semibold">
                    ₹{order.items?.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`badge badge-${STATUS_BADGE[order.overallStatus] || 'info'}`} style={{ textTransform: 'capitalize' }}>
                      {order.overallStatus}
                    </span>
                  </td>
                  <td className="text-xs text-muted">
                    {new Date(order.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(order)}>
                      <HiOutlineEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No orders found</div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selected._id.slice(-8)}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div>
              <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-md)' }}>
                <span className="badge badge-info">Table {selected.table?.tableNumber}</span>
                <span className={`badge badge-${STATUS_BADGE[selected.overallStatus]}`} style={{ textTransform: 'capitalize' }}>
                  {selected.overallStatus}
                </span>
                {selected.kotPrinted && <span className="badge badge-success">KOT Printed</span>}
              </div>
              <table className="data-table">
                <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {selected.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.menuItem?.name || 'Item'}{item.notes && <div className="text-xs text-muted italic">{item.notes}</div>}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</td>
                      <td><span className={`badge badge-${STATUS_BADGE[item.status]}`} style={{ fontSize: '0.7rem' }}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 'var(--space-md)', textAlign: 'right' }}>
                <strong>Total: ₹{selected.items?.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
