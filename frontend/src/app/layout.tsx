import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import WhatsAppButton from '@/components/shared/WhatsAppButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prasad Cement Products | Quality Precast Concrete Windows, Doors, Bricks & Pools',
  description:
    'Manufacturer and supplier of high-strength precast cement windows, single/double door frames (darwajas), solid/hollow/fly-ash bricks, and precast concrete pools in Jagtial, Telangana. Direct factory pricing and wholesale dispatch.',
  keywords: [
    'cement windows',
    'cement door frames',
    'cement darwaja',
    'precast concrete',
    'solid cement bricks',
    'hollow concrete blocks',
    'fly ash bricks',
    'precast swimming pool',
    'garden pool',
    'Prasad Cement Products',
    'Jagtial Velgatoor Telangana',
  ],
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <WhatsAppButton />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
