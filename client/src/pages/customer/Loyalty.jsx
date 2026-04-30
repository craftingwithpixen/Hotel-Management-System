import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function Loyalty() {
  const { isAuthenticated } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLoyalty = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/customer/loyalty');
        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load loyalty details');
      } finally {
        setLoading(false);
      }
    };

    loadLoyalty();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 className="text-2xl mb-sm">Loyalty rewards</h2>
        <p className="text-muted mb-lg">Sign in to view your points and redemptions.</p>
        <Link className="btn btn-primary" to="/login">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="mb-lg">
        <h1 className="font-display text-3xl">Loyalty</h1>
        <p className="text-muted">Track your points and rewards history.</p>
      </div>

      <div className="card mb-lg">
        <p className="text-muted mb-xs">Available points</p>
        <h2 className="font-display text-4xl">{balance}</h2>
      </div>

      {loading && <div className="card">Loading loyalty history...</div>}
      {!loading && error && <div className="card">{error}</div>}

      {!loading && !error && (
        <div className="grid gap-md">
          {transactions.length === 0 ? (
            <div className="card">
              <p className="text-muted">No loyalty transactions yet.</p>
            </div>
          ) : (
            transactions.map((txn) => (
              <div key={txn._id} className="card flex justify-between items-center">
                <div>
                  <p className="font-semibold">{txn.note || txn.type || 'Loyalty update'}</p>
                  <p className="text-xs text-muted">
                    {txn.createdAt ? new Date(txn.createdAt).toLocaleString('en-IN') : ''}
                  </p>
                </div>
                <strong>{txn.points > 0 ? `+${txn.points}` : txn.points}</strong>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
