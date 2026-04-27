import { useState } from 'react';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineCheck, HiOutlineX, HiOutlineLogin, HiOutlineLogout } from 'react-icons/hi';
import toast from 'react-hot-toast';

const demoBookings = [
  { _id: '1', type: 'room', customer: { name: 'Rahul Sharma' }, room: { roomNumber: '101' }, checkIn: '2026-04-28', checkOut: '2026-04-30', guestCount: 2, status: 'confirmed' },
  { _id: '2', type: 'table', customer: { name: 'Priya Patel' }, table: { tableNumber: 'T-05' }, bookingDate: '2026-04-27', timeSlot: '19:00', guestCount: 4, status: 'pending' },
  { _id: '3', type: 'room', customer: { name: 'Amit Kumar' }, room: { roomNumber: '201' }, checkIn: '2026-04-26', checkOut: '2026-04-29', guestCount: 1, status: 'checked_in' },
  { _id: '4', type: 'table', customer: { name: 'Neha Singh' }, table: { tableNumber: 'T-12' }, bookingDate: '2026-04-27', timeSlot: '20:30', guestCount: 6, status: 'confirmed' },
  { _id: '5', type: 'room', customer: { name: 'Vikram Reddy' }, room: { roomNumber: '301' }, checkIn: '2026-04-25', checkOut: '2026-04-27', guestCount: 2, status: 'checked_out' },
  { _id: '6', type: 'room', customer: { name: 'Sneha Joshi' }, room: { roomNumber: '102' }, checkIn: '2026-04-29', checkOut: '2026-05-01', guestCount: 3, status: 'pending' },
];

export default function Bookings() {
  const [bookings] = useState(demoBookings);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [search, setSearch] = useState('');

  const filtered = bookings.filter(b =>
    (!filter.type || b.type === filter.type) && (!filter.status || b.status === filter.status) &&
    (!search || b.customer.name.toLowerCase().includes(search.toLowerCase()))
  );

  const statusBadge = { pending: 'warning', confirmed: 'success', checked_in: 'info', checked_out: 'primary', cancelled: 'danger' };

  return (
    <div className="animate-fade">
      <div className="page-header"><div><h1>Bookings</h1><p className="text-muted">Manage all reservations</p></div></div>

      <div className="flex items-center gap-md flex-wrap mb-lg">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search by guest name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="tabs">
          <button className={`tab ${filter.type === '' ? 'active' : ''}`} onClick={() => setFilter({...filter, type: ''})}>All</button>
          <button className={`tab ${filter.type === 'room' ? 'active' : ''}`} onClick={() => setFilter({...filter, type: 'room'})}>Rooms</button>
          <button className={`tab ${filter.type === 'table' ? 'active' : ''}`} onClick={() => setFilter({...filter, type: 'table'})}>Tables</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr>
            <th>Guest</th><th>Type</th><th>Room/Table</th><th>Date</th><th>Guests</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b._id}>
                <td><div className="flex items-center gap-sm"><div className="avatar avatar-sm">{b.customer.name.charAt(0)}</div><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{b.customer.name}</span></div></td>
                <td><span className={`badge badge-${b.type === 'room' ? 'primary' : 'info'}`}>{b.type}</span></td>
                <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{b.room?.roomNumber || b.table?.tableNumber}</td>
                <td>{b.checkIn ? `${b.checkIn} → ${b.checkOut}` : `${b.bookingDate} ${b.timeSlot}`}</td>
                <td>{b.guestCount}</td>
                <td><span className={`badge badge-${statusBadge[b.status]}`}>{b.status.replace('_', ' ')}</span></td>
                <td>
                  <div className="flex gap-xs">
                    {b.status === 'pending' && <button className="btn btn-success btn-sm btn-icon" onClick={() => toast.success('Confirmed')} title="Confirm"><HiOutlineCheck /></button>}
                    {b.status === 'confirmed' && <button className="btn btn-primary btn-sm btn-icon" title="Check In"><HiOutlineLogin /></button>}
                    {b.status === 'checked_in' && <button className="btn btn-outline btn-sm btn-icon" title="Check Out"><HiOutlineLogout /></button>}
                    {['pending', 'confirmed'].includes(b.status) && <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} title="Cancel"><HiOutlineX /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
