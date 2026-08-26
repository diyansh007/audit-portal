'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Camera, Calendar, TrendingUp,
  FileText, Activity, Clock, CheckCircle2, BarChart2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler
);

// Color palette
const ACCENT = '#B8935A';
const COLORS = ['#B8935A','#2D7A4E','#1967D2','#9B2C2C','#6B46C1','#C05621','#2C7A7B'];

function KpiCard({ icon, label, value, trend, trendLabel, accentColor, iconBg }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-accent" style={{ background: accentColor }} />
      <div className="kpi-icon-wrap" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {trend !== undefined && (
        <div className={`kpi-trend ${trend >= 0 ? 'up' : 'neutral'}`}>
          <TrendingUp size={12} />
          {trendLabel}
        </div>
      )}
    </div>
  );
}

export default function DashboardClient({
  locations, allVisits, monthlyData,
  photosByLocation, totalPhotos, totalVisits,
  thisMonthVisits, lastMonthVisits,
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // --- Chart configs ---

  // Monthly audits bar chart
  const barData = {
    labels: monthlyData.map(m => m.label),
    datasets: [
      {
        label: 'Audit Visits',
        data: monthlyData.map(m => m.count),
        backgroundColor: monthlyData.map((_, i) =>
          i === monthlyData.length - 1 ? ACCENT : 'rgba(184,147,90,0.25)'
        ),
        borderColor: ACCENT,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: {
      title: (items) => `Month: ${items[0].label}`,
      label: (item) => ` ${item.raw} audit visit${item.raw !== 1 ? 's' : ''}`,
    }}},
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 1, font: { size: 11 } } },
    },
  };

  // Monthly photos line chart
  const lineData = {
    labels: monthlyData.map(m => m.label),
    datasets: [{
      label: 'Photos Uploaded',
      data: monthlyData.map(m => m.photos),
      borderColor: '#2D7A4E',
      backgroundColor: 'rgba(45,122,78,0.08)',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#2D7A4E',
      fill: true,
      tension: 0.4,
    }],
  };

  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
    },
  };

  // Doughnut: visits per location
  const doughnutData = {
    labels: locations.map(l => l.name),
    datasets: [{
      data: locations.map(l => l.totalVisits),
      backgroundColor: COLORS.slice(0, locations.length),
      borderWidth: 2,
      borderColor: 'white',
      hoverOffset: 6,
    }],
  };

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
      tooltip: { callbacks: {
        label: (item) => ` ${item.label}: ${item.raw} visit${item.raw !== 1 ? 's' : ''}`,
      }},
    },
    cutout: '62%',
  };

  // Photos per location bar
  const photosBarData = {
    labels: photosByLocation.map(l => l.name),
    datasets: [{
      label: 'Photos',
      data: photosByLocation.map(l => l.photos),
      backgroundColor: COLORS.slice(0, photosByLocation.length).map(c => c + 'CC'),
      borderColor: COLORS.slice(0, photosByLocation.length),
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const photosBarOpts = {
    indexAxis: 'y',
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 12, weight: '500' } } },
    },
  };

  // Month heatmap data
  const maxCount = Math.max(...monthlyData.map(m => m.count), 1);

  // Top location
  const topLocation = [...locations].sort((a, b) => b.totalVisits - a.totalVisits)[0];
  const mostPhotos = [...locations].sort((a, b) => b.totalPhotos - a.totalPhotos)[0];

  return (
    <div className="dashboard-page">
      {/* Top bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <Link href="/" className="dash-back-btn">
            <ArrowLeft size={13} />
            Map
          </Link>
          <div>
            <div className="dash-title">Civil Surgeon Dashboard</div>
            <div className="dash-subtitle">CS Civil Surgeon Hospital, Nagpur — Audit Analytics</div>
          </div>
        </div>
        <div className="dash-timestamp">
          <Clock size={12} />
          {dateStr}
        </div>
      </div>

      {/* Body */}
      <div className="dash-body">

        {/* ── KPI CARDS ── */}
        <div className="kpi-grid">
          <KpiCard
            icon={<MapPin size={18} color="#B8935A" />}
            label="Active Locations"
            value={locations.length}
            accentColor="#B8935A"
            iconBg="rgba(184,147,90,0.1)"
            trendLabel="Across Maharashtra"
          />
          <KpiCard
            icon={<FileText size={18} color="#2D7A4E" />}
            label="Total Audit Visits"
            value={totalVisits}
            accentColor="#2D7A4E"
            iconBg="rgba(45,122,78,0.1)"
            trend={thisMonthVisits - lastMonthVisits}
            trendLabel={`${thisMonthVisits} this month`}
          />
          <KpiCard
            icon={<Camera size={18} color="#1967D2" />}
            label="Geo-Tagged Photos"
            value={totalPhotos}
            accentColor="#1967D2"
            iconBg="rgba(25,103,210,0.1)"
            trendLabel={`${Math.round(totalPhotos / Math.max(totalVisits,1))} avg per visit`}
          />
          <KpiCard
            icon={<Activity size={18} color="#9B2C2C" />}
            label="Audits This Month"
            value={thisMonthVisits}
            accentColor="#9B2C2C"
            iconBg="rgba(155,44,44,0.1)"
            trend={thisMonthVisits - lastMonthVisits}
            trendLabel={lastMonthVisits > 0
              ? `${lastMonthVisits} last month`
              : 'First month of data'}
          />
        </div>

        {/* ── CHARTS ROW 1 ── */}
        <div className="charts-grid">
          {/* Monthly audits bar */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Audit Visits — Monthly Trend</div>
                <div className="chart-card-sub">Last 12 months · each bar = one calendar month</div>
              </div>
              <span className="badge badge-amber">{totalVisits} total</span>
            </div>
            <div style={{ height: 220 }}>
              <Bar data={barData} options={barOpts} />
            </div>
          </div>

          {/* Visits distribution doughnut */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Visits by Location</div>
                <div className="chart-card-sub">Distribution across {locations.length} sites</div>
              </div>
            </div>
            <div style={{ height: 220 }}>
              <Doughnut data={doughnutData} options={doughnutOpts} />
            </div>
          </div>
        </div>

        {/* ── CHARTS ROW 2 ── */}
        <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Photo uploads line */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Photo Upload Activity</div>
                <div className="chart-card-sub">Geo-tagged photographs per month</div>
              </div>
              <span className="badge badge-green">{totalPhotos} total</span>
            </div>
            <div style={{ height: 200 }}>
              <Line data={lineData} options={lineOpts} />
            </div>
          </div>

          {/* Photos per location horizontal bar */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Photos per Location</div>
                <div className="chart-card-sub">Total photographic evidence archived</div>
              </div>
            </div>
            <div style={{ height: 200 }}>
              <Bar data={photosBarData} options={photosBarOpts} />
            </div>
          </div>
        </div>

        {/* ── ACTIVITY HEATMAP ── */}
        <div className="chart-card" style={{ marginBottom: 20 }}>
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Monthly Activity Heatmap</div>
              <div className="chart-card-sub">Darker = more audits conducted</div>
            </div>
          </div>
          <div className="month-grid">
            {monthlyData.map((m) => {
              const intensity = m.count / maxCount;
              const bg = intensity === 0
                ? '#F4F2EE'
                : `rgba(184,147,90,${0.15 + intensity * 0.75})`;
              const textColor = intensity > 0.5 ? 'white' : 'var(--text-primary)';
              return (
                <div key={m.monthKey} className="month-cell" style={{ background: bg, color: textColor }}>
                  <span className="month-label" style={{ color: intensity > 0.5 ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                    {m.label.split(' ')[0]}
                  </span>
                  <span className="month-count">{m.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── LOCATION PERFORMANCE ── */}
        <div className="perf-grid">
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Visits per Location</div>
                <div className="chart-card-sub">Coverage depth by site</div>
              </div>
            </div>
            {locations.map((loc, i) => {
              const max = Math.max(...locations.map(l => l.totalVisits), 1);
              return (
                <div key={loc.id} className="perf-row">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                  <span className="perf-name">{loc.name}</span>
                  <div className="perf-bar-wrap">
                    <div className="perf-bar-fill" style={{ width: `${(loc.totalVisits / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <span className="perf-count">{loc.totalVisits}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Photos per Location</div>
                <div className="chart-card-sub">Photographic evidence volume</div>
              </div>
            </div>
            {locations.map((loc, i) => {
              const max = Math.max(...locations.map(l => l.totalPhotos), 1);
              return (
                <div key={loc.id} className="perf-row">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                  <span className="perf-name">{loc.name}</span>
                  <div className="perf-bar-wrap">
                    <div className="perf-bar-fill" style={{ width: `${(loc.totalPhotos / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <span className="perf-count">{loc.totalPhotos}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RECENT AUDIT ACTIVITY TABLE ── */}
        <div className="activity-card">
          <div className="activity-header">
            <div className="activity-title">Recent Audit Activity</div>
            <span className="badge badge-blue">Last {Math.min(allVisits.length, 10)} records</span>
          </div>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Date</th>
                <th>Title</th>
                <th>Photos</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allVisits.slice(0, 10).map((visit, i) => (
                <tr key={visit.id}>
                  <td>
                    <div className="location-dot">
                      <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
                      <Link
                        href={`/location/${visit.locationSlug}`}
                        style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                      >
                        {visit.locationName}
                      </Link>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(visit.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td style={{ maxWidth: 240 }}>
                    <Link
                      href={`/location/${visit.locationSlug}/visit/${visit.id}`}
                      style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      {visit.title || `${visit.locationName} Audit`}
                    </Link>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                      <Camera size={13} />
                      {visit.photoCount}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-green">
                      <CheckCircle2 size={11} style={{ marginRight: 4 }} />
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── SUMMARY CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <div className="chart-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Most Active Location</div>
            <div style={{ fontSize: 22, fontFamily: 'Playfair Display, serif', fontWeight: 600, marginBottom: 4 }}>{topLocation?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--accent)' }}>{topLocation?.totalVisits} audit visits</div>
          </div>
          <div className="chart-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Most Documented</div>
            <div style={{ fontSize: 22, fontFamily: 'Playfair Display, serif', fontWeight: 600, marginBottom: 4 }}>{mostPhotos?.name}</div>
            <div style={{ fontSize: 12, color: '#2D7A4E' }}>{mostPhotos?.totalPhotos} photographs</div>
          </div>
          <div className="chart-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Coverage</div>
            <div style={{ fontSize: 22, fontFamily: 'Playfair Display, serif', fontWeight: 600, marginBottom: 4 }}>Maharashtra</div>
            <div style={{ fontSize: 12, color: '#1967D2' }}>{locations.length} districts covered</div>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, paddingBottom: 16 }}>
          CS Civil Surgeon Hospital Nagpur · Audit Photo Archive · Data as of {dateStr}
        </div>
      </div>
    </div>
  );
}
