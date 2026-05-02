import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

const authStyles = `
  .auth-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: var(--space-xl);
    background: linear-gradient(180deg, #091013 0%, #060f12 100%);
    color: #f4f5ef;
  }
  .auth-shell {
    width: min(100%, 980px);
    display: grid;
    grid-template-columns: minmax(0, 440px) minmax(280px, 1fr);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    overflow: hidden;
    background: rgba(255,255,255,0.03);
    box-shadow: 0 22px 46px rgba(0,0,0,0.38);
  }
  .auth-panel { padding: clamp(1.5rem, 4vw, 2.6rem); }
  .auth-brand {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    color: #f4f5ef;
    text-decoration: none;
    margin-bottom: 1.8rem;
  }
  .auth-brand span {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: #dfcf9f;
    background: rgba(181,167,118,0.14);
  }
  .auth-eyebrow {
    margin: 0 0 0.45rem;
    color: #d8c69b;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-size: 0.72rem;
  }
  .auth-panel h1 { margin: 0 0 0.65rem; font-size: clamp(1.8rem, 4vw, 2.45rem); line-height: 1.08; }
  .auth-copy { margin: 0 0 1.35rem; color: #aeb8b2; line-height: 1.6; }
  .auth-form { display: grid; gap: 1rem; }
  .auth-panel label { color: #c5cdc8; }
  .auth-input-wrap { position: relative; display: flex; align-items: center; }
  .auth-input-wrap > svg {
    position: absolute;
    left: 12px;
    color: #8a9690;
    z-index: 1;
  }
  .auth-input-wrap .input {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
    color: #f4f5ef;
  }
  .auth-input-wrap .input:focus {
    border-color: rgba(210,196,149,0.55);
    box-shadow: 0 0 0 3px rgba(181,167,118,0.14);
  }
  .auth-eye {
    position: absolute;
    right: 10px;
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: #8a9690;
    cursor: pointer;
  }
  .auth-small-link,
  .auth-switch a { color: #dfcf9f; text-decoration: none; font-weight: 700; }
  .auth-submit {
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d2c495;
    border-radius: 999px;
    background: linear-gradient(90deg, #b5a776, #958657);
    color: #fdfbf5;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 10px 22px rgba(0,0,0,0.35);
  }
  .auth-submit:disabled { opacity: 0.65; cursor: not-allowed; }
  .auth-switch { margin: 1.2rem 0 0; text-align: center; color: #aeb8b2; }
  .auth-art {
    min-height: 620px;
    display: grid;
    align-items: end;
    padding: 1.5rem;
    background:
      linear-gradient(180deg, rgba(8,12,14,0.1), rgba(8,12,14,0.86)),
      url('https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1000&q=80') center/cover;
  }
  .auth-art div {
    border: 1px solid rgba(255,255,255,0.16);
    border-radius: 18px;
    padding: 1rem;
    background: rgba(8,12,14,0.58);
    backdrop-filter: blur(8px);
  }
  .auth-art p { margin: 0 0 0.25rem; font-weight: 800; }
  .auth-art span { color: #c5cdc8; font-size: 0.9rem; }
  @media (max-width: 820px) {
    .auth-shell { grid-template-columns: 1fr; }
    .auth-art { display: none; }
  }
  @media (max-width: 520px) {
    .auth-page { padding: var(--space-md); }
    .auth-shell { border-radius: 18px; }
  }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);
      const roleRedirects = {
        admin: '/admin',
        manager: '/staff/manager',
        receptionist: '/staff/receptionist',
        waiter: '/staff/waiter',
        chef: '/staff/chef',
        customer: '/customer',
      };
      navigate(roleRedirects[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-panel">
          <Link to="/" className="auth-brand">
            <span><HiOutlineOfficeBuilding /></span>
            <strong>Grand Paradise</strong>
          </Link>
          <p className="auth-eyebrow">Welcome Back</p>
          <h1>Sign in to continue</h1>
          <p className="auth-copy">Access bookings, orders, service requests, and guest preferences from one place.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <HiOutlineMail />
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <div className="flex justify-between">
                <label>Password</label>
                <Link to="/forgot-password" className="auth-small-link">Forgot?</Link>
              </div>
              <div className="auth-input-wrap">
                <HiOutlineLockClosed />
                <input className="input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button className="auth-eye" type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Sign Up</Link>
          </p>
        </section>
        <aside className="auth-art" aria-hidden="true">
          <div>
            <p>Book. Dine. Relax.</p>
            <span>Your hospitality dashboard is ready.</span>
          </div>
        </aside>
      </div>
      <style>{authStyles}</style>
    </div>
  );
}
