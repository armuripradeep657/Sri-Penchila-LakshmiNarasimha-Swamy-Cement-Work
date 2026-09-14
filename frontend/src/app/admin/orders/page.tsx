'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Filter,
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Calendar,
  MessageCircle,
  XCircle,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const freqs = [659.25, 880.0, 1046.5];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.35);
      });
    } catch (e) {}
  };

  const loadOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.getAdminOrders(statusFilter || undefined, search || undefined);
      if (res?.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // ─── Real-time Auto-Refresh & Multi-Tab Synchronization ────────────────
    const interval = setInterval(() => {
      loadOrders(true);
    }, 4000);

    const onOrderPlaced = (e: any) => {
      const ord = e.detail;
      playNotificationChime();
      setLiveAlert(`🔔 NEW ORDER: ${ord.orderNumber} • ${ord.user?.name || 'Customer'} (${ord.user?.phone || ''}) • ₹${Math.round(ord.grandTotal / 100)}`);
      loadOrders(true);
      setTimeout(() => setLiveAlert(null), 8000);
    };

    window.addEventListener('pcp_order_placed', onOrderPlaced);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('pcp_orders_channel');
      bc.onmessage = (evt) => {
        if (evt.data?.type === 'NEW_ORDER') {
          playNotificationChime();
          const ord = evt.data.order;
          setLiveAlert(`🔔 NEW ORDER: ${ord.orderNumber} • ${ord.user?.name || 'Customer'} • ₹${Math.round((ord.grandTotal || ord.totalAmount) / 100)}`);
          loadOrders(true);
          setTimeout(() => setLiveAlert(null), 8000);
        }
      };
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('pcp_order_placed', onOrderPlaced);
      if (bc) bc.close();
    };
  }, [statusFilter, search]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      if (res?.whatsappUrl) {
        const sendWA = confirm(`Order status updated to ${newStatus.replace(/_/g, ' ')}. Would you like to open WhatsApp to send this update to customer now?`);
        if (sendWA) {
          window.open(res.whatsappUrl, '_blank');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmAndWhatsApp = async (order: Order) => {
    setUpdatingId(order.id);
    try {
      const res = await api.updateOrderStatus(order.id, 'CONFIRMED');
      await loadOrders();
      if (res?.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank');
      } else if (order.user?.phone) {
        const msg = `*SRI LAKSHMI PENCHILA NARASIMHA SWAMY CEMENT WORK (PRASAD CEMENT WORK)*\nDear ${order.user.name || 'Customer'},\n✅ Your Precast Concrete Order #${order.orderNumber} for ${formatPrice(order.grandTotal)} has been CONFIRMED!\nMaterials prepped for dispatch from Velagatoor yard. Contact: 8919526315.`;
        window.open(`https://wa.me/91${order.user.phone}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to confirm order');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelAndWhatsApp = async (order: Order) => {
    const reason = prompt(`Enter cancellation reason for Order #${order.orderNumber}:`, 'Site delivery inaccessible or customer requested cancellation.');
    if (reason === null) return; // user clicked cancel
    setUpdatingId(order.id);
    try {
      const res = await api.updateOrderStatus(order.id, 'CANCELLED', reason);
      await loadOrders();
      if (res?.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank');
      } else if (order.user?.phone) {
        const msg = `*SRI LAKSHMI PENCHILA NARASIMHA SWAMY CEMENT WORK (PRASAD CEMENT WORK)*\nDear ${order.user.name || 'Customer'},\n⚠️ Order #${order.orderNumber} has been CANCELLED.\nReason: ${reason}\nContact owner Prasad directly at 8919526315 for assistance.`;
        window.open(`https://wa.me/91${order.user.phone}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = [
    { value: '', label: 'All Orders' },
    { value: 'DELIVERED', label: '✅ Fulfilled Orders (Delivered)' },
    { value: 'OUT_FOR_DELIVERY', label: '🚚 Out For Delivery' },
    { value: 'IN_PRODUCTION', label: '🏗️ In Production (Curing)' },
    { value: 'CONFIRMED', label: '📋 Confirmed' },
    { value: 'CANCELLED', label: '❌ Cancelled' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 🚨 Real-Time Live Order Alert Banner */}
      {liveAlert && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-extrabold text-sm flex items-center justify-between shadow-2xl shadow-amber-500/20 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
            <span>{liveAlert}</span>
          </div>
          <button
            onClick={() => setLiveAlert(null)}
            className="text-xs bg-amber-500 text-slate-950 px-3 py-1 rounded-lg font-bold hover:bg-amber-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Order Fulfillment & Dispatch Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage live precast orders, distance delivery freight, yard worker home placement, and customer dispatch
          </p>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-white">{orders.length}</strong> orders
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # or Phone (e.g. PCP-2024, 8888888888)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 w-full sm:w-auto font-semibold"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400 text-xs">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 rounded-2xl glass-panel border border-slate-800 text-slate-400 text-xs">
            No orders found matching the filter
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl glass-panel border border-slate-800 p-5 sm:p-6 space-y-4 hover:border-slate-700 transition-all"
            >
              {/* Order Top Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-mono font-extrabold text-base text-white">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    {(order.workerPlacementFee ?? 0) > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        🏡 Worker Placement (+{formatPrice(order.workerPlacementFee!)})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Placed: {formatDate(order.createdAt)} • Customer: <strong>{order.user?.name || 'Customer'}</strong> ({order.user?.phone})
                  </p>
                </div>

                {/* 1-Click WhatsApp Quick Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700">
                    <span className="text-[11px] text-slate-400 pl-1.5">Status:</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="IN_PRODUCTION">In Production (Curing)</option>
                      <option value="OUT_FOR_DELIVERY">Out For Delivery (Truck)</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* 🟢 Quick Confirm & WhatsApp Button */}
                  {order.status !== 'CONFIRMED' && (
                    <button
                      onClick={() => handleConfirmAndWhatsApp(order)}
                      disabled={updatingId === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
                      title="Confirm Order and open customer WhatsApp confirmation message"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & WhatsApp</span>
                    </button>
                  )}

                  {/* 🔴 Quick Cancel & WhatsApp Button */}
                  {order.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancelAndWhatsApp(order)}
                      disabled={updatingId === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                      title="Cancel Order and open customer WhatsApp cancellation notice"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel & WhatsApp</span>
                    </button>
                  )}

                  {/* Direct WhatsApp Chat with Customer */}
                  <a
                    href={`https://wa.me/91${order.user?.phone}?text=${encodeURIComponent(
                      `Hello ${order.user?.name || 'Customer'}, this is Prasad from PRASAD CEMENT WORK regarding your Precast Order #${order.orderNumber}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all"
                    title="Direct WhatsApp Chat with Customer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat ({order.user?.phone || 'Customer'})</span>
                  </a>
                </div>
              </div>

              {/* Order Items & Site Info */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                {/* Items */}
                <div className="md:col-span-8 space-y-2">
                  <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                    Materials Ordered ({order.items.length})
                  </p>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80"
                      >
                        <div>
                          <span className="font-bold text-white">
                            {item.variant?.product?.name}
                          </span>{' '}
                          <span className="text-slate-400">
                            ({item.variant?.name}) × {item.quantity}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-amber-400">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 text-xs border-t border-slate-800">
                    <div className="flex flex-wrap items-center gap-3 text-slate-400">
                      <span>
                        🚚 Delivery Freight: <strong className="text-white">{formatPrice(order.deliveryFee)}</strong>
                      </span>
                      {(order.workerPlacementFee ?? 0) > 0 && (
                        <span className="text-amber-400 font-semibold">
                          🏡 Worker Home Placement: <strong>+{formatPrice(order.workerPlacementFee!)}</strong>
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-extrabold text-white">
                      Grand Total: <span className="text-amber-400">{formatPrice(order.grandTotal)}</span>
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Site Delivery Address</span>
                  </p>
                  {order.deliveryAddress ? (
                    <div className="text-slate-300 leading-relaxed text-[11px]">
                      <p className="font-semibold text-white">{order.deliveryAddress.line1}</p>
                      {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                      <p>
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} -{' '}
                        <span className="text-amber-400 font-mono">{order.deliveryAddress.pincode}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500">Pickup from yard</p>
                  )}

                  {order.notes && (
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <strong>Site Notes:</strong> {order.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
