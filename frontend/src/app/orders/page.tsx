'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Truck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Order, QuoteRequest } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'ORDERS' | 'QUOTES'>('ORDERS');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/orders');
      return;
    }

    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [ordersRes, quotesRes] = await Promise.all([
          api.getOrders(),
          api.getQuotes(),
        ]);
        if (ordersRes?.orders) setOrders(ordersRes.orders);
        if (quotesRes?.quotes) setQuotes(quotesRes.quotes);
      } catch (err) {
        console.error('Failed to load orders or quotes:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 mt-4">Loading your construction orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          My Orders & Quotes
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track manufacturing and dispatch progress for your construction orders
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ORDERS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('QUOTES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'QUOTES'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quote Requests ({quotes.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-400">
                You have not placed any precast cement orders. Browse catalog to start.
              </p>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl glass-panel border border-slate-800 p-5 sm:p-6 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-white">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Grand Total</p>
                      <p className="text-base font-extrabold text-amber-400">
                        {formatPrice(order.grandTotal)}
                      </p>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>Track Status</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">
                        {item.variant?.product?.name || 'Cement Item'} ({item.variant?.name}) × {item.quantity}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Quote Requests */}
      {activeTab === 'QUOTES' && (
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <div className="text-center py-16 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <FileText className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Custom Quotes Requested</h3>
              <p className="text-xs text-slate-400">
                Need custom sizes or pool dimensions? Submit your blueprints and dimensions.
              </p>
              <Link
                href="/quote"
                className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Request Custom Quote
              </Link>
            </div>
          ) : (
            quotes.map((quote) => (
              <div
                key={quote.id}
                className="rounded-2xl glass-panel border border-slate-800 p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-white">
                        Quote #{quote.id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                          quote.status
                        )}`}
                      >
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Requested on {formatDate(quote.createdAt)} • {quote.product?.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Quoted Price</p>
                    <p className="text-base font-extrabold text-amber-400">
                      {quote.quotedPrice ? formatPrice(quote.quotedPrice) : 'Pending Review'}
                    </p>
                  </div>
                </div>

                {/* Dimensions and details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Dimensions</span>
                    <span className="text-white font-medium">
                      {quote.customWidth || '-'}W × {quote.customHeight || '-'}H × {quote.customDepth || '-'}D ft
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Quantity</span>
                    <span className="text-white font-medium">{quote.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Site Location</span>
                    <span className="text-white font-medium truncate block">{quote.deliveryLocation}</span>
                  </div>
                </div>

                {quote.adminNotes && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <strong>Prasad&apos;s Note:</strong> {quote.adminNotes}
                  </div>
                )}

                {/* Accept Quote Action */}
                {quote.status === 'QUOTED' && quote.quotedPrice && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.acceptQuote(quote.id);
                          if (res?.order) {
                            router.push(`/orders/${res.order.id}?success=true`);
                          }
                        } catch (err: any) {
                          alert(err.message || 'Failed to accept quote');
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
                    >
                      Accept Quoted Price & Place Order →
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
