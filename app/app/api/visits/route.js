import { getVisitsByLocation, createVisit, updateLocationStats, upsertLocation } from '@/lib/store';
import { geocodingService } from '@/lib/geocoding';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    if (!locationId) {
      return NextResponse.json({ error: 'locationId required' }, { status: 400 });
    }
    const visits = getVisitsByLocation(locationId);
    return NextResponse.json({ visits });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { locationName, date, title, notes } = body;

    if (!locationName || !date) {
      return NextResponse.json({ error: 'locationName and date are required' }, { status: 400 });
    }

    // Geocode the location name
    const geo = await geocodingService.geocode(locationName);

    // Slugify
    const slug = geo.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Upsert location
    const locationId = `loc-${slug}`;
    upsertLocation({
      id: locationId,
      slug,
      name: geo.name,
      district: geo.district,
      state: geo.state,
      country: geo.country,
      lat: geo.lat,
      lng: geo.lng,
      totalVisits: 0,
      totalPhotos: 0,
      createdAt: new Date().toISOString(),
    });

    // Create visit
    const visitId = `vis-${randomUUID().split('-')[0]}`;
    const visit = createVisit({
      id: visitId,
      locationId,
      locationSlug: slug,
      date,
      title: title || null,
      notes: notes || null,
      photoCount: 0,
      coverPhotoUrl: null,
      createdAt: new Date().toISOString(),
    });

    // Recompute location stats
    updateLocationStats(locationId);

    return NextResponse.json({ visit, locationSlug: slug }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
