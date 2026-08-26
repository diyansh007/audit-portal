'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhotoViewer({ photos, initialIndex, locationName, visitDate, onClose }) {
  const [current, setCurrent] = useState(initialIndex || 0);

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? photos.length - 1 : c - 1)), [photos.length]);
  const next = useCallback(() => setCurrent((c) => (c === photos.length - 1 ? 0 : c + 1)), [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const photo = photos[current];

  return (
    <div className="photo-viewer">
      {/* Top bar */}
      <div className="viewer-top">
        <div className="viewer-meta">
          {locationName && <span>{locationName}</span>}
          {locationName && visitDate && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
          {visitDate && <span>{new Date(visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="viewer-counter">{current + 1} / {photos.length}</span>
          <button className="viewer-close" onClick={onClose} aria-label="Close viewer">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="viewer-image-area">
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.originalName || photo.filename}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 4 }}
          draggable={false}
        />

        {/* Nav buttons */}
        {photos.length > 1 && (
          <>
            <button className="viewer-nav prev" onClick={prev} aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <button className="viewer-nav next" onClick={next} aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="viewer-bottom">
        <span className="viewer-filename">{photo.originalName || photo.filename}</span>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="viewer-thumbnails">
            {photos.map((p, i) => (
              <img
                key={p.id}
                src={p.thumbnailUrl || p.url}
                alt=""
                className={`viewer-thumb${i === current ? ' active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
