import { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineQrcode } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import QRDisplay from '../../components/QRDisplay';

const statusStyles = {
  available: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#10b981', label: 'Available' },
  occupied: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', label: 'Occupied' },
  reserved: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', label: 'Reserved' },
};

export default function Tables() {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [hotelId, setHotelId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: 4, location: 'Indoor' });
  const [qrModalTable, setQrModalTable] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hotelRes, tablesRes] = await Promise.all([api.get('/hotel'), api.get('/tables')]);
      setHotelId(hotelRes.data?.hotel?._id || null);
      setTables(tablesRes.data?.tables || []);
    } catch (err) {
      toast.error('Failed to load tables');
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!hotelId) return toast.error('Hotel not configured yet');

    try {
      const payload = {
        hotel: hotelId,
        tableNumber: form.tableNumber,
        capacity: Number(form.capacity),
        location: form.location,
        status: 'available',
        isActive: true,
      };
      await api.post('/tables', payload);
      toast.success('Table created');
      setShowModal(false);
      setForm({ tableNumber: '', capacity: 4, location: 'Indoor' });
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create table');
    }
  };

  const handleDelete = async (tableId) => {
    const confirmed = window.confirm('Delete this table?');
    if (!confirmed) return;
    try {
      await api.delete(`/tables/${tableId}`);
      toast.success('Table deleted');
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete table');
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Tables</h1>
          <p className="text-muted">Restaurant floor management</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus /> Add Table
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-3 gap-lg" style={{ marginBottom: 'var(--space-xl)' }}>
        {['available', 'occupied', 'reserved'].map((status) => {
          const count = tables.filter((t) => t.status === status).length;
          const s = statusStyles[status];
          return (
            <div key={status} className="card" style={{ background: s.bg, borderColor: s.border }}>
              <div className="text-3xl font-bold" style={{ color: s.color }}>
                {count}
              </div>
              <div className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>
                {status} Tables
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Grid */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          Loading tables...
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
          {tables.map((table) => {
            const s = statusStyles[table.status] || statusStyles.available;
            return (
              <div
                key={table._id}
                className="card card-hover"
                style={{ textAlign: 'center', borderColor: s.border, background: s.bg, position: 'relative' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🪑</div>
                <div className="font-bold text-lg">{table.tableNumber}</div>
                <div className="text-xs text-muted">
                  {table.location} · {table.capacity} seats
                </div>
                <div className="text-xs font-semibold" style={{ color: s.color, marginTop: 'var(--space-sm)' }}>
                  {s.label}
                </div>
                <div className="flex gap-xs justify-center" style={{ marginTop: 'var(--space-md)' }}>
                  <button className="btn btn-ghost btn-sm btn-icon" title="Show QR" onClick={() => setQrModalTable(table)}>
                    <HiOutlineQrcode />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    title="Delete table"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleDelete(table._id)}
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {qrModalTable && (
        <div className="modal-overlay" onClick={() => setQrModalTable(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>Table QR</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setQrModalTable(null)}>
                ✕
              </button>
            </div>
            <QRDisplay table={qrModalTable} onRegenerate={fetchAll} />
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Table</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="input-group mb-md">
                <label>Table Number</label>
                <input className="input" value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })} required />
              </div>
              <div className="grid grid-2 gap-md mb-lg">
                <div className="input-group">
                  <label>Capacity</label>
                  <input className="input" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Location</label>
                  <select className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                    <option>Indoor</option>
                    <option>Rooftop</option>
                    <option>Garden</option>
                    <option>Poolside</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-md justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
