import { HiOutlineQrcode, HiOutlineDownload, HiOutlineRefresh } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function QRDisplay({ table, onRegenerate }) {
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await api.post(`/tables/${table._id}/qr`);
      toast.success('QR code regenerated');
      onRegenerate?.();
    } catch {
      toast.error('Failed to regenerate QR');
    } finally {
      setLoading(false);
    }
  };

  if (!table?.qrCode) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
        <HiOutlineQrcode style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }} />
        <p>No QR code generated yet</p>
        <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }} onClick={handleRegenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate QR'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-md)', boxShadow: 'var(--shadow-md)' }}>
        <img src={table.qrCode} alt={`QR for ${table.tableNumber}`} style={{ width: 200, height: 200, display: 'block' }} />
      </div>
      <div className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>
        Table {table.tableNumber} · Scan to order
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
        <a href={table.qrCode} download={`table-${table.tableNumber}-qr.png`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
          <HiOutlineDownload /> Download
        </a>
        <button className="btn btn-ghost btn-sm" onClick={handleRegenerate} disabled={loading}>
          <HiOutlineRefresh /> Regenerate
        </button>
      </div>
    </div>
  );
}
