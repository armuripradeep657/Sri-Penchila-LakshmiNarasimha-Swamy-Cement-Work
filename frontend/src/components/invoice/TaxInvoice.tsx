'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import OfficialSeal from './OfficialSeal';
import {
  Download,
  Printer,
  X,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export interface InvoiceItem {
  name: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dimensions?: string;
}

export interface TaxInvoiceProps {
  invoiceNumber: string;
  orderNumber: string;
  date?: string | Date;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: InvoiceItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod?: string;
  codFee?: number;
  paymentId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

// Convert number to Indian currency words
function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  };

  const rupees = Math.floor(num / 100);
  return `Indian Rupees ${inWords(rupees)} Only`;
}

export default function TaxInvoice({
  invoiceNumber,
  orderNumber,
  date = new Date(),
  customerName = 'Valued Builder / Contractor',
  customerPhone = '+91 89195 26315',
  customerAddress,
  items,
  subtotal,
  deliveryFee,
  grandTotal,
  paymentStatus,
  paymentMethod = 'ONLINE',
  codFee,
  paymentId,
  isModal = false,
  onClose,
}: TaxInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isCOD = paymentMethod === 'COD';

  const content = (
    <div
      ref={invoiceRef}
      id="tax-invoice"
      className="relative overflow-hidden bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-300 max-w-3xl mx-auto font-sans leading-relaxed select-text"
    >
      {/* ─── Circular Center Watermark Stamp for Screen & Print ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center justify-center text-center"
      >
        <OfficialSeal size={380} watermark={true} />
      </div>

      {/* ─── Top Control Bar (Hidden on print) ─── */}
      <div className="relative z-10 no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
              isCOD
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>OFFICIAL TAX INVOICE</span>
          </span>
          <span className="text-xs text-slate-500 font-mono font-bold">
            {isCOD ? 'CASH ON DELIVERY (COD)' : paymentStatus === 'PAID' ? 'PAID IN FULL' : 'PAYMENT RECORDED'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoice (PDF)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Company Header & Logo ─── */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2 border-slate-800">
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-900 shrink-0 shadow-md">
            <Image
              src="/images/logo.png"
              alt="Sri Lakshmi Penchila Narasimha Swamy Cement Work (PRASAD CEMENT WORK)"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-600">
              PRASAD CEMENT WORK
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Sri Lakshmi Penchila Narasimha Swamy Cement Work
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Reinforced Precast Concrete Products, Windows, Darwajas, Bricks & Gagulu
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Opp. Sudha Hospital, Jagtial - Velgatoor Road, Velagatoor, Dist. Jagtial, Telangana - 505526
            </p>
            <p className="text-[11px] text-slate-500">
              Phone: +91 89195 26315 / +91 99121 79771 • Email: prasadcementproducts@gmail.com
            </p>
            <p className="text-[11px] font-bold text-slate-700 mt-0.5">
              GSTIN: 36AABCP1924L1Z8 • State: 36 (Telangana)
            </p>
          </div>
        </div>

        <div className="text-right sm:min-w-[200px] bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Tax Invoice / Receipt
          </span>
          <p className="font-mono text-base font-extrabold text-slate-900 mt-0.5">
            {invoiceNumber}
          </p>
          <div className="mt-2 text-xs text-slate-600 space-y-0.5">
            <p>
              <strong>Date:</strong> {formatDate(typeof date === 'string' ? date : date.toISOString())}
            </p>
            <p>
              <strong>Order Ref:</strong>{' '}
              <span className="font-mono font-bold text-amber-700">{orderNumber}</span>
            </p>
            {paymentId && (
              <p className="text-[10px] font-mono text-slate-500 truncate">
                <strong>Txn ID:</strong> {paymentId}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bill To & Delivery Site Details ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Bill To / Client Details:
          </span>
          <p className="font-bold text-sm text-slate-900">{customerName}</p>
          <p className="text-slate-600">Contact: {customerPhone}</p>
          <p className="text-slate-600">Type: Verified Precast Direct Buyer</p>
        </div>

        <div className="space-y-1 sm:text-right">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Delivery Site / Unloading Point:
          </span>
          {customerAddress ? (
            <div className="text-slate-800">
              <p className="font-semibold">{customerAddress.line1}</p>
              {customerAddress.line2 && <p>{customerAddress.line2}</p>}
              <p>
                {customerAddress.city}, {customerAddress.state} -{' '}
                <span className="font-mono font-bold text-amber-700">{customerAddress.pincode}</span>
              </p>
            </div>
          ) : (
            <p className="text-slate-600 italic">Factory Yard Direct Pickup (Velagatoor, Jagtial)</p>
          )}
        </div>
      </div>

      {/* ─── Itemized Products Table ─── */}
      <div className="py-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-700 font-extrabold">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-3">Item Description & Specifications</th>
              <th className="py-3 px-3 text-center">HSN</th>
              <th className="py-3 px-3 text-center">Qty</th>
              <th className="py-3 px-3 text-right">Unit Rate (₹)</th>
              <th className="py-3 px-3 text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                <td className="py-3.5 px-3">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {item.variantName || 'Standard'} {item.dimensions ? `• ${item.dimensions}` : ''}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    53-Grade OPC Concrete • TMT Reinforced • Steam Cured
                  </p>
                </td>
                <td className="py-3.5 px-3 text-center font-mono text-slate-600">6810</td>
                <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-900">
                  {item.quantity}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                  {formatPrice(item.unitPrice)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                  {formatPrice(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Financial Calculation & Tax Summary ─── */}
      <div className="border-t-2 border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-12 gap-6 text-xs">
        <div className="sm:col-span-7 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Amount in Words:
            </span>
            <p className="font-bold text-slate-800 italic mt-0.5">
              {numberToWords(grandTotal)}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Quality & Dispatch Guarantee:</p>
            <p>1. Manufactured with IS-standard 53-grade cement and ribbed steel rebar.</p>
            <p>2. Weatherproof, 100% termite-proof with compressive load ratings.</p>
            <p>3. Hydraulic crane unloading assistance provided at site address.</p>
          </div>
        </div>

        <div className="sm:col-span-5 space-y-2 text-right">
          <div className="flex justify-between text-slate-600">
            <span>Precast Materials Subtotal:</span>
            <span className="font-mono font-semibold text-slate-900">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>CGST (Inclusive 9%):</span>
            <span className="font-mono font-medium text-slate-700">
              {formatPrice(Math.round((subtotal * 0.09) / 1.18))}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>SGST (Inclusive 9%):</span>
            <span className="font-mono font-medium text-slate-700">
              {formatPrice(Math.round((subtotal * 0.09) / 1.18))}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Truck Delivery & Freight:</span>
            <span className="font-mono font-semibold text-slate-900">
              {deliveryFee === 0 ? 'FREE DISPATCH' : formatPrice(deliveryFee)}
            </span>
          </div>

          {(codFee || isCOD) && (
            <div className="flex justify-between text-amber-800 font-semibold">
              <span>COD Processing Fee (Site Verification):</span>
              <span className="font-mono font-bold text-amber-700">
                {formatPrice(codFee || 15000)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t-2 border-slate-800 flex justify-between items-baseline text-sm font-extrabold text-slate-950">
            <span>Grand Total:</span>
            <span className="text-xl font-black text-amber-600 font-mono">
              {formatPrice(grandTotal)}
            </span>
          </div>

          <div className="pt-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-widest ${
                isCOD
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : paymentStatus === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}
            >
              ●{' '}
              {isCOD
                ? 'CASH ON DELIVERY (COLLECT AT SITE UNLOADING)'
                : paymentStatus === 'PAID'
                ? 'PAID VIA ONLINE GATEWAY'
                : 'OFFICIAL BOOKING CONFIRMED'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Signatory & Stamp ─── */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6">
        <div className="text-[11px] text-slate-500 space-y-0.5">
          <p className="font-bold text-slate-700">SRI LAKSHMI PENCHILA NARASIMHA SWAMY CEMENT WORK</p>
          <p>This is a computer-generated tax invoice and verified manufacturing record.</p>
          <p>For yard inquiries or dispatch status, contact: +91 89195 26315</p>
        </div>

        <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
          <div className="relative mb-1">
            <OfficialSeal size={120} rotation={-2.5} className="filter contrast-125" />
          </div>
          <p className="text-xs font-black tracking-wide text-slate-900 mt-1">Authorised Signatory & Seal</p>
          <p className="text-[10px] font-semibold text-slate-500">Prasad Cement Work (Velagatoor Yard)</p>
        </div>
      </div>

      {/* ─── Bottom Action Bar (Hidden on print) ─── */}
      <div className="no-print mt-8 pt-6 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <a
          href={`https://wa.me/918919526315?text=${encodeURIComponent(
            `Hello Sri Lakshmi Penchila Narasimha Swamy Cement Work (PRASAD CEMENT WORK)! I have received Tax Invoice #${invoiceNumber} for Order #${orderNumber}. Please update me on dispatch.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
        >
          <Phone className="w-4 h-4" />
          <span>Confirm on WhatsApp (8919526315)</span>
        </a>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoice (PDF)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 flex items-start justify-center animate-in fade-in duration-200">
        <div className="relative w-full max-w-3xl my-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
