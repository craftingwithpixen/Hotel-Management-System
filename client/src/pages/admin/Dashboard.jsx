import { useState, useEffect } from 'react';
import { HiOutlineCurrencyRupee, HiOutlineCalendar, HiOutlineShoppingCart, HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineTrendingUp, HiOutlineExclamation, HiOutlineClipboardList, HiOutlineKey } from 'react-icons/hi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0, bookings: 0, orders: 0, occupancy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [occupancySlices, setOccupancySlices] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [dailyRes, occupancyRes, monthlyRes, bookingsRes, alertsRes] = await Promise.all([
          api.get(`/reports/daily?date=${todayStr}`).catch(() => ({ data: {} })),
          api.get('/reports/occupancy').catch(() => ({ data: {} })),
          api.get(`/reports/monthly?month=${month}&year=${year}`).catch(() => ({ data: { data: [] } })),
          api.get('/bookings?limit=5').catch(() => ({ data: { bookings: [] } })),
          api.get('/inventory/alerts').catch(() => ({ data: { items: [] } })),
        ]);

        const daily = dailyRes.data || {};
        const occ = occupancyRes.data || {};
        const monthlyRows = monthlyRes.data?.data || [];

        const totalRooms = occ.totalRooms || 0;
        const bookedRooms = occ.bookedRooms || 0;
        const bookedPct = totalRooms ? (bookedRooms / totalRooms) * 100 : 0;
        const availablePct = Math.max(0, 100 - bookedPct);

        setStats({
          revenue: daily.revenue || 0,
          bookings: daily.bookings || 0,
          orders: daily.orders || 0,
          occupancy: occ.occupancyRate || 0,
        });

        setMonthlyChartData(
          monthlyRows.map((r) => ({
            day: r._id,
            revenue: r.total,
          }))
        );

        setOccupancySlices([
          { name: 'Booked', value: Number(bookedPct.toFixed(1)) },
          { name: 'Available', value: Number(availablePct.toFixed(1)) },
        ]);

        setRecentBookings(bookingsRes.data?.bookings || []);
        setLowStockItems(alertsRes.data?.items || []);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Today's Revenue", value: `₹${(stats.revenue).toLocaleString('en-IN')}`, icon: HiOutlineCurrencyRupee, color: 'purple', change: '+12.5%' },
    { label: 'Total Bookings', value: stats.bookings, icon: HiOutlineCalendar, color: 'amber', change: '+8.2%' },
    { label: 'Active Orders', value: stats.orders, icon: HiOutlineShoppingCart, color: 'green', change: '+15.3%' },
    { label: 'Room Occupancy', value: `${stats.occupancy}%`, icon: HiOutlineOfficeBuilding, color: 'blue', change: '+5.1%' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="card" style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '0.8125rem' }}>
          <div className="text-muted">Day {payload[0].payload.day}</div>
          <div className="font-bold">₹{payload[0].value.toLocaleString('en-IN')}</div>
        </div>
      );
    }
    return null;
  };

  const timeAgo = (dateValue) => {
    if (!dateValue) return "";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "";
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="animate-fade">
      {/* Stats Grid */}
      <div className="grid grid-4 gap-lg" style={{ marginBottom: 'var(--space-xl)' }}>
        {statCards.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.color}`}>
            <div className="stat-icon"><stat.icon style={{ fontSize: '1.25rem' }} /></div>
            <div className="stat-value">{stat.value}</div>
            <div className="flex items-center justify-between">
              <span className="stat-label">{stat.label}</span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                <HiOutlineTrendingUp /> {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <div>
              <h3 className="font-bold text-lg">Revenue Overview</h3>
              <p className="text-sm text-muted">Last 30 days</p>
            </div>
            <div className="tabs">
              <button className="tab active">Monthly</button>
              <button className="tab">Weekly</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyChartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Pie */}
        <div className="card">
          <h3 className="font-bold text-lg" style={{ marginBottom: 'var(--space-lg)' }}>Room Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={occupancySlices}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {occupancySlices.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--space-md)' }}>
            {occupancySlices.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-sm">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i] }} />
                  {item.name}
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Recent Bookings */}
        <div className="card">
          <h3 className="font-bold text-lg" style={{ marginBottom: 'var(--space-lg)' }}>Recent Bookings</h3>
          <div className="flex flex-col gap-md">
            {recentBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No recent bookings</div>
            ) : (
              recentBookings.map((b) => {
                const statusToBadge = {
                  pending: 'warning',
                  confirmed: 'success',
                  checked_in: 'info',
                  checked_out: 'primary',
                  cancelled: 'danger',
                  rejected: 'danger',
                };

                const name = b.customer?.name || 'Walk-in';
                const place = b.type === 'room' ? b.room?.roomNumber : b.table?.tableNumber;
                const time = b.createdAt ? timeAgo(b.createdAt) : '';

                return (
                  <div key={b._id} className="flex items-center justify-between" style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div className="flex items-center gap-md">
                      <div className="avatar avatar-sm">{name.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-semibold">{name}</div>
                        <div className="text-xs text-muted">
                          {b.type === 'room' ? 'Room' : 'Table'} · {place || '—'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge badge-${statusToBadge[b.status] || 'info'}`}>{b.status?.replace('_', ' ')}</span>
                      <div className="text-xs text-muted" style={{ marginTop: 4 }}>{time}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="card">
          <h3 className="font-bold text-lg" style={{ marginBottom: 'var(--space-lg)' }}>Quick Actions</h3>
          <div className="grid grid-2 gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
            {[
              { label: 'New Booking', icon: HiOutlineClipboardList, color: 'var(--primary)' },
              { label: 'Add Order', icon: HiOutlineShoppingCart, color: 'var(--accent)' },
              { label: 'Check In', icon: HiOutlineKey, color: 'var(--success)' },
              { label: 'Generate Bill', icon: HiOutlineCurrencyRupee, color: 'var(--info)' },
            ].map((action) => (
              <button key={action.label} className="card card-hover" style={{ cursor: 'pointer', textAlign: 'center', padding: 'var(--space-md)', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)', color: action.color }}><action.icon /></div>
                <div className="text-sm font-medium">{action.label}</div>
              </button>
            ))}
          </div>

          <h4 className="font-semibold text-sm" style={{ marginBottom: 'var(--space-md)', color: 'var(--accent)' }}>
            <HiOutlineExclamation style={{ display: 'inline', marginRight: 4 }} /> Alerts
          </h4>
          <div className="flex flex-col gap-sm">
            {lowStockItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-muted)' }}>No low-stock alerts</div>
            ) : (
              lowStockItems.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="badge badge-warning"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', width: '100%', justifyContent: 'flex-start' }}
                >
                  Low stock: {item.name} ({item.currentStock} {item.unit})
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
