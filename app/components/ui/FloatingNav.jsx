'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Plus, X, MapPin } from 'lucide-react';
import UploadModal from '@/components/upload/UploadModal';

export default function FloatingNav({ locations, selectedSlug, onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const navRef = useRef(null);

  const filtered = query.length > 0
    ? locations.filter((l) =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.district?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback((loc) => {
    setQuery(loc.name);
    setShowDropdown(false);
    onLocationSelect(loc);
  }, [onLocationSelect]);

  const handleClear = () => {
    setQuery('');
    setShowDropdown(false);
    onLocationSelect(null);
  };

  return (
    <>
      <nav className="floating-nav" ref={navRef} style={{ position: 'relative' }}>
        {/* Logo */}
        <div className="nav-logo">
          <div className="nav-logo-mark">CS</div>
          <div>
            <div className="nav-brand">Civil Surgeon</div>
          </div>
        </div>

        <div className="nav-divider" />

        {/* Search */}
        <div className="nav-search">
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search locations..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => { if (query) setShowDropdown(true); }}
          />
          {query && (
            <button onClick={handleClear} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'var(--text-muted)' }}>
              <X size={12} />
            </button>
          )}
        </div>

        <div className="nav-divider" />

        {/* Add button */}
        <button className="nav-add-btn" onClick={() => setShowUpload(true)}>
          <Plus size={14} />
          Add Images
        </button>

        {/* Search dropdown */}
        {showDropdown && filtered.length > 0 && (
          <div className="search-dropdown" style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0 }}>
            {filtered.map((loc) => (
              <button key={loc.id} className="search-item" onClick={() => handleSelect(loc)}>
                <MapPin size={14} color="var(--accent)" />
                <div>
                  <div className="search-item-name">{loc.name}</div>
                  <div className="search-item-meta">{loc.totalVisits} visits · {loc.totalPhotos} photos</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </nav>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(locationSlug, visitId) => {
            setShowUpload(false);
          }}
        />
      )}
    </>
  );
}
