import { useEffect, useState } from 'react';
import { HiOutlineViewGrid } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const statusColors = { pending: '#f59e0b', preparing: '#3b82f6', ready: '#10b981', served: '#8b5cf6', billed: '#64748b' };

const timeAgo = (date) => {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

const getTotal = (items) => items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const qs = activeTab === 'all' ? '?limit=50' : `?status=${encodeURIComponent(activeTab)}&limit=50`;
      const url = `/orders${qs}`;
      const { data } = await api.get(url);
      setOrders(data?.orders || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSendKOT = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/kot`);
      toast.success('Sent to kitchen');
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send KOT');
    }
  };

  const handleGenerateBill = async (orderId) => {
    try {
      await api.post('/billing/generate', { orderId });
      toast.success('Bill generated');
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate bill');
    }
  };

  const copyOrderCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied ${code}`);
    } catch {
      toast.error('Failed to copy order code');
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div><h1>Orders</h1><p className="text-muted">Kitchen & table orders</p></div>
      </div>

      <div className="tabs mb-lg">
        {['all', 'pending', 'preparing', 'ready', 'served'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-auto gap-lg">
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No orders found</div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="card" style={{ borderTop: `3px solid ${statusColors[order.overallStatus] || '#64748b'}` }}>
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <HiOutlineViewGrid style={{ fontSize: '1.5rem' }} />
                  <div>
                    <div className="font-bold text-lg">{order.table?.tableNumber || '—'}</div>
                    <div className="text-xs text-muted">by {order.waiter?.name || '—'} · {timeAgo(order.createdAt)}</div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: 6, padding: 0, minHeight: 'auto' }}
                      onClick={() => copyOrderCode(order.orderCode)}
                      title="Copy order code"
                    >
                      {order.orderCode || 'ORD-—'}
                    </button>
                  </div>
                </div>
                <span className="badge" style={{ background: `${(statusColors[order.overallStatus] || '#64748b')}20`, color: statusColors[order.overallStatus] || '#64748b' }}>
                  {order.overallStatus}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                    style={{ padding: '4px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="flex items-center gap-sm">
                      <span
                        className="status-dot"
                        style={{
                          background: statusColors[item.status] || '#94a3b8',
                          boxShadow: `0 0 6px ${statusColors[item.status] || '#94a3b8'}`,
                        }}
                      />
                      <span>{item.menuItem?.name || 'Item'} × {item.quantity}</span>
                    </div>
                    <span className="font-medium">₹{(item.price || 0) * (item.quantity || 0)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Total: ₹{getTotal(order.items).toLocaleString('en-IN')}</span>
                <div className="flex gap-xs">
                  {order.overallStatus === 'pending' && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleSendKOT(order._id)}>
                      Send KOT
                    </button>
                  )}
                  {order.overallStatus === 'served' && (
                    <button className="btn btn-accent btn-sm" onClick={() => handleGenerateBill(order._id)}>
                      Generate Bill
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
