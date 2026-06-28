import { useCallback, useEffect, useRef, useState } from 'react';
import { HiOutlineBell, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import api from '../services/api';
import useSocket from '../hooks/useSocket';

const typeLabels = {
  'booking:new': 'New booking',
  'booking:confirmed': 'Booking confirmed',
  'booking:rejected': 'Booking rejected',
  'booking:cancelled': 'Booking cancelled',
  'room:order': 'Room service order',
  'order:ready': 'Order ready',
  'order:ready:waiter': 'Order ready to serve',
  'order:served': 'Order served',
  'inventory:alert': 'Low stock alert',
  'inventory:request': 'Inventory request',
  'payment:captured': 'Payment received',
  'table:status': 'Table status',
  'table:help': 'Table help request',
};

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const { on } = useSocket();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=20');
      setItems(data?.notifications || []);
      setUnread(data?.unreadCount || 0);
    } catch {
      // Silently ignore — the bell should never break the page.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const off = on('notification:new', () => {
      fetchNotifications();
    });
    return () => {
      if (off) off();
    };
  }, [on, fetchNotifications]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((prev) => Math.max(0, prev - 1));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await api.put('/notifications/read-all');
    } catch {
      fetchNotifications();
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        style={{ position: 'relative' }}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <HiOutlineBell style={{ fontSize: '1.25rem' }} />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              background: 'var(--danger)',
              color: '#fff',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.625rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 340,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 440,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)' }}
          >
            <strong>Notifications{unread > 0 ? ` (${unread})` : ''}</strong>
            <div className="flex items-center gap-xs">
              {unread > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={markAllRead} title="Mark all read">
                  <HiOutlineCheck /> All
                </button>
              )}
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setOpen(false)} aria-label="Close">
                <HiOutlineX />
              </button>
            </div>
          </div>

          <div style={{ overflowY: 'auto' }}>
            {loading && items.length === 0 ? (
              <div className="text-sm text-muted" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                No notifications yet
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => !n.read && markRead(n._id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--space-md)',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    background: n.read ? 'transparent' : 'rgba(99,102,241,0.08)',
                    cursor: n.read ? 'default' : 'pointer',
                  }}
                >
                  <div className="flex items-center justify-between gap-sm">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {typeLabels[n.type] || n.type}
                    </span>
                    {!n.read && <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>New</span>}
                  </div>
                  {n.message && (
                    <div className="text-sm text-muted" style={{ marginTop: 4 }}>{n.message}</div>
                  )}
                  <div className="text-xs text-muted" style={{ marginTop: 6 }}>{formatTime(n.createdAt)}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
