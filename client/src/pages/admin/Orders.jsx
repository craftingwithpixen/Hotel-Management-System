import { useState } from 'react';
import toast from 'react-hot-toast';

const demoOrders = [
  { _id: '1', table: { tableNumber: 'T-02' }, waiter: { name: 'Raj' }, items: [{ menuItem: { name: 'Butter Chicken' }, quantity: 2, status: 'preparing', price: 320 }, { menuItem: { name: 'Naan' }, quantity: 4, status: 'ready', price: 50 }], overallStatus: 'preparing', createdAt: new Date(Date.now() - 600000) },
  { _id: '2', table: { tableNumber: 'T-05' }, waiter: { name: 'Amit' }, items: [{ menuItem: { name: 'Paneer Tikka' }, quantity: 1, status: 'pending', price: 260 }, { menuItem: { name: 'Dal Makhani' }, quantity: 1, status: 'pending', price: 220 }], overallStatus: 'pending', createdAt: new Date(Date.now() - 120000) },
  { _id: '3', table: { tableNumber: 'T-01' }, waiter: { name: 'Raj' }, items: [{ menuItem: { name: 'Biryani' }, quantity: 1, status: 'served', price: 350 }], overallStatus: 'served', createdAt: new Date(Date.now() - 3600000) },
  { _id: '4', table: { tableNumber: 'T-06' }, waiter: { name: 'Sunil' }, items: [{ menuItem: { name: 'Masala Dosa' }, quantity: 3, status: 'preparing', price: 150 }, { menuItem: { name: 'Coffee' }, quantity: 3, status: 'ready', price: 80 }], overallStatus: 'preparing', createdAt: new Date(Date.now() - 900000) },
];

const statusColors = { pending: '#f59e0b', preparing: '#3b82f6', ready: '#10b981', served: '#8b5cf6', billed: '#64748b' };

export default function Orders() {
  const [orders] = useState(demoOrders);
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.overallStatus === activeTab);

  const getTotal = (items) => items.reduce((s, i) => s + i.price * i.quantity, 0);
  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="animate-fade">
      <div className="page-header"><div><h1>Orders</h1><p className="text-muted">Kitchen & table orders</p></div></div>

      <div className="tabs mb-lg">
        {['all', 'pending', 'preparing', 'ready', 'served'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-auto gap-lg">
        {filtered.map(order => (
          <div key={order._id} className="card" style={{ borderTop: `3px solid ${statusColors[order.overallStatus]}` }}>
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span style={{ fontSize: '1.5rem' }}>🪑</span>
                <div><div className="font-bold text-lg">{order.table.tableNumber}</div><div className="text-xs text-muted">by {order.waiter.name} · {timeAgo(order.createdAt)}</div></div>
              </div>
              <span className="badge" style={{ background: `${statusColors[order.overallStatus]}20`, color: statusColors[order.overallStatus] }}>{order.overallStatus}</span>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm" style={{ padding: '4px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="flex items-center gap-sm">
                    <span className="status-dot" style={{ background: statusColors[item.status], boxShadow: `0 0 6px ${statusColors[item.status]}` }} />
                    <span>{item.menuItem.name} × {item.quantity}</span>
                  </div>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Total: ₹{getTotal(order.items)}</span>
              <div className="flex gap-xs">
                {order.overallStatus === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => toast.success('Sent to kitchen')}>Send KOT</button>}
                {order.overallStatus === 'served' && <button className="btn btn-accent btn-sm" onClick={() => toast.success('Bill generated')}>Generate Bill</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
