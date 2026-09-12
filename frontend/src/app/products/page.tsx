'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  ArrowUpDown,
  Sparkles,
  ShoppingBag,
  Crown,
  Plus,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Product, ProductCategory } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>(initialSearch);
  const [availability, setAvailability] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('sortOrder');
  const [isLoading, setIsLoading] = useState(true);

  const { isAdmin } = useAuth();
  const { language, t, localizeProduct, localizeCategory } = useLanguage();

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const res = await api.getProducts({
          category: category || undefined,
          search: search || undefined,
          availability: availability || undefined,
          sort: sortBy,
        });
        if (res?.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [category, search, availability, sortBy]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const params = new URLSearchParams(window.location.search);
    if (newCat) params.set('category', newCat);
    else params.delete('category');
    router.replace(`/products?${params.toString()}`);
  };

  const categories = [
    { id: '', label: t('cat_all') },
    { id: 'WINDOW', label: t('cat_window') },
    { id: 'DOOR', label: t('cat_door') },
    { id: 'BRICK', label: t('cat_brick') },
    { id: 'POOL', label: t('cat_pool') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Owner Quick Toolbar if Admin */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-slate-900 border-2 border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                👑 {language === 'te' ? 'యజమాని / అడ్మిన్ మోడ్ సక్రియంగా ఉంది' : 'Owner / Admin Mode Active'}
              </p>
              <p className="text-xs text-slate-300">
                {language === 'te'
                  ? 'స్టాక్ పరిమాణం, ధర లేదా కొలతలను మార్చడానికి క్రింది ఉత్పత్తి కార్డుపై క్లిక్ చేయండి.'
                  : 'Click any product card below to update yard quantity, set pricing, or change dimensions.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/products?new=1"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('btn_add_product')}</span>
            </Link>

            <Link
              href="/admin/quotes"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{t('btn_customer_quotes')}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Header & Title */}
      <div className="border-b border-slate-800 pb-6">
        <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider">
          {language === 'te' ? 'ప్రీకాస్ట్ కాంక్రీట్ ఉత్పత్తుల జాబితా' : 'Precast Concrete Catalog'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          {category
            ? categories.find((c) => c.id === category)?.label
            : (language === 'te' ? 'అన్ని నిర్మాణ ఉత్పత్తులు' : 'All Construction Products')}
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          {language === 'te'
            ? 'ఫ్యాక్టరీలో నాణ్యంగా తయారైన సిమెంట్ ఫ్రేములు, మోడ్యులర్ దర్వాజాలు, ఇటుకలు మరియు పూల్స్. అన్ని ఉత్పత్తులు సైజుల వివరాలతో లభించును.'
            : 'Factory-cured cement frames, modular door jambs, masonry blocks, and precast basins. All products include size-variant specifications.'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center glass-panel p-4 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by size (2x2, 3x7), grill, solid, pool..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Availability Filter & Sort */}
        <div className="flex items-center gap-3">
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Availability</option>
            <option value="IN_STOCK">Ready In Stock</option>
            <option value="MADE_TO_ORDER">Made To Order / Custom</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="sortOrder">Featured Sort</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              category === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
            ></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <Layers className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No products found matching your filter</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search terms or view our custom quote form for special dimensions.
          </p>
          <Link
            href="/quote"
            className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950"
          >
            Request Custom Sizing Quote
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((rawProduct) => {
            const product = localizeProduct(rawProduct);
            const minPrice = product.variants?.reduce((min, v) => {
              if (!v.price) return min;
              return min === null || v.price < min ? v.price : min;
            }, null as number | null);

            return (
              <div
                key={product.id}
                className="group rounded-2xl overflow-hidden glass-panel border border-slate-800 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5"
              >
                <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                  <img
                    src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-950/80 text-amber-400 border border-amber-500/30 uppercase tracking-wider backdrop-blur-md">
                    {localizeCategory(rawProduct.category)}
                  </span>
                  {product.subType && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900/80 text-slate-300 border border-slate-700">
                      {product.subType}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Variant options preview */}
                    <div className="mt-3">
                      <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                        {t('available_sizes')} ({product.variants?.length || 0})
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {product.variants?.slice(0, 4).map((v) => (
                          <span
                            key={v.id}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700/60"
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">{t('starting_at')}</p>
                      <p className="text-lg font-extrabold text-amber-400">
                        {minPrice ? formatPrice(minPrice) : t('quote_on_request')}
                      </p>
                    </div>

                    <Link
                      href={`/products/${rawProduct.slug}`}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                        isAdmin
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                      }`}
                    >
                      {isAdmin ? (
                        <>
                          <Settings className="w-3.5 h-3.5" />
                          <span>{t('manage_stock_price')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('select_size_book')}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
