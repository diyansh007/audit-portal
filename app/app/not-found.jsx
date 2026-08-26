import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-surface)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontSize: 64, fontFamily: 'Playfair Display, serif', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Page not found</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>This location or visit doesn't exist.</div>
      <Link href="/" style={{
        padding: '12px 24px', background: 'var(--bg-dark)', color: 'white',
        borderRadius: 100, fontSize: 14, fontWeight: 500, textDecoration: 'none',
      }}>
        Back to Map
      </Link>
    </div>
  );
}
