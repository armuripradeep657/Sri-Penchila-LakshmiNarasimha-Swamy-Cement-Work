import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import AmbientLogoBackground from '@/components/shared/AmbientLogoBackground';
import MobileBottomNav from '@/components/shared/MobileBottomNav';
import PWARegister from '@/components/shared/PWARegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sri Lakshmi Penchila Narasimha Swamy Cement Work | Quality Precast Concrete Windows, Bricks & Gagulu',
  description:
    'Manufacturer and supplier of high-strength precast cement windows, machine & hand-made ketikelu, gagulu cement well rings, solid bricks, and ventilator jalis. Direct factory pricing and wholesale yard dispatch.',
  applicationName: 'Prasad Cement Work',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Prasad Cement',
  },
  keywords: [
    'Sri Lakshmi Penchila Narasimha Swamy Cement Work',
    'Prasad Cement Products',
    'cement windows',
    'kodada ketikelu',
    'machine ketikelu',
    'gagulu cement rings',
    'precast concrete',
    'solid cement bricks',
    'ventilator jali blocks',
    'Jagtial Velgatoor Telangana',
  ],
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#0b0f19" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 antialiased relative overflow-x-hidden`}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <AmbientLogoBackground />
              <Header />
              <main className="flex-1 overflow-x-hidden pb-mobile-nav">{children}</main>
              <Footer />
              <WhatsAppButton />
              <MobileBottomNav />
              <PWARegister />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
