import { useState, useEffect } from 'react';
import { HiOutlineCurrencyRupee, HiOutlineCalendar, HiOutlineShoppingCart, HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineTrendingUp, HiOutlineExclamation } from 'react-icons/hi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];

const mockRevenueData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1, revenue: Math.floor(Math.random() * 50000) + 10000,
}));

const mockOccupancy = [
  { name: 'Occupied', value: 68 }, { name: 'Available', value: 25 }, { name: 'Maintenance', value: 7 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0, bookings: 0, orders: 0, occupancy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, bookingsRes] = await Promise.all([
          api.get('/reports/daily').catch(() => ({ data: {} })),
          api.get('/bookings?limit=5').catch(() => ({ data: { bookings: [] } })),
        ]);
        setStats({
          revenue: dailyRes.data?.revenue || 125400,
          bookings: dailyRes.data?.bookings || 24,
          orders: dailyRes.data?.orders || 67,
          occupancy: 72,
        });
        setRecentBookings(bookingsRes.data?.bookings || []);
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
            <AreaChart data={mockRevenueData}>
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
              <Pie data={mockOccupancy} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                {mockOccupancy.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--space-md)' }}>
            {mockOccupancy.map((item, i) => (
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
            {[
              { name: 'Rahul Sharma', type: 'Room', room: 'Deluxe-101', status: 'confirmed', time: '2 min ago' },
              { name: 'Priya Patel', type: 'Table', room: 'T-05', status: 'pending', time: '15 min ago' },
              { name: 'Amit Kumar', type: 'Room', room: 'Suite-201', status: 'checked_in', time: '1 hr ago' },
              { name: 'Neha Singh', type: 'Table', room: 'T-12', status: 'confirmed', time: '2 hrs ago' },
            ].map((b, i) => (
              <div key={i} className="flex items-center justify-between" style={{ padding: 'var(--space-sm) 0', borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none' }}>
                <div className="flex items-center gap-md">
                  <div className="avatar avatar-sm">{b.name.charAt(0)}</div>
                  <div>
                    <div className="text-sm font-semibold">{b.name}</div>
                    <div className="text-xs text-muted">{b.type} · {b.room}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'info'}`}>{b.status}</span>
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>{b.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="card">
          <h3 className="font-bold text-lg" style={{ marginBottom: 'var(--space-lg)' }}>Quick Actions</h3>
          <div className="grid grid-2 gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
            {[
              { label: 'New Booking', icon: '📋', color: 'var(--primary)' },
              { label: 'Add Order', icon: '🍽️', color: 'var(--accent)' },
              { label: 'Check In', icon: '🔑', color: 'var(--success)' },
              { label: 'Generate Bill', icon: '💰', color: 'var(--info)' },
            ].map((action) => (
              <button key={action.label} className="card card-hover" style={{ cursor: 'pointer', textAlign: 'center', padding: 'var(--space-md)', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>{action.icon}</div>
                <div className="text-sm font-medium">{action.label}</div>
              </button>
            ))}
          </div>

          <h4 className="font-semibold text-sm" style={{ marginBottom: 'var(--space-md)', color: 'var(--accent)' }}>
            <HiOutlineExclamation style={{ display: 'inline', marginRight: 4 }} /> Alerts
          </h4>
          <div className="flex flex-col gap-sm">
            {[
              { text: 'Low stock: Tomatoes (2 kg left)', type: 'warning' },
              { text: '3 rooms need cleaning', type: 'info' },
              { text: 'New feedback received ★★★★☆', type: 'success' },
            ].map((alert, i) => (
              <div key={i} className={`badge badge-${alert.type}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', width: '100%', justifyContent: 'flex-start' }}>
                {alert.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
