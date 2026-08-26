import { getVisitById, getLocationBySlug, getPhotosByVisit } from '@/lib/store';
import VisitPageClient from './VisitPageClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const visit = getVisitById(id);
  if (!visit) return { title: 'Visit Not Found' };
  return {
    title: `${visit.title || 'Audit Visit'} — CS Civil Surgeon Nagpur`,
    description: `${visit.photoCount} photographs from audit visit on ${new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
  };
}

export default async function VisitPage({ params }) {
  const { slug, id } = await params;
  const visit = getVisitById(id);
  if (!visit) notFound();

  const location = getLocationBySlug(slug);
  if (!location) notFound();

  const photos = getPhotosByVisit(id);

  return <VisitPageClient visit={visit} location={location} photos={photos} />;
}
