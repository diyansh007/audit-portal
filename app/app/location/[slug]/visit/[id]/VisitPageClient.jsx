'use client';
import Link from 'next/link';
import { ArrowLeft, Camera, Calendar, MapPin } from 'lucide-react';
import PhotoGrid from '@/components/gallery/PhotoGrid';

export default function VisitPageClient({ visit, location, photos }) {
  const dateFormatted = new Date(visit.date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const dateShort = new Date(visit.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).toUpperCase();

  return (
    <div className="gallery-page">
      {/* Sticky header */}
      <header className="gallery-header">
        <Link href={`/location/${location.slug}`} className="back-btn" style={{ position: 'static', padding: '6px 12px', fontSize: 12 }}>
          <ArrowLeft size={12} />
          {location.name}
        </Link>

        <div className="gallery-breadcrumb">
          <Link href="/" className="breadcrumb-item">Map</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/location/${location.slug}`} className="breadcrumb-item">{location.name}</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{visit.title || dateShort}</span>
        </div>
      </header>

      {/* Body */}
      <div className="gallery-body">
        <div className="gallery-meta">
          {/* Date + location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              <Calendar size={13} />
              {dateShort}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <MapPin size={12} />
              {location.name}, {location.state}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <Camera size={12} />
              {photos.length} photograph{photos.length !== 1 ? 's' : ''}
            </div>
          </div>

          <h1 className="gallery-title">
            {visit.title || `${location.name} Audit`}
          </h1>

          {visit.notes && (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 640 }}>
              {visit.notes}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 28 }} />

        {/* Photo grid */}
        <PhotoGrid
          photos={photos}
          locationName={location.name}
          visitDate={visit.date}
        />
      </div>
    </div>
  );
}
