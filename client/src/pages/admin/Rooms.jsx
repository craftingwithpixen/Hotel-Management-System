import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineFilter } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ roomNumber: '', type: 'single', pricePerNight: '', capacity: 2, floor: 1, amenities: '', status: 'available' });

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms', { params: filter });
      setRooms(data.rooms || []);
    } catch { setRooms(demoRooms); }
    finally { setLoading(false); }
  };

  const demoRooms = [
    { _id: '1', roomNumber: '101', type: 'single', pricePerNight: 2500, capacity: 1, floor: 1, status: 'available', cleaningStatus: 'clean' },
    { _id: '2', roomNumber: '102', type: 'double', pricePerNight: 4000, capacity: 2, floor: 1, status: 'booked', cleaningStatus: 'clean' },
    { _id: '3', roomNumber: '201', type: 'deluxe', pricePerNight: 6500, capacity: 3, floor: 2, status: 'available', cleaningStatus: 'dirty' },
    { _id: '4', roomNumber: '301', type: 'suite', pricePerNight: 12000, capacity: 4, floor: 3, status: 'maintenance', cleaningStatus: 'in_progress' },
    { _id: '5', roomNumber: '103', type: 'double', pricePerNight: 4200, capacity: 2, floor: 1, status: 'booked', cleaningStatus: 'clean' },
    { _id: '6', roomNumber: '202', type: 'deluxe', pricePerNight: 7000, capacity: 3, floor: 2, status: 'available', cleaningStatus: 'clean' },
  ];

  const displayRooms = (rooms.length ? rooms : demoRooms).filter(r =>
    (!search || r.roomNumber.toLowerCase().includes(search.toLowerCase())) &&
    (!filter.type || r.type === filter.type) && (!filter.status || r.status === filter.status)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRoom) {
        await api.put(`/rooms/${editRoom._id}`, form);
        toast.success('Room updated');
      } else {
        await api.post('/rooms', form);
        toast.success('Room created');
      }
      fetchRooms();
      setShowModal(false);
      setEditRoom(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const statusColor = { available: 'success', booked: 'primary', maintenance: 'warning' };
  const cleanColor = { clean: 'success', dirty: 'danger', in_progress: 'warning' };
  const typeEmoji = { single: '🛏️', double: '🛏️🛏️', deluxe: '✨', suite: '👑' };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Rooms</h1>
          <p className="text-muted">Manage your hotel rooms</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditRoom(null); setForm({ roomNumber: '', type: 'single', pricePerNight: '', capacity: 2, floor: 1, amenities: '', status: 'available' }); setShowModal(true); }}>
          <HiOutlinePlus /> Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-md flex-wrap" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="input" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} style={{ width: 160 }}>
          <option value="">All Types</option>
          <option value="single">Single</option><option value="double">Double</option>
          <option value="deluxe">Deluxe</option><option value="suite">Suite</option>
        </select>
        <select className="input" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} style={{ width: 160 }}>
          <option value="">All Status</option>
          <option value="available">Available</option><option value="booked">Booked</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Room Grid */}
      <div className="grid grid-auto gap-lg">
        {displayRooms.map((room) => (
          <div key={room._id} className="card card-hover">
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="flex items-center gap-sm">
                <span style={{ fontSize: '1.5rem' }}>{typeEmoji[room.type]}</span>
                <div>
                  <div className="font-bold text-lg">Room {room.roomNumber}</div>
                  <div className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>Floor {room.floor} · {room.type}</div>
                </div>
              </div>
              <span className={`badge badge-${statusColor[room.status]}`}>{room.status}</span>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div className="flex justify-between text-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                <span className="text-muted">Price/Night</span>
                <span className="font-bold">₹{room.pricePerNight?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                <span className="text-muted">Capacity</span>
                <span>{room.capacity} guest{room.capacity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Cleaning</span>
                <span className={`badge badge-${cleanColor[room.cleaningStatus]}`} style={{ fontSize: '0.7rem' }}>{room.cleaningStatus}</span>
              </div>
            </div>

            <div className="flex gap-sm">
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setEditRoom(room); setForm(room); setShowModal(true); }}>
                <HiOutlinePencil /> Edit
              </button>
              <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }}>
                <HiOutlineTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editRoom ? 'Edit Room' : 'Add New Room'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2 gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="input-group">
                  <label>Room Number</label>
                  <input className="input" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="single">Single</option><option value="double">Double</option>
                    <option value="deluxe">Deluxe</option><option value="suite">Suite</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Price / Night (₹)</label>
                  <input className="input" type="number" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Capacity</label>
                  <input className="input" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Floor</label>
                  <input className="input" type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="available">Available</option><option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-md justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editRoom ? 'Update' : 'Create'} Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
