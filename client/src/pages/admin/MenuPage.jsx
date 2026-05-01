import { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineEye, HiOutlineEyeOff, HiOutlineSparkles, HiOutlineCollection, HiOutlineHome, HiOutlineOfficeBuilding, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const catCfg = {
  veg: { icon: HiOutlineSparkles, color: '#10b981', label: 'Veg' },
  non_veg: { icon: HiOutlineCollection, color: '#ef4444', label: 'Non-Veg' },
  drinks: { icon: HiOutlineCollection, color: '#3b82f6', label: 'Drinks' },
  dessert: { icon: HiOutlineHome, color: '#f59e0b', label: 'Dessert' },
  combo: { icon: HiOutlineOfficeBuilding, color: '#8b5cf6', label: 'Combo' },
};

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [activeCat, setActiveCat] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [hotelId, setHotelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', category: 'veg', price: '', description: '', prepTime: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hRes, menuRes] = await Promise.all([api.get('/hotel'), api.get('/menu')]);
      setHotelId(hRes.data?.hotel?._id || null);
      setItems(menuRes.data?.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load menu');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = items.filter(i =>
    (!activeCat || i.category === activeCat) &&
    (!search || i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = async (id) => {
    try {
      await api.put(`/menu/${id}/toggle`);
      toast.success('Menu updated');
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update item');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!hotelId) return toast.error('Hotel not configured yet');
    try {
      await api.post('/menu', {
        hotel: hotelId,
        name: form.name,
        category: form.category,
        price: Number(form.price),
        description: form.description || undefined,
        prepTime: form.prepTime ? Number(form.prepTime) : undefined,
      });
      toast.success('Added menu item');
      setShowModal(false);
      setForm({ name: '', category: 'veg', price: '', description: '', prepTime: '' });
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add item');
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div><h1>Menu</h1><p className="text-muted">Manage menu items</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><HiOutlinePlus /> Add Item</button>
      </div>

      <div className="flex items-center gap-md flex-wrap mb-lg">
        <div className="tabs">
          <button className={`tab ${!activeCat ? 'active' : ''}`} onClick={() => setActiveCat('')}>All</button>
          {Object.entries(catCfg).map(([k, v]) => (
            <button key={k} className={`tab ${activeCat === k ? 'active' : ''}`} onClick={() => setActiveCat(k)}><v.icon /> {v.label}</button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <div className="grid grid-auto gap-lg">
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No menu items found</div>
        ) : (
        filtered.map(item => {
          const c = catCfg[item.category] || catCfg.veg;
          return (
            <div key={item._id} className="card card-hover" style={{ opacity: item.isAvailable ? 1 : 0.6 }}>
              <div style={{ height: 100, background: `linear-gradient(135deg, ${c.color}22, ${c.color}08)`, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}><c.icon /></div>
              <div className="flex items-start justify-between mb-sm">
                <div><h3 className="font-bold">{item.name}</h3><span className="badge" style={{ background: `${c.color}20`, color: c.color }}>{c.label}</span></div>
                <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>₹{item.price}</div>
              </div>
              <p className="text-sm text-muted mb-md">{item.description}</p>
              <div className="flex gap-sm">
                <button className={`btn btn-sm btn-icon ${item.isAvailable ? 'btn-success' : 'btn-danger'}`} onClick={() => toggle(item._id)}>
                  {item.isAvailable ? <HiOutlineEye /> : <HiOutlineEyeOff />}
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
            <div className="modal-header"><h2>Add Item</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button></div>
            <form onSubmit={submit}>
              <div className="input-group mb-md"><label>Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="grid grid-2 gap-md mb-md">
                <div className="input-group"><label>Category</label><select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {Object.entries(catCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                <div className="input-group"><label>Price (₹)</label><input className="input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
              </div>
              <div className="grid grid-2 gap-md mb-md">
                <div className="input-group"><label>Prep Time (mins)</label><input className="input" type="number" value={form.prepTime} onChange={e => setForm({...form, prepTime: e.target.value})} /></div>
              </div>
              <div className="input-group mb-lg"><label>Description</label><textarea className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ minHeight: 60 }} /></div>
              <div className="flex gap-md justify-end"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
