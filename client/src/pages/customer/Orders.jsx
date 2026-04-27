import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function Orders() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/customer/orders');
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated]);

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
            orders.map((order) => (
              <div key={order._id} className="card">
                <div className="flex justify-between items-center mb-sm">
                  <h3 className="font-bold">Order #{order.orderNo || order._id.slice(-6)}</h3>
                  <span className="badge">{order.status || 'placed'}</span>
                </div>
                <p className="text-sm text-muted mb-sm">Items: {order.items?.length || 0}</p>
                <p className="text-sm">
                  Total: <strong>₹{order.totalAmount || 0}</strong>
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
