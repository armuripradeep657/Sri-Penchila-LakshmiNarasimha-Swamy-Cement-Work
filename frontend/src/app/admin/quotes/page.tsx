'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Phone,
  CheckCircle2,
  Clock,
  ArrowLeft,
  DollarSign,
  Send,
  MessageCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { QuoteRequest } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Response modal
  const [activeQuote, setActiveQuote] = useState<QuoteRequest | null>(null);
  const [priceRupees, setPriceRupees] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminQuotes(statusFilter || undefined);
      if (res?.quotes) {
        setQuotes(res.quotes);
      }
    } catch (err) {
      console.error('Failed to load admin quotes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [statusFilter]);

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuote || !priceRupees) return;

    setIsSubmitting(true);
    try {
      const quotedPricePaisa = Math.round(parseFloat(priceRupees) * 100);
      await api.respondQuote(activeQuote.id, quotedPricePaisa, adminNotes || undefined);
      setActiveQuote(null);
      setPriceRupees('');
      setAdminNotes('');
      await loadQuotes();
      alert('Quote response sent to customer successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit quote response');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
            Custom Dimensions & Bulk Quote Inquiries
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review custom customer sizes, estimate manufacturing molds, and set finalized prices
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 self-start sm:self-auto"
        >
          <option value="">All Inquiries</option>
          <option value="PENDING">Pending Pricing</option>
          <option value="QUOTED">Priced & Sent</option>
          <option value="ACCEPTED">Accepted by Client</option>
        </select>
      </div>

      {/* Quote Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400 text-xs">Loading quote requests...</div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl glass-panel border border-slate-800 text-slate-400 text-xs">
            No quote inquiries found matching this filter
          </div>
        ) : (
          quotes.map((quote) => (
            <div
              key={quote.id}
              className="rounded-2xl glass-panel border border-slate-800 p-5 sm:p-6 space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
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
                  <p className="text-xs text-slate-400 mt-1">
                    Requested on {formatDate(quote.createdAt)} • Phone:{' '}
                    <strong className="text-white font-mono">{quote.phone}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {quote.status === 'PENDING' ? (
                    <button
                      onClick={() => {
                        setActiveQuote(quote);
                        setPriceRupees('');
                        setAdminNotes('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition-all flex items-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Set Quoted Price</span>
                    </button>
                  ) : (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase">Quoted Price</p>
                      <p className="text-base font-extrabold text-amber-400">
                        {formatPrice(quote.quotedPrice)}
                      </p>
                    </div>
                  )}

                  <a
                    href={`https://wa.me/91${quote.phone}?text=${encodeURIComponent(
                      `Hello, this is Prasad regarding your quote inquiry for ${quote.product?.name}. We have reviewed your dimensions.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Specifications Card */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Product</span>
                  <p className="text-white font-bold">{quote.product?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Custom Dimensions</span>
                  <p className="text-amber-400 font-mono font-medium">
                    {quote.customWidth || '-'}W × {quote.customHeight || '-'}H × {quote.customDepth || '-'}D ft
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Quantity</span>
                  <p className="text-white font-medium">{quote.quantity} units</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Delivery Location</span>
                  <p className="text-slate-200 truncate">{quote.deliveryLocation} {quote.deliveryPincode ? `(${quote.deliveryPincode})` : ''}</p>
                </div>
              </div>

              {quote.notes && (
                <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Client Notes:</span>
                  {quote.notes}
                </div>
              )}

              {quote.adminNotes && (
                <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  <span className="text-amber-400 uppercase text-[10px] font-bold block">Your Quoted Note:</span>
                  {quote.adminNotes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {activeQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-slate-700 bg-slate-900 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Set Final Quoted Price</h2>
              <p className="text-xs text-slate-400">
                For {activeQuote.product?.name} ({activeQuote.quantity} units)
              </p>
            </div>

            <form onSubmit={handleRespond} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">
                  Final Quoted Price in Rupees (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-amber-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    step="1"
                    min="1"
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    placeholder="e.g. 24500"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">
                  Notes / Breakdown for Customer
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Includes 53-grade steam curing, truck freight to site, and crane unloading..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveQuote(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Quote to Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
