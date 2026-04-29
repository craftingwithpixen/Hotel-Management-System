import { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [hotelId, setHotelId] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Grains',
    currentStock: '',
    unit: 'kg',
    lowStockThreshold: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hotelRes, inventoryRes] = await Promise.all([api.get('/hotel'), api.get('/inventory')]);
      setHotelId(hotelRes.data?.hotel?._id || null);
      setItems(inventoryRes.data?.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load inventory');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p className="text-muted">Track supplies and stock levels</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus /> Add Item
        </button>
      </div>

      <div className="flex items-center gap-md mb-lg">
        <div style={{ position: 'relative', flex: 1 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search inventory items..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <div className="grid grid-auto gap-lg">
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No inventory items found</div>
        ) : (
        filtered.map(item => {
          const isLow = item.currentStock <= item.lowStockThreshold;
          return (
            <div key={item._id} className="card card-hover" style={{ borderColor: isLow ? 'var(--danger-light)' : 'var(--border)' }}>
              <div className="flex justify-between items-start mb-md">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <span className="badge badge-info">{item.category}</span>
                </div>
                {isLow && <HiOutlineExclamationCircle style={{ color: 'var(--danger)', fontSize: '1.5rem' }} title="Low Stock!" />}
              </div>

              <div className="flex items-end justify-between mb-lg">
                <div>
                  <div className="text-2xl font-bold">{item.currentStock} <span className="text-sm font-normal text-muted">{item.unit}</span></div>
                  <div className="text-xs text-muted">Threshold: {item.lowStockThreshold} {item.unit}</div>
                </div>
                <div style={{ width: '100px', height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(100, (item.currentStock / (item.lowStockThreshold * 2)) * 100)}%`, 
                    height: '100%', 
                    background: isLow ? 'var(--danger)' : 'var(--success)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              <div className="flex gap-sm">
                <button
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => toast('Restock is available via Inventory API endpoints')}
                >
                  Restock
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => toast('History is available on the inventory detail screen')}>
                  History
                </button>
              </div>
            </div>
          );
        })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Inventory Item</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!hotelId) return toast.error('Hotel not configured');
                try {
                  await api.post('/inventory', {
                    hotel: hotelId,
                    name: form.name,
                    category: form.category || undefined,
                    unit: form.unit,
                    currentStock: Number(form.currentStock),
                    lowStockThreshold: Number(form.lowStockThreshold),
                  });
                  toast.success('Item added');
                  setShowModal(false);
                  setForm({ name: '', category: 'Grains', currentStock: '', unit: 'kg', lowStockThreshold: '' });
                  fetchAll();
                } catch (err) {
                  toast.error(err?.response?.data?.message || 'Failed to add item');
                }
              }}
            >
              <div className="input-group mb-md">
                <label>Item Name</label>
                <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-2 gap-md mb-md">
                <div className="input-group"><label>Category</label>
                  <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>Grains</option><option>Oils</option><option>Dairy</option><option>Meat</option><option>Vegetables</option><option>Beverages</option>
                  </select>
                </div>
                <div className="input-group"><label>Unit</label>
                  <select className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="litre">litre</option>
                    <option value="pcs">pcs</option>
                    <option value="box">box</option>
                    <option value="packet">packet</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-2 gap-md mb-lg">
                <div className="input-group">
                  <label>Initial Stock</label>
                  <input className="input" type="number" required value={form.currentStock} onChange={e => setForm({ ...form, currentStock: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Low Stock Warning</label>
                  <input className="input" type="number" required value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-md justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add to Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
