'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const { t, localizeProduct, localizeVariant, localizeCategory } = useLanguage();
  const router = useRouter();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto border border-slate-800">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Your Cart is Empty</h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Explore our precast cement windows, door frames, bricks, or pools and add items to your cart.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
        >
          <span>Browse Product Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review your precast concrete material items before delivery checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const variant = item.variant;
            const product = variant?.product;
            const imgUrl =
              variant?.images?.[0]?.url ||
              product?.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={item.id}
                className="rounded-2xl glass-panel border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <img src={imgUrl} alt={product?.name || ''} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {product ? localizeCategory(product.category) : ''}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {product ? localizeProduct(product).name : 'Precast Product'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {t('variant') || 'Variant'}: <span className="text-slate-200 font-medium">{variant ? localizeVariant(variant).name : ''}</span>
                    </p>
                    <p className="text-xs font-bold text-amber-400 sm:hidden">
                      {variant?.price ? formatPrice(variant.price) : (t('quote_required') || 'Quote Required')}
                    </p>
                  </div>
                </div>

                {/* Quantity + Price + Delete */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Quantity adjustment */}
                  <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-slate-300 hover:text-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-slate-300 hover:text-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total item price */}
                  <div className="text-right hidden sm:block min-w-[100px]">
                    <p className="text-sm font-extrabold text-white">
                      {variant?.price ? formatPrice(variant.price * item.quantity) : 'Quote Required'}
                    </p>
                    {variant?.price && (
                      <p className="text-[10px] text-slate-400">
                        {formatPrice(variant.price)} each
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-6">
            <h2 className="text-base font-bold text-white">Order Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span className="text-white font-semibold">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Delivery Fee</span>
                <span className="text-amber-400 font-medium">Calculated at Checkout</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-sm">
                <span className="font-bold text-white">Estimated Total</span>
                <span className="font-extrabold text-amber-400 text-lg">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>
            </div>

            {cart.quoteRequiredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <p>
                  You have {cart.quoteRequiredCount} item(s) that require a custom quote. Please submit a quote request for custom dimensions.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push('/checkout')}
              disabled={cart.quoteRequiredCount > 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Protected by Razorpay Payment Gateway</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct Truck Dispatch to Construction Site</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
