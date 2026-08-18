import type { Metadata } from 'next';
import './globals.css';
import SystemGuideLink from './SystemGuideLink';

export const metadata: Metadata = {
  title: 'RepairAtlas — Institutional memory for field operations',
  description: 'An agentic repair intelligence console that turns completed work into reusable operational memory.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: { title: 'RepairAtlas', description: 'Every repair teaches the next one.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SystemGuideLink />
      </body>
    </html>
  );
}
