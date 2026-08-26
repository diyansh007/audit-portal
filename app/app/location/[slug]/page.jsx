import { getLocationBySlug } from '@/lib/store';
import { getVisitsByLocation } from '@/lib/store';
import LocationPageClient from './LocationPageClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location) return { title: 'Location Not Found' };
  return {
    title: `${location.name} — CS Civil Surgeon Nagpur Audit Portal`,
    description: `${location.totalVisits} audit visits, ${location.totalPhotos} photographs from ${location.name}, ${location.state}.`,
  };
}

export default async function LocationPage({ params }) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location) notFound();

  const visits = getVisitsByLocation(location.id);

  return <LocationPageClient location={location} visits={visits} />;
}
