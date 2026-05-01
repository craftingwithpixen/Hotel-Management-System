import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineGift,
  HiOutlineHeart,
  HiOutlineReceiptTax,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { getCustomerText } from '../../i18n/customerText';

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

const getTxnPoints = (txn) => Number(txn.points || 0);
const formatTxnDate = (date) => (
  date ? new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
);

const getTier = (balance) => {
  if (balance >= 5000) return { labelKey: 'tierPlatinum', nextKey: null, target: 5000 };
  if (balance >= 2000) return { labelKey: 'tierGold', nextKey: 'tierPlatinum', target: 5000 };
  if (balance >= 750) return { labelKey: 'tierSilver', nextKey: 'tierGold', target: 2000 };
  return { labelKey: 'tierMember', nextKey: 'tierSilver', target: 750 };
};

export default function Loyalty() {
  const { isAuthenticated, user, preferredLang } = useAuthStore();
  const t = getCustomerText(user?.preferredLang || preferredLang);
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
        setError(err.response?.data?.message || t('failed'));
      } finally {
        setLoading(false);
      }
    };

    loadLoyalty();
  }, [isAuthenticated]);

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
        <h2 className="text-2xl mb-sm" style={{ color: '#f4f5ef' }}>{t('loyaltyRewards')}</h2>
        <p className="text-muted mb-lg">{t('loyaltySignInHelp')}</p>
        <Link className="btn btn-primary" to="/login" style={goldButton}>{t('signIn')}</Link>
      </div>
    );
  }

  const earnedPoints = transactions.reduce((sum, txn) => {
    const points = getTxnPoints(txn);
    return points > 0 ? sum + points : sum;
  }, 0);
  const redeemedPoints = Math.abs(transactions.reduce((sum, txn) => {
    const points = getTxnPoints(txn);
    return points < 0 ? sum + points : sum;
  }, 0));
  const tier = getTier(balance);
  const progress = tier.nextKey ? Math.min(100, Math.round((balance / tier.target) * 100)) : 100;

  return (
    <div
      className="animate-fade customer-loyalty-page"
      style={{
        margin: 'calc(-1 * var(--space-xl)) calc(-1 * var(--space-xl)) 0',
        padding: 'var(--space-xl)',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
      }}
    >
      <div className="customer-loyalty-shell">
        <section className="customer-loyalty-hero">
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>
              {t('loyaltyRewards')}
            </p>
            <h1 className="font-bold" style={{ fontSize: 'clamp(1.45rem, 3vw, 2.3rem)', lineHeight: 1.12, marginBottom: 12 }}>
              {t('loyaltyHeading')}
            </h1>
            <p style={{ color: '#b7c1bb', maxWidth: 560 }}>
              {t('loyaltyIntro')}
            </p>
          </div>
          <Link to="/customer/bookings" className="btn btn-primary" style={goldButton}>
            {t('bookAgain')} <HiOutlineArrowRight />
          </Link>
        </section>

        <div className="customer-loyalty-grid">
          <div className="customer-loyalty-balance">
            <div className="flex items-center justify-between gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
              <div>
                <p style={{ color: '#8a9690', marginBottom: 6 }}>{t('availablePoints')}</p>
                <strong>{balance.toLocaleString('en-IN')}</strong>
              </div>
              <span className="customer-loyalty-medal"><HiOutlineSparkles /></span>
            </div>

            <div className="customer-tier-panel">
              <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 10 }}>
                <span className="badge" style={{ background: 'rgba(181,167,118,0.2)', color: '#dfcf9f', border: '1px solid rgba(181,167,118,0.35)' }}>
                  {t(tier.labelKey)}
                </span>
                <span style={{ color: '#8a9690', fontSize: '0.82rem' }}>
                  {tier.nextKey ? `${Math.max(tier.target - balance, 0).toLocaleString('en-IN')} ${t('to')} ${t(tier.nextKey)}` : t('topTier')}
                </span>
              </div>
              <div className="customer-tier-track">
                <div style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="customer-loyalty-stat">
            <span><HiOutlineTrendingUp /></span>
            <div>
              <strong>{earnedPoints.toLocaleString('en-IN')}</strong>
              <p>{t('pointsEarned')}</p>
            </div>
          </div>
          <div className="customer-loyalty-stat">
            <span><HiOutlineGift /></span>
            <div>
              <strong>{redeemedPoints.toLocaleString('en-IN')}</strong>
              <p>{t('redeemedPoints')}</p>
            </div>
          </div>
        </div>

        {loading && (
          <div
            className="card"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#c5cdc8' }}
          >
            {t('loadingLoyalty')}
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
          <section className="customer-loyalty-history">
            <div className="flex items-center justify-between gap-md" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div>
                <h2 className="font-bold" style={{ color: '#f4f5ef', margin: 0, fontSize: '1.15rem' }}>{t('rewardsHistory')}</h2>
                <p style={{ color: '#8a9690', margin: '3px 0 0', fontSize: '0.9rem' }}>
                  {transactions.length} {transactions.length === 1 ? t('transaction') : t('transactions')}
                </p>
              </div>
              <span className="customer-history-icon"><HiOutlineReceiptTax /></span>
            </div>

            {transactions.length === 0 ? (
              <div className="customer-loyalty-empty">
                <HiOutlineHeart />
                <p>{t('noLoyaltyTransactions')}</p>
                <Link to="/customer/scan" className="btn btn-primary" style={goldButton}>{t('startOrdering')}</Link>
              </div>
            ) : (
              <div className="customer-loyalty-list">
                {transactions.map((txn) => {
                  const points = getTxnPoints(txn);
                  const positive = points >= 0;
                  return (
                    <div key={txn._id} className="customer-loyalty-row">
                      <span className={positive ? 'is-positive' : 'is-negative'}>
                        {positive ? <HiOutlineSparkles /> : <HiOutlineGift />}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p className="font-semibold" style={{ color: '#f4f5ef', margin: 0 }}>
                          {txn.note || txn.type || t('loyaltyUpdate')}
                        </p>
                        <p className="text-xs" style={{ color: '#8a9690', margin: '3px 0 0' }}>
                          {formatTxnDate(txn.createdAt)}
                        </p>
                      </div>
                      <strong style={{ color: positive ? '#8dd7b5' : '#f0adad' }}>
                        {positive ? `+${points}` : points}
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <style>{`
        .customer-loyalty-shell {
          max-width: 1080px;
          margin: 0 auto;
        }
        .customer-loyalty-hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-xl);
          padding: 1.75rem;
          margin-bottom: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          background:
            linear-gradient(110deg, rgba(8,12,14,0.94), rgba(8,12,14,0.74)),
            url('https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&w=1400&q=80') center/cover;
          box-shadow: 0 18px 38px rgba(0,0,0,0.35);
        }
        .customer-loyalty-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(180px, 0.55fr) minmax(180px, 0.55fr);
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        .customer-loyalty-balance,
        .customer-loyalty-stat,
        .customer-loyalty-history {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-xl);
          background: rgba(255,255,255,0.03);
          box-shadow: 0 14px 26px rgba(0,0,0,0.25);
        }
        .customer-loyalty-balance {
          padding: var(--space-xl);
        }
        .customer-loyalty-balance strong {
          display: block;
          font-size: clamp(2.2rem, 6vw, 4rem);
          line-height: 1;
          color: #f4f5ef;
        }
        .customer-loyalty-medal {
          width: 72px;
          height: 72px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 22px;
          color: #dfcf9f;
          background: rgba(181,167,118,0.12);
          border: 1px solid rgba(181,167,118,0.25);
          flex-shrink: 0;
        }
        .customer-loyalty-medal svg {
          font-size: 2.1rem;
        }
        .customer-tier-panel {
          padding: var(--space-md);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.035);
        }
        .customer-tier-track {
          height: 9px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
        }
        .customer-tier-track div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #b5a776, #e2c765);
          transition: width 0.3s ease;
        }
        .customer-loyalty-stat {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: var(--space-lg);
        }
        .customer-loyalty-stat span,
        .customer-history-icon,
        .customer-loyalty-row > span {
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
        .customer-loyalty-stat svg,
        .customer-history-icon svg,
        .customer-loyalty-row > span svg {
          font-size: 1.25rem;
        }
        .customer-loyalty-stat strong {
          display: block;
          font-size: 1.45rem;
          color: #f4f5ef;
          line-height: 1;
        }
        .customer-loyalty-stat p {
          color: #8a9690;
          margin: 6px 0 0;
          font-size: 0.86rem;
        }
        .customer-loyalty-history {
          padding: var(--space-lg);
        }
        .customer-loyalty-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 220px;
          text-align: center;
          color: #8a9690;
          gap: var(--space-md);
        }
        .customer-loyalty-empty > svg {
          font-size: 2.8rem;
          color: #dfcf9f;
          opacity: 0.9;
        }
        .customer-loyalty-empty p {
          margin: 0;
        }
        .customer-loyalty-list {
          display: grid;
          gap: var(--space-sm);
        }
        .customer-loyalty-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.025);
        }
        .customer-loyalty-row > span.is-positive {
          color: #8dd7b5;
          background: rgba(94,180,140,0.14);
        }
        .customer-loyalty-row > span.is-negative {
          color: #f0adad;
          background: rgba(228,94,94,0.12);
        }
        .customer-loyalty-row > strong {
          white-space: nowrap;
          font-size: 1.05rem;
        }
        @media (max-width: 900px) {
          .customer-loyalty-grid {
            grid-template-columns: 1fr 1fr;
          }
          .customer-loyalty-balance {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 768px) {
          .customer-loyalty-page {
            margin: calc(-1 * var(--space-md)) calc(-1 * var(--space-md)) 0 !important;
            padding: var(--space-md) !important;
          }
          .customer-loyalty-hero {
            flex-direction: column;
            padding: var(--space-lg);
          }
          .customer-loyalty-hero .btn {
            width: 100%;
          }
          .customer-loyalty-grid {
            grid-template-columns: 1fr;
          }
          .customer-loyalty-balance {
            padding: var(--space-lg);
          }
          .customer-loyalty-row {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
