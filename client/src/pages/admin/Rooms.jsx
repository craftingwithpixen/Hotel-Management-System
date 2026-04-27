import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function Rooms() {
  const { user } = useAuthStore();
  const canManageRooms = ['admin', 'manager'].includes(user?.role);
  const [rooms, setRooms] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    roomNumber: '',
    type: 'single',
    pricePerNight: '',
    capacity: 2,
    floor: 1,
    amenities: '',
    status: 'available',
    cleaningStatus: 'clean',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    imageUrl: '',
  });
  const [uploadFile, setUploadFile] = useState(null);

  const demoRooms = [
    { _id: '1', roomNumber: '101', type: 'single', pricePerNight: 2500, capacity: 1, floor: 1, status: 'available', cleaningStatus: 'clean', checkInTime: '14:00', checkOutTime: '11:00', images: [] },
    { _id: '2', roomNumber: '102', type: 'double', pricePerNight: 4000, capacity: 2, floor: 1, status: 'booked', cleaningStatus: 'clean', checkInTime: '14:00', checkOutTime: '11:00', images: [] },
    { _id: '3', roomNumber: '201', type: 'deluxe', pricePerNight: 6500, capacity: 3, floor: 2, status: 'available', cleaningStatus: 'dirty', checkInTime: '13:00', checkOutTime: '10:30', images: [] },
    { _id: '4', roomNumber: '301', type: 'suite', pricePerNight: 12000, capacity: 4, floor: 3, status: 'maintenance', cleaningStatus: 'in_progress', checkInTime: '15:00', checkOutTime: '11:00', images: [] },
  ];

  const fetchRooms = async () => {
    if (!canManageRooms) {
      setIsFetching(false);
      return;
    }
    try {
      const { data } = await api.get('/rooms', { params: filter });
      setRooms(data.rooms || []);
    } catch {
      setRooms(demoRooms);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageRooms]);

  const displayRooms = (rooms.length ? rooms : demoRooms).filter(r =>
    (!search || r.roomNumber.toLowerCase().includes(search.toLowerCase())) &&
    (!filter.type || r.type === filter.type) && (!filter.status || r.status === filter.status)
  );

  const resetForm = () => {
    setForm({
      roomNumber: '',
      type: 'single',
      pricePerNight: '',
      capacity: 2,
      floor: 1,
      amenities: '',
      status: 'available',
      cleaningStatus: 'clean',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      imageUrl: '',
    });
    setUploadFile(null);
  };

  const openCreate = () => {
    setEditRoom(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({
      roomNumber: room.roomNumber || '',
      type: room.type || 'single',
      pricePerNight: room.pricePerNight || '',
      capacity: room.capacity || 2,
      floor: room.floor || 1,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      status: room.status || 'available',
      cleaningStatus: room.cleaningStatus || 'clean',
      checkInTime: room.checkInTime || '14:00',
      checkOutTime: room.checkOutTime || '11:00',
      imageUrl: room.images?.[0] || '',
    });
    setUploadFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManageRooms) return;
    setIsSubmitting(true);

    const payload = {
      roomNumber: form.roomNumber,
      type: form.type,
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      floor: Number(form.floor),
      amenities: form.amenities,
      status: form.status,
      cleaningStatus: form.cleaningStatus,
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime,
      images: form.imageUrl ? [form.imageUrl] : [],
    };

    try {
      let targetRoomId = editRoom?._id || null;
      if (editRoom) {
        await api.put(`/rooms/${editRoom._id}`, payload);
        toast.success('Room updated');
      } else {
        const { data } = await api.post('/rooms', payload);
        targetRoomId = data.room?._id || null;
        toast.success('Room created');
      }

      if (uploadFile && targetRoomId) {
        const imageData = new FormData();
        imageData.append('image', uploadFile);
        await api.post(`/rooms/${targetRoomId}/image`, imageData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      fetchRooms();
      setShowModal(false);
      setEditRoom(null);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!canManageRooms) return;
    const confirmed = window.confirm('Delete this room?');
    if (!confirmed) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((room) => room._id !== roomId));
      toast.success('Room deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const statusColor = { available: 'success', booked: 'primary', maintenance: 'warning' };
  const cleanColor = { clean: 'success', dirty: 'danger', in_progress: 'warning' };
  const typeEmoji = { single: '🛏️', double: '🛏️🛏️', deluxe: '✨', suite: '👑' };

  if (!canManageRooms) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold mb-sm">Access denied</h2>
        <p className="text-muted">Only admin and manager roles can manage rooms.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Rooms</h1>
          <p className="text-muted">Manage your hotel rooms</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
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
        {isFetching && <div className="card">Loading rooms...</div>}
        {displayRooms.map((room) => (
          <div key={room._id} className="card card-hover">
            {room.images?.[0] ? (
              <img
                src={room.images[0]}
                alt={`Room ${room.roomNumber}`}
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-md)' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-md)',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                No Image
              </div>
            )}
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
              <div className="flex justify-between text-sm" style={{ marginTop: 'var(--space-xs)' }}>
                <span className="text-muted">Check-in / Check-out</span>
                <span>{room.checkInTime || '14:00'} / {room.checkOutTime || '11:00'}</span>
              </div>
            </div>

            <div className="flex gap-sm">
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(room)}>
                <HiOutlinePencil /> Edit
              </button>
              <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(room._id)}>
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
                <div className="input-group">
                  <label>Cleaning Status</label>
                  <select className="input" value={form.cleaningStatus} onChange={(e) => setForm({ ...form, cleaningStatus: e.target.value })}>
                    <option value="clean">Clean</option>
                    <option value="dirty">Dirty</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Check-in Time</label>
                  <input className="input" type="time" value={form.checkInTime} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Check-out Time</label>
                  <input className="input" type="time" value={form.checkOutTime} onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Amenities (comma separated)</label>
                  <input className="input" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, Breakfast, AC" />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Room Image URL</label>
                  <input className="input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Upload Room Image (optional, update only)</label>
                  <input className="input" type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="flex gap-md justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : `${editRoom ? 'Update' : 'Create'} Room`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
