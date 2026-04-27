import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function Login() {
  const [isStaff, setIsStaff] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, staffLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = isStaff ? await staffLogin(email, password) : await login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);
      const roleRedirects = { admin: '/admin', manager: '/admin', receptionist: '/admin', waiter: '/admin/orders', chef: '/admin/orders', customer: '/customer' };
      navigate(roleRedirects[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--gradient-hero)', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background orbs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: '-10%', right: '-5%', filter: 'blur(40px)' }} className="animate-float" />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', bottom: '-5%', left: '-5%', filter: 'blur(40px)', animationDelay: '1.5s' }} className="animate-float" />

      <div className="card-glass animate-slide-up" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-2xl)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>🏨</div>
          <h1 className="font-display text-3xl font-bold" style={{ marginBottom: 'var(--space-xs)' }}>HospitalityOS</h1>
          <p className="text-muted text-sm">Sign in to your account</p>
        </div>

        {/* Toggle Staff / Customer */}
        <div className="tabs" style={{ width: '100%', marginBottom: 'var(--space-xl)' }}>
          <button className={`tab ${isStaff ? 'active' : ''}`} onClick={() => setIsStaff(true)} style={{ flex: 1 }}>Staff Login</button>
          <button className={`tab ${!isStaff ? 'active' : ''}`} onClick={() => setIsStaff(false)} style={{ flex: 1 }}>Customer Login</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="flex justify-between">
              <label>Password</label>
              <Link to="/forgot-password" className="text-xs" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>Forgot?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <HiOutlineLockClosed style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
              <input className="input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingLeft: 40, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginBottom: 'var(--space-lg)' }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
          </button>
        </form>

        {!isStaff && (
          <p className="text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
          </p>
        )}
      </div>
    </div>
  );
}
