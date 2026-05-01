import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineCamera,
  HiOutlineClipboardCopy,
  HiOutlineQrcode,
  HiOutlineSparkles,
  HiOutlineTable,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const goldButton = {
  border: '1px solid #d2c495',
  background: 'linear-gradient(90deg, #b5a776, #958657)',
  color: '#fdfbf5',
  borderRadius: 999,
  padding: '0.66rem 1.25rem',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const softButton = {
  border: '1px solid rgba(210,196,149,0.35)',
  background: 'rgba(181,167,118,0.08)',
  color: '#dfcf9f',
  borderRadius: 999,
};

const extractTableId = (value) => {
  const input = String(value || '').trim();
  if (!input) return '';

  const match = input.match(/\/scan\/table\/([^/?#]+)/i);
  if (match?.[1]) return match[1];

  return input;
};

export default function ScanQr() {
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState('');

  const handleOpen = () => {
    const tableId = extractTableId(qrValue);
    if (!tableId) {
      toast.error('Paste QR link or table ID');
      return;
    }
    navigate(`/scan/table/${tableId}`);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQrValue(text);
      toast.success('QR link pasted');
    } catch {
      toast.error('Clipboard permission is blocked');
    }
  };

  return (
    <div
      className="animate-fade customer-scan-page"
      style={{
        margin: 'calc(-1 * var(--space-xl)) calc(-1 * var(--space-xl)) 0',
        padding: 'var(--space-xl)',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(180deg, #091013 0%, #060f12 100%)',
        color: '#f4f5ef',
      }}
    >
      <div className="customer-scan-shell">
        <section className="customer-scan-hero">
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>
              SCAN TABLE QR
            </p>
            <h1 className="font-bold" style={{ fontSize: 'clamp(1.45rem, 3vw, 2.3rem)', lineHeight: 1.12, marginBottom: 12 }}>
              Open your table menu in seconds
            </h1>
            <p style={{ color: '#b7c1bb', maxWidth: 560 }}>
              Use the QR link from your table to browse the menu, add items, and send your order straight to the kitchen.
            </p>
          </div>
          <div className="customer-scan-visual" aria-hidden="true">
            <div className="customer-qr-mark">
              <span />
              <span />
              <span />
              <span />
              <HiOutlineQrcode />
            </div>
          </div>
        </section>

        <div className="customer-scan-grid">
          <div className="customer-scan-card">
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-md)' }}>
              <span className="customer-scan-icon"><HiOutlineCamera /></span>
              <div>
                <h2 className="font-bold" style={{ color: '#f4f5ef', margin: 0, fontSize: '1.1rem' }}>Enter QR details</h2>
                <p style={{ color: '#8a9690', fontSize: '0.86rem', margin: '2px 0 0' }}>Paste the scanned link or the table ID.</p>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ color: '#c5cdc8' }}>QR Link or Table ID</label>
              <div className="customer-scan-input-row">
                <input
                  className="input"
                  placeholder="https://.../scan/table/<tableId> or <tableId>"
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleOpen();
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: '#f4f5ef',
                  }}
                />
                <button type="button" className="btn btn-outline btn-icon" onClick={pasteFromClipboard} style={softButton} title="Paste from clipboard">
                  <HiOutlineClipboardCopy />
                </button>
              </div>
            </div>

            <div className="customer-scan-actions">
              <button className="btn btn-outline" type="button" onClick={() => navigate('/customer')} style={softButton}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={handleOpen} style={goldButton}>
                Open Table Menu <HiOutlineArrowRight />
              </button>
            </div>
          </div>

          <aside className="customer-scan-card customer-scan-guide">
            <div className="customer-scan-guide-row">
              <span><HiOutlineQrcode /></span>
              <div>
                <strong>Scan the QR</strong>
                <p>Use your camera app or QR scanner at the table.</p>
              </div>
            </div>
            <div className="customer-scan-guide-row">
              <span><HiOutlineTable /></span>
              <div>
                <strong>Confirm table</strong>
                <p>The menu opens for the table linked to that code.</p>
              </div>
            </div>
            <div className="customer-scan-guide-row">
              <span><HiOutlineSparkles /></span>
              <div>
                <strong>Order fresh</strong>
                <p>Add items and place the order after signing in.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .customer-scan-shell {
          max-width: 1080px;
          margin: 0 auto;
        }
        .customer-scan-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-xl);
          padding: 1.75rem;
          margin-bottom: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          background:
            linear-gradient(110deg, rgba(8,12,14,0.94), rgba(8,12,14,0.76)),
            url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80') center/cover;
          box-shadow: 0 18px 38px rgba(0,0,0,0.35);
          overflow: hidden;
        }
        .customer-scan-visual {
          width: 190px;
          height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 24px;
          border: 1px solid rgba(210,196,149,0.28);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(10px);
        }
        .customer-qr-mark {
          position: relative;
          width: 126px;
          height: 126px;
          display: grid;
          place-items: center;
          color: #dfcf9f;
        }
        .customer-qr-mark svg {
          font-size: 3.8rem;
        }
        .customer-qr-mark span {
          position: absolute;
          width: 34px;
          height: 34px;
          border-color: #d8c69b;
          opacity: 0.9;
        }
        .customer-qr-mark span:nth-child(1) {
          top: 0;
          left: 0;
          border-top: 3px solid;
          border-left: 3px solid;
        }
        .customer-qr-mark span:nth-child(2) {
          top: 0;
          right: 0;
          border-top: 3px solid;
          border-right: 3px solid;
        }
        .customer-qr-mark span:nth-child(3) {
          bottom: 0;
          left: 0;
          border-bottom: 3px solid;
          border-left: 3px solid;
        }
        .customer-qr-mark span:nth-child(4) {
          bottom: 0;
          right: 0;
          border-bottom: 3px solid;
          border-right: 3px solid;
        }
        .customer-scan-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: var(--space-lg);
        }
        .customer-scan-card {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-xl);
          background: rgba(255,255,255,0.03);
          padding: var(--space-lg);
          box-shadow: 0 14px 26px rgba(0,0,0,0.25);
        }
        .customer-scan-icon,
        .customer-scan-guide-row span {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          color: #dfcf9f;
          background: rgba(181,167,118,0.12);
          flex-shrink: 0;
        }
        .customer-scan-icon svg,
        .customer-scan-guide-row svg {
          font-size: 1.25rem;
        }
        .customer-scan-input-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: var(--space-sm);
          align-items: center;
        }
        .customer-scan-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }
        .customer-scan-guide {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .customer-scan-guide-row {
          display: flex;
          gap: var(--space-md);
          align-items: flex-start;
          padding-bottom: var(--space-md);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .customer-scan-guide-row:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }
        .customer-scan-guide-row strong {
          display: block;
          color: #f4f5ef;
          margin-bottom: 3px;
        }
        .customer-scan-guide-row p {
          margin: 0;
          color: #8a9690;
          font-size: 0.86rem;
          line-height: 1.5;
        }
        @media (max-width: 900px) {
          .customer-scan-grid {
            grid-template-columns: 1fr;
          }
          .customer-scan-hero {
            align-items: flex-start;
          }
          .customer-scan-visual {
            width: 150px;
            height: 150px;
          }
        }
        @media (max-width: 768px) {
          .customer-scan-page {
            margin: calc(-1 * var(--space-md)) calc(-1 * var(--space-md)) 0 !important;
            padding: var(--space-md) !important;
          }
          .customer-scan-hero {
            flex-direction: column;
            padding: var(--space-lg);
          }
          .customer-scan-visual {
            width: 100%;
            height: 150px;
          }
          .customer-scan-input-row,
          .customer-scan-actions {
            grid-template-columns: 1fr;
          }
          .customer-scan-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
