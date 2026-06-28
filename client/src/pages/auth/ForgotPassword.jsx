import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineShieldCheck,
  HiOutlineKey,
} from 'react-icons/hi';
import api from '../../services/api';

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
  .auth-ghost-btn {
    border: 0;
    background: transparent;
    color: #dfcf9f;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
  }
  .auth-switch { margin: 1.1rem 0 0; text-align: center; color: #aeb8b2; }
  .auth-switch a { color: #dfcf9f; text-decoration: none; font-weight: 700; }
  .auth-art {
    min-height: 620px;
    display: grid;
    align-items: end;
    padding: 1.5rem;
    background:
      linear-gradient(180deg, rgba(8,12,14,0.08), rgba(8,12,14,0.88)),
      url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1100&q=80') center/cover;
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
  }
`;

export default function ForgotPassword() {
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email address');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success('Password reset code sent to your email');
      setStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success('A new code has been sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) return toast.error('Enter the 6-digit code');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      toast.success('Password reset successful. Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
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

          <span className="auth-hero-icon"><HiOutlineLockClosed /></span>
          <p className="auth-eyebrow">Account Recovery</p>

          {step === 'request' ? (
            <>
              <h1>Forgot password?</h1>
              <p className="auth-copy">
                Enter the email linked to your account and we&apos;ll send you a 6-digit code to reset your password.
              </p>

              <form onSubmit={requestOtp} className="auth-form">
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

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Send Reset Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1>Reset password</h1>
              <p className="auth-copy">
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below with your new password.
              </p>

              <div className="auth-note">
                <span className="auth-note-icon"><HiOutlineShieldCheck /></span>
                <span>Never share this code. It expires in 10 minutes.</span>
              </div>

              <form onSubmit={resetPassword} className="auth-form">
                <div className="input-group">
                  <label>Verification Code</label>
                  <div className="auth-input-wrap">
                    <HiOutlineKey />
                    <input
                      className="input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>New Password</label>
                  <div className="auth-input-wrap">
                    <HiOutlineLockClosed />
                    <input
                      className="input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button className="auth-eye" type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Confirm New Password</label>
                  <div className="auth-input-wrap">
                    <HiOutlineLockClosed />
                    <input
                      className="input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Reset Password'}
                </button>
              </form>

              <p className="auth-switch">
                Didn&apos;t get the code?{' '}
                <button type="button" className="auth-ghost-btn" onClick={resendOtp} disabled={loading}>
                  Resend
                </button>
              </p>
            </>
          )}

          <p className="auth-switch">
            Remembered it? <Link to="/login">Back to Sign In</Link>
          </p>
        </section>

        <aside className="auth-art" aria-hidden="true">
          <div className="auth-art-card">
            <p>We&apos;ve got you.</p>
            <span>Reset your password securely and get back to booking and dining in minutes.</span>
          </div>
        </aside>
      </div>
      <style>{authStyles}</style>
    </div>
  );
}
