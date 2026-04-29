import { useEffect, useState } from 'react';
import { HiOutlineSave, HiOutlineGlobe, HiOutlineLockClosed, HiOutlineBell, HiOutlineCurrencyRupee } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'notifications') return;
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark all as read');
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="text-muted">Configure your system preferences</p>
        </div>
        <button className="btn btn-primary" onClick={() => toast.success('Settings saved!')}>
          <HiOutlineSave /> Save Changes
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '240px 1fr', gap: 'var(--space-2xl)' }}>
        <aside className="flex flex-col gap-sm">
          {[
            { id: 'general', label: 'General Info', icon: HiOutlineGlobe },
            { id: 'security', label: 'Security', icon: HiOutlineLockClosed },
            { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
            { id: 'financial', label: 'Financial & GST', icon: HiOutlineCurrencyRupee },
          ].map(tab => (
            <button 
              key={tab.id} 
              className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </aside>

        <div className="card">
          {activeTab === 'general' && (
            <div className="animate-fade">
              <h3 className="font-bold mb-lg">Hotel Information</h3>
              <div className="grid grid-2 gap-lg mb-xl">
                <div className="input-group"><label>Hotel Name</label><input className="input" defaultValue="Grand Paradise Resort" /></div>
                <div className="input-group"><label>Contact Email</label><input className="input" defaultValue="contact@grandparadise.com" /></div>
                <div className="input-group"><label>Phone Number</label><input className="input" defaultValue="+91 98765 43210" /></div>
                <div className="input-group"><label>Website URL</label><input className="input" defaultValue="https://grandparadise.com" /></div>
              </div>
              <div className="input-group mb-xl">
                <label>Address</label>
                <textarea className="input" defaultValue="123 Luxury Avenue, Near Beach Road, Goa, India - 403001" />
              </div>
              <h3 className="font-bold mb-lg">Branding</h3>
              <div className="flex items-center gap-xl">
                <div className="avatar avatar-lg" style={{ width: 80, height: 80, fontSize: '2rem' }}>GP</div>
                <button className="btn btn-outline">Change Logo</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fade">
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <h3 className="font-bold mb-sm">Notifications</h3>
                  <p className="text-sm text-muted">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
                <button className="btn btn-outline" onClick={markAllRead} disabled={loading || unreadCount === 0}>
                  Mark all read
                </button>
              </div>

              {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  No notifications
                </div>
              ) : (
                <div className="flex flex-col gap-sm">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className="card card-hover"
                      style={{
                        padding: 'var(--space-md)',
                        borderColor: n.read ? 'var(--border)' : 'var(--primary)',
                        background: n.read ? 'transparent' : 'rgba(99,102,241,0.06)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-md">
                        <div>
                          <div className="font-semibold">{n.type}</div>
                          <div className="text-sm text-muted" style={{ marginTop: 4 }}>{n.message || 'Notification'}</div>
                          <div className="text-xs text-muted" style={{ marginTop: 6 }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : ''}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-xs">
                          {!n.read && <span className="badge badge-success">Unread</span>}
                          <button className="btn btn-ghost btn-sm" onClick={() => markRead(n._id)} disabled={n.read}>
                            Mark read
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="animate-fade">
              <h3 className="font-bold mb-lg">Taxation & Currency</h3>
              <div className="grid grid-2 gap-lg mb-xl">
                <div className="input-group"><label>Currency Symbol</label><input className="input" defaultValue="₹" /></div>
                <div className="input-group"><label>GST Percentage (%)</label><input className="input" type="number" defaultValue="18" /></div>
                <div className="input-group"><label>GST Number</label><input className="input" defaultValue="22AAAAA0000A1Z5" /></div>
                <div className="input-group"><label>Service Charge (%)</label><input className="input" type="number" defaultValue="5" /></div>
              </div>
              <h3 className="font-bold mb-lg">Loyalty Program</h3>
              <div className="flex items-center gap-md">
                <input type="checkbox" id="loyalty-active" defaultChecked />
                <label htmlFor="loyalty-active">Enable Loyalty Points System</label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
