import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCheckCircle,
  HiOutlineGlobeAlt,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineUser,
} from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { getCustomerText, languageName } from '../../i18n/customerText';

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

export default function Profile() {
  const { user, isAuthenticated, preferredLang: globalPreferredLang, setAuth, setPreferredLang: setGlobalPreferredLang } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredLang, setPreferredLang] = useState(user?.preferredLang || globalPreferredLang || 'en');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const t = getCustomerText(preferredLang);

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
        <h2 className="text-2xl mb-sm" style={{ color: '#f4f5ef' }}>{t('profileTitle')}</h2>
        <p className="text-muted mb-lg">{t('profileSignInHelp')}</p>
        <Link className="btn btn-primary" to="/login" style={goldButton}>{t('signIn')}</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await api.put('/customer/profile', { name, phone, preferredLang });
      setAuth(data.user, useAuthStore.getState().accessToken);
      setMessageType('success');
      setMessage(t('saved'));
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || t('failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (value) => {
    setPreferredLang(value);
    setGlobalPreferredLang(value);
  };

  return (
    <div
      className="animate-fade customer-profile-page"
      style={{
        margin: 'calc(-1 * var(--space-xl)) calc(-1 * var(--space-xl)) 0',
        padding: 'var(--space-xl)',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
      }}
    >
      <div className="customer-profile-shell">
        <section className="customer-profile-hero">
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>
              {t('profileEyebrow')}
            </p>
            <h1 className="font-bold" style={{ fontSize: 'clamp(1.45rem, 3vw, 2.3rem)', lineHeight: 1.12, marginBottom: 12 }}>
              {t('profileHeading')}
            </h1>
            <p style={{ color: '#b7c1bb', maxWidth: 560 }}>
              {t('profileIntro')}
            </p>
          </div>
        </section>

        <div className="customer-profile-grid">
          <aside className="customer-profile-summary">
            <div className="customer-profile-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name || t('profile')} />
              ) : (
                <span>{(name || user?.name || 'G').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h2>{name || user?.name || t('guestProfile')}</h2>
            <p>{user?.email || t('noEmail')}</p>

            <div className="customer-profile-facts">
              <div>
                <span><HiOutlineShieldCheck /></span>
                <div>
                  <strong>{t('account')}</strong>
                  <p>{user?.role || 'customer'}</p>
                </div>
              </div>
              <div>
                <span><HiOutlineGlobeAlt /></span>
                <div>
                  <strong>{t('language')}</strong>
                  <p>{languageName(preferredLang)}</p>
                </div>
              </div>
              <div>
                <span><HiOutlineSparkles /></span>
                <div>
                  <strong>{t('rewards')}</strong>
                  <p>{Number(user?.loyaltyPoints || 0).toLocaleString('en-IN')} {t('points')}</p>
                </div>
              </div>
            </div>
          </aside>

          <form className="customer-profile-form" onSubmit={handleSubmit}>
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
              <span className="customer-form-icon"><HiOutlineUser /></span>
              <div>
                <h2 className="font-bold" style={{ color: '#f4f5ef', margin: 0, fontSize: '1.15rem' }}>{t('personalDetails')}</h2>
                <p style={{ color: '#8a9690', margin: '3px 0 0', fontSize: '0.9rem' }}>{t('personalDetailsHint')}</p>
              </div>
            </div>

            <div className="customer-profile-fields">
              <div className="input-group">
                <label>{t('name')}</label>
                <div className="customer-input-wrap">
                  <HiOutlineUser />
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label>{t('email')}</label>
                <div className="customer-input-wrap is-disabled">
                  <HiOutlineMail />
                  <input className="input" value={user?.email || ''} disabled />
                </div>
              </div>

              <div className="input-group">
                <label>{t('phone')}</label>
                <div className="customer-input-wrap">
                  <HiOutlinePhone />
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('addPhone')} />
                </div>
              </div>

              <div className="input-group">
                <label>{t('preferredLanguage')}</label>
                <div className="customer-input-wrap">
                  <HiOutlineGlobeAlt />
                  <select className="input" value={preferredLang} onChange={(e) => handleLanguageChange(e.target.value)}>
                    <option value="en">{t('english')}</option>
                    <option value="hi">{t('hindi')}</option>
                    <option value="mr">{t('marathi')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="customer-profile-actions">
              <button className="btn btn-primary" type="submit" disabled={saving} style={goldButton}>
                {saving ? t('saving') : t('saveChanges')}
              </button>
              {message && (
                <p className={messageType === 'success' ? 'is-success' : 'is-error'}>
                  <HiOutlineCheckCircle />
                  {message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .customer-profile-shell {
          max-width: 1080px;
          margin: 0 auto;
        }
        .customer-profile-hero {
          padding: 1.75rem;
          margin-bottom: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          background:
            linear-gradient(110deg, rgba(8,12,14,0.94), rgba(8,12,14,0.74)),
            url('https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1400&q=80') center/cover;
          box-shadow: 0 18px 38px rgba(0,0,0,0.35);
        }
        .customer-profile-grid {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          gap: var(--space-lg);
          align-items: start;
        }
        .customer-profile-summary,
        .customer-profile-form {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-xl);
          background: rgba(255,255,255,0.03);
          box-shadow: 0 14px 26px rgba(0,0,0,0.25);
        }
        .customer-profile-summary {
          padding: var(--space-xl);
          text-align: center;
        }
        .customer-profile-avatar {
          width: 96px;
          height: 96px;
          margin: 0 auto var(--space-md);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(210,196,149,0.32);
          background: linear-gradient(135deg, rgba(181,167,118,0.95), rgba(122,107,69,0.95));
          box-shadow: 0 16px 26px rgba(0,0,0,0.28);
          overflow: hidden;
        }
        .customer-profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .customer-profile-avatar span {
          color: #fff9e8;
          font-size: 2.2rem;
          font-weight: 800;
        }
        .customer-profile-summary h2 {
          color: #f4f5ef;
          font-size: 1.25rem;
          margin: 0 0 4px;
        }
        .customer-profile-summary > p {
          color: #8a9690;
          margin: 0 0 var(--space-lg);
          overflow-wrap: anywhere;
        }
        .customer-profile-facts {
          display: grid;
          gap: var(--space-sm);
          text-align: left;
        }
        .customer-profile-facts > div {
          display: flex;
          gap: var(--space-md);
          align-items: center;
          padding: var(--space-md);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.025);
        }
        .customer-profile-facts span,
        .customer-form-icon {
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
        .customer-profile-facts svg,
        .customer-form-icon svg {
          font-size: 1.25rem;
        }
        .customer-profile-facts strong {
          display: block;
          color: #f4f5ef;
          font-size: 0.9rem;
        }
        .customer-profile-facts p {
          margin: 2px 0 0;
          color: #8a9690;
          font-size: 0.82rem;
          text-transform: capitalize;
        }
        .customer-profile-form {
          padding: var(--space-xl);
        }
        .customer-profile-fields {
          display: grid;
          gap: var(--space-md);
        }
        .customer-profile-form label {
          color: #c5cdc8;
        }
        .customer-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .customer-input-wrap > svg {
          position: absolute;
          left: 12px;
          color: #8a9690;
          z-index: 1;
        }
        .customer-input-wrap .input {
          padding-left: 2.4rem;
          background-color: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.12);
          color: #f4f5ef;
        }
        .customer-input-wrap select.input {
          color-scheme: dark;
        }
        .customer-input-wrap select.input option {
          background: #11191c;
          color: #f4f5ef;
        }
        .customer-input-wrap select.input option:checked {
          background: #b5a776;
          color: #0b1113;
        }
        .customer-input-wrap .input:focus {
          border-color: rgba(210,196,149,0.55);
          box-shadow: 0 0 0 3px rgba(181,167,118,0.14);
        }
        .customer-input-wrap.is-disabled .input {
          color: #8a9690;
          cursor: not-allowed;
          opacity: 0.9;
        }
        .customer-profile-actions {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
          margin-top: var(--space-lg);
        }
        .customer-profile-actions p {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          margin: 0;
          font-size: 0.875rem;
        }
        .customer-profile-actions p.is-success {
          color: #8dd7b5;
        }
        .customer-profile-actions p.is-error {
          color: #f0adad;
        }
        @media (max-width: 900px) {
          .customer-profile-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .customer-profile-page {
            margin: calc(-1 * var(--space-md)) calc(-1 * var(--space-md)) 0 !important;
            padding: var(--space-md) !important;
          }
          .customer-profile-hero,
          .customer-profile-form,
          .customer-profile-summary {
            padding: var(--space-lg);
          }
          .customer-profile-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
