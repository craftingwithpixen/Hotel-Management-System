import { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineCalendar, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Staff() {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [hotelId, setHotelId] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'waiter',
    department: 'Restaurant',
    salary: '',
    employeeId: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hotelRes, staffRes] = await Promise.all([api.get('/hotel'), api.get('/staff')]);
      setHotelId(hotelRes.data?.hotel?._id || null);
      const rawStaff = staffRes.data?.staff || [];
      const mapped = rawStaff.map((s) => ({
        _id: s._id,
        name: s.user?.name,
        email: s.user?.email,
        phone: s.user?.phone,
        role: s.user?.role,
        department: s.department,
        salary: s.salary,
      }));
      setStaff(mapped);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = staff.filter(
    (s) =>
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Staff Management</h1>
          <p className="text-muted">Manage your employees and payroll</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus /> Add Staff
        </button>
      </div>

      <div className="flex items-center gap-md mb-lg">
        <div style={{ position: 'relative', flex: 1 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search staff by name or department..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  No staff found
                </td>
              </tr>
            ) : (
            filtered.map((s) => (
              <tr key={s._id}>
                <td>
                  <div className="flex items-center gap-sm">
                    <div className="avatar avatar-sm">{s.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</div>
                      <div className="text-xs text-muted">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{s.role}</span></td>
                <td>{s.department}</td>
                <td className="font-medium">₹{s.salary.toLocaleString()}</td>
                <td className="text-sm">{s.phone}</td>
                <td>
                  <div className="flex gap-xs">
                    <button className="btn btn-ghost btn-sm btn-icon" title="Attendance"><HiOutlineCalendar /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} title="Delete"><HiOutlineTrash /></button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Staff</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!hotelId) return toast.error('Hotel not configured yet');
                try {
                  await api.post('/staff', {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    phone: form.phone,
                    role: form.role,
                    hotelId,
                    department: form.department,
                    salary: Number(form.salary),
                    employeeId: form.employeeId,
                  });
                  toast.success('Staff added');
                  setShowModal(false);
                  setForm({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'waiter',
                    department: 'Restaurant',
                    salary: '',
                    employeeId: '',
                  });
                  fetchAll();
                } catch (err) {
                  toast.error(err?.response?.data?.message || 'Failed to add staff');
                }
              }}
            >
              <div className="input-group mb-md">
                <label>Full Name</label>
                <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-2 gap-md mb-md">
                <div className="input-group">
                  <label>Email</label>
                  <input className="input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input className="input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-2 gap-md mb-md">
                <div className="input-group">
                  <label>Password</label>
                  <input className="input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Employee ID</label>
                  <input className="input" required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-2 gap-md mb-md">
                <div className="input-group">
                  <label>Role</label>
                  <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="waiter">Waiter</option>
                    <option value="chef">Chef</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Department</label>
                  <select className="input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Front Desk">Front Desk</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div className="input-group mb-lg">
                <label>Monthly Salary (₹)</label>
                <input
                  className="input"
                  type="number"
                  required
                  value={form.salary}
                  onChange={e => setForm({ ...form, salary: e.target.value })}
                />
              </div>

              <div className="flex gap-md justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
