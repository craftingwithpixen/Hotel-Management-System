import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function Profile() {
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredLang, setPreferredLang] = useState(user?.preferredLang || 'en');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 className="text-2xl mb-sm">Your profile</h2>
        <p className="text-muted mb-lg">Sign in to manage your profile preferences.</p>
        <Link className="btn btn-primary" to="/login">Sign In</Link>
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
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 640 }}>
      <div className="mb-lg">
        <h1 className="font-display text-3xl">My Profile</h1>
        <p className="text-muted">Keep your contact details up to date.</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="input-group mb-md">
          <label>Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="input-group mb-md">
          <label>Email</label>
          <input className="input" value={user?.email || ''} disabled />
        </div>
        <div className="input-group mb-md">
          <label>Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="input-group mb-lg">
          <label>Preferred Language</label>
          <select className="input" value={preferredLang} onChange={(e) => setPreferredLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && <p className="text-sm" style={{ marginTop: 'var(--space-sm)' }}>{message}</p>}
      </form>
    </div>
  );
}
