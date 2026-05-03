import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlinePlus, HiOutlineMinus, HiOutlineCheckCircle, HiOutlineSparkles, HiOutlineCollection, HiOutlineOfficeBuilding, HiOutlineHome } from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { getCustomerText } from '../../i18n/customerText';

const CATEGORY_ICONS = {
  veg: HiOutlineSparkles,
  non_veg: HiOutlineCollection,
  drinks: HiOutlineCollection,
  dessert: HiOutlineHome,
  combo: HiOutlineOfficeBuilding,
};
const goldButton = {
  border: '1px solid #d2c495',
  background: 'linear-gradient(90deg, #b5a776, #958657)',
  color: '#fdfbf5',
  borderRadius: 999,
  padding: '0.5rem 1rem',
  fontWeight: 700,
  boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
  cursor: 'pointer',
  fontSize: '0.82rem',
};

export default function ScanTable() {
  const { tableId, bookingId } = useParams();
  const isRoomOrder = Boolean(bookingId);
  const { isAuthenticated, user, preferredLang } = useAuthStore();
  const t = getCustomerText(user?.preferredLang || preferredLang);
  const [tableData, setTableData] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const url = isRoomOrder
      ? `/customer/room-service/${bookingId}`
      : `/customer/scan/table/${tableId}`;

    api.get(url)
      .then(({ data }) => {
        setTableData(data.table || null);
        setRoomData(data.room || null);
        setBookingData(data.booking || null);
        setMenu(data.menu || []);
      })
      .catch(() => toast.error(isRoomOrder ? 'Room service is not available for this booking' : t('invalidTableQr')))
      .finally(() => setLoading(false));
  }, [tableId, bookingId, isRoomOrder]);

  const categories = ['all', ...new Set(menu.map(i => i.category))];
  const filtered = menu.filter(i => category === 'all' || i.category === category);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.menuItem._id === item._id);
      if (ex) return prev.map(c => c.menuItem._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1, notes: '' }];
    });
  };

  const changeQty = (id, d) => setCart(prev => prev.map(c => c.menuItem._id === id ? { ...c, quantity: c.quantity + d } : c).filter(c => c.quantity > 0));
  const cartTotal = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return toast.error(t('addAtLeastOneItem'));
    if (!isAuthenticated) return toast.error(t('pleaseLoginOrder'));
    setSubmitting(true);
    try {
      await api.post('/orders', {
        tableId: isRoomOrder ? undefined : tableId,
        roomId: isRoomOrder ? roomData?._id : undefined,
        bookingId: isRoomOrder ? bookingData?._id : undefined,
        items: cart.map(c => ({ menuItemId: c.menuItem._id, quantity: c.quantity, notes: c.notes })),
        isQROrder: !isRoomOrder,
        customerId: user?._id,
      });
      setSubmitted(true);
      toast.success(t('orderPlaced'));
    } catch (err) {
      toast.error(err?.response?.data?.message || t('failed'));
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
          padding: 'var(--space-xl)',
          color: '#f4f5ef',
        }}
      >
        <HiOutlineCheckCircle style={{ fontSize: '5rem', color: '#8dd7b5', marginBottom: 'var(--space-lg)' }} />
        <h2 className="font-bold text-xl" style={{ marginBottom: 'var(--space-sm)' }}>{t('orderPlaced')}</h2>
        <p style={{ textAlign: 'center', color: '#b7c1bb', maxWidth: 520 }}>
          {t('orderPlacedMessage')}{' '}
          <strong>{isRoomOrder ? roomData?.hotel?.name : tableData?.hotel?.name}</strong>
          {' · '}
          {isRoomOrder ? 'Room' : t('table')}{' '}
          <strong>{isRoomOrder ? roomData?.roomNumber : tableData?.tableNumber}</strong>
        </p>
        <button
          type="button"
          style={{ ...goldButton, marginTop: 'var(--space-xl)', padding: '0.66rem 1.35rem' }}
          onClick={() => { setSubmitted(false); setCart([]); }}
        >
          {t('orderMore')}
        </button>
      </div>
    );
  }

  return (
    <div
      className="animate-fade scan-table-page"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
        padding: 'var(--space-lg)',
      }}
    >
      <div className="scan-table-shell" style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div
          className="scan-table-hero"
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 'var(--space-lg)',
            border: '1px solid rgba(255,255,255,0.1)',
            background:
              "linear-gradient(110deg, rgba(8,12,14,0.92), rgba(8,12,14,0.75)), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80') center/cover",
            boxShadow: '0 18px 38px rgba(0,0,0,0.35)',
          }}
        >
          <div className="scan-table-hero-content" style={{ padding: '1.75rem' }}>
            <p className="scan-table-eyebrow" style={{ fontSize: '0.7rem', letterSpacing: '0.24em', color: '#d8c69b', marginBottom: 8 }}>
              {isRoomOrder ? 'ROOM SERVICE' : t('scanAndOrder')}
            </p>
            <h1 className="font-bold" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', lineHeight: 1.15, marginBottom: 8 }}>
              {isRoomOrder ? (roomData?.hotel?.name || 'Grand Paradise') : (tableData?.hotel?.name || 'Grand Paradise')}
            </h1>
            <p style={{ color: '#c5cdc8' }}>
              {isRoomOrder ? `Room ${roomData?.roomNumber || '-'} · ${t('scanOrderIntro')}` : `${t('table')} ${tableData?.tableNumber} · ${t('scanOrderIntro')}`}
            </p>
          </div>
        </div>

        <div
          className="scan-table-categories"
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-md)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c];
            return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                fontWeight: 600,
                flexShrink: 0,
                background: category === c ? 'rgba(181,167,118,0.22)' : 'rgba(255,255,255,0.04)',
                color: category === c ? '#e9d9a8' : '#a8b3ad',
                transition: 'all 0.2s',
              }}
            >
              {Icon ? <Icon style={{ marginRight: 6 }} /> : null}
              {c === 'all' ? t('all') : c.replace('_', ' ')}
            </button>
            );
          })}
        </div>

        <div className="scan-table-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-md)' }}>
          <div>
            {filtered.length === 0 ? (
              <div
                className="card"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  textAlign: 'center',
                  color: '#b7c1bb',
                }}
              >
                {t('noMenuInCategory')}
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  className="card card-hover scan-menu-card"
                  style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-md)',
                    alignItems: 'center',
                    borderColor: 'rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  {item.image ? (
                    <img
                      className="scan-menu-image"
                      src={item.image}
                      alt={item.name}
                      style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      className="scan-menu-image scan-menu-image-empty"
                      style={{
                        width: 84,
                        height: 84,
                        borderRadius: 'var(--radius-md)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#8a9690',
                        fontSize: '0.8rem',
                      }}
                    >
                      {t('noImage')}
                    </div>
                  )}
                  <div className="scan-menu-body" style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold text-sm scan-menu-title" style={{ color: '#f4f5ef' }}>{item.name}</div>
                    {item.description && (
                      <div
                        className="text-xs scan-menu-description"
                        style={{
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#8a9690',
                        }}
                      >
                        {item.description}
                      </div>
                    )}
                    <div className="scan-menu-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <span className="font-bold" style={{ color: '#e9bf47' }}>₹{item.price}</span>
                      {cart.find((c) => c.menuItem._id === item._id) ? (
                        <div className="flex items-center gap-sm scan-qty-control">
                          <button
                            className="btn btn-ghost btn-icon"
                            style={{ padding: 4, borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
                            onClick={() => changeQty(item._id, -1)}
                            type="button"
                          >
                            <HiOutlineMinus />
                          </button>
                          <span className="font-bold" style={{ color: '#e9d9a8' }}>
                            {cart.find((c) => c.menuItem._id === item._id)?.quantity}
                          </span>
                          <button
                            className="btn btn-ghost btn-icon"
                            style={{ padding: 4, borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
                            onClick={() => changeQty(item._id, 1)}
                            type="button"
                          >
                            <HiOutlinePlus />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => addToCart(item)} style={goldButton}>
                          <HiOutlinePlus /> {t('add')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <div
              className="scan-cart-panel"
              style={{
                position: 'sticky',
                top: 'var(--space-md)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                padding: 'var(--space-lg)',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
                <div className="flex items-center gap-sm">
                  <HiOutlineShoppingCart style={{ color: '#dfcf9f' }} />
                  <span className="font-semibold">{t('yourCart')}</span>
                </div>
                <span style={{ color: '#8a9690', fontSize: '0.85rem' }}>
                  {cart.reduce((s, c) => s + c.quantity, 0)} {t('items')}
                </span>
              </div>

              {cart.length === 0 ? (
                <p style={{ color: '#8a9690', fontSize: '0.9rem', marginBottom: 0 }}>
                  {t('addMenuItems')}
                </p>
              ) : (
                <>
                  <div className="scan-cart-items" style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 'var(--space-md)' }}>
                    {cart.map((c) => (
                      <div key={c.menuItem._id} className="flex items-center justify-between scan-cart-row" style={{ padding: '0.45rem 0' }}>
                        <div style={{ minWidth: 0 }}>
                          <p className="scan-cart-item-name" style={{ margin: 0, color: '#dfe6e1', fontSize: '0.88rem' }}>{c.menuItem.name}</p>
                          <p style={{ margin: 0, color: '#8a9690', fontSize: '0.75rem' }}>
                            ₹{c.menuItem.price} x {c.quantity}
                          </p>
                        </div>
                        <span style={{ color: '#e9bf47', fontWeight: 700 }}>
                          ₹{(c.menuItem.price * c.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                    <span className="font-semibold">{t('total')}</span>
                    <span className="font-bold text-lg" style={{ color: '#e9bf47' }}>
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}

              <button
                className="w-full"
                type="button"
                onClick={placeOrder}
                disabled={submitting || cart.length === 0}
                style={{ ...goldButton, width: '100%', justifyContent: 'center', opacity: submitting || cart.length === 0 ? 0.6 : 1 }}
              >
                {submitting ? t('placingOrder') : t('placeOrder')}
              </button>
              {!isAuthenticated && (
                <div className="text-xs" style={{ textAlign: 'center', marginTop: 8, color: '#8a9690' }}>
                  {t('loginToOrder')}{' '}
                  <a href="/login" style={{ color: '#dfcf9f' }}>{t('login')}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .scan-table-page {
          overflow-x: hidden;
        }
        .scan-table-categories {
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
        .scan-table-categories button {
          display: inline-flex;
          align-items: center;
        }
        .scan-menu-title,
        .scan-cart-item-name {
          overflow-wrap: anywhere;
        }
        .scan-menu-footer .btn,
        .scan-qty-control .btn {
          min-width: 34px;
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 900px) {
          .scan-table-grid {
            grid-template-columns: 1fr !important;
          }
          .scan-cart-panel {
            position: static !important;
          }
          .scan-cart-items {
            max-height: none !important;
          }
        }
        @media (max-width: 640px) {
          .scan-table-page {
            padding: var(--space-md) !important;
          }
          .scan-table-hero {
            border-radius: 16px !important;
          }
          .scan-table-hero-content {
            padding: var(--space-lg) !important;
          }
          .scan-table-eyebrow {
            letter-spacing: 0.16em !important;
            line-height: 1.4;
          }
          .scan-table-categories {
            margin-left: calc(-1 * var(--space-md));
            margin-right: calc(-1 * var(--space-md));
            border-radius: 0 !important;
            border-left: 0 !important;
            border-right: 0 !important;
            padding: var(--space-sm) var(--space-md) !important;
          }
          .scan-menu-card {
            align-items: flex-start !important;
            gap: var(--space-sm) !important;
            padding: var(--space-md) !important;
          }
          .scan-menu-image {
            width: 72px !important;
            height: 72px !important;
          }
          .scan-menu-description {
            white-space: normal !important;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .scan-menu-footer {
            align-items: flex-start !important;
            gap: var(--space-sm);
          }
          .scan-menu-footer > button {
            padding: 0.48rem 0.8rem !important;
            white-space: nowrap;
          }
          .scan-cart-panel {
            padding: var(--space-md) !important;
            border-radius: var(--radius-lg) !important;
          }
          .scan-cart-row {
            gap: var(--space-sm);
          }
          .scan-cart-row > span {
            white-space: nowrap;
          }
        }
        @media (max-width: 420px) {
          .scan-menu-card {
            display: grid !important;
            grid-template-columns: 64px minmax(0, 1fr);
          }
          .scan-menu-image {
            width: 64px !important;
            height: 64px !important;
          }
          .scan-menu-footer {
            flex-direction: column;
            align-items: stretch !important;
          }
          .scan-menu-footer > button,
          .scan-qty-control {
            width: 100%;
            justify-content: center;
          }
          .scan-qty-control {
            display: grid !important;
            grid-template-columns: 34px minmax(0, 1fr) 34px;
            text-align: center;
          }
          .scan-cart-row {
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
