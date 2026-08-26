'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, Check, AlertCircle, Image } from 'lucide-react';

export default function UploadModal({ onClose, onSuccess }) {
  const router = useRouter();
  const [form, setForm] = useState({
    locationName: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    notes: '',
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null); // { success, visitId, locationSlug, count }
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, { url: e.target.result, name: f.name }]);
      reader.readAsDataURL(f);
    });
  }, []);

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.locationName || !form.date) { setError('Location and date are required.'); return; }
    setError('');
    setUploading(true);
    setProgress(10);

    try {
      // Step 1: Create visit
      const visitRes = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: form.locationName,
          date: form.date,
          title: form.title || undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!visitRes.ok) throw new Error(await visitRes.text());
      const { visit, locationSlug } = await visitRes.json();
      setProgress(30);

      // Step 2: Upload photos (if any)
      let photoCount = 0;
      if (files.length > 0) {
        const formData = new FormData();
        formData.append('visitId', visit.id);
        formData.append('locationId', visit.locationId);
        files.forEach((f) => formData.append('photos', f));

        const photoRes = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        });

        if (!photoRes.ok) throw new Error(await photoRes.text());
        const data = await photoRes.json();
        photoCount = data.count;
      }

      setProgress(100);
      setResult({ success: true, visitId: visit.id, locationSlug, count: photoCount });
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Success screen
  if (result?.success) {
    return (
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="success-card">
            <div className="success-icon">
              <Check size={24} />
            </div>
            <div className="success-title">Audit Created</div>
            <div className="success-sub">
              {result.count > 0
                ? `${result.count} photo${result.count !== 1 ? 's' : ''} uploaded to ${form.locationName}`
                : `Visit recorded for ${form.locationName}`}
            </div>
            <div className="success-actions">
              <button className="btn-secondary" onClick={onClose}>Back to Map</button>
              <button
                className="btn-primary"
                onClick={() => {
                  onClose();
                  router.push(`/location/${result.locationSlug}/visit/${result.visitId}`);
                }}
              >
                View Visit →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Add Audit Images</div>
            <div className="modal-subtitle">Record a new field visit with photographs</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Date */}
          <div className="form-field">
            <label className="form-label">Date *</label>
            <input
              type="date"
              className="form-input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          {/* Location */}
          <div className="form-field">
            <label className="form-label">Location *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Wardha, Hinganghat, Beltarodi…"
              value={form.locationName}
              onChange={(e) => setForm({ ...form, locationName: e.target.value })}
              required
            />
          </div>

          {/* Title */}
          <div className="form-field">
            <label className="form-label">Title <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Wardha District Hospital Inspection"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="form-field">
            <label className="form-label">Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <textarea
              className="form-input"
              placeholder="Brief description of the visit…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>

          {/* Drop zone */}
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label">Photos</label>
            <div
              className={`drop-zone${dragOver ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="drop-zone-icon">
                <Image size={28} color="var(--text-muted)" />
              </div>
              <div className="drop-zone-text">Drag photos here or click to select</div>
              <div className="drop-zone-sub">JPEG, PNG, HEIC — multiple files supported</div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="preview-grid">
                {previews.map((p, i) => (
                  <div key={i} className="preview-item">
                    <img src={p.url} alt={p.name} />
                    <button
                      type="button"
                      className="preview-remove"
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    >
                      <X size={8} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#c0392b', fontSize: 12, marginTop: 12 }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="upload-progress" style={{ marginTop: 16 }}>
              <div className="progress-bar-wrapper">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-label">
                {progress < 30 ? 'Creating visit…' : progress < 90 ? 'Uploading photos…' : 'Almost done…'}
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={uploading}>
            {uploading ? 'Submitting…' : `Submit Audit${files.length > 0 ? ` (${files.length} photo${files.length !== 1 ? 's' : ''})` : ''}`}
          </button>
        </form>
      </div>
    </div>
  );
}
