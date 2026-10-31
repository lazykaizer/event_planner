import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quote X-Ray — Decode Wedding & Event Vendor Quotes Before Paying Advances',
  description:
    'Don’t pay the advance until you’ve X-Rayed the quote. Spot hidden costs, compute true all-in cost with live guest slider, detect predatory contract terms, and generate polite WhatsApp negotiation messages.',
  keywords: [
    'Quote X-Ray',
    'wedding vendor quotes',
    'caterer quote calculator',
    'hidden wedding costs',
    'wedding vendor red flags',
    'Indian wedding advance protection',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream-50 font-body text-gray-800">
        {children}
      </body>
    </html>
  );
}
