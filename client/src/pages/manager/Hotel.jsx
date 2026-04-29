import { useState, useEffect } from 'react';
import { HiOutlineSave, HiOutlinePhotograph, HiOutlineOfficeBuilding, HiOutlineGlobe, HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi';
import api from '../../services/api';
import ImageUpload from '../../components/ImageUpload';
import toast from 'react-hot-toast';

export default function ManagerHotel() {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    api.get('/hotel').then(({ data }) => setHotel(data.hotel))
      .catch(() => toast.error('Failed to load hotel'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/hotel', hotel);
      setHotel(data.hotel);
      toast.success('Hotel info updated!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const toggleOpen = async () => {
    try {
      await api.put('/hotel/availability', { isOpen: !hotel.isOpen });
      setHotel(h => ({ ...h, isOpen: !h.isOpen }));
      toast.success(`Hotel marked ${!hotel.isOpen ? 'Open' : 'Closed'}`);
    } catch { toast.error('Failed to toggle'); }
  };

  const addPhoto = (url) => {
    if (url) setHotel(h => ({ ...h, photos: [...(h.photos || []), url] }));
  };

  const removePhoto = async (idx) => {
    try {
      await api.delete(`/hotel/photos/${idx}`);
      setHotel(h => ({ ...h, photos: h.photos.filter((_, i) => i !== idx) }));
      toast.success('Photo removed');
    } catch { toast.error('Failed to remove photo'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>;
  if (!hotel) return <div className="card" style={{ textAlign: 'center', padding: 40 }}>No hotel found. Contact admin.</div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>🏢 Hotel Settings</h1>
          <p className="text-muted">Manage hotel information, photos, and availability</p>
        </div>
        <div className="flex gap-md">
          <button
            className={`btn ${hotel.isOpen ? 'btn-success' : 'btn-outline'}`}
            onClick={toggleOpen}
          >
            {hotel.isOpen ? '🟢 Open' : '🔴 Closed'} — Click to toggle
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <HiOutlineSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-lg)' }}>
        {[['info', 'Basic Info'], ['photos', 'Photos'], ['billing', 'GST & Billing'], ['social', 'Social & Web']].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          <div className="card">
            <h3 className="font-bold" style={{ marginBottom: 'var(--space-lg)' }}>
              <HiOutlineOfficeBuilding style={{ display: 'inline', marginRight: 6 }} />Property Details
            </h3>
            <div className="input-group mb-md"><label>Hotel Name</label><input className="input" value={hotel.name || ''} onChange={e => setHotel(h => ({ ...h, name: e.target.value }))} /></div>
            <div className="input-group mb-md"><label>Description</label><textarea className="input" rows={3} value={hotel.description || ''} onChange={e => setHotel(h => ({ ...h, description: e.target.value }))} /></div>
            <div className="grid grid-2 gap-md mb-md">
              <div className="input-group"><label>Check-In Time</label><input className="input" type="time" value={hotel.checkInTime || '12:00'} onChange={e => setHotel(h => ({ ...h, checkInTime: e.target.value }))} /></div>
              <div className="input-group"><label>Check-Out Time</label><input className="input" type="time" value={hotel.checkOutTime || '11:00'} onChange={e => setHotel(h => ({ ...h, checkOutTime: e.target.value }))} /></div>
            </div>
            <div className="input-group mb-md"><label>Amenities (comma-separated)</label>
              <input className="input" value={(hotel.amenities || []).join(', ')} onChange={e => setHotel(h => ({ ...h, amenities: e.target.value.split(',').map(a => a.trim()).filter(Boolean) }))} placeholder="WiFi, AC, Parking, Pool" />
            </div>
          </div>
          <div className="card">
            <h3 className="font-bold" style={{ marginBottom: 'var(--space-lg)' }}>
              <HiOutlineLocationMarker style={{ display: 'inline', marginRight: 6 }} />Contact & Address
            </h3>
            <div className="input-group mb-md"><label><HiOutlinePhone style={{ display: 'inline' }} /> Phone</label><input className="input" value={hotel.phone || ''} onChange={e => setHotel(h => ({ ...h, phone: e.target.value }))} /></div>
            <div className="input-group mb-md"><label><HiOutlineMail style={{ display: 'inline' }} /> Email</label><input className="input" type="email" value={hotel.email || ''} onChange={e => setHotel(h => ({ ...h, email: e.target.value }))} /></div>
            <div className="input-group mb-md"><label>Street</label><input className="input" value={hotel.address?.street || ''} onChange={e => setHotel(h => ({ ...h, address: { ...h.address, street: e.target.value } }))} /></div>
            <div className="grid grid-2 gap-md mb-md">
              <div className="input-group"><label>City</label><input className="input" value={hotel.address?.city || ''} onChange={e => setHotel(h => ({ ...h, address: { ...h.address, city: e.target.value } }))} /></div>
              <div className="input-group"><label>State</label><input className="input" value={hotel.address?.state || ''} onChange={e => setHotel(h => ({ ...h, address: { ...h.address, state: e.target.value } }))} /></div>
            </div>
            <div className="input-group"><label>Pincode</label><input className="input" value={hotel.address?.pincode || ''} onChange={e => setHotel(h => ({ ...h, address: { ...h.address, pincode: e.target.value } }))} /></div>
          </div>
        </div>
      )}

      {tab === 'photos' && (
        <div className="card">
          <h3 className="font-bold" style={{ marginBottom: 'var(--space-lg)' }}>
            <HiOutlinePhotograph style={{ display: 'inline', marginRight: 6 }} />Hotel Photos
          </h3>
          <div className="grid grid-3 gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
            {(hotel.photos || []).map((url, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <img src={url} alt={`Hotel ${i + 1}`} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <button
                  onClick={() => removePhoto(i)}
                  className="btn btn-ghost btn-icon"
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '50%' }}
                >✕</button>
              </div>
            ))}
          </div>
          <ImageUpload folder="hotel_photos" label="Add Hotel Photo" onUpload={addPhoto} />
        </div>
      )}

      {tab === 'billing' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <h3 className="font-bold" style={{ marginBottom: 'var(--space-lg)' }}>GST & Billing</h3>
          <div className="input-group mb-md"><label>GST Number</label><input className="input" value={hotel.gstNumber || ''} onChange={e => setHotel(h => ({ ...h, gstNumber: e.target.value }))} placeholder="22AAAAA0000A1Z5" /></div>
          <div className="input-group mb-md"><label>GST Rate (%)</label><input className="input" type="number" min={0} max={100} value={hotel.gstRate ?? 18} onChange={e => setHotel(h => ({ ...h, gstRate: Number(e.target.value) }))} /></div>
          <div className="badge badge-info" style={{ padding: 'var(--space-md)', width: '100%' }}>
            GST is automatically applied to all bills. Current rate: <strong>{hotel.gstRate ?? 18}%</strong>
          </div>
        </div>
      )}

      {tab === 'social' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <h3 className="font-bold" style={{ marginBottom: 'var(--space-lg)' }}>
            <HiOutlineGlobe style={{ display: 'inline', marginRight: 6 }} />Social & Web Links
          </h3>
          <div className="input-group mb-md"><label>Website URL</label><input className="input" value={hotel.socialLinks?.website || ''} onChange={e => setHotel(h => ({ ...h, socialLinks: { ...h.socialLinks, website: e.target.value } }))} placeholder="https://yourhotel.com" /></div>
          <div className="input-group mb-md"><label>Instagram</label><input className="input" value={hotel.socialLinks?.instagram || ''} onChange={e => setHotel(h => ({ ...h, socialLinks: { ...h.socialLinks, instagram: e.target.value } }))} placeholder="@yourhotel" /></div>
          <div className="input-group"><label>Facebook</label><input className="input" value={hotel.socialLinks?.facebook || ''} onChange={e => setHotel(h => ({ ...h, socialLinks: { ...h.socialLinks, facebook: e.target.value } }))} placeholder="facebook.com/yourhotel" /></div>
        </div>
      )}
    </div>
  );
}
