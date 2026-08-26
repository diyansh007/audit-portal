import { storageService } from '@/lib/storage';
import { addPhotosToVisit, updateVisit, updateLocationStats, getVisitById } from '@/lib/store';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const visitId = formData.get('visitId');
    const locationId = formData.get('locationId');

    if (!visitId || !locationId) {
      return NextResponse.json({ error: 'visitId and locationId required' }, { status: 400 });
    }

    const files = formData.getAll('photos');
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No photos provided' }, { status: 400 });
    }

    const photoRecords = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = await storageService.upload(buffer, file.name);

      photoRecords.push({
        id: `ph-${randomUUID().split('-')[0]}`,
        visitId,
        locationId,
        url: stored.url,
        thumbnailUrl: stored.url,
        filename: stored.filename,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: stored.sizeBytes,
        uploadedAt: new Date().toISOString(),
      });
    }

    // Persist photos
    addPhotosToVisit(visitId, photoRecords);

    // Update visit photo count and cover
    const visit = getVisitById(visitId);
    const newCount = (visit?.photoCount || 0) + photoRecords.length;
    updateVisit(visitId, {
      photoCount: newCount,
      coverPhotoUrl: photoRecords[0]?.url || visit?.coverPhotoUrl,
    });

    // Update location stats
    updateLocationStats(locationId);

    return NextResponse.json({ photos: photoRecords, count: photoRecords.length }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
