'use client';
import { useEffect, useRef } from 'react';

// Leaflet must be imported dynamically (client-only)
// This component is always wrapped in dynamic({ ssr: false })

export default function AuditMap({ locations, selectedSlug, onLocationClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamic Leaflet import
    import('leaflet').then((L) => {
      // Fix default icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapRef.current) {
        // Initialize map centered on Nagpur region
        // Maharashtra bounds: SW [15.6, 72.6] → NE [22.2, 80.9]
        const MAHARASHTRA_BOUNDS = L.latLngBounds(
          [15.6, 72.6],
          [22.2, 80.9]
        );

        const map = L.map(mapRef.current, {
          center: [21.1458, 79.0882], // Nagpur at center
          zoom: 8,
          minZoom: 6,
          maxZoom: 14,
          zoomControl: false,
          attributionControl: true,
          maxBounds: MAHARASHTRA_BOUNDS,
          maxBoundsViscosity: 0.95,
        });

        // CartoDB Positron — clean, neutral tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          maxZoom: 18,
        }).addTo(map);

        // Zoom control — bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Start centered on Nagpur at zoom 8
        map.setView([21.1458, 79.0882], 8);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      // Add markers for each location
      locations.forEach((loc) => {
        const isActive = loc.slug === selectedSlug;

        const icon = L.divIcon({
          className: '',
          html: `
            <div class="marker-wrapper" style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;">
              <div class="marker-dot ${isActive ? 'active' : ''}" style="
                width:${isActive ? '16px' : '12px'};
                height:${isActive ? '16px' : '12px'};
                background:${isActive ? '#B8935A' : '#0A0A0A'};
                border:2.5px solid white;
                border-radius:50%;
                box-shadow:${isActive ? '0 0 0 4px rgba(184,147,90,0.25), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.3)'};
                transition:all 0.25s ease;
              "></div>
              <div class="marker-label ${isActive ? 'active' : ''}" style="
                background:${isActive ? '#0A0A0A' : 'white'};
                color:${isActive ? 'white' : '#0D0D0D'};
                font-size:11px;
                font-weight:600;
                font-family:Inter,sans-serif;
                padding:3px 8px;
                border-radius:100px;
                box-shadow:0 2px 8px rgba(0,0,0,0.1);
                white-space:nowrap;
                border:1px solid ${isActive ? '#0A0A0A' : 'rgba(0,0,0,0.08)'};
              ">${loc.name}</div>
            </div>
          `,
          iconSize: [80, 46],
          iconAnchor: [40, 8],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon })
          .addTo(map)
          .on('click', () => onLocationClick(loc));

        markersRef.current[loc.slug] = marker;
      });

      // Fly to selected location
      if (selectedSlug && markersRef.current[selectedSlug]) {
        const loc = locations.find((l) => l.slug === selectedSlug);
        if (loc) {
          map.flyTo([loc.lat, loc.lng], 10, { animate: true, duration: 1.2 });
        }
      } else if (!selectedSlug) {
        // Fly back to Nagpur center
        map.flyTo([21.1458, 79.0882], 8, { animate: true, duration: 0.8 });
      }
    });
  }, [locations, selectedSlug, onLocationClick]);

  return (
    <div
      ref={mapRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
    />
  );
}
