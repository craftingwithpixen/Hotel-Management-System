import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { HiOutlineMail } from 'react-icons/hi';

export default function OTPVerify() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Please enter 6-digit OTP');
    setLoading(true);
    try {
      await verifyOTP(email, code);
      toast.success('Email verified successfully!');
      navigate('/customer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--gradient-hero)' }}>
      <div className="card-glass animate-slide-up" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-2xl)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
          <HiOutlineMail style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', color: 'var(--primary-light)' }} />
          <h1 className="font-display text-2xl font-bold" style={{ marginBottom: 'var(--space-xs)' }}>Verify Email</h1>
          <p className="text-muted text-sm">We sent a code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong></p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-sm" style={{ marginBottom: 'var(--space-xl)' }}>
            {otp.map((digit, i) => (
              <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                className="input" style={{ width: 48, height: 56, textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, padding: 0 }}
              />
            ))}
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}
