'use client';
import { useRouter } from 'next/navigation';
import { X, MapPin, Camera, ArrowRight } from 'lucide-react';

export default function LocationPanel({ location, onClose }) {
  const router = useRouter();

  if (!location) return null;

  return (
    <div className="location-panel">
      {/* Close button */}
      <button className="panel-close-btn" onClick={onClose} aria-label="Close">
        <X size={14} />
      </button>

      {/* Hero photo */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#e8e8e8' }}>
        {location.coverPhotoUrl ? (
          <img
            src={location.coverPhotoUrl}
            alt={location.name}
            className="location-panel-photo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #e8e6e0, #d4d0c8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MapPin size={32} color="#aaa" />
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)'
        }} />
      </div>

      {/* Body */}
      <div className="location-panel-body">
        <div className="location-panel-state">
          <MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />
          {location.state}, {location.country}
        </div>

        <div className="location-panel-name">{location.name}</div>

        <div className="location-panel-stats">
          <div className="location-panel-stat">
            <span className="stat-value">{location.totalVisits}</span>
            <span className="stat-label">Visits</span>
          </div>
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
          <div className="location-panel-stat">
            <span className="stat-value">{location.totalPhotos}</span>
            <span className="stat-label">Photos</span>
          </div>
        </div>

        <button
          className="location-panel-btn"
          onClick={() => router.push(`/location/${location.slug}`)}
        >
          View audit history
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
