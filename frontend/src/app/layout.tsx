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
  title: 'Sri Penchila LakshmiNarasimha Swamy Cement Work | Quality Precast Concrete Windows, Bricks & Gagulu',
  description:
    'Manufacturer and supplier of high-strength precast cement windows, machine & hand-made ketikelu, gagulu cement well rings, solid bricks, and ventilator jalis. Direct factory pricing and wholesale yard dispatch.',
  keywords: [
    'Sri Penchila LakshmiNarasimha Swamy Cement Work',
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
