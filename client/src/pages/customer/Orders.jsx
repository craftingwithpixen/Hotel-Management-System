import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ACTIVE_ORDER_STATUSES = new Set(['pending', 'preparing', 'ready', 'served']);

const getOrderTotal = (order) => (
  order.items?.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0) || 0
);

const getOrderStatus = (order) => order.overallStatus || order.status || 'pending';
const refId = (value) => value?._id || value;

const helpMatchesOrder = (req, order) => (
  refId(req.order) === order._id || refId(req.table) === refId(order.table)
);

export default function Orders() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [helpLoadingByOrder, setHelpLoadingByOrder] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const [{ data: orderData }, { data: helpData }] = await Promise.all([
          api.get('/customer/orders'),
          api.get('/help-requests/mine'),
        ]);
        setOrders(orderData.orders || []);
        setHelpRequests(helpData.helpRequests || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const timer = setInterval(loadData, 15000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const copyOrderCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied ${code}`);
    } catch {
      toast.error('Failed to copy order code');
    }
  };

  const activeHelpForOrder = (order) => helpRequests.find((req) => req.status === 'active' && helpMatchesOrder(req, order));
  const hasAnyHelpHistory = (order) => helpRequests.some((req) => helpMatchesOrder(req, order));
  const latestHelpForOrder = (order) => helpRequests.find((req) => helpMatchesOrder(req, order));

  const requestHelp = async (order) => {
    if (!order?.table?._id) {
      toast.error('Table information missing for this order');
      return;
    }
    setHelpLoadingByOrder((prev) => ({ ...prev, [order._id]: true }));
    try {
      const { data } = await api.post('/help-requests', {
        tableId: order.table._id,
        orderId: order._id,
      });
      const incoming = data.helpRequest;
      setHelpRequests((prev) => {
        const existingIdx = prev.findIndex((item) => item._id === incoming._id);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = incoming;
          return next;
        }
        return [incoming, ...prev];
      });
      toast.success(data.alreadyActive ? 'Help request already active' : 'Waiter has been notified');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to request help');
    } finally {
      setHelpLoadingByOrder((prev) => ({ ...prev, [order._id]: false }));
    }
  };

  const resolveHelp = async (order) => {
    const activeHelp = activeHelpForOrder(order);
    if (!activeHelp?._id) return;

    setHelpLoadingByOrder((prev) => ({ ...prev, [order._id]: true }));
    try {
      const { data } = await api.patch(`/help-requests/${activeHelp._id}/resolve`);
      const resolved = data.helpRequest;
      setHelpRequests((prev) => prev.map((item) => (
        item._id === resolved._id ? resolved : item
      )));
      toast.success('Help request closed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to close help request');
    } finally {
      setHelpLoadingByOrder((prev) => ({ ...prev, [order._id]: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 className="text-2xl mb-sm">Your orders</h2>
        <p className="text-muted mb-lg">Sign in to check your food and service orders.</p>
        <Link className="btn btn-primary" to="/login">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="mb-lg">
        <h1 className="font-display text-3xl">My Orders</h1>
        <p className="text-muted">See current and past in-hotel orders.</p>
      </div>

      {loading && <div className="card">Loading orders...</div>}
      {!loading && error && <div className="card">{error}</div>}

      {!loading && !error && (
        <div className="grid gap-lg">
          {orders.length === 0 ? (
            <div className="card">
              <p className="text-muted">No orders yet. Start with the menu.</p>
            </div>
          ) : (
            orders.map((order) => {
              const activeHelp = activeHelpForOrder(order);
              return (
              <div key={order._id} className="card">
                <div className="flex justify-between items-center mb-sm">
                  <h3 className="font-bold">Order {order.orderCode || `#${order.orderNo || order._id.slice(-6)}`}</h3>
                  <span className="badge" style={{ textTransform: 'capitalize' }}>{getOrderStatus(order)}</span>
                </div>
                <p className="text-sm text-muted mb-sm">
                  Order ID:{' '}
                  <button className="btn btn-ghost btn-sm" onClick={() => copyOrderCode(order.orderCode)}>
                    {order.orderCode || 'ORD-—'}
                  </button>
                </p>
                <p className="text-sm text-muted mb-sm">Table: {order.table?.tableNumber || '—'}</p>
                <p className="text-sm text-muted mb-sm">Items: {order.items?.length || 0}</p>
                <p className="text-sm">
                  Total: <strong>₹{getOrderTotal(order).toLocaleString('en-IN')}</strong>
                </p>
                <div className="mt-sm">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => activeHelp ? resolveHelp(order) : requestHelp(order)}
                    disabled={
                      helpLoadingByOrder[order._id] ||
                      (!activeHelp && (
                        !ACTIVE_ORDER_STATUSES.has(getOrderStatus(order)) ||
                        order.table?.status === 'available'
                      ))
                    }
                  >
                    {helpLoadingByOrder[order._id]
                      ? activeHelp ? 'Closing...' : 'Sending...'
                      : activeHelp
                        ? 'Close Help Request'
                        : order.table?.status === 'available'
                          ? 'Table Free (Help Disabled)'
                          : 'Need Help'}
                  </button>
                  {hasAnyHelpHistory(order) && (
                    <p className="text-xs text-muted mt-xs">
                      Last help request: {latestHelpForOrder(order)?.status || 'resolved'}
                      {latestHelpForOrder(order)?.createdAt ? ` · ${new Date(latestHelpForOrder(order).createdAt).toLocaleString('en-IN')}` : ''}
                    </p>
                  )}
                </div>
              </div>
            );
            })
          )}
        </div>
      )}
    </div>
  );
}
