'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  FileText,
  User as UserIcon,
  Menu,
  X,
  ShieldAlert,
  Phone,
  Layers,
  MapPin,
  Settings,
  Crown,
  Edit3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Globe } from 'lucide-react';

import Logo from '@/components/shared/Logo';
import NotificationCenter from '@/components/notifications/NotificationCenter';

export default function Header() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { phone: storePhone, cleanPhone } = useStoreSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = isAdmin
    ? [
        { name: t('nav_home'), href: '/' },
        { name: t('nav_products'), href: '/products' },
        { name: t('nav_admin'), href: '/admin' },
      ]
    : [
        { name: t('nav_home'), href: '/' },
        { name: t('nav_products'), href: '/products' },
        { name: t('nav_quote'), href: '/quote' },
      ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href.includes('category=') && pathname.includes(link.href.split('?')[1]));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-amber-400 bg-amber-500/10 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons & Language Switcher */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Language Switcher Pill — hidden on mobile, shown in mobile drawer instead */}
            <div className="hidden md:flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="English"
              >
                ENG
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'te'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="తెలుగు"
              >
                తెలుగు
              </button>
            </div>

            {/* Request Quote Button (For Customers) */}
            {!isAdmin && (
              <Link
                href="/quote"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t('nav_quote')}</span>
              </Link>
            )}

            {/* Admin Fast Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t('nav_admin_ops')}</span>
              </Link>
            )}

            {/* Cart Icon */}
            {!isAdmin ? (
              <Link
                href="/cart"
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] h-5 w-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
            ) : null}

            {/* Notification Center (Live Status Reports & Offers) */}
            <NotificationCenter />

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 p-1.5 rounded-xl text-sm font-medium transition-colors border ${
                    isAdmin
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-slate-700/60 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {isAdmin ? '👑' : (user.name ? user.name[0].toUpperCase() : 'U')}
                  </div>
                  <span className="hidden sm:inline-block max-w-[110px] truncate text-xs font-semibold">
                    {user.name || user.phone}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {isAdmin ? 'Owner Account' : 'Customer Account'}
                      </p>
                      <p className="text-sm font-bold text-white truncate">{user.name || user.phone}</p>
                      {user.email && (
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      )}
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-extrabold rounded-md ${
                        isAdmin
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {isAdmin ? 'ADMINISTRATOR (PRASAD)' : 'CUSTOMER'}
                      </span>
                    </div>

                    {/* Common link: Edit Profile */}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <span>{t('nav_edit_profile')}</span>
                    </Link>

                    {isAdmin ? (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-slate-800"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>{t('nav_admin')}</span>
                        </Link>
                        <Link
                          href="/admin/products"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <Layers className="w-4 h-4" />
                          <span>{language === 'te' ? 'ఉత్పత్తులు & స్టాక్ నిర్వహణ' : 'Manage Products & Stock'}</span>
                        </Link>
                        <Link
                          href="/admin/orders"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{language === 'te' ? 'ఆర్డర్లు డిస్పాచ్' : 'Fulfill Orders'}</span>
                        </Link>
                        <Link
                          href="/admin/quotes"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{language === 'te' ? 'కస్టమర్ కోట్స్ ధరలు' : 'Price Customer Quotes'}</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{language === 'te' ? 'నా ఆర్డర్లు' : 'Order History'}</span>
                        </Link>
                        <Link
                          href="/quote"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{language === 'te' ? 'నా కోట్ అభ్యర్థనలు' : 'My Quote Requests'}</span>
                        </Link>
                        <Link
                          href="/cart"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{t('nav_cart')} ({cart.totalItems})</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 font-medium"
                    >
                      {t('nav_logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t('nav_login')}</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2">
          {isAdmin && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400">👑 Logged in as Owner (Prasad)</span>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] text-white underline font-semibold"
              >
                Edit Profile
              </Link>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-900"
            >
              {link.name}
            </Link>
          ))}

          {isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-amber-400 bg-amber-500/10"
            >
              ⚙️ Admin Operations Dashboard
            </Link>
          ) : (
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-300 hover:text-amber-400"
            >
              📦 My Orders & Tracking
            </Link>
          )}

          {/* Language Switcher — placed below navigation items on mobile */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>{t('lang_toggle_label')} / Language</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'en' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'te' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                తెలుగు
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <p>Jagtial - Velgatoor Road, Opp. Sudha Hospital, Velagatoor (Mandal), Jagtial Dist - 505526</p>
            <p className="text-amber-400 font-medium">
              Direct Phone: <a href={`tel:+91${cleanPhone}`} className="hover:underline">+91 {cleanPhone}</a>
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
