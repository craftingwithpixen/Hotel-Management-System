import { useState } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const demoStaff = [
  { _id: '1', name: 'Rajesh Kumar', role: 'manager', department: 'Management', email: 'rajesh@example.com', phone: '9876543210', salary: 45000, status: 'active' },
  { _id: '2', name: 'Suresh Patil', role: 'waiter', department: 'Restaurant', email: 'suresh@example.com', phone: '9876543211', salary: 18000, status: 'active' },
  { _id: '3', name: 'Vikram Singh', role: 'chef', department: 'Kitchen', email: 'vikram@example.com', phone: '9876543212', salary: 35000, status: 'active' },
  { _id: '4', name: 'Anjali Deshmukh', role: 'receptionist', department: 'Front Desk', email: 'anjali@example.com', phone: '9876543213', salary: 22000, status: 'active' },
];

export default function Staff() {
  const [staff, setStaff] = useState(demoStaff);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'waiter', department: 'Restaurant', salary: '', phone: '' });

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
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
            {filtered.map(s => (
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
                    <button className="btn btn-ghost btn-sm btn-icon" title="Edit"><HiOutlinePencil /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} title="Delete"><HiOutlineTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Staff</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); setStaff([...staff, { ...form, _id: Date.now().toString(), status: 'active' }]); setShowModal(false); toast.success('Staff added'); }}>
              <div className="input-group mb-md"><label>Full Name</label><input className="input" required onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="grid grid-2 gap-md mb-md">
                <div className="input-group"><label>Email</label><input className="input" type="email" required onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="input-group"><label>Phone</label><input className="input" required onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="grid grid-2 gap-md mb-md">
                <div className="input-group"><label>Role</label>
                  <select className="input" onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="waiter">Waiter</option><option value="chef">Chef</option><option value="receptionist">Receptionist</option><option value="manager">Manager</option>
                  </select>
                </div>
                <div className="input-group"><label>Department</label>
                  <select className="input" onChange={e => setForm({...form, department: e.target.value})}>
                    <option value="Restaurant">Restaurant</option><option value="Kitchen">Kitchen</option><option value="Front Desk">Front Desk</option><option value="Management">Management</option>
                  </select>
                </div>
              </div>
              <div className="input-group mb-lg"><label>Monthly Salary (₹)</label><input className="input" type="number" required onChange={e => setForm({...form, salary: parseInt(e.target.value)})} /></div>
              <div className="flex gap-md justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
