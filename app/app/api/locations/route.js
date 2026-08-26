import { getAllLocations } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const locations = getAllLocations();
    return NextResponse.json({ locations });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
