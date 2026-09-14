'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Shield,
  Truck,
  CheckCircle,
  FileText,
  Layers,
  ShoppingBag,
  Sparkles,
  PhoneCall,
  MapPin,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language, t, localizeProduct, localizeCategory } = useLanguage();

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({ limit: 6 }),
          api.getCategories(),
        ]);
        if (prodRes?.data) setFeaturedProducts(prodRes.data);
        if (catRes?.categories) setCategories(catRes.categories);
      } catch (err) {
        console.warn('Using initial fallback data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);


  return (
    <div className="flex flex-col gap-16 pb-20 bg-concrete-grid">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Background ambient glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <div className="space-y-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>{t('direct_factory_solutions')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              {language === 'te' ? (
                <>నాణ్యమైన <span className="gradient-amber">ప్రీకాస్ట్ సిమెంట్</span> శాశ్వత నిర్మాణం కొరకు</>
              ) : (
                <>Heavy-Duty <span className="gradient-amber">Precast Cement</span> For Lifelong Construction</>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              {t('hero_desc')}
            </p>

            {/* Two CTA Paths */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="/products"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>{t('hero_cta_browse')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/quote"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-semibold text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{t('hero_cta_quote')}</span>
              </Link>
            </div>

            {/* Quick Trust Highlights */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800/80 text-xs text-slate-300 max-w-md w-full">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">50K+</p>
                <p className="text-slate-400 mt-1">{language === 'te' ? 'యూనిట్లు విక్రయించబడ్డాయి' : 'Precast Units Sold'}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">53 OPC</p>
                <p className="text-slate-400 mt-1">{language === 'te' ? 'ధృవీకరించబడిన గ్రేడ్ బలం' : 'Certified Grade Strength'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dual Ordering Workflow Section ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Contractor & Builder Friendly
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Two Ways to Order
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Whether you need ready-to-dispatch standard stock or customized blueprints for special project dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Path A: Standard Catalog */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-6 space-y-4 hover:border-amber-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">1. Instant Online Checkout</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                For in-stock standard sizes (e.g. 2×2 windows, 3×7 door frames, solid bricks per 1000). Add to cart, enter your delivery address, pay securely via Razorpay (UPI/Card) or Cash on Site.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Immediate order confirmation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Real-time delivery tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Fixed factory rates guaranteed</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  Shop In-Stock Catalog →
                </Link>
              </div>
            </div>

            {/* Path B: Custom Quote */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-6 space-y-4 hover:border-amber-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">2. Request a Custom Quote</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                For non-standard window dimensions, swimming pool installations, or bulk orders of 10,000+ bricks. Prasad will review specifications and provide final discounted pricing.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Specify custom Width × Height × Depth</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Fast response within 2-4 business hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Direct phone / WhatsApp follow-up</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300"
                >
                  Submit Custom Quote Form →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Products Showcase ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider">
              {language === 'te' ? 'జనాదరణ పొందిన ప్రీకాస్ట్ ఉత్పత్తులు' : 'Popular Precast Items'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {language === 'te' ? 'ప్రత్యేక ప్రీకాస్ట్ నిర్మాణ సామగ్రి' : 'Featured Precast Construction Materials'}
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-amber-400 hover:text-amber-300"
          >
            {language === 'te' ? `అన్నీ చూడండి (${featuredProducts.length}+) →` : `View All (${featuredProducts.length}+) →`}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.slice(0, 6).map((rawProduct) => {
            const product = localizeProduct(rawProduct);
            const minPrice = product.variants?.reduce((min, v) => {
              if (!v.price) return min;
              return min === null || v.price < min ? v.price : min;
            }, null as number | null);

            return (
              <div
                key={product.id}
                className="group rounded-2xl overflow-hidden glass-panel border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                  <img
                    src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-950/80 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                    {localizeCategory(rawProduct.category)}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Variant size previews */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {product.variants?.slice(0, 3).map((v) => (
                        <span
                          key={v.id}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700/50"
                        >
                          {v.name}
                        </span>
                      ))}
                      {product.variants && product.variants.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-amber-400 font-medium">
                          +{product.variants.length - 3} {language === 'te' ? 'మరిన్ని సైజులు' : 'more sizes'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">{t('starting_at')}</p>
                      <p className="text-base font-extrabold text-amber-400">
                        {minPrice ? formatPrice(minPrice) : t('quote_on_request')}
                      </p>
                    </div>

                    <Link
                      href={`/products/${rawProduct.slug}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all"
                    >
                      {language === 'te' ? 'సైజు ఎంచుకోండి →' : 'Select Variant →'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Factory Location & Contact Section ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Verified Google Maps Location</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                    Visit Prasad Cement Work Factory Yard
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
                    Builders, engineers, contractors, and individual homeowners are always welcome to visit our yard, inspect cured precast materials, and discuss custom dimensions directly with owner Prasad.
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Prasad Cement Work (Factory & Yard)</p>
                      <p className="text-slate-300 text-xs mt-0.5">
                        Opp. Sudha Hospital, Jagtial - Velgatoor Road, Velagatoor, Dist. Jagtial, Telangana - 505526
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <PhoneCall className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-xs">
                      <p className="text-slate-400 font-medium">Direct Yard Contacts</p>
                      <div className="flex flex-wrap gap-3 mt-0.5 font-mono font-bold">
                        <a href="tel:+919912179771" className="text-amber-400 hover:underline">
                          +91 99121 79771 (Prasad)
                        </a>
                        <span className="text-slate-600">•</span>
                        <a href="mailto:armuriprasad@gmail.com" className="text-amber-400 hover:underline">
                          armuriprasad@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="https://www.google.com/maps/place/Prasad+Cement+work/@18.8437643,79.1686384,17z/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Get Driving Directions on Google Maps</span>
                </a>
                <a
                  href="https://wa.me/918919526315?text=Hello%20Prasad%20Garu%2C%20I%20am%20coming%20to%20visit%20Prasad%20Cement%20work%20yard%20in%20Velagatoor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <span>💬 WhatsApp Yard Location</span>
                </a>
              </div>
            </div>

            {/* Responsive Embedded Google Map iframe — perfectly sized and spacious across all devices */}
            <div className="lg:col-span-7 relative w-full rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-950 min-h-[440px] sm:min-h-[500px] lg:min-h-[560px] h-[480px] lg:h-full flex flex-col">
              <iframe
                title="Sri Lakshmi Penchila Narasimha Swamy Cement Work (Prasad Cement work) Official Google Maps Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3775.9753396386423!2d79.16863837550547!3d18.84376428231365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcd39451070cfc1%3A0x90cc0b6511d388bd!2sPrasad%20Cement%20work!5e0!3m2!1sen!2sin!4v1789238412071!5m2!1sen!2sin"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 w-full h-full"
              ></iframe>

              {/* Top Status Overlay Badge */}
              <div className="absolute top-4 left-4 bg-slate-950/90 border border-amber-500/40 px-3.5 py-2 rounded-2xl text-xs font-bold text-white flex items-center gap-2.5 shadow-2xl backdrop-blur-md z-10 pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-amber-400 font-extrabold">Prasad Cement Work Yard</span>
                <span className="text-slate-400 font-normal hidden sm:inline">| Velagatoor, Telangana</span>
              </div>

              {/* Bottom Quick-Action Floating Button */}
              <div className="absolute bottom-4 right-4 z-10">
                <a
                  href="https://www.google.com/maps/place/Prasad+Cement+work/@18.8437643,79.1686384,17z/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-amber-400 hover:text-amber-300 border border-amber-500/50 text-xs font-bold flex items-center gap-2 backdrop-blur-md shadow-xl transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Full Screen Map</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
