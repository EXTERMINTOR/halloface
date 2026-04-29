import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'HALL OF ACE — by Wallace',
  description: 'Different problems. Same shapes. A daily field notebook on building, thinking, and the space between.',
  openGraph: {
    title: 'HALL OF ACE — by Wallace',
    description: 'Different problems. Same shapes.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grain" />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
