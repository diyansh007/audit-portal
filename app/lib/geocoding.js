// =============================================================================
// Geocoding Service — swap provider to use Nominatim, Bhuvan, or Google
// =============================================================================

const KNOWN_LOCATIONS = {
  wardha:      { name: 'Wardha',     district: 'Wardha',     state: 'Maharashtra', country: 'India', lat: 20.7491, lng: 78.5991 },
  nagpur:      { name: 'Nagpur',     district: 'Nagpur',     state: 'Maharashtra', country: 'India', lat: 21.1458, lng: 79.0882 },
  hinganghat:  { name: 'Hinganghat', district: 'Wardha',     state: 'Maharashtra', country: 'India', lat: 20.5504, lng: 78.8405 },
  beltarodi:   { name: 'Beltarodi',  district: 'Nagpur',     state: 'Maharashtra', country: 'India', lat: 21.0677, lng: 79.0105 },
  amravati:    { name: 'Amravati',   district: 'Amravati',   state: 'Maharashtra', country: 'India', lat: 20.9320, lng: 77.7523 },
  yavatmal:    { name: 'Yavatmal',   district: 'Yavatmal',   state: 'Maharashtra', country: 'India', lat: 20.3888, lng: 78.1204 },
  chandrapur:  { name: 'Chandrapur', district: 'Chandrapur', state: 'Maharashtra', country: 'India', lat: 19.9615, lng: 79.2961 },
  akola:       { name: 'Akola',      district: 'Akola',      state: 'Maharashtra', country: 'India', lat: 20.7059, lng: 77.0074 },
};

// Production: replace with Nominatim/Bhuvan/Google API call
async function geocode(locationName) {
  const key = locationName.toLowerCase().trim();

  if (KNOWN_LOCATIONS[key]) return KNOWN_LOCATIONS[key];

  // Partial match
  const found = Object.entries(KNOWN_LOCATIONS).find(
    ([k]) => k.includes(key) || key.includes(k)
  );
  if (found) return found[1];

  // Fallback: Nagpur region with slight offset
  const normalized = locationName.trim();
  return {
    name: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    district: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    state: 'Maharashtra',
    country: 'India',
    lat: 21.1458 + (Math.random() - 0.5) * 3,
    lng: 79.0882 + (Math.random() - 0.5) * 3,
  };
}

export const geocodingService = { geocode };
