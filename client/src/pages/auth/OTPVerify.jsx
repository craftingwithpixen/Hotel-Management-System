import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import useAuthStore from '../../store/authStore';

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
    grid-template-columns: minmax(0, 450px) minmax(280px, 1fr);
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
    margin-bottom: 1.65rem;
  }
  .auth-brand span,
  .auth-note-icon,
  .auth-hero-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: #dfcf9f;
    background: rgba(181,167,118,0.14);
    flex-shrink: 0;
  }
  .auth-hero-icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    margin-bottom: 1rem;
    font-size: 1.55rem;
  }
  .auth-eyebrow {
    margin: 0 0 0.45rem;
    color: #d8c69b;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-size: 0.72rem;
  }
  .auth-panel h1 { margin: 0 0 0.65rem; font-size: clamp(1.8rem, 4vw, 2.45rem); line-height: 1.08; }
  .auth-copy { margin: 0 0 1.2rem; color: #aeb8b2; line-height: 1.6; }
  .auth-copy strong { color: #f4f5ef; overflow-wrap: anywhere; }
  .auth-note {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    padding: 0.8rem 0.9rem;
    border: 1px solid rgba(210,196,149,0.18);
    border-radius: 16px;
    background: rgba(181,167,118,0.08);
    color: #c5cdc8;
    font-size: 0.88rem;
    line-height: 1.45;
  }
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
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
    color: #f4f5ef;
  }
  .auth-input-wrap .input:focus,
  .otp-input:focus {
    border-color: rgba(210,196,149,0.55);
    box-shadow: 0 0 0 3px rgba(181,167,118,0.14);
  }
  .otp-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.55rem;
  }
  .otp-input {
    width: 100%;
    aspect-ratio: 1 / 1.12;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    background: rgba(255,255,255,0.05);
    color: #f4f5ef;
    text-align: center;
    font-size: 1.45rem;
    font-weight: 800;
    outline: none;
  }
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
  .auth-switch { margin: 1.1rem 0 0; text-align: center; color: #aeb8b2; }
  .auth-switch a { color: #dfcf9f; text-decoration: none; font-weight: 700; }
  .auth-art {
    min-height: 620px;
    display: grid;
    align-items: end;
    padding: 1.5rem;
    background:
      linear-gradient(180deg, rgba(8,12,14,0.08), rgba(8,12,14,0.88)),
      url('https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=1100&q=80') center/cover;
  }
  .auth-art-card {
    max-width: 330px;
    border: 1px solid rgba(255,255,255,0.16);
    border-radius: 18px;
    padding: 1rem;
    background: rgba(8,12,14,0.58);
    backdrop-filter: blur(8px);
  }
  .auth-art-card p { margin: 0 0 0.25rem; font-weight: 800; }
  .auth-art-card span { color: #c5cdc8; font-size: 0.9rem; }
  @media (max-width: 820px) {
    .auth-shell { grid-template-columns: 1fr; }
    .auth-art { display: none; }
  }
  @media (max-width: 520px) {
    .auth-page { padding: var(--space-md); }
    .auth-shell { border-radius: 18px; }
    .auth-panel { padding: 1.35rem; }
    .otp-grid { gap: 0.38rem; }
    .otp-input { border-radius: 12px; font-size: 1.25rem; }
  }
`;

export default function OTPVerify() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';
  const activeEmail = email || initialEmail;

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    if (digit && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const nextOtp = [...otp];
    pasted.split('').forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);
    document.getElementById(`otp-${Math.min(pasted.length, 6) - 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (!activeEmail.trim()) return toast.error('Please enter your email address');
    if (code.length !== 6) return toast.error('Please enter 6-digit OTP');
    setLoading(true);
    try {
      await verifyOTP(activeEmail.trim(), code);
      toast.success('Email verified successfully!');
      navigate('/customer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
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

          <span className="auth-hero-icon"><HiOutlineMail /></span>
          <p className="auth-eyebrow">Email Verification</p>
          <h1>Enter your OTP</h1>
          <p className="auth-copy">
            We sent a 6-digit code to <strong>{activeEmail || 'your email address'}</strong>.
          </p>

          <div className="auth-note">
            <span className="auth-note-icon"><HiOutlineShieldCheck /></span>
            <span>This keeps your booking, food orders, and account details protected.</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!initialEmail && (
              <div className="input-group">
                <label>Email Address</label>
                <div className="auth-input-wrap">
                  <HiOutlineMail />
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Verification Code</label>
              <div className="otp-grid">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Verify Email'}
            </button>
          </form>

          <p className="auth-switch">
            Entered the wrong email? <Link to="/register">Create account again</Link>
          </p>
        </section>

        <aside className="auth-art" aria-hidden="true">
          <div className="auth-art-card">
            <p>Almost there.</p>
            <span>Verify your email once, then start booking rooms and ordering meals smoothly.</span>
          </div>
        </aside>
      </div>
      <style>{authStyles}</style>
    </div>
  );
}
