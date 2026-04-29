import { useState } from 'react';
import { HiOutlineCurrencyRupee, HiOutlineX, HiOutlineCreditCard, HiOutlineCash } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * PaymentModal
 * Props:
 *   billing     – Billing document (must have _id and total)
 *   onSuccess   – callback(updatedBilling) called after payment
 *   onClose     – callback to close the modal
 */
export default function PaymentModal({ billing, onSuccess, onClose }) {
  const [mode, setMode]           = useState('online'); // 'online' | 'cash'
  const [paying, setPaying]       = useState(false);

  if (!billing) return null;

  /* ── Cash payment ────────────────────────────────────────────────── */
  const handleCash = async () => {
    setPaying(true);
    try {
      const { data } = await api.post('/payments/cash', { billingId: billing._id });
      toast.success('Cash payment recorded!');
      onSuccess?.(data.billing);
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cash payment failed');
    } finally { setPaying(false); }
  };

  /* ── Online payment (Razorpay) ───────────────────────────────────── */
  const handleOnline = async () => {
    setPaying(true);
    try {
      // 1. Create Razorpay order on server
      const { data: order } = await api.post('/payments/create-order', { billingId: billing._id });

      // 2. Ensure Razorpay script is loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.head.appendChild(script);
        });
      }

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key:               order.key,
        amount:            order.amount,
        currency:          order.currency,
        order_id:          order.razorpay_order_id,
        name:              'HospitalityOS',
        description:       `Invoice #${billing._id}`,
        theme:             { color: '#6c63ff' },
        handler: async (response) => {
          try {
            // 4. Verify signature on server
            const { data: verified } = await api.post('/payments/verify', {
              razorpay_payment_id:  response.razorpay_payment_id,
              razorpay_order_id:    response.razorpay_order_id,
              razorpay_signature:   response.razorpay_signature,
            });
            toast.success('Payment successful! 🎉');
            onSuccess?.(verified.billing);
            onClose?.();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast('Payment cancelled', { icon: '⚠️' });
          },
        },
      });

      rzp.open();
    } catch (err) {
      setPaying(false);
      toast.error(err?.response?.data?.message || err.message || 'Payment init failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal card animate-fade"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 440, width: '100%' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineCurrencyRupee style={{ color: 'var(--primary)' }} />
            Collect Payment
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {/* Bill summary */}
        <div className="card" style={{ background: 'var(--bg-tertiary)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', fontSize: '0.875rem' }}>
            <span className="text-muted">Subtotal</span>
            <span style={{ textAlign: 'right' }}>₹{billing.subtotal?.toLocaleString('en-IN')}</span>
            <span className="text-muted">GST ({billing.gstRate}%)</span>
            <span style={{ textAlign: 'right' }}>₹{billing.gstAmount?.toLocaleString('en-IN')}</span>
            {billing.discount > 0 && <>
              <span className="text-muted">Discount</span>
              <span style={{ textAlign: 'right', color: 'var(--success)' }}>-₹{billing.discount?.toLocaleString('en-IN')}</span>
            </>}
            {billing.loyaltyPointsUsed > 0 && <>
              <span className="text-muted">Loyalty Redeemed</span>
              <span style={{ textAlign: 'right', color: 'var(--accent)' }}>-{billing.loyaltyPointsUsed} pts</span>
            </>}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-bold">Total Payable</span>
            <span className="font-bold text-xl" style={{ color: 'var(--primary)' }}>
              ₹{billing.total?.toLocaleString('en-IN')}
            </span>
          </div>
          {billing.splitBetween > 1 && (
            <div className="text-xs text-muted" style={{ marginTop: 4, textAlign: 'right' }}>
              ₹{billing.amountPerPerson?.toLocaleString('en-IN')} per person ({billing.splitBetween} split)
            </div>
          )}
        </div>

        {/* Payment mode selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <button
            className={`btn ${mode === 'online' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setMode('online')}
            style={{ flexDirection: 'column', gap: 4, padding: 'var(--space-lg)' }}
          >
            <HiOutlineCreditCard style={{ fontSize: '1.5rem' }} />
            Online / UPI
          </button>
          <button
            className={`btn ${mode === 'cash' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setMode('cash')}
            style={{ flexDirection: 'column', gap: 4, padding: 'var(--space-lg)' }}
          >
            <HiOutlineCash style={{ fontSize: '1.5rem' }} />
            Cash
          </button>
        </div>

        {mode === 'online' && (
          <p className="text-xs text-muted" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>
            Opens Razorpay secure checkout. Supports UPI, Cards, Net Banking & Wallets.
          </p>
        )}
        {mode === 'cash' && (
          <p className="text-xs text-muted" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>
            Record cash payment received from customer. No online transaction required.
          </p>
        )}

        <button
          className="btn btn-primary w-full"
          style={{ fontSize: '1rem', padding: 'var(--space-md)' }}
          onClick={mode === 'cash' ? handleCash : handleOnline}
          disabled={paying}
        >
          {paying ? 'Processing…' : mode === 'cash' ? '✓ Record Cash Payment' : '⚡ Pay ₹' + billing.total?.toLocaleString('en-IN')}
        </button>
      </div>
    </div>
  );
}
