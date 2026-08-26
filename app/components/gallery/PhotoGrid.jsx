'use client';
import { useState } from 'react';
import PhotoViewer from './PhotoViewer';

export default function PhotoGrid({ photos, locationName, visitDate }) {
  const [viewerIndex, setViewerIndex] = useState(null);

  return (
    <>
      {photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <div className="empty-title">No photos yet</div>
          <div className="empty-sub">Photos uploaded to this visit will appear here.</div>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="photo-card"
              onClick={() => setViewerIndex(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setViewerIndex(i)}
              aria-label={`Open photo ${i + 1}`}
            >
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.originalName || `Photo ${i + 1}`}
                loading="lazy"
                style={{ width: '100%', display: 'block' }}
              />
              <div className="photo-card-overlay">
                <span className="photo-card-num">#{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewerIndex !== null && (
        <PhotoViewer
          photos={photos}
          initialIndex={viewerIndex}
          locationName={locationName}
          visitDate={visitDate}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
