import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineSearch,
} from 'react-icons/hi';
import api from '../../services/api';

export default function InventoryUsage() {
  const [items, setItems] = useState([]);
  const [usage, setUsage] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inventory');
      setItems(data.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load inventory');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.name, item.category, item.unit].filter(Boolean).some((value) => value.toLowerCase().includes(term))
    );
  }, [items, search]);

  const usageRows = useMemo(() => (
    Object.entries(usage)
      .map(([itemId, value]) => ({ itemId, quantity: Number(value) }))
      .filter((row) => Number.isFinite(row.quantity) && row.quantity > 0)
  ), [usage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usageRows.length === 0) return toast.error('Enter at least one used quantity');

    setSaving(true);
    try {
      const { data } = await api.post('/inventory/consume-today', { usages: usageRows });
      setUsage({});
      const alertCount = data.alertsSentTo?.length || 0;
      toast.success(alertCount > 0 ? `Usage saved. Low-stock email sent to ${alertCount} recipient${alertCount === 1 ? '' : 's'}.` : 'Usage saved');
      fetchInventory();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save usage');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade chef-inventory-page">
      <div className="page-header">
        <div>
          <h1>Today&apos;s Inventory Usage</h1>
          <p className="text-muted">Enter ingredients used by the kitchen. Stock updates immediately.</p>
        </div>
        <button className="btn btn-outline" type="button" onClick={fetchInventory} disabled={loading}>
          <HiOutlineRefresh /> Refresh
        </button>
      </div>

      <div className="card chef-inventory-summary">
        <div>
          <span className="text-xs text-muted">Items selected</span>
          <strong>{usageRows.length}</strong>
        </div>
        <div>
          <span className="text-xs text-muted">Low stock now</span>
          <strong>{items.filter((item) => item.currentStock <= item.lowStockThreshold).length}</strong>
        </div>
        <div>
          <span className="text-xs text-muted">Action</span>
          <strong>Deduct used stock</strong>
        </div>
      </div>

      <div className="flex items-center gap-md mb-lg">
        <div style={{ position: 'relative', flex: 1 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Search ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="chef-inventory-list">
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading inventory...</div>
          ) : filteredItems.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No inventory items found</div>
          ) : filteredItems.map((item) => {
            const isLow = item.currentStock <= item.lowStockThreshold;
            const entered = Number(usage[item._id] || 0);
            const projected = Math.max(0, item.currentStock - (Number.isFinite(entered) ? entered : 0));
            const willBeLow = projected <= item.lowStockThreshold;

            return (
              <article key={item._id} className="card chef-inventory-row" style={{ borderColor: willBeLow ? 'var(--danger-light)' : 'var(--border)' }}>
                <div>
                  <div className="flex items-center gap-sm" style={{ marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 className="font-bold" style={{ margin: 0 }}>{item.name}</h3>
                    {item.category && <span className="badge badge-info">{item.category}</span>}
                    {isLow && <span className="badge badge-danger"><HiOutlineExclamationCircle /> Low</span>}
                  </div>
                  <p className="text-sm text-muted" style={{ margin: 0 }}>
                    Current: <strong style={{ color: 'var(--text-primary)' }}>{item.currentStock} {item.unit}</strong>
                    {' '}· Threshold: {item.lowStockThreshold} {item.unit}
                  </p>
                </div>

                <div className="chef-inventory-usage">
                  <label className="text-xs text-muted" htmlFor={`usage-${item._id}`}>Used today</label>
                  <div className="flex items-center gap-sm">
                    <input
                      id={`usage-${item._id}`}
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={usage[item._id] || ''}
                      onChange={(e) => setUsage((prev) => ({ ...prev, [item._id]: e.target.value }))}
                    />
                    <span className="text-sm text-muted">{item.unit}</span>
                  </div>
                  <span className={`text-xs ${willBeLow ? 'text-danger' : 'text-muted'}`}>
                    After save: {projected} {item.unit}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="chef-inventory-actions">
          <button className="btn btn-outline" type="button" onClick={() => setUsage({})} disabled={saving || usageRows.length === 0}>
            Clear
          </button>
          <button className="btn btn-primary" type="submit" disabled={saving || usageRows.length === 0}>
            {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><HiOutlineCheckCircle /> Save Today&apos;s Usage</>}
          </button>
        </div>
      </form>

      <style>{`
        .chef-inventory-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        .chef-inventory-summary > div {
          display: grid;
          gap: 0.25rem;
        }
        .chef-inventory-summary strong {
          font-size: 1.15rem;
        }
        .chef-inventory-list {
          display: grid;
          gap: var(--space-md);
          padding-bottom: 5rem;
        }
        .chef-inventory-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
          gap: var(--space-lg);
          align-items: center;
        }
        .chef-inventory-usage {
          display: grid;
          gap: 0.35rem;
        }
        .chef-inventory-actions {
          position: sticky;
          bottom: 0;
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          padding: var(--space-md) 0;
          background: linear-gradient(180deg, transparent, var(--bg-primary) 28%);
        }
        @media (max-width: 720px) {
          .chef-inventory-summary,
          .chef-inventory-row {
            grid-template-columns: 1fr;
          }
          .chef-inventory-actions {
            flex-direction: column;
          }
          .chef-inventory-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
