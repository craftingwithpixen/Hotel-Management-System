import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineDocumentDuplicate,
  HiOutlineExclamation,
  HiOutlineShoppingBag,
  HiOutlineTable,
} from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ACTIVE_ORDER_STATUSES = new Set(['pending', 'preparing', 'ready', 'served']);

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

const ghostGoldButton = {
  border: '1px solid rgba(210,196,149,0.35)',
  background: 'rgba(181,167,118,0.08)',
  color: '#dfcf9f',
  borderRadius: 999,
};

const dangerSoftButton = {
  border: '1px solid rgba(228,94,94,0.35)',
  background: 'rgba(228,94,94,0.1)',
  color: '#f0adad',
  borderRadius: 999,
};

const getStatusStyle = (status) => {
  const value = (status || 'pending').toLowerCase();
  if (value === 'served' || value === 'billed') {
    return {
      background: 'rgba(94,180,140,0.18)',
      color: '#8dd7b5',
      border: '1px solid rgba(94,180,140,0.35)',
    };
  }
  if (value === 'ready') {
    return {
      background: 'rgba(181,167,118,0.2)',
      color: '#dfcf9f',
      border: '1px solid rgba(181,167,118,0.35)',
    };
  }
  if (value === 'preparing') {
    return {
      background: 'rgba(59,130,246,0.16)',
      color: '#9bc1ff',
      border: '1px solid rgba(59,130,246,0.3)',
    };
  }
  if (value === 'cancelled') {
    return {
      background: 'rgba(228,94,94,0.14)',
      color: '#f0adad',
      border: '1px solid rgba(228,94,94,0.3)',
    };
  }
  return {
    background: 'rgba(120,131,144,0.22)',
    color: '#c4cbd2',
    border: '1px solid rgba(120,131,144,0.32)',
  };
};

const getOrderTotal = (order) => (
  order.items?.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0) || 0
);

