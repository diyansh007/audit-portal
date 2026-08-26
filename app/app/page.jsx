'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FolderOpen, Search, Plus, MapPin, Camera, Calendar, BarChart2, X, Menu } from 'lucide-react';
import LocationPanel from '@/components/map/LocationPanel';
import UploadModal from '@/components/upload/UploadModal';

const AuditMap = dynamic(() => import('@/components/map/AuditMap'), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'absolute', inset: 0, background: '#E8E5DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner" />
    </div>
  ),
});

const DOT_COLORS = ['#B8935A', '#2D7A4E', '#1967D2', '#9B2C2C', '#6B46C1'];

export default function HomePage() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [query, setQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile only

  useEffect(() => {
    fetch('/api/locations')
      .then(r => r.json())
      .then(({ locations }) => setLocations(locations))
      .catch(console.error);
  }, []);

  const filtered = query
    ? locations.filter(l => l.name.toLowerCase().includes(query.toLowerCase()))
    : locations;

  const handleSelect = useCallback((loc) => {
    setSelectedLocation(loc);
    setSidebarOpen(false);
  }, []);

  const totalAudits = locations.reduce((s, l) => s + l.totalVisits, 0);
  const totalPhotos = locations.reduce((s, l) => s + l.totalPhotos, 0);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />

      <div className="home-layout">
        {/* ── LEFT SIDEBAR ────────────────────────────────────── */}
        <aside className={`location-sidebar${sidebarOpen ? ' open' : ''}`}>

          {/* Header: logo + dashboard button */}
          <div className="sidebar-header">
            <div className="sidebar-logo-row">
              <div className="sidebar-logo-mark">CS</div>
              <div>
                <div className="sidebar-brand-name">Civil Surgeon</div>
                <div className="sidebar-brand-sub">Nagpur · Audit Portal</div>
              </div>
            </div>

            {/* Dashboard CTA */}
            <Link href="/dashboard" className="dashboard-btn">
              <div className="dashboard-btn-icon">
                <BarChart2 size={12} color="#B8935A" />
              </div>
              Civil Surgeon Dashboard
              <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 10 }}>↗</span>
            </Link>

            {/* Search */}
            <div className="sidebar-search">
              <Search size={13} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search locations…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Section label */}
          <div className="sidebar-section-label">
            Locations · {filtered.length}
          </div>

          {/* Location folders */}
          <div className="sidebar-locations">
            {filtered.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                No locations found
              </div>
            )}
            {filtered.map((loc, i) => (
              <button
                key={loc.id}
                className={`location-folder${selectedLocation?.id === loc.id ? ' active' : ''}`}
                onClick={() => handleSelect(loc)}
              >
                <div className="folder-icon">
                  <FolderOpen size={15} />
                </div>
                <div className="folder-info">
                  <div className="folder-name">{loc.name}</div>
                  <div className="folder-meta">
                    <span className="folder-badge">
                      <Calendar size={10} />
                      {loc.totalVisits} visit{loc.totalVisits !== 1 ? 's' : ''}
                    </span>
                    <span className="folder-badge">
                      <Camera size={10} />
                      {loc.totalPhotos}
                    </span>
                  </div>
                </div>
                {/* Color dot */}
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                  background: DOT_COLORS[i % DOT_COLORS.length],
                  opacity: selectedLocation?.id === loc.id ? 1 : 0.4,
                }} />
              </button>
            ))}
          </div>

          {/* Footer stats */}
          <div className="sidebar-footer">
            <div className="sidebar-stats-row">
              <div className="sidebar-stat">
                <span className="sidebar-stat-value">{locations.length}</span>
                <span className="sidebar-stat-label">Locations</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-value">{totalAudits}</span>
                <span className="sidebar-stat-label">Audits</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-value">{totalPhotos}</span>
                <span className="sidebar-stat-label">Photos</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAP AREA ─────────────────────────────────────────── */}
        <div className="map-area">
          <AuditMap
            locations={locations}
            selectedSlug={selectedLocation?.slug}
            onLocationClick={handleSelect}
          />

          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(s => !s)}
            style={{
              display: 'none', // shown via media query override below
              position: 'absolute', top: 16, left: 16, zIndex: 700,
              width: 40, height: 40, background: 'white', border: '1px solid var(--border)',
              borderRadius: 10, cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
            id="sidebar-toggle"
          >
            <Menu size={18} />
          </button>

          {/* Top-right: Add Images */}
          <div className="map-topbar">
            <button className="map-add-btn" onClick={() => setShowUpload(true)}>
              <Plus size={15} />
              Add Images
            </button>
          </div>

          {/* Location panel on marker/sidebar click */}
          {selectedLocation && (
            <LocationPanel
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
            />
          )}

          {/* Backdrop to dismiss panel on mobile */}
          {selectedLocation && (
            <div
              style={{ position: 'absolute', inset: 0, zIndex: 800 }}
              onClick={() => setSelectedLocation(null)}
            />
          )}
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => setShowUpload(false)}
        />
      )}

      {/* Mobile sidebar toggle visibility */}
      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
