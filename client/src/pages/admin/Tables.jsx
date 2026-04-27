import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineQrcode } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const demoTables = [
  { _id: '1', tableNumber: 'T-01', capacity: 2, status: 'available', location: 'Indoor' },
  { _id: '2', tableNumber: 'T-02', capacity: 4, status: 'occupied', location: 'Indoor' },
  { _id: '3', tableNumber: 'T-03', capacity: 6, status: 'reserved', location: 'Rooftop' },
  { _id: '4', tableNumber: 'T-04', capacity: 4, status: 'available', location: 'Garden' },
  { _id: '5', tableNumber: 'T-05', capacity: 8, status: 'available', location: 'Indoor' },
  { _id: '6', tableNumber: 'T-06', capacity: 2, status: 'occupied', location: 'Rooftop' },
  { _id: '7', tableNumber: 'T-07', capacity: 4, status: 'available', location: 'Garden' },
  { _id: '8', tableNumber: 'T-08', capacity: 6, status: 'reserved', location: 'Indoor' },
];

export default function Tables() {
  const [tables, setTables] = useState(demoTables);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: 4, location: 'Indoor' });

  const statusStyles = {
    available: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#10b981', label: '🟢 Available' },
    occupied: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', label: '🔴 Occupied' },
    reserved: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', label: '🟡 Reserved' },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTables([...tables, { ...form, _id: Date.now().toString(), status: 'available' }]);
    setShowModal(false);
    toast.success('Table created');
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div><h1>Tables</h1><p className="text-muted">Restaurant floor management</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><HiOutlinePlus /> Add Table</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-3 gap-lg" style={{ marginBottom: 'var(--space-xl)' }}>
        {['available', 'occupied', 'reserved'].map(status => {
          const count = tables.filter(t => t.status === status).length;
          const s = statusStyles[status];
          return (
            <div key={status} className="card" style={{ background: s.bg, borderColor: s.border }}>
              <div className="text-3xl font-bold" style={{ color: s.color }}>{count}</div>
              <div className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>{status} Tables</div>
            </div>
          );
        })}
      </div>

      {/* Table Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
        {tables.map(table => {
          const s = statusStyles[table.status];
          return (
            <div key={table._id} className="card card-hover" style={{ textAlign: 'center', borderColor: s.border, background: s.bg, cursor: 'pointer', position: 'relative' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🪑</div>
              <div className="font-bold text-lg">{table.tableNumber}</div>
              <div className="text-xs text-muted">{table.location} · {table.capacity} seats</div>
              <div className="text-xs font-semibold" style={{ color: s.color, marginTop: 'var(--space-sm)' }}>{s.label}</div>
              <div className="flex gap-xs justify-center" style={{ marginTop: 'var(--space-md)' }}>
                <button className="btn btn-ghost btn-sm btn-icon"><HiOutlineQrcode /></button>
                <button className="btn btn-ghost btn-sm btn-icon"><HiOutlinePencil /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Table</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-md"><label>Table Number</label><input className="input" value={form.tableNumber} onChange={e => setForm({...form, tableNumber: e.target.value})} required /></div>
              <div className="grid grid-2 gap-md mb-lg">
                <div className="input-group"><label>Capacity</label><input className="input" type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
                <div className="input-group"><label>Location</label>
                  <select className="input" value={form.location} onChange={e => setForm({...form, location: e.target.value})}>
                    <option>Indoor</option><option>Rooftop</option><option>Garden</option><option>Poolside</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-md justify-end"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Table</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
