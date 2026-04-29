import { useState, useRef } from 'react';
import { HiOutlinePhotograph, HiOutlineUpload, HiOutlineX } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * ImageUpload — Cloudinary signed upload component.
 * Gets signature from server, then uploads directly to Cloudinary.
 * Props:
 *   folder: string (e.g. "hotel_photos", "room_images", "menu_items", "staff_avatars")
 *   onUpload: (secureUrl) => void
 *   currentUrl: string (existing image URL)
 *   label: string
 */
export default function ImageUpload({ folder = 'uploads', onUpload, currentUrl, label = 'Upload Image' }) {
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      // 1. Get signed params from server
      const { data: sigData } = await api.get(`/hotel/cloudinary-sign?folder=${folder}`);

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const result = await uploadRes.json();

      if (result.secure_url) {
        setPreview(result.secure_url);
        onUpload?.(result.secure_url);
        toast.success('Image uploaded!');
      } else {
        throw new Error('Upload failed');
      }
    } catch {
      toast.error('Image upload failed');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: preview ? 0 : 'var(--space-xl)',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.2s',
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
            {!uploading && (
              <button
                className="btn btn-ghost btn-icon"
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff' }}
                onClick={e => { e.stopPropagation(); setPreview(null); onUpload?.(null); }}
              >
                <HiOutlineX />
              </button>
            )}
          </>
        ) : (
          <div>
            {uploading ? (
              <div className="spinner" style={{ margin: '0 auto var(--space-sm)' }} />
            ) : (
              <HiOutlinePhotograph style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }} />
            )}
            <div className="text-sm font-medium">{uploading ? 'Uploading...' : label}</div>
            <div className="text-xs text-muted">Drag & drop or click to browse</div>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  );
}
