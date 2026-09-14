'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Layers,
  ShoppingBag,
  Clock,
  User as UserIcon,
  Crown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { isAdmin } = useAuth();
  const { language } = useLanguage();

  const isHome = pathname === '/';
  const isProducts = pathname.startsWith('/products');
  const isCart = pathname === '/cart';
  const isOrders = pathname.startsWith('/orders') || pathname === '/quote';
  const isAdminPage = pathname.startsWith('/admin');
  const isProfile = pathname.startsWith('/profile');

  return (
    <nav
      aria-label="Mobile Bottom Dock"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_25px_rgba(0,0,0,0.5)] safe-bottom"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            isHome
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Home className={`w-5 h-5 transition-transform ${isHome ? 'scale-110' : ''}`} />
            {isHome && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none">
            {language === 'te' ? 'హోమ్' : 'Home'}
          </span>
        </Link>

        {/* 2. Products Catalog */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            isProducts
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Layers className={`w-5 h-5 transition-transform ${isProducts ? 'scale-110' : ''}`} />
            {isProducts && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none">
            {language === 'te' ? 'క్యాటలాగ్' : 'Catalog'}
          </span>
        </Link>

        {/* 3. Cart with reactive badge */}
        <Link
          href="/cart"
          className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            isCart
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <ShoppingBag className={`w-5 h-5 transition-transform ${isCart ? 'scale-110' : ''}`} />
            {cart.totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-black text-[10px] h-4 w-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cart.totalItems > 99 ? '99+' : cart.totalItems}
              </span>
            )}
            {isCart && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none">
            {language === 'te' ? 'కార్ట్' : 'Cart'}
          </span>
        </Link>

        {/* 4. Orders or Admin */}
        {isAdmin ? (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              isAdminPage
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Crown className={`w-5 h-5 transition-transform ${isAdminPage ? 'scale-110' : ''}`} />
              {isAdminPage && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">
              {language === 'te' ? 'అడ్మిన్' : 'Admin'}
            </span>
          </Link>
        ) : (
          <Link
            href="/orders"
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              isOrders
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Clock className={`w-5 h-5 transition-transform ${isOrders ? 'scale-110' : ''}`} />
              {isOrders && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">
              {language === 'te' ? 'ఆర్డర్లు' : 'Orders'}
            </span>
          </Link>
        )}

        {/* 5. Profile / Account */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            isProfile
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <UserIcon className={`w-5 h-5 transition-transform ${isProfile ? 'scale-110' : ''}`} />
            {isProfile && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none">
            {language === 'te' ? 'ప్రొఫైల్' : 'Profile'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
