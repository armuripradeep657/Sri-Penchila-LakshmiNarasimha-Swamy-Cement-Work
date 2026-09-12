'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Send,
  CheckCircle2,
  Sparkles,
  Phone,
  MessageCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';

function QuoteFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const preselectedProductId = searchParams.get('productId') || '';
  const preselectedVariantId = searchParams.get('variantId') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId);
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [customDepth, setCustomDepth] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  const [deliveryPincode, setDeliveryPincode] = useState<string>('');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.getProducts({ limit: 50 });
        if (res?.data) {
          setProducts(res.data);
          if (!selectedProductId && res.data.length > 0) {
            setSelectedProductId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load products for quote form:', err);
      }
    }
    loadProducts();
  }, [selectedProductId]);

  useEffect(() => {
    if (user?.phone && !phone) {
      setPhone(user.phone);
    }
  }, [user, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      // Store draft in localStorage and prompt login
      localStorage.setItem(
        'pcp_quote_draft',
        JSON.stringify({
          productId: selectedProductId,
          variantId: preselectedVariantId,
          customWidth: customWidth ? parseFloat(customWidth) : undefined,
          customHeight: customHeight ? parseFloat(customHeight) : undefined,
          customDepth: customDepth ? parseFloat(customDepth) : undefined,
          quantity,
          deliveryLocation,
          deliveryPincode,
          phone,
          notes,
        })
      );
      router.push('/login?redirect=/quote');
      return;
    }

    if (!phone || phone.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number');
      return;
    }

    if (!deliveryLocation) {
      setErrorMessage('Please provide your construction delivery site location');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitQuote({
        productId: selectedProductId,
        variantId: preselectedVariantId || undefined,
        customWidth: customWidth ? parseFloat(customWidth) : undefined,
        customHeight: customHeight ? parseFloat(customHeight) : undefined,
        customDepth: customDepth ? parseFloat(customDepth) : undefined,
        quantity: Number(quantity),
        deliveryLocation,
        deliveryPincode,
        phone,
        notes,
      });

      if (res?.quote) {
        setSubmittedQuote(res.quote);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  if (submittedQuote) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
        <div className="rounded-3xl glass-panel border border-emerald-500/40 p-8 sm:p-10 text-center space-y-6 bg-slate-900/80">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Quote Request Submitted!
            </h1>
            <p className="text-sm text-slate-300">
              Reference #{submittedQuote.id.slice(-8).toUpperCase()}
            </p>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Prasad has received your specifications for <strong>{submittedQuote.product?.name}</strong>. We are calculating manufacturing molds and direct truck freight. You will receive an SMS and pricing update shortly!
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/918919526315?text=${encodeURIComponent(
                `Hello Sri Penchila LakshmiNarasimha Swamy Cement Work, I just submitted Quote Request #${submittedQuote.id.slice(-8).toUpperCase()} for ${submittedQuote.product?.name}. Can we discuss pricing?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Follow-up on WhatsApp with Sri Penchila LakshmiNarasimha Swamy Cement Work</span>
            </a>

            <Link
              href="/orders"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
            >
              <span>View In Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FACTORY CUSTOM FABRICATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Request a Custom Size or Bulk Quote
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          For non-standard window frames, precast pool installations, or bulk orders of 5,000+ bricks. Receive custom factory pricing within 2-4 hours.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-10 space-y-6 bg-slate-900/60"
      >
        {/* Product selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Select Product Category / Item *
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>
                [{prod.category}] {prod.name}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Dimensions (Width, Height, Depth) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Custom Dimensions (in Feet or Inches)
          </label>
          <p className="text-[11px] text-slate-400">
            Leave blank if you want standard catalog sizing with bulk discount
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Width (ft / in)</span>
              <input
                type="number"
                step="0.1"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                placeholder="e.g. 3.5"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Height (ft / in)</span>
              <input
                type="number"
                step="0.1"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                placeholder="e.g. 5.0"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Depth / Thickness (Pool / Frame)</span>
              <input
                type="number"
                step="0.1"
                value={customDepth}
                onChange={(e) => setCustomDepth(e.target.value)}
                placeholder="e.g. 4.0 (for pool depth)"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Quantity & Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Quantity Needed *
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Mobile Number (For SMS Quote) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Delivery Site Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Construction Site Location / Area *
            </label>
            <input
              type="text"
              required
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="e.g. Gachibowli Outer Ring Road, Hyderabad"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Site Pincode
            </label>
            <input
              type="text"
              maxLength={6}
              value={deliveryPincode}
              onChange={(e) => setDeliveryPincode(e.target.value)}
              placeholder="500032"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Notes / Special Instructions */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Special Notes / Blueprint Requirements
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Specify any steel reinforcement needs, grill pattern design, crane unloading access, or timeline..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Sending to Prasad...' : 'Submit Quote Request'}</span>
        </button>

        <p className="text-[11px] text-center text-slate-400">
          Direct inquiry sent to Prasad Cement Products dispatch desk. No spam guaranteed.
        </p>
      </form>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading quote builder...</div>}>
      <QuoteFormContent />
    </Suspense>
  );
}
