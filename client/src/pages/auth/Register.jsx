import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone } from 'react-icons/hi';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
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
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--gradient-hero)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', top: '-10%', left: '-5%', filter: 'blur(40px)' }} className="animate-float" />

      <div className="card-glass animate-slide-up" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-2xl)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>🏨</div>
          <h1 className="font-display text-3xl font-bold" style={{ marginBottom: 'var(--space-xs)' }}>Create Account</h1>
          <p className="text-muted text-sm">Join Grand Paradise today</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { name: 'name', label: 'Full Name', icon: HiOutlineUser, type: 'text', placeholder: 'John Doe' },
            { name: 'email', label: 'Email', icon: HiOutlineMail, type: 'email', placeholder: 'you@example.com' },
            { name: 'phone', label: 'Phone', icon: HiOutlinePhone, type: 'tel', placeholder: '+91 98765 43210' },
            { name: 'password', label: 'Password', icon: HiOutlineLockClosed, type: 'password', placeholder: '••••••••' },
          ].map((field) => (
            <div className="input-group" key={field.name} style={{ marginBottom: 'var(--space-lg)' }}>
              <label>{field.label}</label>
              <div style={{ position: 'relative' }}>
                <field.icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type={field.type} name={field.name} placeholder={field.placeholder} value={formData[field.name]} onChange={handleChange} required={field.name !== 'phone'} style={{ paddingLeft: 40 }} />
              </div>
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginBottom: 'var(--space-lg)' }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
