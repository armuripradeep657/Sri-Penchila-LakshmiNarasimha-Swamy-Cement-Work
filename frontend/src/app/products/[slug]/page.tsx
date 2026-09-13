'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  MessageCircle,
  FileText,
  ShieldCheck,
  Truck,
  Check,
  Plus,
  Minus,
  Layers,
  ArrowLeft,
  Share2,
  Info,
  Crown,
  Edit3,
  Package,
  Ruler,
  IndianRupee,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ClipboardList,
  ChevronRight,
  Clock,
  X,
  Download,
  Printer,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import TaxInvoice from '@/components/invoice/TaxInvoice';
import RealtimePaymentModal from '@/components/payment/RealtimePaymentModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { language, t, localizeProduct, localizeVariant, localizeCategory } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Customer booking state & animations
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [bookingTicketNumber, setBookingTicketNumber] = useState('');

  // Admin In-Page Editing state
  const [adminStock, setAdminStock] = useState<number>(0);
  const [adminPriceRupees, setAdminPriceRupees] = useState<string>('');
  const [adminIsQuoteOnly, setAdminIsQuoteOnly] = useState<boolean>(false);
  const [adminWidth, setAdminWidth] = useState<string>('');
  const [adminHeight, setAdminHeight] = useState<string>('');
  const [adminDepth, setAdminDepth] = useState<string>('');
  const [adminDimUnit, setAdminDimUnit] = useState<string>('ft');
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [isSavingDimensions, setIsSavingDimensions] = useState(false);
  const [adminSuccessToast, setAdminSuccessToast] = useState('');

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const res = await api.getProduct(slug);
        if (res?.product) {
          setProduct(res.product);
          if (res.product.variants && res.product.variants.length > 0) {
            const first = res.product.variants[0];
            setSelectedVariant(first);
            initAdminFields(first);
          }
          if (res.product.images && res.product.images.length > 0) {
            setActiveImage(res.product.images[0].url);
          }
          setQuantity(res.product.minOrderQuantity || 1);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const initAdminFields = (variant: ProductVariant) => {
    setAdminStock(variant.stock ?? 0);
    setAdminPriceRupees(variant.price ? (variant.price / 100).toString() : '');
    setAdminIsQuoteOnly(!variant.price);
    setAdminWidth(variant.width ? variant.width.toString() : '');
    setAdminHeight(variant.height ? variant.height.toString() : '');
    setAdminDepth(variant.depth ? variant.depth.toString() : '');
    setAdminDimUnit(variant.dimensionUnit || 'ft');
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    initAdminFields(variant);
    if (variant.images && variant.images.length > 0) {
      setActiveImage(variant.images[0].url);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const min = product?.minOrderQuantity || 1;
    const newQty = Math.max(min, quantity + delta);
    setQuantity(newQty);
  };

  // ─── Customer: Add To Cart & Book Item Animation ─────────────────────────────
  const triggerConfettiAnimation = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#10b981', '#3b82f6', '#ffffff'],
      });
    } catch (e) {
      // safe fallback if confetti fails
    }
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    await addToCart(selectedVariant, product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const handleBookItem = async () => {
    if (!product || !selectedVariant) return;

    // Add to cart
    await addToCart(selectedVariant, product, quantity);

    // Generate randomized reservation ticket reference
    const ticket = `PCP-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingTicketNumber(ticket);

    // Trigger Real-Time Payment / Allotment Animation Modal
    setShowPaymentModal(true);
  };

  // ─── Admin In-Page Actions ──────────────────────────────────────────────────
  const triggerAdminToast = (msg: string) => {
    setAdminSuccessToast(msg);
    setTimeout(() => setAdminSuccessToast(''), 4500);
  };

  const handleSaveStock = async () => {
    if (!product || !selectedVariant) return;
    setIsSavingStock(true);
    try {
      const res = await api.quickUpdateVariant(product.id, selectedVariant.id, {
        stock: adminStock,
      });
      if (res?.variant) {
        setSelectedVariant(res.variant);
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                variants: prev.variants?.map((v) => (v.id === res.variant.id ? res.variant : v)),
              }
            : null
        );
        triggerAdminToast(`✓ Yard stock updated to ${adminStock} units for ${selectedVariant.name}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setIsSavingStock(false);
    }
  };

  const handleSavePrice = async () => {
    if (!product || !selectedVariant) return;
    setIsSavingPrice(true);
    try {
      const pricePaise = adminIsQuoteOnly
        ? null
        : adminPriceRupees
        ? Math.round(parseFloat(adminPriceRupees) * 100)
        : null;

      const res = await api.quickUpdateVariant(product.id, selectedVariant.id, {
        price: pricePaise,
      });
      if (res?.variant) {
        setSelectedVariant(res.variant);
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                variants: prev.variants?.map((v) => (v.id === res.variant.id ? res.variant : v)),
              }
            : null
        );
        triggerAdminToast(
          adminIsQuoteOnly
            ? `✓ Set ${selectedVariant.name} as Quote Only`
            : `✓ Price set to ₹${adminPriceRupees} per unit`
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update price');
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handleSaveDimensions = async () => {
    if (!product || !selectedVariant) return;
    setIsSavingDimensions(true);
    try {
      const res = await api.quickUpdateVariant(product.id, selectedVariant.id, {
        width: adminWidth ? parseFloat(adminWidth) : null,
        height: adminHeight ? parseFloat(adminHeight) : null,
        depth: adminDepth ? parseFloat(adminDepth) : null,
        dimensionUnit: adminDimUnit,
      });
      if (res?.variant) {
        setSelectedVariant(res.variant);
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                variants: prev.variants?.map((v) => (v.id === res.variant.id ? res.variant : v)),
              }
            : null
        );
        triggerAdminToast(`✓ Sizing saved: ${adminWidth || '?'}×${adminHeight || '?'} ${adminDimUnit}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update dimensions');
    } finally {
      setIsSavingDimensions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 mt-4 tracking-wider uppercase">
          Loading precast specifications & yard inventory...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Layers className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <Link href="/products" className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950">
          Return to Precast Catalog
        </Link>
      </div>
    );
  }

  const isQuoteOnly = !selectedVariant?.price;
  const locProduct = product ? localizeProduct(product) : null;
  const locSelectedVariant = selectedVariant ? localizeVariant(selectedVariant) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Breadcrumb & Role Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">{t('nav_home')}</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-amber-400 transition-colors">{t('nav_products')}</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-amber-400 transition-colors">
            {localizeCategory(product.category)}
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-xs">{locProduct?.name || product.name}</span>
        </div>

        {/* Dynamic Role Badge Indicator */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-[10px] sm:text-[11px] shadow-sm flex-wrap">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">{language === 'te' ? 'యజమాని / అడ్మిన్ మోడ్ — స్టాక్ & ధర నిర్వహణ' : 'OWNER / ADMIN MODE — DIRECT INVENTORY & PRICING CONTROLS'}</span>
              <span className="sm:hidden">{language === 'te' ? 'అడ్మిన్ మోడ్' : 'ADMIN MODE'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold text-[10px] sm:text-[11px]">
              <span className="hidden sm:inline">{language === 'te' ? 'బిల్డర్ & కాంట్రాక్టర్ క్యాటలాగ్' : 'BUILDER & CONTRACTOR CATALOG'}</span>
              <span className="sm:hidden">{language === 'te' ? 'క్యాటలాగ్' : 'CATALOG'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Quick Notification Banner */}
      {adminSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{adminSuccessToast}</span>
        </div>
      )}

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative h-64 sm:h-96 md:h-[460px] w-full rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-slate-800 bg-slate-950 shadow-2xl">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80'}
              alt={locProduct?.name || product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-bold bg-slate-950/85 text-amber-400 border border-amber-500/30 uppercase tracking-wider backdrop-blur-md">
              {localizeCategory(product.category)}
            </span>

            {/* In stock badge on image */}
            <span className="absolute bottom-4 left-4 px-3 py-1 rounded-lg text-xs font-bold bg-slate-900/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{selectedVariant?.stock ? `${selectedVariant.stock} ${language === 'te' ? 'యూనిట్లు యార్డ్‌లో సిద్ధం' : 'Units In Yard'}` : (language === 'te' ? 'రెడీ కాస్ట్' : 'Ready Cast')}</span>
            </span>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img.url
                      ? 'border-amber-500 shadow-md shadow-amber-500/20 scale-105'
                      : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{language === 'te' ? '53-గ్రేడ్ OPC కాంక్రీట్ & TMT రీబార్' : '53-Grade OPC Concrete With TMT Rebar'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{language === 'te' ? 'జగిత్యాల & వెలగటూర్ క్రేన్ డెలివరీ' : 'Jagtial & Velgatoor Crane Delivery'}</span>
            </div>
          </div>
        </div>

        {/* Right: Info & Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {selectedVariant?.availability === 'IN_STOCK'
                  ? t('in_stock')
                  : selectedVariant?.availability === 'MADE_TO_ORDER'
                  ? t('made_to_order')
                  : selectedVariant?.availability?.replace(/_/g, ' ') || t('in_stock')}
              </span>
              {product.subType && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
                  {product.subType}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {locProduct?.name || product.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              {locProduct?.description || product.description}
            </p>
          </div>

          {/* Variant Selector Pills */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {language === 'te' ? 'ప్రీకాస్ట్ సైజు / వేరియంట్ ఎంచుకోండి:' : 'Select Precast Size / Variant:'}
              </label>
              <span className="text-[11px] text-amber-400 font-medium">
                {product.variants?.length} {language === 'te' ? 'సైజులు అందుబాటులో ఉన్నాయి' : 'Options Available'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.variants?.map((v) => {
                const locV = localizeVariant(v);
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleVariantSelect(v)}
                    className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/15 ring-1 ring-amber-500/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                        {locV.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
                      <span className="text-slate-300 font-semibold">
                        {v.price ? formatPrice(v.price) : t('quote_on_request')}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {v.stock > 0
                          ? `${v.stock} ${language === 'te' ? 'యార్డ్‌లో సిద్ధంగా ఉంది' : 'ready in yard'}`
                          : (language === 'te' ? 'ఆర్డర్ మేరకు తయారుచేయబడును' : 'Cast on order')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              ADMIN WORKSTATION (If isAdmin === true)
              Admin NEVER sees "Book Item", "Add to Cart", or "Buy Now".
              Instead, they have direct controls:
              1. Add New Product
              2. Update Quantity (Stock)
              3. Set Price
              4. Set Size / Dimensions
              5. Manage Customer Quotes
             ════════════════════════════════════════════════════════════════════════ */}
          {isAdmin ? (
            <div className="rounded-3xl bg-slate-950 border-2 border-amber-500/40 p-6 space-y-6 shadow-2xl relative overflow-hidden">
              {/* Gold Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600"></div>

              {/* Station Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>Owner Fast Control Center</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        {selectedVariant?.name}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Edit yard stock quantity, price, size & inspect contractor inquiries
                    </p>
                  </div>
                </div>

                {/* 1. Add New Product Button */}
                <Link
                  href="/admin/products?new=1"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </Link>
              </div>

              {/* 2. UPDATE QUANTITY (YARD STOCK) */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Update Ready Yard Quantity</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Current Yard Stock: <strong className="text-white font-mono">{selectedVariant?.stock ?? 0} units</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminStock((s) => Math.max(0, s - 10))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminStock((s) => Math.max(0, s - 1))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono"
                  >
                    -1
                  </button>

                  <input
                    type="number"
                    min={0}
                    value={adminStock}
                    onChange={(e) => setAdminStock(parseInt(e.target.value, 10) || 0)}
                    className="w-24 bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-center text-sm font-bold text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                  />

                  <button
                    type="button"
                    onClick={() => setAdminStock((s) => s + 1)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminStock((s) => s + 10)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono"
                  >
                    +10
                  </button>

                  <button
                    type="button"
                    disabled={isSavingStock}
                    onClick={handleSaveStock}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingStock ? 'Saving...' : 'Save Stock'}</span>
                  </button>
                </div>
              </div>

              {/* 3. SET PRICE (₹) */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-amber-400" />
                    <span>Set Unit Price (₹)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminIsQuoteOnly}
                      onChange={(e) => setAdminIsQuoteOnly(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>Quote Only (No Fixed Price)</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      disabled={adminIsQuoteOnly}
                      value={adminPriceRupees}
                      onChange={(e) => setAdminPriceRupees(e.target.value)}
                      placeholder={adminIsQuoteOnly ? 'Requires Custom Quote' : 'e.g. 1850'}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 disabled:opacity-40"
                    />
                  </div>

                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    per {product.unitOfSale?.toLowerCase()}
                  </span>

                  <button
                    type="button"
                    disabled={isSavingPrice}
                    onClick={handleSavePrice}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingPrice ? 'Saving...' : 'Save Price'}</span>
                  </button>
                </div>
              </div>

              {/* 4. SET SIZE / DIMENSIONS */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-amber-400" />
                    <span>Set Size & Dimensions</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Current: {selectedVariant?.width}×{selectedVariant?.height} {selectedVariant?.dimensionUnit}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Width</span>
                    <input
                      type="number"
                      step="any"
                      value={adminWidth}
                      onChange={(e) => setAdminWidth(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Height</span>
                    <input
                      type="number"
                      step="any"
                      value={adminHeight}
                      onChange={(e) => setAdminHeight(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Depth / Thk</span>
                    <input
                      type="number"
                      step="any"
                      value={adminDepth}
                      onChange={(e) => setAdminDepth(e.target.value)}
                      placeholder="e.g. 0.5"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Unit</span>
                    <select
                      value={adminDimUnit}
                      onChange={(e) => setAdminDimUnit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    >
                      <option value="ft">Feet (ft)</option>
                      <option value="in">Inches (in)</option>
                      <option value="mm">Millimeters (mm)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="m">Meters (m)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isSavingDimensions}
                    onClick={handleSaveDimensions}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingDimensions ? 'Saving...' : 'Save Sizing'}</span>
                  </button>
                </div>
              </div>

              {/* 5. CUSTOMER QUOTATIONS & ADMIN NAVIGATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link
                  href="/admin/quotes"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-all"
                >
                  <ClipboardList className="w-4 h-4 text-amber-400" />
                  <span>Customer Quotes & Inquiries</span>
                </Link>

                <Link
                  href="/admin/products"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Full Admin Products Desk</span>
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
                <span>🛡️ Customer buying buttons (Cart / Buy / Book) are hidden for Owner role</span>
                <Link href="/profile" className="font-bold underline hover:text-white">
                  Edit Profile
                </Link>
              </div>
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════════════
               CUSTOMER WORKSTATION (Contractors / Builders / Buyers)
               Shows Book Item with celebratory animation, Add to Cart, Buy Now
               ════════════════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {/* Customer Price Box */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <p className="text-xs text-slate-400">
                  {isQuoteOnly ? 'Custom Quotation Model' : 'Factory Direct Dispatch Price'}
                </p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-extrabold text-amber-400">
                    {formatPrice(selectedVariant?.price)}
                  </span>
                  {!isQuoteOnly && (
                    <span className="text-xs text-slate-400 font-medium">
                      per {product.unitOfSale?.toLowerCase()?.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                {isQuoteOnly && (
                  <p className="text-xs text-amber-400/90 mt-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Custom dimension or bulk unit — final pricing confirmed via quotation</span>
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              {!isQuoteOnly && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Quantity Required ({product.unitOfSale})
                    </label>
                    {product.minOrderQuantity > 1 && (
                      <span className="text-[11px] text-amber-400 font-semibold">
                        Min Lot: {product.minOrderQuantity} {product.unitOfSale}s
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900 shadow-inner">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-3 text-slate-300 hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-16 text-center text-sm font-bold text-white font-mono">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-3 text-slate-300 hover:text-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-400">
                      <span>Subtotal: </span>
                      <strong className="text-white text-base font-extrabold">
                        {formatPrice((selectedVariant?.price || 0) * quantity)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons for Customers */}
              <div className="space-y-3 pt-2">
                {!isQuoteOnly ? (
                  <div className="space-y-3">
                    {/* PRIMARY ACTION: Book Item (With festive reservation ticket animation) */}
                    <button
                      onClick={handleBookItem}
                      className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.01] active:scale-98 animate-pulse hover:animate-none"
                    >
                      <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
                      <span>✨ Book Item (Instant Yard Reservation)</span>
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Secondary: Add to Cart */}
                      <button
                        onClick={handleAddToCart}
                        className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-amber-500/40 transition-all"
                      >
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>{addedSuccess ? '✓ Added to Cart!' : 'Add to Cart'}</span>
                      </button>

                      {/* Buy Now directly to Checkout */}
                      <button
                        onClick={async () => {
                          await handleAddToCart();
                          router.push('/checkout');
                        }}
                        className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all"
                      >
                        <span>Direct Checkout →</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/quote?productId=${product.id}&variantId=${selectedVariant?.id || ''}`}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/25 transition-all transform hover:scale-[1.01]"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Request Custom Precast Quote</span>
                  </Link>
                )}

                {/* WhatsApp Direct Enquiry */}
                <a
                  href={`https://wa.me/918919526315?text=${encodeURIComponent(
                    `Hello Sri Penchila LakshmiNarasimha Swamy Cement Work, I am inquiring about "${product.name}" (${selectedVariant?.name || ''}). Quantity: ${quantity}. Delivery needed in Jagtial / Velgatoor area.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 sm:px-6 rounded-xl font-semibold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Chat on WhatsApp with Sri Penchila LakshmiNarasimha Swamy Cement Work</span>
                  <span className="sm:hidden">WhatsApp Enquiry</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Technical Specifications Section */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          <span>Technical Concrete Specifications</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Dimensions (W × H × D)</span>
            <p className="text-white font-medium text-sm">
              {selectedVariant?.width && selectedVariant?.height
                ? `${selectedVariant.width} × ${selectedVariant.height} ${selectedVariant.dimensionUnit}`
                : selectedVariant?.name}
              {selectedVariant?.depth ? ` (Thk: ${selectedVariant.depth} ${selectedVariant.dimensionUnit})` : ''}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Unit of Sale</span>
            <p className="text-white font-medium text-sm">
              Sold per {product.unitOfSale}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Curing Method</span>
            <p className="text-white font-medium text-sm">
              Steam & Water Cured (28-day rated strength)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Termite & Weather</span>
            <p className="text-white font-medium text-sm">
              100% Termite-Proof, Borer-Proof & Rust-Proof
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">SKU Reference</span>
            <p className="text-white font-mono text-xs">
              {selectedVariant?.sku || 'PCP-STD'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Dispatch Location</span>
            <p className="text-white font-medium text-sm">
              Jagtial - Velgatoor Road, Opp. Sudha Hospital, Velagatoor, Jagtial Dist - 505526
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          ANIMATED CUSTOMER BOOKING TICKET MODAL
          Displayed when a customer clicks "Book Item"
         ══════════════════════════════════════════════════════════════════════════ */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 sm:p-8 space-y-6 shadow-2xl shadow-amber-500/20 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ticket Header & Seal */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                <Sparkles className="w-8 h-8 text-slate-950" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ★ OFFICIAL PRECAST ALLOTMENT RESERVED ★
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                Item Booked Successfully!
              </h3>
              <p className="text-xs text-slate-400">
                Booking Reference:{' '}
                <span className="font-mono font-bold text-amber-400">{bookingTicketNumber}</span>
              </p>
            </div>

            {/* Animated Confirmation Steps */}
            <div className="space-y-2.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Factory Yard Inventory Allocated ({quantity} {product.unitOfSale}s)</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>53-Grade OPC Concrete Quality Verified</span>
              </div>
              <div className="flex items-center gap-3 text-amber-400">
                <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                <span>Hydraulic Crane Truck Delivery Slot Queued</span>
              </div>
            </div>

            {/* Booked Item Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'te' ? 'ఉత్పత్తి:' : 'Product:'}</span>
                <span className="text-white font-bold">{locProduct?.name || product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'te' ? 'సైజు / వేరియంట్:' : 'Variant / Size:'}</span>
                <span className="text-amber-400 font-semibold">{locSelectedVariant?.name || selectedVariant?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'te' ? 'పరిమాణం:' : 'Quantity:'}</span>
                <span className="text-white font-mono font-bold">{quantity} {product.unitOfSale}s</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between text-sm">
                <span className="text-slate-300 font-bold">{language === 'te' ? 'మొత్తం అంచనా:' : 'Estimated Total:'}</span>
                <span className="text-amber-400 font-extrabold">
                  {formatPrice((selectedVariant?.price || 0) * quantity)}
                </span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="space-y-2.5">
              {/* Download Tax Invoice Button */}
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Official Tax Invoice (PDF)</span>
              </button>

              <button
                onClick={() => {
                  setShowBookingModal(false);
                  router.push('/checkout');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
              >
                <span>Proceed to Delivery Address & Checkout →</span>
              </button>

              <a
                href={`https://wa.me/918919526315?text=${encodeURIComponent(
                  `Hello Sri Penchila LakshmiNarasimha Swamy Cement Work (PRASAD CEMENT WORK)! I just booked ${quantity} units of "${product.name}" (${selectedVariant?.name}). Ref: ${bookingTicketNumber}. Please confirm dispatch schedule to Velagatoor / Jagtial.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm on WhatsApp (8919526315)</span>
              </a>

              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-white"
              >
                Continue Browsing Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Real-Time Payment / Booking Animation Modal ─── */}
      <RealtimePaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setShowBookingModal(true);
        }}
        orderNumber={bookingTicketNumber || 'PCP-BOOKING'}
        amount={(selectedVariant?.price || 0) * quantity}
        productName={locProduct?.name || product.name}
        variantName={locSelectedVariant?.name || selectedVariant?.name}
        quantity={quantity}
        onViewInvoice={() => {
          setShowPaymentModal(false);
          setShowInvoiceModal(true);
        }}
      />

      {/* ─── Full Tax Invoice Modal ─── */}
      {showInvoiceModal && (
        <TaxInvoice
          isModal
          onClose={() => setShowInvoiceModal(false)}
          invoiceNumber={`INV-${bookingTicketNumber || Date.now().toString().slice(-6)}`}
          orderNumber={bookingTicketNumber || 'PCP-RESERVE'}
          date={new Date()}
          customerName={user?.name || 'Valued Builder / Contractor'}
          customerPhone={user?.phone || '+91 89195 26315'}
          items={[
            {
              name: locProduct?.name || product.name,
              variantName: locSelectedVariant?.name || selectedVariant?.name,
              quantity: quantity,
              unitPrice: selectedVariant?.price || 0,
              totalPrice: (selectedVariant?.price || 0) * quantity,
              dimensions:
                selectedVariant?.width && selectedVariant?.height
                  ? `${selectedVariant.width}×${selectedVariant.height} ${selectedVariant.dimensionUnit || ''}`
                  : undefined,
            },
          ]}
          subtotal={(selectedVariant?.price || 0) * quantity}
          deliveryFee={0}
          grandTotal={(selectedVariant?.price || 0) * quantity}
          paymentStatus="PAID"
        />
      )}
    </div>
  );
}
