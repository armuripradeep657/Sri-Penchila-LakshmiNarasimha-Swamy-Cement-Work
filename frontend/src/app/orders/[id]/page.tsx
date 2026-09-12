'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  CreditCard,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isJustPlaced = searchParams.get('success') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (isJustPlaced) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ffffff'],
        });
      } catch {}
    }
  }, [isJustPlaced]);

  useEffect(() => {
    async function loadOrder() {
      setIsLoading(true);
      try {
        const res = await api.getOrder(id);
        if (res?.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadOrder();
  }, [id]);

  const handlePayNow = async () => {
    if (!order) return;
    setIsPaying(true);
    try {
      // 1. Create Razorpay order
      const res = await api.createPayment(order.id);
      // 2. Simulate Razorpay success callback
      const mockPaymentId = `pay_mock_${Date.now()}`;
      await api.verifyPayment(order.id, {
        razorpayOrderId: res.razorpayOrder.id,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: 'mock_signature',
      });
      // Refresh order
      const refreshed = await api.getOrder(order.id);
      if (refreshed?.order) setOrder(refreshed.order);
      alert('Payment confirmed successfully via Razorpay!');
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed');
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 mt-4">Loading order tracking timeline...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <Link href="/orders" className="text-xs font-bold text-amber-400">
          Return to Orders
        </Link>
      </div>
    );
  }

  // Timeline steps
  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Specifications & reinforced molds prepped' },
    { key: 'IN_PRODUCTION', label: 'In Steam Curing', desc: '28-day rated compressive curing in progress' },
    { key: 'OUT_FOR_DELIVERY', label: 'Dispatched on Truck', desc: 'Loaded and en route with site crane assistance' },
    { key: 'DELIVERED', label: 'Delivered & Unloaded', desc: 'Inspected and handed over at site' },
  ];

  const statusOrder = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order History</span>
      </Link>

      {/* Success Banner if redirected from checkout */}
      {isJustPlaced && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-sm text-white">Order Placed Successfully!</p>
            <p className="text-emerald-300">
              Thank you for trusting Prasad Cement Products. Our dispatch team is preparing your precast items.
            </p>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
              Order Reference
            </span>
            <h1 className="text-2xl font-mono font-extrabold text-white mt-1">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                order.paymentStatus === 'PAID'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}
            >
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Visual Progress Tracker */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Manufacturing & Delivery Timeline
          </h2>

          <div className="relative pt-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {steps.map((step, idx) => {
                const isCompleted = currentIndex >= idx + 1;
                const isCurrent = currentIndex === idx + 1 || (currentIndex === 0 && idx === 0);

                return (
                  <div
                    key={step.key}
                    className={`rounded-2xl p-4 border transition-all ${
                      isCompleted
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : isCurrent
                        ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800/80 bg-slate-900/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950'
                            : isCurrent
                            ? 'bg-amber-500 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className="text-xs font-bold text-white truncate">
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Items Breakdown & Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Items List */}
        <div className="md:col-span-8 rounded-3xl glass-panel border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Precast Concrete Items ({order.items.length})</h3>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">
                    {item.variant?.product?.name || 'Precast Item'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.variant?.name} • Qty: <span className="text-white font-medium">{item.quantity}</span>
                  </p>
                  {item.variantSnapshot && typeof item.variantSnapshot === 'string' && (
                    <p className="text-[10px] text-slate-500">
                      Specs verified at order time
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs font-extrabold text-amber-400">
                    {formatPrice(item.totalPrice)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatPrice(item.unitPrice)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Math */}
          <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Materials Total</span>
              <span className="text-white font-medium">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Truck Dispatch Fee ({order.deliveryZone?.name || 'Zone'})</span>
              <span className="text-white font-medium">
                {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
              </span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold">
              <span className="text-white">Grand Total</span>
              <span className="text-lg font-extrabold text-amber-400">
                {formatPrice(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address & Actions */}
        <div className="md:col-span-4 space-y-4">
          <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <MapPin className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Delivery Site
              </h3>
            </div>

            {order.deliveryAddress ? (
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white">{order.deliveryAddress.line1}</p>
                {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} -{' '}
                  <span className="font-mono text-amber-400">{order.deliveryAddress.pincode}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Factory Yard Pickup</p>
            )}

            {order.notes && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Site Instructions:</strong> {order.notes}
              </div>
            )}
          </div>

          {/* Payment & Contact Actions */}
          <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-3">
            {order.paymentStatus !== 'PAID' && (
              <button
                onClick={handlePayNow}
                disabled={isPaying}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isPaying ? 'Processing...' : `Pay ${formatPrice(order.grandTotal)} Online`}</span>
              </button>
            )}

            <a
              href={`https://wa.me/918919526315?text=${encodeURIComponent(
                `Hello Sri Penchila LakshmiNarasimha Swamy Cement Work, I am inquiring about Order #${order.orderNumber}. Could you please update me on dispatch status?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with Sri Penchila LakshmiNarasimha Swamy Cement Work</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
