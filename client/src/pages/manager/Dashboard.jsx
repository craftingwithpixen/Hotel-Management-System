import { useState, useEffect } from 'react';
import {
  HiOutlineOfficeBuilding, HiOutlineViewGrid, HiOutlineCollection,
  HiOutlineClipboardList, HiOutlineRefresh, HiOutlineCheckCircle,
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/rooms').catch(() => ({ data: { rooms: [] } })),
      api.get('/tables').catch(() => ({ data: { tables: [] } })),
      api.get('/inventory?lowStock=true').catch(() => ({ data: { items: [] } })),
      api.get('/menu').catch(() => ({ data: { items: [] } })),
    ]).then(([roomsRes, tablesRes, invRes, menuRes]) => {
      const rooms  = roomsRes.data.rooms   || [];
      const tables = tablesRes.data.tables || [];
      const menu   = menuRes.data.items || menuRes.data.menuItems || [];
      setLowStock(invRes.data.items || []);
      setStats({
        totalRooms:     rooms.length,
        availableRooms: rooms.filter(r => r.status === 'available').length,
        bookedRooms:    rooms.filter(r => r.status === 'booked').length,
        maintenance:    rooms.filter(r => r.status === 'maintenance').length,
        totalTables:    tables.length,
        availTables:    tables.filter(t => t.status === 'available').length,
        occupiedTables: tables.filter(t => t.status === 'occupied').length,
        totalMenuItems: menu.length,
        availMenu:      menu.filter(m => m.isAvailable).length,
      });
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: color || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', flexShrink: 0 }}>
        <Icon />
      </div>
      <div>
        <div className="text-xs text-muted font-bold uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-muted">{sub}</div>}
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p className="text-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}><HiOutlineRefresh /> Refresh</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4 gap-lg mb-xl">
        <StatCard icon={HiOutlineOfficeBuilding} label="Total Rooms" value={stats?.totalRooms ?? 0}
          sub={`${stats?.availableRooms} available · ${stats?.bookedRooms} booked`} color="var(--primary)" />
        <StatCard icon={HiOutlineOfficeBuilding} label="Maintenance" value={stats?.maintenance ?? 0}
          sub="Rooms under maintenance" color="var(--danger)" />
        <StatCard icon={HiOutlineViewGrid} label="Total Tables" value={stats?.totalTables ?? 0}
          sub={`${stats?.availTables} available · ${stats?.occupiedTables} occupied`} color="var(--info)" />
        <StatCard icon={HiOutlineClipboardList} label="Menu Items" value={stats?.totalMenuItems ?? 0}
          sub={`${stats?.availMenu} available`} color="var(--success)" />
      </div>

      {/* Room availability breakdown */}
      <div className="grid grid-2 gap-lg mb-lg">
        <div className="card">
          <h3 className="font-bold mb-lg">Room Status</h3>
          {[
            { label: 'Available', value: stats?.availableRooms, color: 'var(--success)', pct: stats?.totalRooms ? Math.round((stats.availableRooms / stats.totalRooms) * 100) : 0 },
            { label: 'Booked', value: stats?.bookedRooms, color: 'var(--primary)', pct: stats?.totalRooms ? Math.round((stats.bookedRooms / stats.totalRooms) * 100) : 0 },
            { label: 'Maintenance', value: stats?.maintenance, color: 'var(--danger)', pct: stats?.totalRooms ? Math.round((stats.maintenance / stats.totalRooms) * 100) : 0 },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 'var(--space-md)' }}>
              <div className="flex items-center justify-between mb-xs">
                <span className="text-sm font-medium">{row.label}</span>
                <span className="font-bold">{row.value} ({row.pct}%)</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Low stock alerts */}
        <div className="card">
          <h3 className="font-bold mb-lg" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineCollection style={{ color: 'var(--danger)' }} />
            Low Stock Alerts
            {lowStock.length > 0 && <span className="badge badge-danger">{lowStock.length}</span>}
          </h3>
          {lowStock.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><HiOutlineCheckCircle /> All inventory levels are sufficient</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxHeight: 240, overflowY: 'auto' }}>
              {lowStock.map(item => (
                <div key={item._id} className="flex items-center justify-between" style={{ padding: 'var(--space-sm)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--danger)' }}>
                  <div>
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs text-muted">{item.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-bold" style={{ color: 'var(--danger)' }}>{item.currentStock} {item.unit}</div>
                    <div className="text-xs text-muted">min: {item.lowStockThreshold}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
