import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shaadi Guardian — AI Celebration & Wedding Financial Advisor',
  description:
    'Plan Indian weddings and celebrations within your true budget (₹2L - ₹25L). Smart intake, deterministic budget splits, What-If simulator, and vendor red-flag protection.',
  keywords: [
    'Indian wedding planner',
    'wedding budget calculator',
    'shaadi planner',
    'event budget breakdown',
    'vendor red flags',
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
