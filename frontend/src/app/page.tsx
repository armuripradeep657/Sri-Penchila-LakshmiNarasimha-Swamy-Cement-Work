'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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

  const categoryCards = [
    {
      id: 'WINDOW',
      title: language === 'te' ? 'సిమెంట్ కిటికీలు' : 'Cement Windows',
      subtitle: language === 'te' ? 'స్టాండర్డ్ & వెంటిలేషన్ జాలీ' : 'Standard & Ventilation Jali',
      desc: language === 'te'
        ? 'ఇనుప గ్రిల్స్‌తో లేదా గ్రిల్స్ లేకుండా లభించే నాణ్యమైన ప్రీకాస్ట్ సిమెంట్ కిటికీ ఫ్రేములు. 50+ ఏళ్ల మన్నిక.'
        : 'Precision precast concrete window frames with optional iron grills. Weatherproof, termite-proof & maintenance-free for 50+ years.',
      badge: language === 'te' ? '₹550 నుండి' : 'From ₹550',
      image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
      href: '/products?category=WINDOW',
    },
    {
      id: 'DOOR',
      title: language === 'te' ? 'సిమెంట్ దర్వాజాలు (తలుపులు)' : 'Cement Doors (Darwajas)',
      subtitle: language === 'te' ? 'సింగిల్ & డబుల్ దర్వాజా ఫ్రేములు' : 'Single & Double Door Frames',
      desc: language === 'te'
        ? 'ప్రధాన ద్వారాలు, గదులు మరియు గేట్ల కొరకు తయారుచేసిన దృఢమైన ప్రీకాస్ట్ సిమెంట్ దర్వాజా ఫ్రేములు.'
        : 'Heavy-duty precast door frames engineered for main entrance gates, residential rooms, and commercial structures.',
      badge: language === 'te' ? '₹2,500 నుండి' : 'From ₹2,500',
      image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
      href: '/products?category=DOOR',
    },
    {
      id: 'BRICK',
      title: language === 'te' ? 'సిమెంట్ ఇటుకలు' : 'Cement Bricks',
      subtitle: language === 'te' ? 'సాలిడ్, హాలో & ఫ్లై యాష్' : 'Solid, Hollow & Fly Ash',
      desc: language === 'te'
        ? '53-గ్రేడ్ ఓపిసి సిమెంట్‌తో తయారైన అధిక బలం గల ఇటుకలు. ఒక్కో యూనిట్ లేదా 1,000 ఇటుకల లాట్‌గా లభించును.'
        : 'High compressive strength bricks manufactured with 53-grade OPC cement. Sold per piece or in bulk lots of 1,000.',
      badge: language === 'te' ? '₹6 / ఒక్కోటి' : 'From ₹6 / unit',
      image: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
      href: '/products?category=BRICK',
    },
    {
      id: 'POOL',
      title: language === 'te' ? 'ప్రీకాస్ట్ సిమెంట్ పూల్స్' : 'Precast Cement Pools',
      subtitle: language === 'te' ? 'గార్డెన్ పూల్స్ & స్విమ్మింగ్ ట్యాంకులు' : 'Garden Pools & Swimming Units',
      desc: language === 'te'
        ? 'ఫామ్‌హౌస్‌లు, విల్లాలు మరియు గార్డెన్స్ కొరకు మోడ్యులర్ ప్రీకాస్ట్ కాంక్రీట్ పూల్ బేసిన్లు.'
        : 'Modular precast concrete pool basins for residential landscape gardens, koi fish ponds, farmhouses & villas.',
      badge: language === 'te' ? 'కస్టమ్ సైజులు' : 'Custom Sizes',
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      href: '/products?category=POOL',
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-20 bg-concrete-grid">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Background ambient glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>{t('hero_cta_browse')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/quote"
                  className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>{t('hero_cta_quote')}</span>
                </Link>
              </div>
              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 text-xs text-slate-300">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-amber-400">50K+</p>
                  <p className="text-slate-400">{language === 'te' ? 'యూనిట్లు విక్రయించబడ్డాయి' : 'Precast Units Sold'}</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-amber-400">53 OPC</p>
                  <p className="text-slate-400">{language === 'te' ? 'ధృవీకరించబడిన గ్రేడ్ బలం' : 'Certified Grade Strength'}</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-amber-400">{language === 'te' ? 'నేరుగా' : 'Direct'}</p>
                  <p className="text-slate-400">{language === 'te' ? 'సైట్ ట్రక్ రవాణా' : 'Site Truck Delivery'}</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl p-2 bg-gradient-to-b from-amber-500/20 via-slate-800/40 to-slate-900 border border-slate-700/60 shadow-2xl overflow-hidden group">
                <div className="relative h-96 w-full rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80"
                    alt="Prasad Cement Window Frames"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                      Featured Precast Frame
                    </span>
                    <h3 className="text-xl font-bold text-white">Standard Cement Window with Grill</h3>
                    <p className="text-xs text-slate-300">
                      Vibrated casting with high durability. Ready for rapid installation in masonry openings.
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-amber-400 font-extrabold text-lg">From ₹850</span>
                      <Link
                        href="/products/standard-cement-window"
                        className="text-xs font-semibold text-white bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                      >
                        View Sizes →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Categories Grid ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider">
              Catalog Navigation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Explore Product Categories
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md mt-2 md:mt-0">
            Every product category comes in multiple width × height variants, plus custom sizing options upon request.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryCards.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative rounded-2xl overflow-hidden glass-panel border border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                  {cat.badge}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-slate-900/60">
                <div>
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    {cat.subtitle}
                  </p>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Browse Sizes & Options</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
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
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Factory & Curing Yard
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Visit Our Manufacturing Facility in Velagatoor, Jagtial
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Builders, engineers, and individual property owners are always welcome to visit our factory yard, inspect finished product strength, and discuss custom precast specifications with Prasad directly.
              </p>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">
                    Jagtial - Velgatoor Road, Opposite to Sudha Hospital, Velagatoor, Velagatoor Mandal, Jagtial District, Telangana - 505526
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-5 h-5 text-amber-400 shrink-0" />
                  <a href="tel:+919912179771" className="text-amber-400 font-semibold hover:underline">
                    +91 99121 79771 (Prasad)
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="https://maps.google.com/?q=Velagatoor+Jagtial+Telangana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Open in Google Maps</span>
                </a>
                <a
                  href="https://wa.me/919912179771?text=Hello%20Prasad%2C%20I%20would%20like%20to%20visit%20the%20yard%20in%20Velagatoor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-all"
                >
                  <span>Chat on WhatsApp (+91 99121 79771)</span>
                </a>
              </div>
            </div>

            {/* Embedded interactive Google Map placeholder with visual frame */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl h-80 bg-slate-950">
              <iframe
                title="Prasad Cement Products Factory Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30347.16!2d79.1!3d18.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bccd54972e68041%3A0xb36384a511874ea9!2sVelgatur%2C%20Telangana%20505526!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Velagatoor Manufacturing Yard (Jagtial Dist)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
