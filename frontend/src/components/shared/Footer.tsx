'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, MapPin, Phone, Mail, Clock, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import Logo from '@/components/shared/Logo';

export default function Footer() {
  const { language, t } = useLanguage();
  const { email: storeEmail, phone: storePhone, cleanPhone } = useStoreSettings();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      {/* Trust Badges */}
      <div className="border-b border-slate-900 py-8 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {language === 'te' ? '53-గ్రేడ్ OPC అధిక బలం' : '53-Grade OPC Strength'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'te' ? 'ప్రయోగశాలలో పరీక్షించబడింది' : 'Laboratory tested & steam-cured'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {language === 'te' ? 'నేరుగా సైట్‌కు డెలివరీ' : 'Direct Site Delivery'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'te' ? 'క్రేన్ మరియు అన్‌లోడింగ్ సౌకర్యం' : 'Crane & unloading support available'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {language === 'te' ? 'కస్టమ్ కొలతలు' : 'Custom Dimensions'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'te' ? 'ఆర్డర్ మేరకు ప్రత్యేక సైజులు' : 'Custom cast for doors, windows & pools'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {language === 'te' ? 'ఫ్యాక్టరీ డైరెక్ట్ ధరలు' : 'Factory Direct Pricing'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'te' ? 'దళారులు లేకుండా హోల్‌సేల్ రేట్లు' : 'Zero middleman contractor pricing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="space-y-4">
          <Logo size="md" />
          <p className="text-xs leading-relaxed text-slate-400">
            {language === 'te'
              ? 'తెలంగాణలోని జగిత్యాల మరియు పరిసర ప్రాంతాలకు నాణ్యమైన ప్రీకాస్ట్ కాంక్రీట్ కిటికీలు, దర్వాజాలు, సాలిడ్ ఇటుకలు మరియు స్విమ్మింగ్ పూల్స్ తయారీదారులు.'
              : 'Leading manufacturer and supplier of heavy-duty precast concrete products, cement window frames, darwaja door frames, high-density bricks, and modular concrete pools in Telangana.'}
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● {language === 'te' ? 'ఫ్యాక్టరీ యార్డ్ సందర్శనలు తెరిచి ఉన్నాయి' : 'Factory Open for Site Visits'}
            </span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            {language === 'te' ? 'ఉత్పత్తుల వర్గాలు' : 'Product Categories'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/products?category=WINDOW" className="hover:text-amber-400 transition-colors">
                {language === 'te' ? 'సిమెంట్ కిటికీలు (గ్రిల్ లేదా సాధారణ)' : 'Cement Windows (With / Without Grill)'}
              </Link>
            </li>
            <li>
              <Link href="/products?category=WINDOW&subType=Ventilation" className="hover:text-amber-400 transition-colors">
                {language === 'te' ? 'వెంటిలేషన్ & బాత్‌రూమ్ జాలీ కిటికీలు' : 'Ventilation & Bathroom Jali Windows'}
              </Link>
            </li>
            <li>
              <Link href="/products?category=DOOR" className="hover:text-amber-400 transition-colors">
                {language === 'te' ? 'సింగిల్ & డబుల్ దర్వాజా ఫ్రేములు' : 'Single & Double Door Frames (Darwajas)'}
              </Link>
            </li>
            <li>
              <Link href="/products?category=BRICK" className="hover:text-amber-400 transition-colors">
                {language === 'te' ? 'సాలిడ్ & హాలో సిమెంట్ ఇటుకలు' : 'Solid & Hollow Cement Bricks (Per 1000)'}
              </Link>
            </li>
            <li>
              <Link href="/products?category=POOL" className="hover:text-amber-400 transition-colors">
                {language === 'te' ? 'ప్రీకాస్ట్ గార్డెన్ & స్విమ్మింగ్ పూల్స్' : 'Precast Garden & Swimming Pools'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            {language === 'te' ? 'కస్టమర్ సేవలు' : 'Customer Services'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/quote" className="hover:text-amber-400 transition-colors font-medium text-amber-400/90">
                {language === 'te' ? 'ప్రత్యేక కొలతల కొటేషన్ కోరండి' : 'Request Custom Dimensions Quote'}
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-amber-400 transition-colors">
                {language === 'te' ? 'ఆర్డర్ ట్రాకింగ్' : 'Track Existing Order'}
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-amber-400 transition-colors">
                {language === 'te' ? 'షాపింగ్ కార్ట్' : 'Shopping Cart'}
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-amber-400 transition-colors">
                {language === 'te' ? 'కాంట్రాక్టర్ లాగిన్' : 'Contractor Mobile Login'}
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-amber-400 transition-colors text-slate-500">
                {language === 'te' ? 'అడ్మిన్ మేనేజ్‌మెంట్ పోర్టల్' : 'Admin Management Portal'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Factory / Yard Location */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
            {t('factory_address_title')}
          </h4>
          <div className="flex items-start gap-2.5 text-xs">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{t('factory_address')}</p>
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <a href={`tel:+91${cleanPhone}`} className="hover:text-white transition-colors font-semibold text-amber-400">
                +91 {cleanPhone} ({language === 'te' ? 'ప్రసాద్' : 'Yard Contract / Prasad'})
              </a>
              <a href="tel:+918919526315" className="hover:text-white transition-colors text-slate-400">
                +91 89195 26315 (Support)
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <a href={`mailto:${storeEmail}`} className="hover:text-white transition-colors text-slate-300">
              {storeEmail || 'armuriprasad@gmail.com'}
            </a>
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t('factory_hours')}</span>
          </div>

          <div className="pt-2">
            <a
              href="https://www.google.com/maps/place/Prasad+Cement+work/@18.8437643,79.1686384,17z/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              {language === 'te' ? 'గూగుల్ మ్యాప్స్‌లో ప్రసాద్ సిమెంట్ వర్క్ తెరవండి →' : 'Open Prasad Cement work on Google Maps →'}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {language === 'te' ? 'శ్రీ లక్ష్మీ పెంచల నరసింహ స్వామి సిమెంట్ వర్క్ (ప్రసాద్ సిమెంట్ వర్క్). సర్వ హక్కులు ప్రత్యేకించబడ్డాయి.' : 'Sri Lakshmi Penchila Narasimha Swamy Cement Work (PRASAD CEMENT WORK). All Rights Reserved.'}</p>
      </div>
    </footer>
  );
}

