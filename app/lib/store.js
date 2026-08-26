// =============================================================================
// In-memory data store with JSON file persistence
// Production: replace with PostgreSQL/Prisma
// =============================================================================

import fs from 'fs';
import path from 'path';
import { DEMO_LOCATIONS, DEMO_VISITS, DEMO_PHOTOS } from './demo-data.js';

const DATA_FILE = path.join(process.cwd(), 'data', 'store.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadStore() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      locations: DEMO_LOCATIONS,
      visits: DEMO_VISITS,
      photos: DEMO_PHOTOS,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveStore(store) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

export function getAllLocations() {
  const store = loadStore();
  return store.locations;
}

export function getLocationBySlug(slug) {
  const store = loadStore();
  return store.locations.find((l) => l.slug === slug) || null;
}

export function upsertLocation(locationData) {
  const store = loadStore();
  const existing = store.locations.find((l) => l.slug === locationData.slug);
  if (existing) {
    Object.assign(existing, locationData);
  } else {
    store.locations.push(locationData);
  }
  saveStore(store);
  return locationData;
}

export function updateLocationStats(locationId) {
  const store = loadStore();
  const loc = store.locations.find((l) => l.id === locationId);
  if (!loc) return;

  const visits = store.visits.filter((v) => v.locationId === locationId);
  const photoCount = visits.reduce((sum, v) => sum + v.photoCount, 0);
  loc.totalVisits = visits.length;
  loc.totalPhotos = photoCount;

  // Set cover from newest visit
  const newest = visits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  if (newest) loc.coverPhotoUrl = newest.coverPhotoUrl;

  saveStore(store);
}

// ---------------------------------------------------------------------------
// Visits
// ---------------------------------------------------------------------------

export function getVisitsByLocation(locationId) {
  const store = loadStore();
  return store.visits
    .filter((v) => v.locationId === locationId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getVisitById(id) {
  const store = loadStore();
  return store.visits.find((v) => v.id === id) || null;
}

export function createVisit(visitData) {
  const store = loadStore();
  store.visits.push(visitData);
  saveStore(store);
  return visitData;
}

export function updateVisit(id, updates) {
  const store = loadStore();
  const visit = store.visits.find((v) => v.id === id);
  if (visit) {
    Object.assign(visit, updates);
    saveStore(store);
  }
  return visit;
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export function getPhotosByVisit(visitId) {
  const store = loadStore();
  const photos = store.photos[visitId] || [];
  return photos;
}

export function getPhotoById(id) {
  const store = loadStore();
  for (const visitPhotos of Object.values(store.photos)) {
    const photo = visitPhotos.find((p) => p.id === id);
    if (photo) return photo;
  }
  return null;
}

export function addPhotosToVisit(visitId, photoRecords) {
  const store = loadStore();
  if (!store.photos[visitId]) store.photos[visitId] = [];
  store.photos[visitId].push(...photoRecords);
  saveStore(store);
  return photoRecords;
}
