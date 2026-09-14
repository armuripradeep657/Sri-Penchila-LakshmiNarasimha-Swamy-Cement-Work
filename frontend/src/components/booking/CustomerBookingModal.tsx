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
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
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

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [txnId, setTxnId] = useState('');

  // Pricing calculations
  const unitPrice = selectedVariant?.price || 1000;
  const itemsTotal = unitPrice * quantity;
  // Local delivery free within 505526, otherwise ₹1500 estimate
  const deliveryFee = pincode.trim() === '505526' ? 0 : 150000;
  const codFee = paymentMethod === 'COD' ? 15000 : 0; // ₹150 COD verification
  const grandTotal = itemsTotal + deliveryFee + codFee;

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

    const generatedOrderNum = `ORD-${Date.now().toString().slice(-6)}`;
    const generatedTxn = `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setOrderNumber(generatedOrderNum);
    setTxnId(generatedTxn);

    // Simulated high-security gateway processing
    await new Promise((r) => setTimeout(r, 1600));

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
          colors: ['#0024d6', '#3b82f6', '#ffffff'],
        });
      }, 350);
    } catch {}
  };

  const getInvoiceData = () => ({
    orderNumber: orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
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
    grandTotal,
    deliveryAddress: {
      line1: addressLine,
      line2: landmark ? `Near ${landmark}` : undefined,
      city,
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
              {step === 1 && (language === 'te' ? 'డెలివరీ & అన్‌లోడింగ్ వివరాలు' : 'Delivery & Site Details')}
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

        {/* ─── STEP 1: DELIVERY DETAILS ─── */}
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

            {/* Site Crane Access Checkbox */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <input
                type="checkbox"
                id="craneAccess"
                checked={craneAccess}
                onChange={(e) => setCraneAccess(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="craneAccess" className="text-xs text-slate-300 cursor-pointer">
                Site has road access for hydraulic unloading truck / crane
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
                <span>Transport & Unloading ({pincode === '505526' ? 'Local Velagatoor' : 'District Delivery'}):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {deliveryFee === 0 ? 'FREE (Local)' : formatPrice(deliveryFee)}
                </span>
              </div>
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
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-amber-400" />
                      <span>Instant UPI / Card</span>
                    </span>
                    {paymentMethod === 'ONLINE' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Google Pay, PhonePe, Paytm, Cards
                  </p>
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
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-400" />
                      <span>Pay on Delivery</span>
                    </span>
                    {paymentMethod === 'COD' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Verify material at site & pay cash
                  </p>
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompletePayment}
                className="flex-1 py-3.5 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Allocating Material & Authorizing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'ONLINE'
                        ? `Pay ${formatPrice(grandTotal)} & Confirm Allotment`
                        : `Confirm Site Booking (${formatPrice(grandTotal)})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: CELEBRATION ANIMATION & DIRECT INVOICE ACTIONS ─── */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-300">
            {/* High-Tech Animated Glowing Checkmark with Concentric Waves */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-50" />
              <div className="absolute inset-2 rounded-full border-2 border-emerald-400/40 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/50 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-slate-950" />
              </div>
            </div>

            {/* Official Confirmation Notice */}
            <div className="space-y-1.5">
              <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ★ 100% QUALITY VERIFIED & RESERVED ★
              </span>
              <h3 className="text-2xl font-black text-white">
                {language === 'te' ? 'బుకింగ్ విజయవంతమైంది!' : 'Booking Allotment Successful!'}
              </h3>
              <p className="text-xs text-slate-400">
                Official Order Reference: <strong className="font-mono text-amber-400">{orderNumber}</strong>
                {txnId && <> • Txn: <span className="font-mono text-slate-300">{txnId}</span></>}
              </p>
            </div>

            {/* Official Seal Badge Preview */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center gap-4">
              <OfficialSeal size={65} rotation={-2} className="shrink-0" />
              <div className="text-left text-xs">
                <p className="font-bold text-white uppercase text-[11px]">
                  Sri Lakshmi Penchila Narasimha Swamy
                </p>
                <p className="text-[10px] text-amber-400 font-semibold">
                  Official Precast Manufacturing Seal Affixed
                </p>
                <p className="text-[10px] text-slate-400">
                  Velagatoor Factory Yard, Telangana
                </p>
              </div>
            </div>

            {/* Primary Action Buttons: View & Download Invoice */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* View Invoice */}
                <button
                  type="button"
                  onClick={handleOpenInvoice}
                  className="py-3 px-4 rounded-2xl font-black text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Official Tax Invoice</span>
                </button>

                {/* Download Invoice PDF */}
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="py-3 px-4 rounded-2xl font-black text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Invoice (PDF)</span>
                </button>
              </div>

              {/* WhatsApp Confirmation */}
              <a
                href={`https://wa.me/918919526315?text=${encodeURIComponent(
                  `Hello Sri Lakshmi Penchila Narasimha Swamy Cement Work (PRASAD CEMENT WORK)!\nI have booked ${quantity} ${product.name} (Order #${orderNumber}).\nUnloading site: ${addressLine}, ${city} - ${pincode}.\nPlease confirm dispatch timeline.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Confirm on WhatsApp with Owner Prasad (8919526315)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
