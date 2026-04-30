import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlineDownload, HiOutlineChartBar, HiOutlineTrendingUp,
  HiOutlineUsers, HiOutlineRefresh, HiOutlineCalendar,
} from 'react-icons/hi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6c63ff', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Reports() {
  const [tab, setTab]         = useState('daily');
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth]     = useState(new Date().getMonth() + 1);
  const [year, setYear]       = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [daily, setDaily]           = useState(null);
  const [monthly, setMonthly]       = useState([]);
  const [occupancy, setOccupancy]   = useState([]);
  const [topMenu, setTopMenu]       = useState([]);
  const [staffPerf, setStaffPerf]   = useState([]);
  const [tableUsage, setTableUsage] = useState(null);
  const [invReport, setInvReport]   = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'daily') {
        const { data } = await api.get(`/reports/daily?date=${date}`);
        setDaily(data);
      } else if (tab === 'monthly') {
        const { data } = await api.get(`/reports/monthly?month=${month}&year=${year}`);
        setMonthly(data.chart || []);
      } else if (tab === 'occupancy') {
        const { data } = await api.get(`/reports/occupancy?month=${month}&year=${year}`);
        setOccupancy(data.byType || []);
      } else if (tab === 'orders') {
        const [topRes, staffRes] = await Promise.all([
          api.get(`/reports/top-menu-items?month=${month}&year=${year}`),
          api.get(`/reports/staff-performance?month=${month}&year=${year}`),
        ]);
        setTopMenu(topRes.data.items || []);
        setStaffPerf(staffRes.data.staff || []);
      } else if (tab === 'inventory') {
        const { data } = await api.get('/reports/inventory');
        setInvReport(data.items || []);
      } else if (tab === 'tables') {
        const { data } = await api.get('/reports/table-usage');
        setTableUsage(data);
      }
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  }, [tab, date, month, year]);

  useEffect(() => { load(); }, [load]);

  const StatCard = ({ label, value, sub, color }) => (
    <div className="card">
      <div className="text-xs text-muted font-bold uppercase tracking-wider mb-sm">{label}</div>
      <div className="text-3xl font-bold mb-xs" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
      {sub && <div className="text-sm text-muted">{sub}</div>}
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Analytics &amp; Reports</h1>
          <p className="text-muted">In-depth operational performance insights</p>
        </div>
        <div className="flex gap-md">
          <button className="btn btn-ghost" onClick={load} disabled={loading}><HiOutlineRefresh /></button>
          <button className="btn btn-outline"><HiOutlineDownload /> Export</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tabs mb-lg">
        {[
          ['daily',     'Daily'],
          ['monthly',   'Monthly Revenue'],
          ['occupancy', 'Occupancy'],
          ['orders',    'Orders & Menu'],
          ['inventory', 'Inventory'],
          ['tables',    'Table Usage'],
        ].map(([key, label]) => (
          <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {/* Date / month selectors */}
      {(tab === 'daily') && (
        <div className="flex gap-md mb-lg" style={{ alignItems: 'center' }}>
          <HiOutlineCalendar />
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 180 }} />
        </div>
      )}
      {(['monthly', 'occupancy', 'orders'].includes(tab)) && (
        <div className="flex gap-md mb-lg" style={{ alignItems: 'center' }}>
          <HiOutlineCalendar />
          <select className="input" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 140 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2024, i, 1).toLocaleString('en-IN', { month: 'long' })}</option>
            ))}
          </select>
          <input type="number" className="input" value={year} onChange={e => setYear(e.target.value)} style={{ width: 100 }} min={2020} max={2030} />
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>}

      {/* ── Daily ──────────────────────────────────────────────────── */}
      {!loading && tab === 'daily' && daily && (
        <>
          <div className="grid grid-4 gap-lg mb-xl">
            <StatCard label="Total Revenue" value={fmt(daily.totalRevenue)} color="var(--primary)" />
            <StatCard label="Room Revenue" value={fmt(daily.roomRevenue)} />
            <StatCard label="Restaurant Revenue" value={fmt(daily.restaurantRevenue)} />
            <StatCard label="Total Bills" value={daily.billCount ?? 0} sub={`${daily.paidCount ?? 0} paid`} />
          </div>
          <div className="grid grid-3 gap-lg">
            <StatCard label="Room Nights" value={daily.roomNights ?? 0} />
            <StatCard label="Covers (Restaurant)" value={daily.covers ?? 0} />
            <StatCard label="Avg Bill Value" value={fmt(daily.avgBillValue)} />
          </div>
        </>
      )}
      {!loading && tab === 'daily' && !daily && (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No data for selected date</div>
      )}

      {/* ── Monthly Revenue ─────────────────────────────────────────── */}
      {!loading && tab === 'monthly' && (
        <div className="card">
          <h3 className="font-bold mb-lg">Revenue — {new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</h3>
          {monthly.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No revenue data</div>
          ) : (
            <div style={{ height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Occupancy ───────────────────────────────────────────────── */}
      {!loading && tab === 'occupancy' && (
        <div className="grid grid-2 gap-lg">
          <div className="card">
            <h3 className="font-bold mb-lg">Occupancy by Room Type</h3>
            {occupancy.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No data</div>
            ) : (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={occupancy} dataKey="occupancyPct" nameKey="type" cx="50%" cy="50%" outerRadius={100} label={({ type, occupancyPct }) => `${type}: ${occupancyPct}%`}>
                      {occupancy.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Occupancy']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="card">
            <h3 className="font-bold mb-lg">Occupancy Detail</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {occupancy.map((row, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-xs">
                    <span className="text-sm font-medium" style={{ textTransform: 'capitalize' }}>{row.type}</span>
                    <span className="font-bold">{row.occupancyPct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${row.occupancyPct}%`, background: COLORS[i % COLORS.length], borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>{row.bookedNights} nights booked of {row.totalNights}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Orders & Menu ───────────────────────────────────────────── */}
      {!loading && tab === 'orders' && (
        <div className="grid grid-2 gap-lg">
          <div className="card">
            <h3 className="font-bold mb-lg">Top Menu Items</h3>
            {topMenu.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No order data</div>
            ) : (
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMenu} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} width={110} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }} />
                    <Bar dataKey="orders" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="card">
            <h3 className="font-bold mb-lg">Staff Performance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {staffPerf.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No data</div>
              ) : staffPerf.map((s, i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-sm">
                    <div className="avatar avatar-sm">{s.name?.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-sm">{s.name}</div>
                      <div className="text-xs text-muted">{s.ordersHandled} orders · {s.attendanceRate}% attendance</div>
                    </div>
                  </div>
                  <div className="badge badge-primary">{s.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Inventory ───────────────────────────────────────────────── */}
      {!loading && tab === 'inventory' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-bold">Inventory Consumption vs Purchases</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Item</th><th>Unit</th><th>Opening</th><th>Purchased</th><th>Consumed</th><th>Closing</th><th>Status</th></tr></thead>
            <tbody>
              {invReport.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No inventory data</td></tr>
              )}
              {invReport.map((item, i) => (
                <tr key={i}>
                  <td className="font-semibold">{item.name}</td>
                  <td>{item.unit}</td>
                  <td>{item.openingStock}</td>
                  <td style={{ color: 'var(--success)' }}>+{item.purchased}</td>
                  <td style={{ color: 'var(--danger)' }}>-{item.consumed}</td>
                  <td className="font-bold">{item.closing}</td>
                  <td>
                    <span className={`badge badge-${item.closing <= item.threshold ? 'danger' : 'success'}`}>
                      {item.closing <= item.threshold ? 'Low Stock' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Table Usage ─────────────────────────────────────────────── */}
      {!loading && tab === 'tables' && tableUsage && (
        <div className="grid grid-3 gap-lg">
          <StatCard label="Total Orders" value={tableUsage.totalOrders ?? 0} />
          <StatCard label="Avg Turnover / Table" value={`${tableUsage.avgTurnover ?? 0}x`} />
          <StatCard label="Peak Hour" value={tableUsage.peakHour ?? '—'} />
        </div>
      )}
    </div>
  );
}
