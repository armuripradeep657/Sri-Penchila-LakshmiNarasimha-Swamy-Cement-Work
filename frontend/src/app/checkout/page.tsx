'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { DeliveryZone } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { cart, refreshCart } = useCart();
  const { t, localizeProduct, localizeVariant } = useLanguage();

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: 'Velagatoor, Jagtial Dist',
    state: 'Telangana',
    pincode: '505526',
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if empty cart
  useEffect(() => {
    if (!authLoading && cart.items.length === 0) {
      router.replace('/cart');
    }
  }, [cart.items.length, authLoading, router]);

  // Load delivery zones
  useEffect(() => {
    async function loadZones() {
      try {
        const res = await api.getDeliveryZones();
        if (res?.zones && res.zones.length > 0) {
          setDeliveryZones(res.zones);
          setSelectedZoneId(res.zones[0].id);
        }
      } catch (err) {
        // Fallback default zones
        const defaultZones: DeliveryZone[] = [
          { id: 'zone_local', name: 'Local Velagatoor Mandal (0-10 km)', pincodes: ['505526'], fee: 0, isActive: true },
          { id: 'zone_city', name: 'Jagtial District & Surrounds (10-30 km)', pincodes: ['505327'], fee: 150000, isActive: true },
          { id: 'zone_dist', name: 'Karimnagar / Mancherial Border (30-60 km)', pincodes: ['505001'], fee: 350000, isActive: true },
        ];
        setDeliveryZones(defaultZones);
        setSelectedZoneId(defaultZones[0].id);
      }
    }
    loadZones();
  }, []);

  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const deliveryFee = selectedZone ? selectedZone.fee : 0;
  const grandTotal = cart.subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      // Direct user to quick OTP login
      router.push(`/login?redirect=/checkout`);
      return;
    }

    if (!address.line1 || !address.city || !address.pincode) {
      setErrorMessage('Please fill in complete construction site address and pincode');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderRes = await api.placeOrder({
        deliveryAddress: address,
        deliveryZoneId: selectedZoneId || undefined,
        notes,
      });

      if (orderRes?.order) {
        // Order placed successfully!
        await refreshCart();
        router.push(`/orders/${orderRes.order.id}?success=true`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Construction Site Checkout
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Specify your delivery address and zone for direct factory dispatch
        </p>
      </div>

      {!user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Mobile Verification Recommended</p>
              <p className="text-xs text-slate-300">
                Log in with your 10-digit mobile number for order tracking and SMS dispatch updates.
              </p>
            </div>
          </div>
          <Link
            href="/login?redirect=/checkout"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 whitespace-nowrap"
          >
            Quick OTP Login
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Address and Zone Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Delivery Address */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">1. Construction Site / Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-semibold text-slate-300">
                  Plot / Street Address / Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  placeholder="e.g. Plot No 45, Beside Royal Garden, Outer Ring Road"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Site Contact / Landmark</label>
                <input
                  type="text"
                  value={address.line2}
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                  placeholder="e.g. Supervisor Rajesh (Near Water Tank)"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">State *</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="500032"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Zone */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Truck className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">2. Select Delivery Distance Zone</h2>
            </div>

            <p className="text-xs text-slate-400">
              Prasad delivers precast items via heavy commercial trucks equipped with strapping and unloading assistance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {deliveryZones.map((zone) => {
                const isSelected = selectedZoneId === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                        {zone.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-sm font-extrabold text-white mt-2">
                      {zone.fee === 0 ? 'FREE' : formatPrice(zone.fee)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Special Site Instructions */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-3">
            <h2 className="text-sm font-bold text-white">3. Site Unloading & Gate Instructions (Optional)</h2>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Truck access from back gate, crane needed for 3x7 door frames..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Right: Payment & Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-6">
            <h2 className="text-base font-bold text-white">Payment & Confirmation</h2>

            {/* Order Items Snapshot */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white truncate max-w-[170px]">
                      {item.variant.product ? localizeProduct(item.variant.product).name : ''}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.variant ? localizeVariant(item.variant).name : ''} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-slate-200">
                    {formatPrice((item.variant.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing math */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Materials Subtotal</span>
                <span className="text-white font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Truck Delivery Fee</span>
                <span className="text-amber-400 font-semibold">
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline text-sm">
                <span className="font-bold text-white">Total Amount</span>
                <span className="text-xl font-extrabold text-amber-400">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Method Option */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">Razorpay Secure Checkout</p>
                <p className="text-[11px] text-slate-400">UPI (GPay / PhonePe), Cards, Netbanking</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Order...' : `Pay & Confirm ${formatPrice(grandTotal)}`}</span>
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                <span>Zero-risk precast guarantee. Invoice provided at delivery.</span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
