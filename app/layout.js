import './globals.css';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThemeConfig from '@/components/ThemeConfig';
import PromoBar from '@/components/PromoBar';
import ReferralHydrator from '@/components/ReferralHydrator';

export const metadata = {
  title: 'AETHEL PARFUMS | Secret for a Luxurious Life',
  description: 'Experience the Kings and Queens Collections from Aethel Parfums. Extraordinary fragrances crafted for a luxurious life.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeConfig />
        <PromoBar />
        <Header />
        <main>{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <ReferralHydrator />
        </Suspense>
        <div id="toast-container"></div>
      </body>
    </html>
  );
}
