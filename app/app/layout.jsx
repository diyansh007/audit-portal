import './globals.css';

export const metadata = {
  title: 'CS Civil Surgeon Hospital Nagpur — Audit Photo Archive',
  description: 'Geographic audit evidence portal for CS Civil Surgeon Hospital, Nagpur. Explore field audit photographs organized by location and visit.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
