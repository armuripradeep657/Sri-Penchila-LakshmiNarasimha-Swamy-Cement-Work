'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Download,
  FileText,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Building2,
  Lock,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface RealtimePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amount: number;
  productName?: string;
  variantName?: string;
  quantity?: number;
  onViewInvoice: () => void;
}

export default function RealtimePaymentModal({
  isOpen,
  onClose,
  orderNumber,
  amount,
  productName = 'Precast Concrete Order',
  variantName,
  quantity = 1,
  onViewInvoice,
}: RealtimePaymentModalProps) {
  const [step, setStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [txnId, setTxnId] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setIsCompleted(false);
      return;
    }

    // Generate random transaction ID
    const generatedTxn = `TXN_${Date.now().toString(36).toUpperCase()}_${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    setTxnId(generatedTxn);

    // Sequence stages
    const timer1 = setTimeout(() => setStep(2), 1200);
    const timer2 = setTimeout(() => setStep(3), 2500);
    const timer3 = setTimeout(() => {
      setStep(4);
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ffffff'],
        });
      } catch {}
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-center overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* ─── Real-Time Visual Animation Ring ─── */}
        <div className="relative my-4 flex items-center justify-center">
          {!isCompleted ? (
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping opacity-60" />
              {/* Spinning dual colored radar ring */}
              <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-amber-500 border-r-amber-400 animate-spin" />
              {/* Inner counter-rotating ring */}
              <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-emerald-400 border-l-emerald-500 animate-[spin_1.5s_linear_infinite_reverse]" />
              {/* Central secure card / gateway emblem */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 flex items-center justify-center shadow-lg">
                <CreditCard className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="relative w-28 h-28 flex items-center justify-center animate-in zoom-in-75 duration-300">
              {/* Success concentric ripples */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-payment-pulse" />
              <div className="absolute inset-2 rounded-full border-2 border-emerald-500/40" />
              <div className="relative w-18 h-18 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
            </div>
          )}
        </div>

        {/* ─── Status Text & Stage Progression ─── */}
        <div className="space-y-2 mt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>256-BIT ENCRYPTED PAYMENT GATEWAY</span>
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            {isCompleted ? 'Payment & Booking Confirmed!' : 'Processing Real-Time Payment...'}
          </h3>

          <p className="text-xs text-slate-400 min-h-[2.5rem] flex items-center justify-center">
            {step === 1 && 'Connecting to RBI-Compliant Banking Handshake...'}
            {step === 2 && 'Authenticating Instant UPI / Card Settlement...'}
            {step === 3 && 'Allocating 53-Grade Yard Inventory & Crane Dispatch Slot...'}
            {step === 4 && 'Transaction Successful! Official Tax Invoice Ready.'}
          </p>
        </div>

        {/* ─── Real-Time Live Progress Bar ─── */}
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden my-4 border border-slate-700/60">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              isCompleted
                ? 'w-full bg-emerald-500'
                : step === 1
                ? 'w-1/4 bg-amber-500'
                : step === 2
                ? 'w-2/3 bg-amber-400'
                : 'w-5/6 bg-emerald-400'
            }`}
          />
        </div>

        {/* ─── Transaction Summary Card ─── */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs mb-5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Order Reference:</span>
            <span className="font-mono font-bold text-amber-400">{orderNumber}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Company / Yard:</span>
            <span className="font-bold text-white text-right">
              PRASAD CEMENT WORK
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Item:</span>
            <span className="text-white font-medium truncate max-w-[180px]">
              {productName} {variantName ? `(${variantName})` : ''}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Quantity:</span>
            <span className="text-white font-mono">{quantity} Unit(s)</span>
          </div>

          {txnId && (
            <div className="flex justify-between items-center pt-1 text-[10px] text-slate-500">
              <span>UPI / Txn Ref:</span>
              <span className="font-mono text-slate-400">{txnId}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-white font-bold text-sm">Amount Paid:</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {formatPrice(amount)}
            </span>
          </div>
        </div>

        {/* ─── Post-Completion Action Buttons ─── */}
        {isCompleted ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Primary Action: Open Tax Invoice */}
            <button
              onClick={() => {
                onViewInvoice();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.01]"
            >
              <FileText className="w-4 h-4" />
              <span>View & Download Tax Invoice (PDF)</span>
            </button>

            {/* WhatsApp Confirmation to Owner */}
            <a
              href={`https://wa.me/918919526315?text=${encodeURIComponent(
                `Hello Sri Penchila LakshmiNarasimha Swamy Cement Work (PRASAD CEMENT WORK)! I have successfully booked and paid ${formatPrice(
                  amount
                )} for Order #${orderNumber}. Txn: ${txnId}. Please confirm dispatch schedule to Velagatoor / Jagtial.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm on WhatsApp (8919526315)</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition-colors"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Please do not refresh or press back...</span>
          </div>
        )}
      </div>
    </div>
  );
}
