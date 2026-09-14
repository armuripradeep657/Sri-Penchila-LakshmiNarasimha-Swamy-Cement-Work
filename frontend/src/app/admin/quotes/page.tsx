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
  XCircle,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Check,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { QuoteRequest } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Accept / Price modal
  const [acceptQuote, setAcceptQuote] = useState<QuoteRequest | null>(null);
  const [priceRupees, setPriceRupees] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject modal
  const [rejectQuote, setRejectQuote] = useState<QuoteRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

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

  // Handle Accept & Set Quoted Price
  const handleAcceptAndQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptQuote || !priceRupees) return;

    setIsSubmitting(true);
    try {
      const quotedPricePaisa = Math.round(parseFloat(priceRupees) * 100);
      await api.respondQuote(acceptQuote.id, quotedPricePaisa, adminNotes || undefined);
      
      const phoneClean = acceptQuote.phone.replace(/\D/g, '').slice(-10);
      const whatsAppMsg = `*SRI LAKSHMI PENCHILA NARASIMHA SWAMY CEMENT WORK*\n*(PRASAD CEMENT WORK)*\nNamaskaram! Regarding your precast quote for *${acceptQuote.product?.name || 'Precast Item'}* (${acceptQuote.quantity} units):\n• Quoted Factory Price: *₹${parseFloat(priceRupees).toLocaleString('en-IN')}*\n• Notes: ${adminNotes || '53-grade OPC, steam cured, yard dispatch ready.'}\nContact owner Prasad directly: 9912179771.`;
      
      setAcceptQuote(null);
      setPriceRupees('');
      setAdminNotes('');
      await loadQuotes();

      if (confirm('Quote price recorded! Would you like to open WhatsApp to notify the customer now?')) {
        window.open(`https://wa.me/91${phoneClean}?text=${encodeURIComponent(whatsAppMsg)}`, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quote response');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reject Quote
  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectQuote) return;

    setIsRejecting(true);
    try {
      await api.rejectQuote(rejectQuote.id, rejectionReason || undefined);

      const phoneClean = rejectQuote.phone.replace(/\D/g, '').slice(-10);
      const whatsAppMsg = `*SRI LAKSHMI PENCHILA NARASIMHA SWAMY CEMENT WORK*\nNamaskaram. Regarding your quote request for *${rejectQuote.product?.name || 'Precast Item'}*:\nWe are unable to manufacture this custom size at this time: "${rejectionReason || 'Custom mould unavailable'}".\nPlease contact Prasad at 9912179771 for standard available sizes.`;

      setRejectQuote(null);
      setRejectionReason('');
      await loadQuotes();

      if (confirm('Quote marked as REJECTED. Would you like to notify the customer on WhatsApp?')) {
        window.open(`https://wa.me/91${phoneClean}?text=${encodeURIComponent(whatsAppMsg)}`, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject quote');
    } finally {
      setIsRejecting(false);
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
            Owner Prasad Review Desk — Accept and quote verified prices or decline unfeasible specifications
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 self-start sm:self-auto"
        >
          <option value="">All Inquiries</option>
          <option value="PENDING">Pending Owner Review</option>
          <option value="QUOTED">Priced & Quoted</option>
          <option value="ACCEPTED">Accepted by Client</option>
          <option value="REJECTED">Rejected / Declined</option>
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
          quotes.map((quote) => {
            const isPending = quote.status === 'PENDING';
            const isRejected = quote.status === 'REJECTED';
            const isQuoted = quote.status === 'QUOTED' || quote.status === 'ACCEPTED';

            return (
              <div
                key={quote.id}
                className={`rounded-2xl glass-panel border p-5 sm:p-6 space-y-4 transition-all ${
                  isPending
                    ? 'border-amber-500/40 bg-slate-900/80 shadow-lg shadow-amber-500/5'
                    : isRejected
                    ? 'border-rose-900/40 bg-slate-950/60 opacity-80'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-white">
                        Quote #{quote.id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isRejected
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : quote.status === 'QUOTED'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : quote.status === 'ACCEPTED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Requested on {formatDate(quote.createdAt)} • Phone:{' '}
                      <strong className="text-white font-mono">{quote.phone}</strong>
                    </p>
                  </div>

                  {/* Action Buttons for Owner */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {isPending ? (
                      <>
                        {/* ACCEPT & SET PRICE BUTTON */}
                        <button
                          onClick={() => {
                            setAcceptQuote(quote);
                            setPriceRupees('');
                            setAdminNotes('');
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept & Set Price</span>
                        </button>

                        {/* REJECT BUTTON */}
                        <button
                          onClick={() => {
                            setRejectQuote(quote);
                            setRejectionReason('');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : isQuoted ? (
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase">Quoted Price</p>
                        <p className="text-base font-extrabold text-amber-400">
                          {formatPrice(quote.quotedPrice)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-400">Request Declined</span>
                      </div>
                    )}

                    {/* WhatsApp Action */}
                    <a
                      href={`https://wa.me/91${quote.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                        `Namaskaram from Prasad Cement Work (Velagatoor). Regarding your quote for ${quote.product?.name}:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30"
                      title="Chat on WhatsApp"
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
                    <p className="text-slate-200 truncate">
                      {quote.deliveryLocation || 'Velagatoor / Jagtial'} {quote.deliveryPincode ? `(${quote.deliveryPincode})` : ''}
                    </p>
                  </div>
                </div>

                {quote.notes && (
                  <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 uppercase text-[10px] font-bold block">Client Specifications:</span>
                    {quote.notes}
                  </div>
                )}

                {quote.adminNotes && (
                  <div
                    className={`text-xs p-2.5 rounded-lg border ${
                      isRejected
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}
                  >
                    <span className="uppercase text-[10px] font-bold block mb-0.5">
                      {isRejected ? 'Decline Reason Recorded:' : 'Owner Quoted Note:'}
                    </span>
                    {quote.adminNotes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ─── ACCEPT & SET PRICE MODAL ─────────────────────────────────────── */}
      {acceptQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-amber-500/40 bg-slate-900 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ACCEPT INQUIRY
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Set Quoted Price & Terms</h2>
                <p className="text-xs text-slate-400">
                  For {acceptQuote.product?.name} ({acceptQuote.quantity} units)
                </p>
              </div>
              <button
                onClick={() => setAcceptQuote(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAcceptAndQuote} className="space-y-4 text-xs">
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
                  Notes / Dispatch Conditions for Customer
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Includes 53-grade OPC, 28-day steam curing, and hydraulic crane unloading at site..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAcceptQuote(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? 'Confirming...' : 'Accept & Send Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REJECT QUOTE MODAL ────────────────────────────────────────────── */}
      {rejectQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-rose-500/40 bg-slate-900 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  REJECT INQUIRY
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Decline Quote Request</h2>
                <p className="text-xs text-slate-400">
                  For {rejectQuote.product?.name} ({rejectQuote.quantity} units)
                </p>
              </div>
              <button
                onClick={() => setRejectQuote(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">
                  Select Reason for Declining:
                </label>

                <div className="space-y-1.5">
                  {[
                    'Custom size mould not available at factory yard',
                    'Quantity requested is below minimum factory batch',
                    'Delivery site location is outside our crane truck service radius',
                    'Temporary raw material / steel reinforcement constraint',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                        rejectionReason === preset
                          ? 'bg-rose-500/20 border-rose-500/60 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      • {preset}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-slate-400 text-[11px] block mb-1">
                    Or write custom decline reason:
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Type reason here..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectQuote(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