const getOrderStatus = (order) => order.overallStatus || order.status || 'pending';
const refId = (value) => value?._id || value;
const formatDateTime = (date) => (
  date ? new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'
);

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
      <div
        className="card"
        style={{
          textAlign: 'center',
          borderColor: 'rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <h2 className="text-2xl mb-sm" style={{ color: '#f4f5ef' }}>Your orders</h2>
        <p className="text-muted mb-lg">Sign in to check your food and service orders.</p>
        <Link className="btn btn-primary" to="/login" style={goldButton}>Sign In</Link>
      </div>
    );
  }

  const activeOrderCount = orders.filter((order) => ACTIVE_ORDER_STATUSES.has(getOrderStatus(order))).length;
  const activeHelpCount = helpRequests.filter((req) => req.status === 'active').length;

  return (
    <div
      className="animate-fade customer-orders-page"
      style={{
        margin: 'calc(-1 * var(--space-xl)) calc(-1 * var(--space-xl)) 0',
        padding: 'var(--space-xl)',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
      }}
    >
      <div className="flex items-center justify-between mb-lg customer-orders-header" style={{ gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 8 }}>
            MY ORDERS
          </p>
          <h1 className="font-bold" style={{ fontSize: 'clamp(1.25rem, 2.6vw, 1.9rem)', lineHeight: 1.2, margin: 0 }}>
            Track table orders and service requests
          </h1>
        </div>
        <Link to="/customer/scan" className="btn btn-primary" style={goldButton}>
          <HiOutlineShoppingBag /> Start Order
        </Link>
      </div>

      <div className="customer-orders-summary">
        <div className="customer-orders-stat">
          <span><HiOutlineClipboardList /></span>
          <div>
            <strong>{orders.length}</strong>
            <p>Total orders</p>
          </div>
        </div>
        <div className="customer-orders-stat">
          <span><HiOutlineClock /></span>
          <div>
            <strong>{activeOrderCount}</strong>
            <p>Active now</p>
          </div>
        </div>
        <div className="customer-orders-stat">
          <span><HiOutlineBell /></span>
          <div>
            <strong>{activeHelpCount}</strong>
            <p>Help requests</p>
          </div>
        </div>
      </div>

      {loading && (
        <div
          className="card"
          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#c5cdc8' }}
        >
          Loading orders...
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
          {orders.length === 0 ? (
            <div
              className="card"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                textAlign: 'center',
                padding: 'var(--space-2xl)',
              }}
            >
              <HiOutlineShoppingBag style={{ fontSize: '2.4rem', color: '#d8c69b', marginBottom: 'var(--space-md)' }} />
              <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                You do not have any food orders yet.
              </p>
              <Link to="/customer/scan" className="btn btn-primary" style={goldButton}>Scan Table QR</Link>
            </div>
          ) : (
            orders.map((order) => {
              const activeHelp = activeHelpForOrder(order);
              const latestHelp = latestHelpForOrder(order);
              const orderStatus = getOrderStatus(order);
              const orderTotal = getOrderTotal(order);
              const visibleItems = order.items?.slice(0, 3) || [];

              return (
                <div
                  key={order._id}
                  className="card card-hover customer-order-card"
                  style={{
                    borderColor: activeHelp ? 'rgba(228,94,94,0.35)' : 'rgba(255,255,255,0.1)',
                    background: activeHelp ? 'rgba(228,94,94,0.055)' : 'rgba(255,255,255,0.03)',
                    boxShadow: '0 14px 26px rgba(0,0,0,0.25)',
                  }}
                >
                  <div className="customer-order-topline">
                    <div>
                      <h3 className="font-bold" style={{ color: '#f4f5ef', marginBottom: 4 }}>
                        Order {order.orderCode || `#${order.orderNo || order._id.slice(-6)}`}
                      </h3>
                      <div className="flex items-center gap-sm flex-wrap text-sm" style={{ color: '#9aa6a0' }}>
                        <span className="flex items-center gap-xs">
                          <HiOutlineTable /> Table {order.table?.tableNumber || '-'}
                        </span>
                        <span className="flex items-center gap-xs">
                          <HiOutlineClock /> {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        textTransform: 'capitalize',
                        fontWeight: 700,
                        ...getStatusStyle(orderStatus),
                      }}
                    >
                      {orderStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="customer-order-body">
                    <div className="customer-order-items">
                      {visibleItems.length === 0 ? (
                        <p className="text-sm" style={{ color: '#9aa6a0' }}>No item details available.</p>
                      ) : (
                        visibleItems.map((item) => (
                          <div key={item._id || item.menuItem?._id || item.menuItem?.name} className="customer-order-item">
                            <span>{item.quantity || 1}x {item.menuItem?.name || item.name || 'Menu item'}</span>
                            <strong>₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('en-IN')}</strong>
                          </div>
                        ))
                      )}
                      {(order.items?.length || 0) > visibleItems.length && (
                        <p className="text-xs" style={{ color: '#7f8a85', marginTop: 8 }}>
                          +{order.items.length - visibleItems.length} more item(s)
                        </p>
                      )}
                    </div>

                    <div className="customer-order-side">
                      <div>
                        <p className="text-xs" style={{ color: '#8a9690', marginBottom: 4 }}>Total</p>
                        <strong style={{ color: '#f4f5ef', fontSize: '1.3rem' }}>₹{orderTotal.toLocaleString('en-IN')}</strong>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => copyOrderCode(order.orderCode)}
                        style={{ color: '#dfcf9f', alignSelf: 'flex-start' }}
                      >
                        <HiOutlineDocumentDuplicate />
                        {order.orderCode || 'ORD-'}
                      </button>
                    </div>
                  </div>

                  <div className="customer-order-footer">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => activeHelp ? resolveHelp(order) : requestHelp(order)}
                      disabled={
                        helpLoadingByOrder[order._id] ||
                        (!activeHelp && (
                          !ACTIVE_ORDER_STATUSES.has(orderStatus) ||
                          order.table?.status === 'available'
                        ))
                      }
                      style={activeHelp ? dangerSoftButton : ghostGoldButton}
                    >
                      {activeHelp ? <HiOutlineCheckCircle /> : <HiOutlineBell />}
                      {helpLoadingByOrder[order._id]
                        ? activeHelp ? 'Closing...' : 'Sending...'
                        : activeHelp
                          ? 'Close Help Request'
                          : order.table?.status === 'available'
                            ? 'Table Free'
                            : 'Need Help'}
                    </button>
                    {hasAnyHelpHistory(order) && (
                      <p className="text-xs flex items-center gap-xs" style={{ color: activeHelp ? '#f0adad' : '#8a9690' }}>
                        <HiOutlineExclamation />
                        Last help request: {latestHelp?.status || 'resolved'}
                        {latestHelp?.createdAt ? ` · ${formatDateTime(latestHelp.createdAt)}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <style>{`
        .customer-orders-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        .customer-orders-stat {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-xl);
          background: rgba(255,255,255,0.03);
        }
        .customer-orders-stat > span {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          color: #dfcf9f;
          background: rgba(181,167,118,0.12);
          flex-shrink: 0;
        }
        .customer-orders-stat svg {
          font-size: 1.25rem;
        }
        .customer-orders-stat strong {
          display: block;
          font-size: 1.35rem;
          line-height: 1;
          color: #f4f5ef;
        }
        .customer-orders-stat p {
          margin: 4px 0 0;
          color: #8a9690;
          font-size: 0.82rem;
        }
        .customer-order-topline,
        .customer-order-body,
        .customer-order-footer {
          display: flex;
          justify-content: space-between;
          gap: var(--space-md);
        }
        .customer-order-topline {
          align-items: flex-start;
          margin-bottom: var(--space-md);
        }
        .customer-order-body {
          align-items: stretch;
          padding: var(--space-md) 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .customer-order-items {
          flex: 1;
          min-width: 0;
        }
        .customer-order-item {
          display: flex;
          justify-content: space-between;
          gap: var(--space-md);
          padding: 0.4rem 0;
          color: #c5cdc8;
          font-size: 0.9rem;
        }
        .customer-order-item + .customer-order-item {
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .customer-order-item strong {
          color: #dfcf9f;
          white-space: nowrap;
        }
        .customer-order-side {
          min-width: 190px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
          gap: var(--space-sm);
          text-align: right;
        }
        .customer-order-footer {
          align-items: center;
          margin-top: var(--space-md);
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .customer-orders-page {
            margin: calc(-1 * var(--space-md)) calc(-1 * var(--space-md)) 0 !important;
            padding: var(--space-md) !important;
          }
          .customer-orders-summary {
            grid-template-columns: 1fr;
          }
          .customer-order-topline,
          .customer-order-body {
            flex-direction: column;
          }
          .customer-order-side {
            min-width: 0;
            align-items: flex-start;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
