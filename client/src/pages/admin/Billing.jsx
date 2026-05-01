import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlineDownload, HiOutlinePrinter, HiOutlineSearch,
  HiOutlineCurrencyRupee, HiOutlineRefresh, HiOutlinePlus,
  HiOutlineTag, HiOutlineStar, HiOutlineUsers, HiOutlineX, HiOutlineCheckCircle,
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PaymentModal from '../../components/PaymentModal';

const STATUS_BADGE = { draft: 'warning', finalized: 'info', paid: 'success' };

export default function Billing() {
  const [bills, setBills]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const LIMIT = 20;

  // Generate bill modal state
  const [showGen, setShowGen]       = useState(false);
  const [genType, setGenType]       = useState('order');
  const [genId, setGenId]           = useState('');
  const [generating, setGenerating] = useState(false);

  // Bill detail / actions
  const [selected, setSelected]   = useState(null); // bill being worked on
  const [showPayment, setShowPay] = useState(false);

  // Coupon / loyalty / split
  const [couponCode, setCoupon]   = useState('');
  const [loyaltyPts, setLoyalty]  = useState('');
  const [splitCount, setSplit]    = useState('');
  const [discountAmt, setDisc]    = useState('');
  const [applying, setApplying]   = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const { data } = await api.get(`/billing?${params}`);
      setBills(data.bills || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = bills.filter(b =>
    b._id?.toLowerCase().includes(search.toLowerCase()) ||
    b.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Generate bill ──────────────────────────────────────────────── */
  const generateBill = async () => {
    if (!genId.trim()) return toast.error('Enter an Order or Booking ID');
    setGenerating(true);
    try {
      const body = genType === 'order' ? { orderId: genId.trim() } : { bookingId: genId.trim() };
      const { data } = await api.post('/billing/generate', body);
      toast.success('Bill generated!');
      setShowGen(false); setGenId('');
      setSelected(data.billing);
      fetch();
    } catch (err) { toast.error(err?.response?.data?.message || 'Generation failed'); }
    finally { setGenerating(false); }
  };

  /* ── Apply coupon ───────────────────────────────────────────────── */
  const applyCoupon = async () => {
    if (!couponCode || !selected) return;
    setApplying(true);
    try {
      const { data } = await api.post(`/billing/${selected._id}/coupon`, { code: couponCode });
      setSelected(data.billing); setCoupon(''); toast.success('Coupon applied!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Invalid coupon'); }
    finally { setApplying(false); }
  };

  /* ── Apply loyalty ──────────────────────────────────────────────── */
  const applyLoyalty = async () => {
    if (!loyaltyPts || !selected) return;
    setApplying(true);
    try {
      const { data } = await api.post(`/billing/${selected._id}/loyalty`, { points: Number(loyaltyPts) });
      setSelected(data.billing); setLoyalty(''); toast.success('Loyalty points redeemed!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setApplying(false); }
  };

  /* ── Apply discount ─────────────────────────────────────────────── */
  const applyDiscount = async () => {
    if (!discountAmt || !selected) return;
    setApplying(true);
    try {
      const { data } = await api.post(`/billing/${selected._id}/discount`, { discount: Number(discountAmt) });
      setSelected(data.billing); setDisc(''); toast.success('Discount applied!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setApplying(false); }
  };

  /* ── Apply split ────────────────────────────────────────────────── */
  const applySplit = async () => {
    if (!splitCount || !selected) return;
    setApplying(true);
    try {
      const { data } = await api.post(`/billing/${selected._id}/split`, { splitBetween: Number(splitCount) });
      setSelected(data.billing); setSplit(''); toast.success('Bill split updated!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setApplying(false); }
  };

  /* ── Download PDF ───────────────────────────────────────────────── */
  const downloadPdf = async (bill) => {
    try {
      const { data } = await api.get(`/billing/${bill._id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${bill._id}.pdf`; a.click();
    } catch { toast.error('PDF download failed'); }
  };

  /* ── Load bill detail ───────────────────────────────────────────── */
  const loadBill = async (id) => {
    try {
      const { data } = await api.get(`/billing/${id}`);
      setSelected(data.billing);
    } catch { toast.error('Failed to load bill'); }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Invoices &amp; Billing</h1>
          <p className="text-muted">Generate bills, apply coupons, process payments</p>
        </div>
        <div className="flex gap-md">
          <button className="btn btn-outline" onClick={fetch}><HiOutlineRefresh /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setShowGen(true)}><HiOutlinePlus /> Generate Bill</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-md mb-lg" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search by ID or customer…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="tabs">
          {['all', 'draft', 'finalized', 'paid'].map(s => (
            <button key={s} className={`tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatus(s); setPage(1); }} style={{ textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Split view: table + detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
        {/* Bills table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill ID</th><th>Customer</th><th>Type</th>
                  <th>Date</th><th>Amount</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No bills found</td></tr>
                )}
                {filtered.map(bill => (
                  <tr key={bill._id} style={{ cursor: 'pointer', background: selected?._id === bill._id ? 'var(--bg-tertiary)' : undefined }}
                    onClick={() => loadBill(bill._id)}>
                    <td className="font-bold text-xs" style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {bill._id?.slice(-8).toUpperCase()}
                    </td>
                    <td>{bill.customer?.name || '—'}</td>
                    <td><span className={`badge badge-${bill.type === 'room' ? 'primary' : 'info'}`} style={{ textTransform: 'capitalize' }}>{bill.type}</span></td>
                    <td className="text-sm">{new Date(bill.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="font-bold">₹{bill.total?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${STATUS_BADGE[bill.status] || 'info'}`} style={{ textTransform: 'capitalize' }}>{bill.status}</span></td>
                    <td>
                      <div className="flex gap-xs" onClick={e => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Download PDF" onClick={() => downloadPdf(bill)}>
                          <HiOutlineDownload />
                        </button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Print" onClick={() => window.print()}>
                          <HiOutlinePrinter />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-between" style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
              <span className="text-xs text-muted">{total} total</span>
              <div className="flex gap-sm">
                <button className="btn btn-sm btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <button className="btn btn-sm btn-outline" disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Summary card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <h3 className="font-bold">Bill Detail</h3>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelected(null)}><HiOutlineX /></button>
              </div>
              <div style={{ fontSize: '0.875rem', display: 'grid', gap: 8 }}>
                {(selected.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-semibold">₹{item.total?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4, display: 'grid', gap: 6 }}>
                  <div className="flex items-center justify-between text-muted"><span>Subtotal</span><span>₹{selected.subtotal?.toLocaleString('en-IN')}</span></div>
                  <div className="flex items-center justify-between text-muted"><span>GST ({selected.gstRate}%)</span><span>₹{selected.gstAmount?.toLocaleString('en-IN')}</span></div>
                  {selected.discount > 0 && <div className="flex items-center justify-between" style={{ color: 'var(--success)' }}><span>Discount</span><span>-₹{selected.discount?.toLocaleString('en-IN')}</span></div>}
                  {selected.loyaltyPointsUsed > 0 && <div className="flex items-center justify-between" style={{ color: 'var(--accent)' }}><span>Loyalty</span><span>-{selected.loyaltyPointsUsed} pts</span></div>}
                  <div className="flex items-center justify-between font-bold" style={{ fontSize: '1rem', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                    <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{selected.total?.toLocaleString('en-IN')}</span>
                  </div>
                  {selected.splitBetween > 1 && <div className="text-xs text-muted text-right">₹{selected.amountPerPerson?.toLocaleString()} / person ({selected.splitBetween} split)</div>}
                </div>
              </div>
              {selected.status !== 'paid' && (
                <button className="btn btn-primary w-full" style={{ marginTop: 'var(--space-lg)' }}
                  onClick={() => setShowPay(true)}>
                  <HiOutlineCurrencyRupee /> Collect Payment
                </button>
              )}
              {selected.status === 'paid' && (
                <div className="badge badge-success" style={{ marginTop: 'var(--space-md)', width: '100%', justifyContent: 'center', padding: 'var(--space-sm)' }}>
                  <HiOutlineCheckCircle /> Paid on {new Date(selected.paidAt).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>

            {/* Actions panel — only for unpaid bills */}
            {selected.status !== 'paid' && (
              <div className="card">
                <h4 className="font-bold" style={{ marginBottom: 'var(--space-md)' }}>Adjustments</h4>
                {/* Coupon */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="text-xs text-muted font-bold uppercase" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <HiOutlineTag /> Coupon Code
                  </label>
                  <div className="flex gap-sm">
                    <input className="input" placeholder="e.g. SUMMER20" value={couponCode}
                      onChange={e => setCoupon(e.target.value.toUpperCase())} style={{ flex: 1 }} />
                    <button className="btn btn-outline btn-sm" onClick={applyCoupon} disabled={applying || !couponCode}>Apply</button>
                  </div>
                </div>
                {/* Loyalty */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="text-xs text-muted font-bold uppercase" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <HiOutlineStar /> Loyalty Points
                  </label>
                  <div className="flex gap-sm">
                    <input className="input" type="number" placeholder="Points to redeem" value={loyaltyPts}
                      onChange={e => setLoyalty(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-outline btn-sm" onClick={applyLoyalty} disabled={applying || !loyaltyPts}>Redeem</button>
                  </div>
                </div>
                {/* Discount */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="text-xs text-muted font-bold uppercase" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <HiOutlineCurrencyRupee /> Manual Discount (₹)
                  </label>
                  <div className="flex gap-sm">
                    <input className="input" type="number" placeholder="Amount" value={discountAmt}
                      onChange={e => setDisc(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-outline btn-sm" onClick={applyDiscount} disabled={applying || !discountAmt}>Apply</button>
                  </div>
                </div>
                {/* Split */}
                <div>
                  <label className="text-xs text-muted font-bold uppercase" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <HiOutlineUsers /> Split Bill
                  </label>
                  <div className="flex gap-sm">
                    <input className="input" type="number" min={1} placeholder="No. of persons" value={splitCount}
                      onChange={e => setSplit(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-outline btn-sm" onClick={applySplit} disabled={applying || !splitCount}>Split</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Bill Modal */}
      {showGen && (
        <div className="modal-overlay" onClick={() => setShowGen(false)}>
          <div className="modal card animate-fade" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <h2 className="font-bold" style={{ marginBottom: 'var(--space-lg)' }}>Generate New Bill</h2>
            <div className="tabs" style={{ marginBottom: 'var(--space-md)' }}>
              <button className={`tab ${genType === 'order' ? 'active' : ''}`} onClick={() => setGenType('order')}>Restaurant Order</button>
              <button className={`tab ${genType === 'booking' ? 'active' : ''}`} onClick={() => setGenType('booking')}>Room Booking</button>
            </div>
            <div className="input-group mb-lg">
              <label>{genType === 'order' ? 'Order Code / ID' : 'Booking Code / ID'}</label>
              <input className="input" placeholder={genType === 'order' ? 'Paste ORD-XXXXXX or ObjectId' : 'Paste BKG-XXXXXX or ObjectId'} value={genId} onChange={e => setGenId(e.target.value)} />
            </div>
            <div className="flex gap-md">
              <button className="btn btn-outline flex-1" onClick={() => setShowGen(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={generateBill} disabled={generating}>{generating ? 'Generating…' : 'Generate Bill'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && selected && (
        <PaymentModal
          billing={selected}
          onSuccess={(updatedBilling) => { setSelected(updatedBilling); fetch(); }}
          onClose={() => setShowPay(false)}
        />
      )}
    </div>
  );
}
