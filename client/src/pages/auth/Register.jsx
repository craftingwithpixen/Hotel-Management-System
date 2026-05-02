import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineUser,
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
    width: min(100%, 1040px);
    display: grid;
    grid-template-columns: minmax(0, 470px) minmax(280px, 1fr);
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
  .auth-note-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: #dfcf9f;
    background: rgba(181,167,118,0.14);
    flex-shrink: 0;
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
  .auth-form { display: grid; gap: 0.95rem; }
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
  .auth-switch { margin: 1.1rem 0 0; text-align: center; color: #aeb8b2; }
  .auth-art {
    min-height: 680px;
    display: grid;
    align-items: end;
    padding: 1.5rem;
    background:
      linear-gradient(180deg, rgba(8,12,14,0.08), rgba(8,12,14,0.88)),
      url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=80') center/cover;
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
  @media (max-width: 860px) {
    .auth-shell { grid-template-columns: 1fr; }
    .auth-art { display: none; }
  }
  @media (max-width: 520px) {
    .auth-page { padding: var(--space-md); }
    .auth-shell { border-radius: 18px; }
    .auth-panel { padding: 1.35rem; }
  }
`;

const fields = [
  { name: 'name', label: 'Full Name', icon: HiOutlineUser, type: 'text', placeholder: 'John Doe', required: true },
  { name: 'email', label: 'Email Address', icon: HiOutlineMail, type: 'email', placeholder: 'you@example.com', required: true },
  { name: 'phone', label: 'Phone Number', icon: HiOutlinePhone, type: 'tel', placeholder: '+91 98765 43210', required: false },
];

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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

          <p className="auth-eyebrow">Create Account</p>
          <h1>Start your stay with us</h1>
          <p className="auth-copy">Create a customer account to book rooms, order food, and manage your visits from one place.</p>

          <div className="auth-note">
            <span className="auth-note-icon"><HiOutlineShieldCheck /></span>
            <span>After signup, we will send an OTP to verify your email before your account opens.</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {fields.map((field) => (
              <div className="input-group" key={field.name}>
                <label>{field.label}</label>
                <div className="auth-input-wrap">
                  <field.icon />
                  <input
                    className="input"
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                  />
                </div>
              </div>
            ))}

            <div className="input-group">
              <label>Password</label>
              <div className="auth-input-wrap">
                <HiOutlineLockClosed />
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button className="auth-eye" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </section>

        <aside className="auth-art" aria-hidden="true">
          <div className="auth-art-card">
            <p>Book. Dine. Relax.</p>
            <span>Your Grand Paradise experience starts with a verified account.</span>
          </div>
        </aside>
      </div>
      <style>{authStyles}</style>
    </div>
  );
}
