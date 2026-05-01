import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineCamera,
  HiOutlineClipboardCopy,
  HiOutlineQrcode,
  HiOutlineSparkles,
  HiOutlineTable,
  HiOutlineX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getCustomerText } from '../../i18n/customerText';

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
  const { user, preferredLang } = useAuthStore();
  const t = getCustomerText(user?.preferredLang || preferredLang);
  const [qrValue, setQrValue] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanFrameRef = useRef(null);

  const stopScanner = () => {
    if (scanFrameRef.current) cancelAnimationFrame(scanFrameRef.current);
    scanFrameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  };

  useEffect(() => () => stopScanner(), []);

  const openTableValue = (value) => {
    const tableId = extractTableId(value);
    if (!tableId) {
      toast.error(t('pasteQrError'));
      return;
    }
    navigate(`/scan/table/${tableId}`);
  };

  const handleOpen = () => {
    openTableValue(qrValue);
  };

  const startScanner = async () => {
    if (!('BarcodeDetector' in window)) {
      toast.error(t('cameraScannerUnsupported'));
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;
      setScanning(true);

      requestAnimationFrame(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        const scan = async () => {
          if (!videoRef.current || !streamRef.current) return;

          if (videoRef.current.readyState >= 2) {
            try {
              const codes = await detector.detect(videoRef.current);
              const value = codes?.[0]?.rawValue;
              if (value) {
                setQrValue(value);
                stopScanner();
                openTableValue(value);
                return;
              }
            } catch {
              // Keep scanning; some frames fail while the camera is settling.
            }
          }

          scanFrameRef.current = requestAnimationFrame(scan);
        };

        scan();
      });
    } catch {
      stopScanner();
      toast.error(t('cameraPermissionBlocked'));
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQrValue(text);
      toast.success(t('qrPasted'));
    } catch {
      toast.error(t('clipboardBlocked'));
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
              {t('scanEyebrow')}
            </p>
            <h1 className="font-bold" style={{ fontSize: 'clamp(1.45rem, 3vw, 2.3rem)', lineHeight: 1.12, marginBottom: 12 }}>
              {t('scanHeading')}
            </h1>
            <p style={{ color: '#b7c1bb', maxWidth: 560 }}>
              {t('scanIntro')}
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
                <h2 className="font-bold" style={{ color: '#f4f5ef', margin: 0, fontSize: '1.1rem' }}>{t('enterQrDetails')}</h2>
                <p style={{ color: '#8a9690', fontSize: '0.86rem', margin: '2px 0 0' }}>{t('pasteQrHint')}</p>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ color: '#c5cdc8' }}>{t('qrLinkOrTableId')}</label>
              <div className="customer-scan-input-row">
                <input
                  className="input"
                  placeholder={t('qrPlaceholder')}
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
                {t('cancel')}
              </button>
              <button className="btn btn-outline" type="button" onClick={startScanner} style={softButton}>
                <HiOutlineCamera /> {t('scanWithCamera')}
              </button>
              <button className="btn btn-primary" type="button" onClick={handleOpen} style={goldButton}>
                {t('openTableMenu')} <HiOutlineArrowRight />
              </button>
            </div>

            {scanning && (
              <div className="customer-camera-panel">
                <div className="customer-camera-head">
                  <span>{t('scanningQr')}</span>
                  <button type="button" className="btn btn-outline btn-icon" onClick={stopScanner} style={softButton} title={t('stopScanning')}>
                    <HiOutlineX />
                  </button>
                </div>
                <div className="customer-camera-view">
                  <video ref={videoRef} playsInline muted />
                  <div className="customer-camera-frame" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>

          <aside className="customer-scan-card customer-scan-guide">
            <div className="customer-scan-guide-row">
              <span><HiOutlineQrcode /></span>
              <div>
                <strong>{t('scanTheQr')}</strong>
                <p>{t('scanTheQrHint')}</p>
              </div>
            </div>
            <div className="customer-scan-guide-row">
              <span><HiOutlineTable /></span>
              <div>
                <strong>{t('confirmTable')}</strong>
                <p>{t('confirmTableHint')}</p>
              </div>
            </div>
            <div className="customer-scan-guide-row">
              <span><HiOutlineSparkles /></span>
              <div>
                <strong>{t('orderFresh')}</strong>
                <p>{t('orderFreshHint')}</p>
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
        .customer-camera-panel {
          margin-top: var(--space-lg);
          border: 1px solid rgba(210,196,149,0.24);
          border-radius: var(--radius-xl);
          background: rgba(0,0,0,0.22);
          overflow: hidden;
        }
        .customer-camera-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
          padding: var(--space-sm) var(--space-md);
          color: #dfcf9f;
          font-weight: 700;
        }
        .customer-camera-view {
          position: relative;
          aspect-ratio: 16 / 9;
          background: #020607;
        }
        .customer-camera-view video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .customer-camera-frame {
          position: absolute;
          inset: 18%;
          border: 2px solid rgba(216,198,155,0.9);
          border-radius: var(--radius-lg);
          box-shadow: 0 0 0 999px rgba(0,0,0,0.28);
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
