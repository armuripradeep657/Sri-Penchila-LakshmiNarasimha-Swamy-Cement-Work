'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Download,
  FileText,
  Phone,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Building2,
  ShieldCheck,
  Clock,
  QrCode,
  Banknote,
  Send,
  Users,
  Home,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import OfficialSeal from '@/components/invoice/OfficialSeal';

interface CustomerBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant: ProductVariant | null;
  quantity: number;
  onViewInvoice: (invoiceData: {
    orderNumber: string;
    items: any[];
    totalAmount: number;
    deliveryFee: number;
    workerPlacementFee?: number;
    grandTotal: number;
    deliveryAddress: any;
    paymentMethod: 'ONLINE' | 'COD';
  }) => void;
}

export default function CustomerBookingModal({
  isOpen,
  onClose,
  product,
  selectedVariant,
  quantity,
  onViewInvoice,
}: CustomerBookingModalProps) {
  const { user } = useAuth();
  const { language } = useLanguage();

  // Multi-step: 1 = Delivery, 2 = Payment, 3 = Celebration / Complete
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Delivery Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Velagatoor');
  const [pincode, setPincode] = useState('505526');
  const [craneAccess, setCraneAccess] = useState(true);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryError, setDeliveryError] = useState('');

  // Distance & Village Auto Rent state
  const [selectedZoneKey, setSelectedZoneKey] = useState<string>('local');
  const [workerPlacement, setWorkerPlacement] = useState<boolean>(false);

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [txnId, setTxnId] = useState('');

  // ─── Distance & Village Delivery Tiers ──────────────────────────────────────
  const DELIVERY_TIERS: Record<string, { label: string; fee: number; desc: string }> = {
    local: {
      label: 'Local (Within Town 0 - 1.5 km)',
      fee: 15000, // ₹150 in paisa
      desc: 'Velagatoor town limits & immediate yard (₹150 flat)',
    },
    '3km': {
      label: 'Up to 3 km (Velagatoor Outskirts / Gopalpur)',
      fee: 25000, // ₹250 in paisa
      desc: 'Up to 3 km yard auto delivery (₹250 flat)',
    },
    kishanraopet: {
      label: 'Kishanraopet / Padkal (3.5 - 5 km)',
      fee: 35000, // ₹350 in paisa
      desc: 'Village Auto Rent (₹350)',
    },
    cheggam: {
      label: 'Cheggam / Saka / Pathagudoor (5 - 7 km)',
      fee: 45000, // ₹450 in paisa
      desc: 'Village Auto Rent (₹450)',
    },
    dharmapuri: {
      label: 'Dharmapuri Mandal (8 - 12 km)',
      fee: 65000, // ₹650 in paisa
      desc: 'Mandal Auto / Tractor Trolley Rent (₹650)',
    },
    jagtial: {
      label: 'Jagtial Town / Commercial Sites (15 - 20 km)',
      fee: 85000, // ₹850 in paisa
      desc: 'Highway Auto / Mini Truck Freight (₹850)',
    },
  };

  // Pricing calculations
  const unitPrice = selectedVariant?.price || 100000;
  const itemsTotal = unitPrice * quantity;
  const deliveryFee = DELIVERY_TIERS[selectedZoneKey]?.fee || 15000;
  const workerPlacementFee = workerPlacement ? quantity * 4000 : 0; // ₹40 per item in paisa
  const codFee = paymentMethod === 'COD' ? 15000 : 0; // ₹150 COD fee
  const grandTotal = itemsTotal + deliveryFee + workerPlacementFee + codFee;

  useEffect(() => {
    if (user) {
      if (!fullName && user.name) setFullName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Step 1 -> Step 2 validation
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setDeliveryError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setDeliveryError(language === 'te' ? 'దయచేసి సరైన 10-అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please provide a valid 10-digit phone number');
      return;
    }

    if (!addressLine.trim()) {
      setDeliveryError(language === 'te' ? 'దయచేసి అన్‌లోడింగ్ సైట్ చిరునామా నమోదు చేయండి' : 'Please provide the construction site unloading address');
      return;
    }

    if (!pincode.trim() || pincode.trim().length !== 6) {
      setDeliveryError(language === 'te' ? 'దయచేసి సరైన 6-అంకెల పిన్‌కోడ్ నమోదు చేయండి' : 'Please enter a valid 6-digit delivery pincode');
      return;
    }

    setStep(2);
  };

  // Step 2 -> Step 3: Complete Payment & Trigger Celebration
  const handleCompletePayment = async () => {
    setIsProcessing(true);

    const generatedOrderNum = `PCP-${Math.floor(10000 + Math.random() * 90000)}`;
    const generatedTxn = `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setOrderNumber(generatedOrderNum);
    setTxnId(generatedTxn);

    // Save order into system store so Admin Orders & Dashboard reflect it instantly
    try {
      await api.placeOrder({
        orderNumber: generatedOrderNum,
        totalAmount: itemsTotal,
        deliveryFee,
        workerPlacementFee,
        workerPlacement,
        quantity,
        productName: product.name,
        paymentMethod,
        deliveryAddress: {
          fullName,
          phone,
          line1: addressLine,
          line2: landmark ? `Near ${landmark}` : undefined,
          city: `${city} (${DELIVERY_TIERS[selectedZoneKey]?.label?.split('(')[0] || 'Local'})`,
          state: 'Telangana',
          pincode,
        },
        items: [
          {
            id: `item_${Date.now()}`,
            quantity,
            unitPrice,
            totalPrice: itemsTotal,
            variant: {
              id: selectedVariant?.id || 'v_default',
              name: selectedVariant?.name || 'Standard Specification',
              width: selectedVariant?.width || null,
              height: selectedVariant?.height || null,
              dimensionUnit: selectedVariant?.dimensionUnit || 'ft',
              product: { name: product.name },
            },
          },
        ],
        notes: [
          `Distance Tier: ${DELIVERY_TIERS[selectedZoneKey]?.label}`,
          workerPlacement ? `Worker Home Placement: ₹${workerPlacementFee / 100} (${quantity} items × ₹40)` : '',
          deliveryNotes || '',
        ].filter(Boolean).join(' | '),
      });
    } catch (err) {
      console.warn('Booking persist notice:', err);
    }

    // Simulated high-security gateway processing
    await new Promise((r) => setTimeout(r, 1200));

    setIsProcessing(false);
    setStep(3);

    // Multi-burst celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0024d6', '#f59e0b', '#10b981', '#3b82f6', '#ffffff'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f59e0b', '#10b981', '#ffffff'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0024d6', '#10b981', '#f59e0b'],
        });
      }, 300);
    } catch (e) {}
  };

  const getInvoiceData = () => ({
    orderNumber,
    items: [
      {
        name: product.name,
        variantName: selectedVariant?.name || 'Standard Precast Specification',
        quantity,
        unitPrice,
        totalPrice: itemsTotal,
        dimensions: selectedVariant?.width
          ? `${selectedVariant.width} × ${selectedVariant.height} ${selectedVariant.dimensionUnit || 'ft'}`
          : undefined,
      },
    ],
    totalAmount: itemsTotal,
    deliveryFee,
    workerPlacementFee,
    grandTotal,
    deliveryAddress: {
      fullName,
      phone,
      line1: addressLine,
      line2: landmark ? `Near ${landmark}` : undefined,
      city: `${city} (${DELIVERY_TIERS[selectedZoneKey]?.label?.split('(')[0] || 'Local'})`,
      state: 'Telangana',
      pincode,
    },
    paymentMethod,
  });

  const handleOpenInvoice = () => {
    onViewInvoice(getInvoiceData());
  };

  const handleDownloadInvoice = () => {
    onViewInvoice(getInvoiceData());
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-slate-700/80 shadow-2xl overflow-hidden my-6">
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-5 text-slate-950 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950/20 px-2 py-0.5 rounded-full inline-block mb-1">
              {step === 1 && 'STEP 1 OF 3 • SITE DELIVERY'}
              {step === 2 && 'STEP 2 OF 3 • SECURE PAYMENT'}
              {step === 3 && 'STEP 3 OF 3 • BOOKING CONFIRMED'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-tight">
              {step === 1 && (language === 'te' ? 'డెలివరీ & అన్‌లోడింగ్ వివరాలు' : 'Delivery & Distance Details')}
              {step === 2 && (language === 'te' ? 'చెల్లింపు & బుకింగ్' : 'Payment & Order Allocation')}
              {step === 3 && (language === 'te' ? 'ఆర్డర్ విజయవంతంగా పూర్తయింది!' : 'Allotment Confirmed!')}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── STEP 1: DELIVERY & DISTANCE DETAILS ─── */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="p-6 sm:p-8 space-y-4">
            {/* Selected Item Mini-Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <p className="font-extrabold text-white">{product.name}</p>
                <p className="text-slate-400">
                  {selectedVariant?.name} • Qty: <strong className="text-amber-400">{quantity} {product.unitOfSale}</strong>
                </p>
              </div>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {formatPrice(itemsTotal)}
              </span>
            </div>

            {deliveryError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {deliveryError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9912179771"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Construction Site Unloading Address *</span>
              </label>
              <textarea
                required
                rows={2}
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Plot/Survey No, Street Name, Near School or Main Road"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Landmark */}
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Opp. Temple"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* City */}
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Mandal / City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Velagatoor"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="505526"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* ─── Distance & Village Delivery Selection ─── */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Delivery Distance & Village Auto Rent *</span>
                </label>
                <span className="font-mono text-xs font-black text-amber-400">
                  {formatPrice(deliveryFee)}
                </span>
              </div>

              <select
                value={selectedZoneKey}
                onChange={(e) => setSelectedZoneKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="local">Local (Within Town 0 to 1.5 km - Velagatoor) — ₹150</option>
                <option value="3km">Up to 3 km (Velagatoor Outskirts / Gopalpur) — ₹250</option>
                <option value="kishanraopet">Kishanraopet / Padkal Village (3.5 - 5 km) — ₹350 (Auto Rent)</option>
                <option value="cheggam">Cheggam / Saka Village (5 - 7 km) — ₹450 (Auto Rent)</option>
                <option value="dharmapuri">Dharmapuri Mandal (8 - 12 km) — ₹650 (Auto Rent)</option>
                <option value="jagtial">Jagtial Town / Commercial Sites (15 - 20 km) — ₹850 (Truck Freight)</option>
              </select>
              <p className="text-[10px] text-slate-400">
                {DELIVERY_TIERS[selectedZoneKey]?.desc || 'Yard auto rent based on distance'}
              </p>
            </div>

            {/* ─── Worker Home Placement Option (+₹40 per item) ─── */}
            <div
              onClick={() => setWorkerPlacement(!workerPlacement)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                workerPlacement
                  ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="workerPlacement"
                  checked={workerPlacement}
                  onChange={(e) => setWorkerPlacement(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-amber-400" />
                      <span>Deliver to Home / Yard Workers Placement</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-xs">
                      {workerPlacement ? `+${formatPrice(workerPlacementFee)}` : '+₹40/item'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Factory workers will physically lift, carry, and place precast items safely near your home or site (Total: {quantity} items × ₹40 = <strong>₹{quantity * 40}</strong>).
                  </p>
                </div>
              </div>
            </div>

            {/* Site Crane Access Checkbox */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <input
                type="checkbox"
                id="craneAccess"
                checked={craneAccess}
                onChange={(e) => setCraneAccess(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <label htmlFor="craneAccess" className="text-xs text-slate-300 cursor-pointer">
                Site has road clearance for hydraulic auto trolley / truck delivery
              </label>
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'te' ? 'చెల్లింపు విభాగానికి వెళ్ళండి →' : 'Proceed to Payment →'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ─── STEP 2: PAYMENT PAGE ─── */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-5">
            {/* Delivery Recap Badge */}
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unloading Destination:</span>
                </p>
                <p className="text-slate-300">
                  {addressLine}, {city} - {pincode}
                </p>
                <p className="text-[11px] text-amber-400 font-medium">
                  Zone: {DELIVERY_TIERS[selectedZoneKey]?.label}
                </p>
                {workerPlacement && (
                  <p className="text-[11px] text-emerald-400 font-medium">
                    ✓ Worker home placement included (+₹{workerPlacementFee / 100})
                  </p>
                )}
                <p className="text-[11px] text-slate-400">
                  Contact: {fullName} ({phone})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Material Cost ({quantity} × {formatPrice(unitPrice)}):</span>
                <span className="font-mono font-bold text-white">{formatPrice(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Distance Auto Delivery ({DELIVERY_TIERS[selectedZoneKey]?.label?.split('(')[0]?.trim()}):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatPrice(deliveryFee)}
                </span>
              </div>
              {workerPlacement && (
                <div className="flex justify-between text-amber-300">
                  <span>Worker Home Placement ({quantity} items × ₹40):</span>
                  <span className="font-mono font-bold">{formatPrice(workerPlacementFee)}</span>
                </div>
              )}
              {paymentMethod === 'COD' && (
                <div className="flex justify-between text-amber-400">
                  <span>COD Processing Fee:</span>
                  <span className="font-mono font-bold">{formatPrice(codFee)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-black text-sm text-white">
                <span>Grand Total:</span>
                <span className="font-mono text-xl text-amber-400">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Select Payment Mode
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Instant Online UPI / Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'ONLINE'
                      ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">Instant UPI / QR / Card</span>
                  </div>
                  <p className="text-[10px] text-slate-400">PhonePe, Google Pay, Paytm, NetBanking</p>
                  <span className="inline-block mt-2 text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ★ Zero Surcharge
                  </span>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Pay cash directly when truck arrives at your site</p>
                  <span className="inline-block mt-2 text-[9px] font-medium text-amber-400">
                    +₹150 verification fee
                  </span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompletePayment}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Allocating Factory Stock & Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>
                      {paymentMethod === 'COD'
                        ? `Confirm Cash on Delivery Booking (${formatPrice(grandTotal)})`
                        : `Pay & Reserve Precast Stock Now (${formatPrice(grandTotal)})`}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-white"
              >
                ← Back to Delivery Details
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: CELEBRATION & INVOICE DOWNLOAD ─── */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
            {/* Glowing Allotment Seal */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-slate-950" />
            </div>

            {/* Official Confirmation Badge */}
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ★ OFFICIAL PRECAST ALLOTMENT RESERVED ★
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Precast Units Booked Successfully!
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Order Allotment No: <strong className="text-amber-400">{orderNumber}</strong>
              </p>
            </div>

            {/* Quality and Dispatch Timeline */}
            <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs text-left">
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Velagatoor Yard Stock Allocated: {quantity} {product.unitOfSale}s of {product.name}</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>53-Grade OPC Concrete Quality Inspected & Cured</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Delivery: {DELIVERY_TIERS[selectedZoneKey]?.label} ({formatPrice(deliveryFee)})</span>
              </div>
              {workerPlacement && (
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Yard Workers Home Placement Confirmed ({quantity} items × ₹40 = ₹{quantity * 40})</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-amber-400">
                <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                <span>Auto / Truck Delivery Dispatched to: {addressLine}, {city}</span>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="text-white font-bold">{fullName} ({phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Address:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{addressLine}, {city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="text-emerald-400 font-bold">{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Instant UPI / Online'}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between text-sm">
                <span className="text-slate-300 font-bold">Total Payable:</span>
                <span className="text-amber-400 font-black">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* ─── INVOICE ACTIONS WITH OFFICIAL SEAL ─── */}
            <div className="space-y-2.5 pt-2">
              {/* View Official Tax Invoice */}
              <button
                type="button"
                onClick={handleOpenInvoice}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-extrabold text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border-2 border-amber-500/50 hover:border-amber-400 transition-all shadow-lg cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>View Official Tax Invoice (With Blue Rubber Stamp Seal)</span>
              </button>

              {/* Download Invoice PDF */}
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-300" />
                <span>Download / Print Official Tax Invoice (PDF)</span>
              </button>

              {/* Confirm on WhatsApp */}
              <a
                href={`https://wa.me/918919526315?text=${encodeURIComponent(
                  `Namaskaram Sri Lakshmi Penchila Narasimha Swamy Cement Work (PRASAD CEMENT WORK)! I just completed booking order #${orderNumber} for ${quantity} units of "${product.name}". Delivery location: ${addressLine}, ${city}. Please confirm dispatch schedule.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Confirm Delivery on WhatsApp (8919526315)</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-white"
              >
                Close & Browse More Precast Materials
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
