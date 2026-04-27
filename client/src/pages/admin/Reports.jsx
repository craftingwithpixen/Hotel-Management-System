import { useState } from 'react';
import { HiOutlineDownload, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineUsers } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockSalesData = [
  { name: 'Mon', sales: 4000 }, { name: 'Tue', sales: 3000 }, { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 }, { name: 'Fri', sales: 1890 }, { name: 'Sat', sales: 2390 }, { name: 'Sun', sales: 3490 },
];

export default function Reports() {
  const [reportType, setReportType] = useState('sales');

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Analytics & Reports</h1>
          <p className="text-muted">In-depth performance insights</p>
        </div>
        <button className="btn btn-outline"><HiOutlineDownload /> Export CSV</button>
      </div>

      <div className="tabs mb-lg">
        <button className={`tab ${reportType === 'sales' ? 'active' : ''}`} onClick={() => setReportType('sales')}>Revenue</button>
        <button className={`tab ${reportType === 'occupancy' ? 'active' : ''}`} onClick={() => setReportType('occupancy')}>Occupancy</button>
        <button className={`tab ${reportType === 'orders' ? 'active' : ''}`} onClick={() => setReportType('orders')}>Orders</button>
      </div>

      <div className="grid grid-3 gap-lg mb-xl">
        <div className="card">
          <div className="text-xs text-muted font-bold uppercase tracking-wider mb-sm">Net Revenue</div>
          <div className="text-3xl font-bold mb-xs">₹1,24,500</div>
          <div className="text-sm text-success flex items-center gap-xs"><HiOutlineTrendingUp /> +14.5% vs last week</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted font-bold uppercase tracking-wider mb-sm">Average Bill Value</div>
          <div className="text-3xl font-bold mb-xs">₹1,850</div>
          <div className="text-sm text-success flex items-center gap-xs"><HiOutlineTrendingUp /> +3.2% vs last week</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted font-bold uppercase tracking-wider mb-sm">New Customers</div>
          <div className="text-3xl font-bold mb-xs">42</div>
          <div className="text-sm text-danger flex items-center gap-xs">-2.1% vs last week</div>
        </div>
      </div>

      <div className="card mb-xl">
        <h3 className="font-bold mb-lg">Revenue Performance</h3>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="sales" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-2 gap-lg">
        <div className="card">
          <h3 className="font-bold mb-lg">Top Menu Items</h3>
          <div className="flex flex-col gap-md">
            {[
              { name: 'Butter Chicken', sales: 145, growth: '+12%' },
              { name: 'Paneer Tikka', sales: 120, growth: '+8%' },
              { name: 'Masala Dosa', sales: 98, growth: '+15%' },
              { name: 'Biryani', sales: 85, growth: '-2%' },
            ].map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-muted">{item.sales} orders this month</div>
                </div>
                <div className={`text-sm ${item.growth.startsWith('+') ? 'text-success' : 'text-danger'}`}>{item.growth}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-lg">Staff Performance</h3>
          <div className="flex flex-col gap-md">
            {[
              { name: 'Rajesh Kumar', rating: 4.8, orders: 342 },
              { name: 'Suresh Patil', rating: 4.6, orders: 289 },
              { name: 'Anjali Deshmukh', rating: 4.9, orders: 156 },
            ].map(staff => (
              <div key={staff.name} className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <div className="avatar avatar-sm">{staff.name.charAt(0)}</div>
                  <div>
                    <div className="font-semibold">{staff.name}</div>
                    <div className="text-xs text-muted">{staff.orders} handled</div>
                  </div>
                </div>
                <div className="font-bold text-accent">⭐ {staff.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
