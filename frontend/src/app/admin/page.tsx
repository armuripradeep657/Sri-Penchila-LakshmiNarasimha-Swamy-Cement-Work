'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingBag,
  FileText,
  AlertTriangle,
  TrendingUp,
  Layers,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const freqs = [587.33, 783.99, 1046.5];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.35);
      });
    } catch (e) {}
  };

  const loadDashboard = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.getAdminDashboard();
      if (res) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
        return;
      }
      if (!isAdmin) {
        alert('Admin access required. Please sign in with admin phone number.');
        router.push('/');
        return;
      }
    }

    if (user && isAdmin) {
      loadDashboard(false);

      // ─── Real-time Auto-Refresh & Multi-Tab Synchronization ────────────────
      const interval = setInterval(() => {
        loadDashboard(true);
      }, 4000);

      const onOrderPlaced = (e: any) => {
        const ord = e.detail;
        playNotificationChime();
        setLiveAlert(`🔔 NEW CUSTOMER ORDER: ${ord.orderNumber} • ${ord.user?.name || 'Customer'} (${ord.user?.phone || ''}) • ₹${Math.round((ord.grandTotal || ord.totalAmount) / 100)}`);
        loadDashboard(true);
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
            setLiveAlert(`🔔 NEW CUSTOMER ORDER: ${ord.orderNumber} • ${ord.user?.name || 'Customer'} • ₹${Math.round((ord.grandTotal || ord.totalAmount) / 100)}`);
            loadDashboard(true);
            setTimeout(() => setLiveAlert(null), 8000);
          }
        };
      }

      return () => {
        clearInterval(interval);
        window.removeEventListener('pcp_order_placed', onOrderPlaced);
        if (bc) bc.close();
      };
    }
  }, [user, isAdmin, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 mt-4">Loading Prasad Cement Products admin portal...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    monthOrders: 0,
    monthRevenuePaisa: 0,
    pendingQuotesCount: 0,
    lowStockCount: 0,
    totalOrders: 0,
  };

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

      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              OWNER PORTAL
            </span>
            <span className="text-xs text-slate-400">Prasad Cement Products</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Business Operations Dashboard
          </h1>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Products</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders</span>
          </Link>
          <Link
            href="/admin/quotes"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Quotes</span>
          </Link>
          <Link
            href="/admin/settings"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            <span>Delivery Zones</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Month Revenue */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Revenue (This Month)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {formatPrice(stats.monthRevenuePaisa)}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">
            Lifetime: {formatPrice(stats.totalRevenuePaisa || stats.monthRevenuePaisa)}
          </p>
        </div>

        {/* Orders Placed */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Orders (This Month)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {stats.monthOrders} Orders
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Total {stats.totalOrders} all-time orders
          </p>
        </div>

        {/* Pending Quotes */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Quotes</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {stats.pendingQuotesCount} Inquiries
          </p>
          <Link
            href="/admin/quotes"
            className="text-[11px] text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <span>Review & Quote</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Low Stock Variants</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-400">
            {stats.lowStockCount} Items
          </p>
          <p className="text-[11px] text-slate-400">
            Inventory &le; 10 units in yard
          </p>
        </div>
      </div>

      {/* Low Stock Attention List */}
      {dashboardData?.lowStockVariants && dashboardData.lowStockVariants.length > 0 && (
        <div className="rounded-2xl glass-panel border border-rose-500/30 p-5 space-y-4 bg-rose-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>INVENTORY RE-STOCK ALERT (YARD UNITS CRITICAL)</span>
            </div>
            <Link href="/admin/products" className="text-xs text-amber-400 hover:underline">
              Adjust Stock →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dashboardData.lowStockVariants.slice(0, 4).map((variant: any) => (
              <div
                key={variant.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[140px]">
                    {variant.product?.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{variant.name}</p>
                </div>
                <span className="px-2 py-1 rounded-md text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {variant.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="rounded-2xl sm:rounded-3xl glass-panel border border-slate-800 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white">Recent Customer Orders</h2>
          <Link href="/admin/orders" className="text-xs text-amber-400 hover:underline font-semibold">
            View All Orders →
          </Link>
        </div>

        {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/40">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dashboardData.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{order.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{order.user?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        {(order.workerPlacementFee ?? 0) > 0 && (
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                            🏡 Home Placement
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-amber-400 font-mono">{formatPrice(order.grandTotal)}</p>
                      <p className="text-[10px] text-slate-500">Freight: {formatPrice(order.deliveryFee)}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders`}
                        className="text-xs text-amber-400 hover:underline font-semibold"
                      >
                        Update →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No orders yet</p>
        )}
      </div>
    </div>
  );
}
