'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Flame,
  X,
  Check,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'status_report' | 'offer' | 'quality_alert';
  title: string;
  titleTe?: string;
  message: string;
  messageTe?: string;
  badge: string;
  badgeColor: 'emerald' | 'amber' | 'blue' | 'purple';
  time: string;
  isUnread: boolean;
  productSlug?: string;
  productName?: string;
  offerCode?: string;
  discountPercent?: number;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'status_report',
    title: 'Ketikelu (Door Frames) — 28-Day Curing Completed',
    titleTe: 'కేతికెలు (డోర్ ఫ్రేమ్‌లు) — 28 రోజుల క్యూరింగ్ పూర్తయింది',
    message:
      'Batch #KF-418 (4×7 ft and 3×7 ft precast door frames) completed 28-day underwater curing. Tested 38 N/mm² M35 concrete grade. Ready for direct dispatch to Velagatoor & Jagtial sites.',
    messageTe:
      'బ్యాచ్ #KF-418 డోర్ ఫ్రేమ్‌లు 28 రోజుల పూర్తి క్యూరింగ్ పూర్తి చేసుకున్నాయి. తక్షణ సైట్ డెలివరీకి అందుబాటులో ఉన్నాయి.',
    badge: 'CURING COMPLETE (DAY 28)',
    badgeColor: 'emerald',
    time: '15 mins ago',
    isUnread: true,
    productSlug: 'door-frames-ketikelu',
    productName: 'Ketikelu (Precast Door Frames)',
  },
  {
    id: 'notif-2',
    type: 'offer',
    title: 'Special Monsoon Discount: 10% Off on Door Frames',
    titleTe: 'ప్రత్యేక ఆఫర్: డోర్ ఫ్రేమ్‌లపై 10% తగ్గింపు',
    message:
      'Book 5 or more Ketikelu units today and receive an automatic 10% contractor discount with complimentary crane unloading at your site.',
    messageTe:
      '5 లేదా అంతకంటే ఎక్కువ కేతికెలు బుక్ చేసుకోండి, 10% కాంట్రాక్టర్ తగ్గింపు పొందండి.',
    badge: '10% OFF DISCOUNT',
    badgeColor: 'amber',
    time: '1 hour ago',
    isUnread: true,
    productSlug: 'door-frames-ketikelu',
    productName: 'Door Frames (Ketikelu)',
    offerCode: 'DOOR10',
    discountPercent: 10,
  },
  {
    id: 'notif-3',
    type: 'status_report',
    title: 'Gagulu (Well Rings) — Fresh 4ft Heavy Batch In Stock',
    titleTe: 'గాగులు (బావి రింగులు) — తాజా 4ft బ్యాచ్ స్టాక్ రెడీ',
    message:
      'Reinforced steel mesh 4ft × 1ft concrete well rings (Gagulu) batch #WR-902 demoulded and cured. 60+ rings currently available in Velagatoor yard.',
    messageTe:
      '4 అడుగుల బావి రింగులు (గాగులు) 60 యూనిట్లు వెల్గటూర్ యార్డులో సిద్ధంగా ఉన్నాయి.',
    badge: 'STOCK READY (60+ UNITS)',
    badgeColor: 'blue',
    time: '3 hours ago',
    isUnread: true,
    productSlug: 'well-rings-gagulu',
    productName: 'Well Rings (Gagulu)',
  },
  {
    id: 'notif-4',
    type: 'offer',
    title: 'Free Hydraulic Crane Truck Delivery (Orders > ₹15,000)',
    titleTe: 'ఉచిత క్రేన్ ట్రక్ డెలివరీ (ఆర్డర్ ₹15,000 పైన)',
    message:
      'Zero delivery charge for all agricultural and construction precast deliveries within 25 KM radius of Velagatoor, Jagtial, and Dharmapuri.',
    messageTe:
      'వెల్గటూర్ నుండి 25 కి.మీ లోపు ఉచిత క్రేన్ ట్రక్ అన్‌లోడింగ్ డెలివరీ సౌకర్యం.',
    badge: 'FREE DELIVERY PROMO',
    badgeColor: 'purple',
    time: 'Yesterday',
    isUnread: false,
    productSlug: 'well-rings-gagulu',
    productName: 'Agricultural Well Rings',
  },
  {
    id: 'notif-5',
    type: 'status_report',
    title: 'Fencing Poles — High-Tensile Wire Tested & Certified',
    titleTe: 'ఫెన్సింగ్ స్తంభాలు — హై-టెన్సైల్ వైర్ నాణ్యత సర్టిఫైడ్',
    message:
      '7ft prestressed concrete fencing poles batch #FP-114 passed load resistance testing. 4-wire high-tensile core, 100% rust-proof & termite-free.',
    messageTe:
      '7 అడుగుల ప్రీకాస్ట్ ఫెన్సింగ్ స్తంభాలు టెస్ట్ చేయబడి రెడీగా ఉన్నాయి.',
    badge: 'QUALITY TESTED',
    badgeColor: 'emerald',
    time: '2 days ago',
    isUnread: false,
    productSlug: 'fencing-poles',
    productName: 'Prestressed Fencing Poles',
  },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'reports' | 'offers'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'reports') return n.type === 'status_report';
    if (activeTab === 'offers') return n.type === 'offer';
    return true;
  });

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-700/60 hover:border-amber-500/40"
        title="Live Factory Reports & Offers"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-200 hover:text-amber-400 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950 shadow-md shadow-amber-500/50 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 sm:w-[420px] max-w-[calc(100vw-2rem)] rounded-3xl bg-slate-900/98 backdrop-blur-xl border-2 border-amber-500/40 shadow-2xl shadow-slate-950/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Factory Updates & Offers</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {unreadCount} New
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Prasad Precast Yard • Velagatoor, Jagtial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'reports'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <span>🏭 Curing Reports</span>
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'offers'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Flame className="w-3 h-3 text-red-400" />
              <span>Live Offers</span>
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/80 p-2 space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No updates in this category</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const badgeBg =
                  notif.badgeColor === 'emerald'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : notif.badgeColor === 'amber'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : notif.badgeColor === 'purple'
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30';

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                      notif.isUnread
                        ? 'bg-slate-850/90 border-amber-500/30 hover:border-amber-500/60 shadow-md'
                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${badgeBg}`}
                      >
                        {notif.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.time}
                      </span>
                    </div>

                    {/* Title */}
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {notif.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                      <span>{notif.title}</span>
                    </h5>

                    {/* Message */}
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Footer Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between">
                      {notif.offerCode ? (
                        <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                          PROMO: {notif.offerCode}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {notif.productName || 'Precast Factory Direct'}
                        </span>
                      )}

                      {notif.productSlug ? (
                        <Link
                          href={`/products/${notif.productSlug}`}
                          onClick={() => {
                            setIsOpen(false);
                            markAsRead(notif.id);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                        >
                          <span>See Product Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href="/products"
                          onClick={() => {
                            setIsOpen(false);
                            markAsRead(notif.id);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                        >
                          <span>Browse Catalog</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Yard Contact Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-between">
            <span>Direct Dispatch: <strong>9912179771</strong></span>
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="text-amber-400 hover:text-white font-bold"
            >
              All Products →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
