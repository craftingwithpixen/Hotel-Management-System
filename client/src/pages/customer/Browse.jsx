import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineCamera,
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineUser,
} from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import { getCustomerText } from '../../i18n/customerText';

const quickActions = [
  {
    titleKey: 'bookStay',
    textKey: 'quickBookStayText',
    to: '/customer/book-room',
    icon: HiOutlineCalendar,
  },
  {
    titleKey: 'scanTableQr',
    textKey: 'quickScanText',
    to: '/customer/scan',
    icon: HiOutlineCamera,
  },
  {
    titleKey: 'orders',
    textKey: 'quickOrdersText',
    to: '/customer/orders',
    icon: HiOutlineShoppingBag,
  },
  {
    titleKey: 'rewards',
    textKey: 'quickRewardsText',
    to: '/customer/loyalty',
    icon: HiOutlineHeart,
  },
];

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

export default function Browse() {
  const { user, preferredLang } = useAuthStore();
  const displayName = user?.name || 'Guest';
  const t = getCustomerText(user?.preferredLang || preferredLang);

  return (
    <div
      className="animate-fade customer-home-page"
      style={{
        margin: 'calc(-1 * var(--space-xl)) calc(-1 * var(--space-xl)) 0',
        padding: 'var(--space-xl)',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
      }}
    >
      <div className="customer-home-shell">
        <section className="customer-home-hero">
          <div className="customer-home-hero-copy">
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>
              {t('homeEyebrow')}
            </p>
            <h1 className="font-bold" style={{ fontSize: 'clamp(1.65rem, 4vw, 3rem)', lineHeight: 1.08, marginBottom: 12 }}>
              {t('welcomeBack')}, {displayName}
            </h1>
            <p style={{ color: '#c5cdc8', maxWidth: 620, fontSize: '1rem' }}>
              {t('homeIntro')}
            </p>
            <div className="customer-home-actions">
              <Link to="/customer/book-room" className="btn btn-primary" style={goldButton}>
                {t('bookStay')} <HiOutlineArrowRight />
              </Link>
              <Link to="/customer/scan" className="btn btn-outline">
                <HiOutlineCamera /> {t('scanQr')}
              </Link>
            </div>
          </div>

          <div className="customer-home-guest-card">
            <span className="customer-home-avatar">{displayName.charAt(0).toUpperCase()}</span>
            <p>{t('guestProfile')}</p>
            <h2>{displayName}</h2>
            <div className="customer-home-mini-row">
              <span><HiOutlineHeart /></span>
              <div>
                <strong>{Number(user?.loyaltyPoints || 0).toLocaleString('en-IN')}</strong>
                <small>{t('rewardPoints')}</small>
              </div>
            </div>
            <Link to="/customer/profile" className="btn btn-outline btn-sm">
              <HiOutlineUser /> {t('manageProfile')}
            </Link>
          </div>
        </section>

        <div className="customer-home-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.titleKey} to={action.to} className="customer-home-action-card">
                <span><Icon /></span>
                <div>
                  <h3>{t(action.titleKey)}</h3>
                  <p>{t(action.textKey)}</p>
                </div>
                <HiOutlineArrowRight className="customer-home-arrow" />
              </Link>
            );
          })}
        </div>

        <section className="customer-home-band">
          <div>
            <span><HiOutlineSparkles /></span>
            <div>
              <h2>{t('readyVisit')}</h2>
              <p>{t('readyVisitText')}</p>
            </div>
          </div>
          <Link to="/customer/bookings" className="btn btn-outline">
            {t('viewBookings')}
          </Link>
        </section>
      </div>

      <style>{`
        .customer-home-shell {
          max-width: 1080px;
          margin: 0 auto;
        }
        .customer-home-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: var(--space-lg);
          align-items: stretch;
          margin-bottom: var(--space-lg);
        }
        .customer-home-hero-copy {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.75rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          background:
            linear-gradient(110deg, rgba(8,12,14,0.94), rgba(8,12,14,0.64)),
            url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80') center/cover;
          box-shadow: 0 18px 38px rgba(0,0,0,0.35);
        }
        .customer-home-actions {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-top: var(--space-xl);
        }
        .customer-home-guest-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: var(--space-md);
          padding: var(--space-xl);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          box-shadow: 0 14px 26px rgba(0,0,0,0.25);
        }
        .customer-home-avatar {
          width: 76px;
          height: 76px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          border: 1px solid rgba(210,196,149,0.32);
          background: linear-gradient(135deg, rgba(181,167,118,0.95), rgba(122,107,69,0.95));
          color: #fff9e8;
          font-size: 2rem;
          font-weight: 800;
        }
        .customer-home-guest-card > p {
          color: #8a9690;
          margin: auto 0 0;
          font-size: 0.85rem;
        }
        .customer-home-guest-card h2 {
          color: #f4f5ef;
          margin: 0;
          font-size: 1.35rem;
          overflow-wrap: anywhere;
        }
        .customer-home-mini-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.025);
        }
        .customer-home-mini-row span,
        .customer-home-action-card > span,
        .customer-home-band span {
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
        .customer-home-mini-row strong {
          display: block;
          color: #f4f5ef;
          line-height: 1;
        }
        .customer-home-mini-row small {
          color: #8a9690;
        }
        .customer-home-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        .customer-home-action-card {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-xl);
          background: rgba(255,255,255,0.03);
          color: inherit;
          text-decoration: none;
          box-shadow: 0 14px 26px rgba(0,0,0,0.22);
          transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
        }
        .customer-home-action-card:hover {
          transform: translateY(-2px);
          border-color: rgba(210,196,149,0.32);
          background: rgba(255,255,255,0.045);
        }
        .customer-home-action-card h3 {
          color: #f4f5ef;
          margin: 0 0 4px;
          font-size: 1rem;
        }
        .customer-home-action-card p {
          color: #8a9690;
          margin: 0;
          font-size: 0.88rem;
          line-height: 1.5;
        }
        .customer-home-arrow {
          color: #dfcf9f;
          flex-shrink: 0;
        }
        .customer-home-band {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-lg);
          padding: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-xl);
          background: rgba(255,255,255,0.03);
          box-shadow: 0 14px 26px rgba(0,0,0,0.22);
        }
        .customer-home-band > div {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .customer-home-band h2 {
          color: #f4f5ef;
          margin: 0 0 4px;
          font-size: 1.05rem;
        }
        .customer-home-band p {
          color: #8a9690;
          margin: 0;
          max-width: 640px;
          font-size: 0.9rem;
        }
        @media (max-width: 900px) {
          .customer-home-hero,
          .customer-home-grid {
            grid-template-columns: 1fr;
          }
          .customer-home-hero-copy {
            min-height: 320px;
          }
        }
        @media (max-width: 768px) {
          .customer-home-page {
            margin: calc(-1 * var(--space-md)) calc(-1 * var(--space-md)) 0 !important;
            padding: var(--space-md) !important;
          }
          .customer-home-hero-copy,
          .customer-home-guest-card,
          .customer-home-action-card,
          .customer-home-band {
            padding: var(--space-lg);
          }
          .customer-home-actions .btn,
          .customer-home-guest-card .btn,
          .customer-home-band .btn {
            width: 100%;
          }
          .customer-home-band,
          .customer-home-band > div {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
