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
  Download,
  Printer,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import TaxInvoice from '@/components/invoice/TaxInvoice';
import RealtimePaymentModal from '@/components/payment/RealtimePaymentModal';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isJustPlaced = searchParams.get('success') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [mockPaymentId, setMockPaymentId] = useState<string>('');

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
      // 2. Mock payment ID
      const pId = `PAY_UPI_${Date.now()}`;
      setMockPaymentId(pId);
      await api.verifyPayment(order.id, {
        razorpayOrderId: res.razorpayOrder.id,
        razorpayPaymentId: pId,
        razorpaySignature: 'verified_sig_gateway',
      });
      // Refresh order
      const refreshed = await api.getOrder(order.id);
      if (refreshed?.order) setOrder(refreshed.order);

      // Trigger real-time payment animation modal
      setShowPaymentModal(true);
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 mt-4">Loading order tracking timeline & invoice...</p>
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

  // Map order items to invoice items
  const invoiceItems = order.items.map((item) => ({
    name: item.variant?.product?.name || 'Precast Item',
    variantName: item.variant?.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    dimensions:
      item.variant?.width && item.variant?.height
        ? `${item.variant.width}×${item.variant.height} ${item.variant.dimensionUnit || ''}`
        : undefined,
  }));

  const isCOD = Boolean(
    order.notes?.includes('[CASH ON DELIVERY') ||
    order.notes?.includes('COD')
  );
  const codFee = isCOD ? 15000 : 0;

  const invoiceNumber = `INV-${order.orderNumber.replace('ORD-', '')}`;

  // WhatsApp Order Details Slip Formatting
  const customerPhoneRaw = order.user?.phone || '';
  const addressText = order.deliveryAddress
    ? `${order.deliveryAddress.line1}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`
    : 'Factory Yard Pickup (Velagatoor)';


  const ownerWhatsAppInquiryMsg =
    `*SRI LAKSHMI PENCHILA NARASIMHA SWAMY CEMENT WORK (PRASAD CEMENT WORK)*\n` +
    `Hello Prasad Garu, I am inquiring regarding Order #${order.orderNumber}.\n` +
    `Customer: ${order.user?.name || 'Customer'} (${customerPhoneRaw || 'Site Contact'})\n` +
    `Grand Total: ₹${(order.grandTotal / 100).toLocaleString('en-IN')} (${isCOD ? 'COD' : 'Online'})\n` +
    `Delivery Site: ${addressText}\n\n` +
    `Could you please update me on dispatch schedule?`;

  const ownerWhatsAppLink = `https://wa.me/918919526315?text=${encodeURIComponent(ownerWhatsAppInquiryMsg)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Printable Invoice Container (Only visible when printing) */}
      <div className="hidden print:block">
        <TaxInvoice
          invoiceNumber={invoiceNumber}
          orderNumber={order.orderNumber}
          date={order.createdAt}
          customerName={order.user?.name || 'Valued Builder / Contractor'}
          customerPhone={order.user?.phone || '+91 89195 26315'}
          customerAddress={order.deliveryAddress}
          items={invoiceItems}
          subtotal={order.totalAmount}
          deliveryFee={order.deliveryFee}
          grandTotal={order.grandTotal}
          paymentStatus={order.paymentStatus}
          paymentMethod={isCOD ? 'COD' : 'ONLINE'}
          codFee={codFee}
          paymentId={mockPaymentId || `TXN_${order.id.slice(0, 8).toUpperCase()}`}
        />
      </div>

      <div className="no-print space-y-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order History</span>
        </Link>

        {/* Success Banner if redirected from checkout */}
        {isJustPlaced && (
          <div className="p-5 sm:p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/50 flex flex-col gap-4 text-emerald-400 text-xs shadow-2xl animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-extrabold text-base text-white">
                    Order #{order.orderNumber} Booked Successfully!
                  </p>
                  <p className="text-emerald-300 mt-0.5 text-xs">
                    Submitted to factory dispatch. Yard owner Prasad (8919526315) will review specifications and send confirmation directly to your WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={ownerWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>💬 Chat with Yard Owner (8919526315)</span>
                </a>

                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer border border-slate-700"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Invoice (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Header */}
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                Order Reference & Invoice
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white mt-1">
                {order.orderNumber}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Placed on {formatDate(order.createdAt)} • Yard: Velagatoor, Jagtial Dist
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                    : isCOD
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                }`}
              >
                {order.paymentStatus === 'PAID'
                  ? 'Payment: PAID'
                  : isCOD
                  ? 'Payment: Cash on Delivery (COD)'
                  : 'Payment: PENDING'}
              </span>

              {/* Quick Invoice Download Action */}
              <button
                onClick={handlePrintInvoice}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
                title="Download / Print Official Tax Invoice"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tax Invoice (PDF)</span>
              </button>
            </div>
          </div>

          {/* Visual Progress Tracker */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Manufacturing & Delivery Timeline
            </h2>

            <div className="relative pt-2 pb-2">
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Precast Concrete Items ({order.items.length})
              </h3>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Tax Invoice</span>
              </button>
            </div>

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
                    {item.variant?.width && item.variant?.height && (
                      <p className="text-[10px] text-amber-400 font-mono">
                        Dimensions: {item.variant.width}×{item.variant.height} {item.variant.dimensionUnit || ''}
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
                  {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee - codFee)}
                </span>
              </div>
              {isCOD && (
                <div className="flex justify-between text-amber-300 font-medium">
                  <span>COD Processing Fee (Site Verification)</span>
                  <span className="font-mono font-bold">+₹150.00</span>
                </div>
              )}
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
                <p className="text-xs text-slate-400">Factory Yard Pickup (Velagatoor)</p>
              )}

              {order.notes && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong>Site Instructions:</strong> {order.notes}
                </div>
              )}
            </div>

            {/* Payment & Contact Actions */}
            <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-3">
              {order.paymentStatus !== 'PAID' ? (
                <button
                  onClick={handlePayNow}
                  disabled={isPaying}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isPaying ? 'Connecting Bank Gateway...' : `Pay ${formatPrice(order.grandTotal)} Online`}
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Payment Verified & Cleared</span>
                </div>
              )}

              {/* Owner WhatsApp Dispatch Status Box */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>OWNER WHATSAPP CONFIRMATION</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Order details and dispatch confirmation will be sent directly by yard owner Prasad (8919526315) to your WhatsApp upon review.
                </p>
              </div>

              {/* Chat with Yard Owner */}
              <a
                href={ownerWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>💬 Chat with Yard Owner (8919526315)</span>
              </a>

              {/* Download Invoice Button */}
              <button
                onClick={handlePrintInvoice}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Official Invoice (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Embedded Tax Invoice View Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Official Tax Invoice Preview</span>
            </h3>
            <button
              onClick={handlePrintInvoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <TaxInvoice
            invoiceNumber={invoiceNumber}
            orderNumber={order.orderNumber}
            date={order.createdAt}
            customerName={order.user?.name || 'Valued Builder / Contractor'}
            customerPhone={order.user?.phone || '+91 89195 26315'}
            customerAddress={order.deliveryAddress}
            items={invoiceItems}
            subtotal={order.totalAmount}
            deliveryFee={order.deliveryFee}
            grandTotal={order.grandTotal}
            paymentStatus={order.paymentStatus}
            paymentMethod={isCOD ? 'COD' : 'ONLINE'}
            codFee={codFee}
            paymentId={mockPaymentId || `TXN_${order.id.slice(0, 8).toUpperCase()}`}
          />
        </div>
      </div>

      {/* ─── Real-Time Payment Animation Modal ─── */}
      <RealtimePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderNumber={order.orderNumber}
        amount={order.grandTotal}
        productName={order.items[0]?.variant?.product?.name || 'Precast Order'}
        variantName={order.items[0]?.variant?.name}
        quantity={order.items[0]?.quantity || 1}
        onViewInvoice={() => {
          setShowPaymentModal(false);
          setShowInvoiceModal(true);
        }}
      />

      {/* ─── Full Screen Tax Invoice Modal ─── */}
      {showInvoiceModal && (
        <TaxInvoice
          isModal
          onClose={() => setShowInvoiceModal(false)}
          invoiceNumber={invoiceNumber}
          orderNumber={order.orderNumber}
          date={order.createdAt}
          customerName={order.user?.name || 'Valued Builder / Contractor'}
          customerPhone={order.user?.phone || '+91 89195 26315'}
          customerAddress={order.deliveryAddress}
          items={invoiceItems}
          subtotal={order.totalAmount}
          deliveryFee={order.deliveryFee}
          grandTotal={order.grandTotal}
          paymentStatus={order.paymentStatus}
          paymentMethod={isCOD ? 'COD' : 'ONLINE'}
          codFee={codFee}
          paymentId={mockPaymentId || `TXN_${order.id.slice(0, 8).toUpperCase()}`}
        />
      )}
    </div>
  );
}
