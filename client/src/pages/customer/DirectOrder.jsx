import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineShoppingBag, HiOutlineTable } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const goldButton = {
  border: '1px solid #d2c495',
  background: 'linear-gradient(90deg, #b5a776, #958657)',
  color: '#fdfbf5',
  borderRadius: 999,
  padding: '0.66rem 1.25rem',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

export default function DirectOrder() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    api.get('/customer/direct-order-options')
      .then(({ data }) => setTables(data.tables || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load available tables'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <h2 className="font-bold" style={{ color: '#f4f5ef', marginBottom: 8 }}>Order directly</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>Sign in to place a table or parcel order.</p>
        <button type="button" style={goldButton} onClick={() => navigate('/login')}>Sign in</button>
      </div>
    );
  }

  return (
    <div
      className="animate-fade direct-order-page"
      style={{
        margin: 'calc(-1 * var(--space-xl)) calc(-1 * var(--space-xl)) 0',
        padding: 'var(--space-xl)',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
      }}
    >
      <section className="direct-order-hero">
        <div>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>
            ORDER DIRECTLY
          </p>
          <h1 className="font-bold" style={{ fontSize: 'clamp(1.55rem, 3vw, 2.45rem)', lineHeight: 1.1, marginBottom: 12 }}>
            Choose table service or parcel pickup
          </h1>
          <p style={{ color: '#b7c1bb', maxWidth: 620 }}>
            Select an available table, or place a parcel order for counter pickup. The kitchen receives both through the same order flow.
          </p>
        </div>
      </section>

      <div className="direct-order-card">
        {/* <div className="direct-order-parcel">
          <div>
            <h2 className="font-bold">Parcel pickup</h2>
            <p>Order food and collect it from the counter once the kitchen marks it ready.</p>
          </div>
          <button type="button" style={goldButton} onClick={() => navigate('/customer/direct-order/parcel')}>
            Start Parcel Order <HiOutlineArrowRight />
          </button>
        </div> */}

        <div className="direct-order-heading">
          <span><HiOutlineTable /></span>
          <div>
            <h2 className="font-bold">Available tables</h2>
            <p>Select where you want the order served.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-lg)' }}><div className="spinner" /></div>
        ) : tables.length === 0 ? (
          <div className="direct-order-empty">No available tables right now.</div>
        ) : (
          <div className="direct-order-table-grid">
            {tables.map((table) => (
              <button
                key={table._id}
                type="button"
                onClick={() => navigate(`/customer/direct-order/table/${table._id}`)}
              >
                <strong>{table.tableNumber}</strong>
                <span>{table.capacity} seats</span>
                <small>{table.location || 'Dining'}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .direct-order-hero {
          padding: 1.75rem;
          margin-bottom: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          background:
            linear-gradient(110deg, rgba(8,12,14,0.94), rgba(8,12,14,0.72)),
            url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80') center/cover;
          box-shadow: 0 18px 38px rgba(0,0,0,0.35);
        }
        .direct-order-card {
          padding: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-xl);
          background: rgba(255,255,255,0.03);
          box-shadow: 0 14px 26px rgba(0,0,0,0.25);
        }
        .direct-order-heading {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-lg);
        }
        .direct-order-heading span {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          color: #dfcf9f;
          background: rgba(181,167,118,0.12);
        }
        .direct-order-heading h2,
        .direct-order-heading p {
          margin: 0;
        }
        .direct-order-heading p {
          color: #8a9690;
          font-size: 0.88rem;
        }
        .direct-order-table-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--space-md);
        }
        .direct-order-table-grid button {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          min-height: 112px;
          padding: var(--space-lg);
          border: 1px solid rgba(210,196,149,0.28);
          border-radius: var(--radius-lg);
          background: rgba(181,167,118,0.08);
          color: #f4f5ef;
          cursor: pointer;
          text-align: left;
        }
        .direct-order-table-grid strong {
          font-size: 1.25rem;
        }
        .direct-order-table-grid span,
        .direct-order-table-grid small,
        .direct-order-empty,
        .direct-order-parcel p {
          color: #8a9690;
        }
        .direct-order-empty {
          padding: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.03);
        }
        .direct-order-parcel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-lg);
          padding: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.03);
        }
        .direct-order-parcel h2,
        .direct-order-parcel p {
          margin: 0;
        }
        .direct-order-parcel p {
          margin-top: 6px;
          font-size: 0.9rem;
        }
        @media (max-width: 768px) {
          .direct-order-page {
            margin: calc(-1 * var(--space-md)) calc(-1 * var(--space-md)) 0 !important;
            padding: var(--space-md) !important;
          }
          .direct-order-parcel {
            align-items: stretch;
            flex-direction: column;
          }
          .direct-order-parcel button {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
