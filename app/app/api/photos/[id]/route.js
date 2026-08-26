import { getPhotosByVisit } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const photos = getPhotosByVisit(id);
    return NextResponse.json({ photos });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
