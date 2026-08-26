import { getAllLocations, getVisitsByLocation, getPhotosByVisit } from '@/lib/store';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Civil Surgeon Dashboard — CS Nagpur Audit Analytics',
  description: 'Analytics and overview of all audit activities across Maharashtra for CS Civil Surgeon Hospital, Nagpur.',
};

export default function DashboardPage() {
  const locations = getAllLocations();

  // Build full visit + photo data for analytics
  const allVisits = locations.flatMap(loc =>
    getVisitsByLocation(loc.id).map(v => ({ ...v, locationName: loc.name }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPhotos = locations.reduce((s, l) => s + l.totalPhotos, 0);
  const totalVisits = locations.reduce((s, l) => s + l.totalVisits, 0);

  // Audits per month (last 12 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const count = allVisits.filter(v => v.date.startsWith(monthKey)).length;
    const photos = allVisits
      .filter(v => v.date.startsWith(monthKey))
      .reduce((s, v) => s + (v.photoCount || 0), 0);
    return { label, count, photos, monthKey };
  });

  // Photos per location
  const photosByLocation = locations
    .map(l => ({ name: l.name, photos: l.totalPhotos, visits: l.totalVisits }))
    .sort((a, b) => b.photos - a.photos);

  // This month vs last month
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthVisits = allVisits.filter(v => v.date.startsWith(thisMonthKey)).length;
  const lastMonthVisits = allVisits.filter(v => v.date.startsWith(lastMonthKey)).length;

  return (
    <DashboardClient
      locations={locations}
      allVisits={allVisits}
      monthlyData={monthlyData}
      photosByLocation={photosByLocation}
      totalPhotos={totalPhotos}
      totalVisits={totalVisits}
      thisMonthVisits={thisMonthVisits}
      lastMonthVisits={lastMonthVisits}
    />
  );
}
