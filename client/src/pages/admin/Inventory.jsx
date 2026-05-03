import { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineExclamationCircle, HiOutlineX, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [hotelId, setHotelId] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestAction, setRequestAction] = useState('');
  const [form, setForm] = useState({
    name: '',
    category: 'Grains',
    currentStock: '',
    unit: 'kg',
    lowStockThreshold: '',
  });
  const [restockForm, setRestockForm] = useState({
    qty: '',
    costPerUnit: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hotelRes, inventoryRes, requestRes] = await Promise.all([
        api.get('/hotel'),
        api.get('/inventory'),
        api.get('/inventory/requests', { params: { limit: 20 } }),
      ]);
      setHotelId(hotelRes.data?.hotel?._id || null);
      setItems(inventoryRes.data?.items || []);
      setRequests(requestRes.data?.requests || []);
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
  const pendingRequests = requests.filter((request) => request.status === 'pending');

  const formatDate = (date) => {
    if (!date) return 'Not recorded';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openRestock = (item) => {
    setRestockItem(item);
    setRestockForm({ qty: '', costPerUnit: '' });
  };

  const submitRestock = async (e) => {
    e.preventDefault();
    if (!restockItem) return;

    const qty = Number(restockForm.qty);
    const costPerUnit = Number(restockForm.costPerUnit);
    if (!Number.isFinite(qty) || qty <= 0) return toast.error('Enter a valid restock quantity');
    if (!Number.isFinite(costPerUnit) || costPerUnit < 0) return toast.error('Enter a valid unit cost');

    setRestocking(true);
    try {
      const { data } = await api.post(`/inventory/${restockItem._id}/restock`, {
        qty,
        costPerUnit,
      });
      setItems((prev) => prev.map((item) => item._id === data.item?._id ? data.item : item));
      setRestockItem(null);
      setRestockForm({ qty: '', costPerUnit: '' });
      toast.success('Stock updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to restock item');
    } finally {
      setRestocking(false);
    }
  };

  const openHistory = async (item) => {
    setHistoryItem(item);
    setHistoryLoading(true);
    try {
      const { data } = await api.get(`/inventory/${item._id}`);
      setHistoryItem(data.item || item);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load inventory history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    setRequestAction(`${requestId}:${status}`);
    try {
      const { data } = await api.patch(`/inventory/requests/${requestId}`, { status });
      setRequests((prev) => prev.map((request) => request._id === requestId ? data.request : request));
      toast.success(`Request marked ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update request');
    } finally {
      setRequestAction('');
    }
  };

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

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="flex items-center justify-between gap-md" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
          <div>
            <h2 className="font-bold" style={{ margin: 0 }}>Chef Inventory Requests</h2>
            <p className="text-sm text-muted" style={{ margin: '4px 0 0' }}>
              {pendingRequests.length} pending request{pendingRequests.length === 1 ? '' : 's'} from kitchen
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={fetchAll}>Refresh</button>
        </div>
        {requests.length === 0 ? (
          <div className="text-sm text-muted">No inventory requests yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            {requests.slice(0, 6).map((request) => (
              <div
                key={request._id}
                className="card"
                style={{
                  background: 'var(--bg-tertiary)',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: 'var(--space-md)',
                  alignItems: 'center',
                  padding: 'var(--space-md)',
                }}
              >
                <div>
                  <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap', marginBottom: 4 }}>
                    <strong>{request.itemName}</strong>
                    <span className={`badge ${request.status === 'pending' ? 'badge-warning' : request.status === 'approved' ? 'badge-success' : 'badge-info'}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted">
                    {request.quantity ? `${request.quantity} ${request.unit || ''}` : 'Quantity not specified'}
                    {' '}· Requested by {request.requestedBy?.name || 'Chef'} · {formatDate(request.createdAt)}
                  </div>
                  {request.note && <div className="text-sm text-muted" style={{ marginTop: 4 }}>Note: {request.note}</div>}
                </div>
                {request.status === 'pending' ? (
                  <div className="flex gap-sm">
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={requestAction === `${request._id}:rejected`}
                      onClick={() => updateRequestStatus(request._id, 'rejected')}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={requestAction === `${request._id}:approved`}
                      onClick={() => updateRequestStatus(request._id, 'approved')}
                    >
                      <HiOutlineCheckCircle /> Approve
                    </button>
                  </div>
                ) : request.status === 'approved' ? (
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={requestAction === `${request._id}:fulfilled`}
                    onClick={() => updateRequestStatus(request._id, 'fulfilled')}
                  >
                    Mark Fulfilled
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
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
                  onClick={() => openRestock(item)}
                >
                  Restock
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => openHistory(item)}>
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
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button>
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

      {restockItem && (
        <div className="modal-overlay" onClick={() => setRestockItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2>Restock {restockItem.name}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setRestockItem(null)}><HiOutlineX /></button>
            </div>
            <div className="card" style={{ background: 'var(--bg-tertiary)', marginBottom: 'var(--space-lg)' }}>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Current stock</span>
                <strong>{restockItem.currentStock} {restockItem.unit}</strong>
              </div>
              <div className="flex justify-between text-sm" style={{ marginTop: 'var(--space-xs)' }}>
                <span className="text-muted">Low stock threshold</span>
                <strong>{restockItem.lowStockThreshold} {restockItem.unit}</strong>
              </div>
            </div>
            <form onSubmit={submitRestock}>
              <div className="grid grid-2 gap-md mb-lg">
                <div className="input-group">
                  <label>Quantity ({restockItem.unit})</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={restockForm.qty}
                    onChange={e => setRestockForm({ ...restockForm, qty: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Cost per {restockItem.unit}</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={restockForm.costPerUnit}
                    onChange={e => setRestockForm({ ...restockForm, costPerUnit: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-md justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setRestockItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={restocking}>
                  {restocking ? 'Saving...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyItem && (
        <div className="modal-overlay" onClick={() => setHistoryItem(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh', overflowY: 'auto', maxWidth: 820 }}>
            <div className="modal-header">
              <h2>{historyItem.name} History</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setHistoryItem(null)}><HiOutlineX /></button>
            </div>

            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" /></div>
            ) : (
              <>
                <div className="grid gap-md mb-lg" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                  <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="text-xs text-muted">Current Stock</div>
                    <div className="font-bold">{historyItem.currentStock} {historyItem.unit}</div>
                  </div>
                  <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="text-xs text-muted">Threshold</div>
                    <div className="font-bold">{historyItem.lowStockThreshold} {historyItem.unit}</div>
                  </div>
                  <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="text-xs text-muted">Last Restocked</div>
                    <div className="font-bold text-sm">{formatDate(historyItem.lastRestockedAt)}</div>
                  </div>
                </div>

                <section style={{ marginBottom: 'var(--space-xl)' }}>
                  <h3 className="font-bold mb-md">Purchase History</h3>
                  {(historyItem.purchaseHistory || []).length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No purchase history recorded</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                      {[...(historyItem.purchaseHistory || [])].reverse().map((row, idx) => (
                        <div
                          key={row._id || idx}
                          className="card"
                          style={{
                            background: 'var(--bg-tertiary)',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 1.5fr) repeat(3, minmax(92px, 1fr))',
                            gap: 'var(--space-md)',
                            alignItems: 'center',
                            padding: 'var(--space-md)',
                          }}
                        >
                          <div>
                            <div className="text-xs text-muted">Date</div>
                            <div className="font-medium">{formatDate(row.date)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted">Qty</div>
                            <div className="font-bold">{row.qty} {historyItem.unit}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted">Cost / Unit</div>
                            <div className="font-bold">₹{Number(row.costPerUnit || 0).toLocaleString('en-IN')}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted">Total</div>
                            <div className="font-bold">₹{Number(row.total || 0).toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="font-bold mb-md">Consumption History</h3>
                  {(historyItem.dailyConsumption || []).length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No consumption history recorded</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                      {[...(historyItem.dailyConsumption || [])].reverse().map((row, idx) => (
                        <div
                          key={row._id || idx}
                          className="card"
                          style={{
                            background: 'var(--bg-tertiary)',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(220px, 4fr) minmax(100px, 0.7fr) minmax(160px, 1fr)',
                            gap: 'var(--space-md)',
                            alignItems: 'center',
                            padding: 'var(--space-md)',
                          }}
                        >
                          <div>
                            <div className="text-xs text-muted">Date</div>
                            <div className="font-medium">
                              <HiOutlineClock style={{ display: 'inline', marginRight: 6 }} />
                              {formatDate(row.date)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted">Qty Used</div>
                            <div className="font-bold">{row.quantity} {historyItem.unit}</div>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
