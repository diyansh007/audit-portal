'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Camera, Calendar, Plus } from 'lucide-react';
import { useState } from 'react';
import UploadModal from '@/components/upload/UploadModal';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).toUpperCase();
}

export default function LocationPageClient({ location, visits }) {
  const [showUpload, setShowUpload] = useState(false);
  const router = useRouter();

  return (
    <div className="location-page">
      {/* Hero header */}
      <div className="location-page-header">
        {location.coverPhotoUrl ? (
          <img src={location.coverPhotoUrl} alt={location.name} className="location-page-hero" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2A2520, #4A4035)' }} />
        )}
        <div className="location-page-hero-overlay" />

        {/* Back button */}
        <Link href="/" className="back-btn">
          <ArrowLeft size={14} />
          Map
        </Link>

        {/* Hero content */}
        <div className="location-page-hero-content">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
            <MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />
            {location.state}, {location.country}
          </div>
          <h1 className="location-title" style={{ color: 'white' }}>{location.name}</h1>
        </div>
      </div>

      {/* Body */}
      <div className="location-page-body">
        {/* Stats + Add button */}
        <div className="location-meta-row">
          <div className="location-stats-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="stat-value">{location.totalVisits}</span>
              <span className="stat-label">Audit Visits</span>
            </div>
            <div style={{ width: 1, background: 'var(--border-strong)', margin: '0 8px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="stat-value">{location.totalPhotos}</span>
              <span className="stat-label">Photographs</span>
            </div>
          </div>

          <button
            className="nav-add-btn"
            style={{ borderRadius: 'var(--radius-md)', padding: '10px 18px' }}
            onClick={() => setShowUpload(true)}
          >
            <Plus size={14} />
            Add Visit
          </button>
        </div>

        {/* Visits */}
        <div style={{ marginBottom: 12 }}>
          <span className="section-label">Audit History</span>
        </div>

        {visits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No visits recorded yet</div>
            <div className="empty-sub">Click "Add Visit" to record the first audit for this location.</div>
          </div>
        ) : (
          <div className="visits-stack">
            {visits.map((visit) => (
              <Link
                key={visit.id}
                href={`/location/${location.slug}/visit/${visit.id}`}
                className="visit-card"
                style={{ textDecoration: 'none' }}
              >
                {/* Hero photo */}
                {visit.coverPhotoUrl ? (
                  <img src={visit.coverPhotoUrl} alt={visit.title || visit.date} className="visit-card-photo" />
                ) : (
                  <div className="visit-card-photo" style={{ background: 'linear-gradient(135deg, #E8E4DC, #D4CEC2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={32} color="#bbb" />
                  </div>
                )}

                <div className="visit-card-body">
                  <div className="visit-card-date">{formatDateShort(visit.date)}</div>
                  <div className="visit-card-title">{visit.title || `${location.name} Audit`}</div>
                  {visit.notes && <div className="visit-card-notes">{visit.notes}</div>}
                  <div className="visit-card-footer">
                    <div className="visit-card-count">
                      <Camera size={13} />
                      {visit.photoCount} photo{visit.photoCount !== 1 ? 's' : ''}
                    </div>
                    <div className="visit-card-arrow">
                      View Gallery <span style={{ marginLeft: 4 }}>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(slug, visitId) => {
            setShowUpload(false);
            router.push(`/location/${slug}/visit/${visitId}`);
          }}
        />
      )}
    </div>
  );
}
