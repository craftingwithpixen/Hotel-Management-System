import { useState, useEffect, useCallback } from 'react';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineFire } from 'react-icons/hi';
import api from '../../services/api';
import useSocket from '../../hooks/useSocket';
import toast from 'react-hot-toast';

const STATUS_COLUMNS = [
  { key: 'pending',   label: 'Pending',   icon: HiOutlineClock,       color: 'var(--accent)' },
  { key: 'preparing', label: 'Preparing', icon: HiOutlineFire,         color: 'var(--warning)' },
  { key: 'ready',     label: 'Ready',     icon: HiOutlineCheckCircle,  color: 'var(--success)' },
];

const NEXT_STATUS = { pending: 'preparing', preparing: 'ready', ready: 'served' };

export default function KitchenBoard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders/kitchen');
      setOrders(data.orders || []);
    } catch { toast.error('Failed to load kitchen orders'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);

    // Listen for real-time new orders
    const offNew = on('new:order', (order) => {
      toast('New order arrived');
      fetchOrders();
    });
    const offUpdate = on('order:update', () => fetchOrders());

    return () => { clearInterval(interval); offNew?.(); offUpdate?.(); };
  }, [fetchOrders, on]);

  const advanceStatus = async (orderId, currentStatus) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: next });
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, overallStatus: next } : o
      ));
      toast.success(`Order marked as ${next}`);
    } catch { toast.error('Failed to update status'); }
  };

  const updateItemStatus = async (orderId, itemId, status) => {
    try {
      await api.put(`/orders/${orderId}/item-status`, { itemId, status });
      fetchOrders();
    } catch { toast.error('Failed to update item'); }
  };

  const byStatus = (status) => orders.filter(o => o.overallStatus === status);
  const getOrderSource = (order) => (
    order.room?.roomNumber
      ? `Room ${order.room.roomNumber}`
      : `Table ${order.table?.tableNumber || '-'}`
  );

  const timeSince = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Kitchen Board</h1>
          <p className="text-muted">{orders.length} active orders · auto-refreshes every 30s</p>
        </div>
        <button className="btn btn-outline" onClick={fetchOrders}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)', alignItems: 'start' }}>
        {STATUS_COLUMNS.map(col => (
          <div key={col.key}>
            {/* Column Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 'var(--space-md)',
              padding: '0.75rem var(--space-md)',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              borderLeft: `4px solid ${col.color}`,
            }}>
              <col.icon style={{ color: col.color, fontSize: '1.25rem' }} />
              <span className="font-bold">{col.label}</span>
              <span className="badge" style={{ marginLeft: 'auto', background: col.color, color: '#fff' }}>
                {byStatus(col.key).length}
              </span>
            </div>

            {/* Order Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {byStatus(col.key).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No orders
                </div>
              ) : byStatus(col.key).map(order => (
                <div key={order._id} className="card card-hover" style={{ borderTop: `3px solid ${col.color}` }}>
                  {/* Order Header */}
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                    <div>
                      <div className="font-bold" style={{ fontSize: '1rem' }}>
                        {getOrderSource(order)}
                      </div>
                      <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <HiOutlineClock style={{ fontSize: '0.75rem' }} />
                        {timeSince(order.createdAt)}
                        {order.waiter ? ` · ${order.waiter.name}` : order.room ? ' · Room service' : ''}
                      </div>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      #{order._id.slice(-6)}
                    </span>
                  </div>

                  {/* Item List */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: idx < order.items.length - 1 ? '1px solid var(--border-light)' : 'none',
                      }}>
                        <div>
                          <div className="text-sm font-medium">
                            {item.quantity}× {item.menuItem?.name || 'Item'}
                          </div>
                          {item.notes && <div className="text-xs text-muted italic">Note: {item.notes}</div>}
                        </div>
                        <select
                          className="input"
                          style={{ fontSize: '0.7rem', padding: '2px 6px', width: 'auto', height: 'auto' }}
                          value={item.status}
                          onChange={e => updateItemStatus(order._id, item._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="served">Served</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Advance Button */}
                  {NEXT_STATUS[col.key] && (
                    <button
                      className="btn btn-primary w-full btn-sm"
                      style={{ background: col.color, borderColor: col.color }}
                      onClick={() => advanceStatus(order._id, col.key)}
                    >
                      Mark as {NEXT_STATUS[col.key].charAt(0).toUpperCase() + NEXT_STATUS[col.key].slice(1)} →
                    </button>
                  )}
                  {col.key === 'ready' && (
                    <div className="badge badge-success" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
                      Notify waiter to collect
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
