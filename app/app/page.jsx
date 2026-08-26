'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import FloatingNav from '@/components/ui/FloatingNav';
import LocationPanel from '@/components/map/LocationPanel';

// Leaflet must be SSR-disabled
const AuditMap = dynamic(() => import('@/components/map/AuditMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#E8E5DE',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="loading-spinner" />
    </div>
  ),
});

export default function HomePage() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then(({ locations }) => setLocations(locations))
      .catch(console.error);
  }, []);

  const handleLocationSelect = useCallback((loc) => {
    setSelectedLocation(loc);
  }, []);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Full-screen map */}
      <div style={{ position: 'fixed', inset: 0 }}>
        <AuditMap
          locations={locations}
          selectedSlug={selectedLocation?.slug}
          onLocationClick={handleLocationSelect}
        />

        {/* Floating nav / search */}
        <FloatingNav
          locations={locations}
          selectedSlug={selectedLocation?.slug}
          onLocationSelect={handleLocationSelect}
        />

        {/* Location detail panel */}
        {selectedLocation && (
          <LocationPanel
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
          />
        )}

        {/* Stats strip — bottom left */}
        {locations.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            display: 'flex',
            gap: 8,
            zIndex: 900,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 100,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {locations.length} locations
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 100,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {locations.reduce((s, l) => s + l.totalVisits, 0)} audits
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 100,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {locations.reduce((s, l) => s + l.totalPhotos, 0)} photos
            </div>
          </div>
        )}

        {/* Click-to-dismiss panel */}
        {selectedLocation && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 800, cursor: 'default' }}
            onClick={() => setSelectedLocation(null)}
          />
        )}
      </div>
    </>
  );
}
