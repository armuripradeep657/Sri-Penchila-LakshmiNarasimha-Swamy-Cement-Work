'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowLeft,
  Search,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Package,
  Ruler,
  IndianRupee,
  Crown,
  Camera,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Product, ProductVariant } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

// Curated high-resolution cement precast factory photography presets
const PHOTO_PRESETS = [
  {
    name: 'Cement Window',
    category: 'WINDOW',
    url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cement Door Jamb',
    category: 'DOOR',
    url: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cement Bricks',
    category: 'BRICK',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cement Pool / Basin',
    category: 'POOL',
    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Precast Wall Slab',
    category: 'WALL',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Precast Concrete Column',
    category: 'OTHER',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  },
];

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const autoOpenNew = searchParams.get('new') === '1' || searchParams.get('action') === 'new';
  const { t, localizeProduct, localizeVariant, localizeCategory } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [successToast, setSuccessToast] = useState('');

  // ─── Add Product Modal State ────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Name & Type
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('WINDOW');
  const [newProdSubType, setNewProdSubType] = useState('Reinforced Heavy Duty');
  const [newProdUnit, setNewProdUnit] = useState('PIECE');
  const [newProdDescription, setNewProdDescription] = useState(
    'Factory steam and water cured 53-grade OPC concrete precast unit with integrated high-tensile TMT rebar reinforcement.'
  );

  // 2. Customized Size & Dimensions
  const [newProdWidth, setNewProdWidth] = useState('3');
  const [newProdHeight, setNewProdHeight] = useState('4');
  const [newProdDepth, setNewProdDepth] = useState('0.5');
  const [newProdDimUnit, setNewProdDimUnit] = useState('ft');
  const [newProdVariantName, setNewProdVariantName] = useState('Standard 3ft × 4ft');

  // 3. Price
  const [newProdPriceRupees, setNewProdPriceRupees] = useState('1850');
  const [newProdIsQuoteOnly, setNewProdIsQuoteOnly] = useState(false);

  // 4. Quantity
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdMinOrderQty, setNewProdMinOrderQty] = useState('1');

  // 5. Upload Photo
  const [newProdPhotoUrl, setNewProdPhotoUrl] = useState(PHOTO_PRESETS[0].url);
  const [newProdPhotoFileName, setNewProdPhotoFileName] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New variant on existing product state
  const [showVariantModal, setShowVariantModal] = useState<string | null>(null);
  const [varName, setVarName] = useState('');
  const [varPriceRupees, setVarPriceRupees] = useState('');
  const [varStock, setVarStock] = useState('20');
  const [varWidth, setVarWidth] = useState('');
  const [varHeight, setVarHeight] = useState('');

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminProducts();
      if (res?.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (autoOpenNew) {
      setShowAddModal(true);
    }
  }, [autoOpenNew]);

  // Handle local image file upload and convert to Data URL
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Photo is too large (max 8MB). Please choose a smaller photo.');
      return;
    }

    setNewProdPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNewProdPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Sync default variant name with width & height changes
  useEffect(() => {
    if (newProdWidth && newProdHeight) {
      setNewProdVariantName(`${newProdWidth}${newProdDimUnit} × ${newProdHeight}${newProdDimUnit}`);
    }
  }, [newProdWidth, newProdHeight, newProdDimUnit]);

  // Create Product with Name, Type, Size, Price, Quantity, and Photo
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      alert('Please enter a product name');
      return;
    }

    setIsSubmitting(true);
    try {
      const slug =
        newProdName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
        '-' +
        Math.floor(100 + Math.random() * 900);

      const pricePaise = newProdIsQuoteOnly
        ? null
        : newProdPriceRupees
        ? Math.round(parseFloat(newProdPriceRupees) * 100)
        : null;

      const photoUrl = newProdPhotoUrl || PHOTO_PRESETS[0].url;

      await api.createProduct({
        name: newProdName,
        slug,
        description: newProdDescription || `${newProdName} precast concrete manufactured by Prasad Cement Products.`,
        category: newProdCategory,
        subType: newProdSubType || undefined,
        unitOfSale: newProdUnit,
        minOrderQuantity: parseInt(newProdMinOrderQty, 10) || 1,
        images: [
          {
            url: photoUrl,
            altText: newProdName,
          },
        ],
        initialVariant: {
          name: newProdVariantName || `${newProdName} Standard`,
          width: newProdWidth ? parseFloat(newProdWidth) : null,
          height: newProdHeight ? parseFloat(newProdHeight) : null,
          depth: newProdDepth ? parseFloat(newProdDepth) : null,
          dimensionUnit: newProdDimUnit,
          price: pricePaise,
          stock: parseInt(newProdStock, 10) || 0,
          availability: 'IN_STOCK',
        },
      });

      setShowAddModal(false);
      setSuccessToast(`✓ "${newProdName}" successfully created with size, price & quantity!`);
      setTimeout(() => setSuccessToast(''), 6000);

      // Reset form fields
      setNewProdName('');
      setNewProdDescription(
        'Factory steam and water cured 53-grade OPC concrete precast unit with integrated high-tensile TMT rebar reinforcement.'
      );
      setNewProdPhotoFileName('');
      await loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateVariant = async (productId: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pricePaisa = varPriceRupees ? Math.round(parseFloat(varPriceRupees) * 100) : null;
      await api.addVariant(productId, {
        name: varName,
        price: pricePaisa,
        stock: parseInt(varStock, 10) || 0,
        width: varWidth ? parseFloat(varWidth) : null,
        height: varHeight ? parseFloat(varHeight) : null,
        availability: 'IN_STOCK',
      });
      setShowVariantModal(null);
      setVarName('');
      setVarPriceRupees('');
      setVarStock('20');
      setVarWidth('');
      setVarHeight('');
      await loadProducts();
      setSuccessToast('✓ Size variant added successfully!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to add variant');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.toggleProductActive(id);
      await loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle product status');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Precast Products & Inventory Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              👑 Owner Controls
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Add new precast products with custom size, unit price, ready stock quantity, product type & photos
          </p>
        </div>

        {/* PRIMARY ACTION: Add New Product Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-2 shadow-xl shadow-amber-500/25 self-start sm:self-auto transform hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>➕ Add New Product</span>
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search precast items or categories..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total Products in Catalog: <strong className="text-white">{products.length}</strong>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400 text-xs">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading products catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800 space-y-3">
            <Layers className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-400">Click &quot;Add New Product&quot; above to create your first concrete item.</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isExpanded = expandedProductId === product.id;
            const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;

            return (
              <div
                key={product.id}
                className="rounded-3xl glass-panel border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg transition-all"
              >
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                      <img
                        src={product.images?.[0]?.url || PHOTO_PRESETS[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {localizeCategory(product.category)}
                        </span>
                        {product.subType && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                            {product.subType}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          Sold per {product.unitOfSale}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mt-1">{localizeProduct(product).name}</h3>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span>
                          Sizes: <strong className="text-white">{product.variants?.length || 0}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Total Yard Stock:{' '}
                          <strong className={totalStock > 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                            {totalStock} units
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Link
                      href={`/products/${product.slug}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Live</span>
                    </Link>

                    <button
                      onClick={() => setShowVariantModal(product.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Size</span>
                    </button>

                    <button
                      onClick={() => handleToggleActive(product.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                        product.isActive
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Draft'}
                    </button>

                    <button
                      onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                      aria-label="Expand variants"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Variants Drawer */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Size Variants, Pricing & Stock
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-400 border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Size Variant Name</th>
                            <th className="py-2 px-3">SKU</th>
                            <th className="py-2 px-3">Dimensions (W × H × D)</th>
                            <th className="py-2 px-3">Price (₹)</th>
                            <th className="py-2 px-3">Yard Stock</th>
                            <th className="py-2 px-3">Availability</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {product.variants?.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-900/40">
                              <td className="py-2.5 px-3 font-semibold text-white">{localizeVariant(v).name}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-400">{v.sku || '-'}</td>
                              <td className="py-2.5 px-3 text-slate-300">
                                {v.width && v.height
                                  ? `${v.width}×${v.height} ${v.dimensionUnit}${v.depth ? ` (Thk: ${v.depth} ${v.dimensionUnit})` : ''}`
                                  : '-'}
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-amber-400">
                                {v.price ? formatPrice(v.price) : 'Quote Only'}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    v.stock <= 5
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300'
                                  }`}
                                >
                                  {v.stock} units
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-slate-300">{v.availability.replace(/_/g, ' ')}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          COMPREHENSIVE MODAL: ADD NEW PRECAST PRODUCT
          Includes: Name, Product Type, Size, Price, Quantity & Photo Upload
         ══════════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl glass-panel border-2 border-amber-500/40 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">
                    Add New Precast Product
                  </h2>
                  <p className="text-xs text-slate-400">
                    Set product name, customize size dimensions, unit price, yard stock & upload photo
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6 text-xs">
              {/* SECTION 1: PRODUCT NAME & TYPE */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>1. Product Identity & Category</span>
                </p>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Heavy Duty TMT Reinforced Cement Window"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    Product Type *
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="WINDOW">Cement Windows</option>
                    <option value="DOOR">Cement Doors (Darwajas)</option>
                    <option value="BRICK">Cement Bricks & Blocks</option>
                    <option value="POOL">Cement Pools & Basins</option>
                    <option value="WALL">Boundary Walls & Slabs</option>
                    <option value="OTHER">Other Precast Concrete</option>
                  </select>
                </div>
              </div>

              {/* SECTION 2: CUSTOMIZE SIZE & DIMENSIONS */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>2. Customize Initial Size & Dimensions</span>
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Auto label: <strong className="text-white">{newProdVariantName}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold text-[10px]">Width</label>
                    <input
                      type="number"
                      step="any"
                      value={newProdWidth}
                      onChange={(e) => setNewProdWidth(e.target.value)}
                      placeholder="3"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold text-[10px]">Height</label>
                    <input
                      type="number"
                      step="any"
                      value={newProdHeight}
                      onChange={(e) => setNewProdHeight(e.target.value)}
                      placeholder="4"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold text-[10px]">Depth / Thk</label>
                    <input
                      type="number"
                      step="any"
                      value={newProdDepth}
                      onChange={(e) => setNewProdDepth(e.target.value)}
                      placeholder="0.5"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold text-[10px]">Unit</label>
                    <select
                      value={newProdDimUnit}
                      onChange={(e) => setNewProdDimUnit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    >
                      <option value="ft">Feet (ft)</option>
                      <option value="in">Inches (in)</option>
                      <option value="mm">Millimeters (mm)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="m">Meters (m)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-slate-300 font-semibold text-[10px]">
                    Size Variant Display Title
                  </label>
                  <input
                    type="text"
                    value={newProdVariantName}
                    onChange={(e) => setNewProdVariantName(e.target.value)}
                    placeholder="e.g. Standard 3ft × 4ft (With Grill)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SECTION 3: PRICE & READY YARD QUANTITY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                {/* Price Setting */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>3. Price Setting (₹)</span>
                    </p>
                    <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProdIsQuoteOnly}
                        onChange={(e) => setNewProdIsQuoteOnly(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Quote Only</span>
                    </label>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      disabled={newProdIsQuoteOnly}
                      value={newProdPriceRupees}
                      onChange={(e) => setNewProdPriceRupees(e.target.value)}
                      placeholder={newProdIsQuoteOnly ? 'Custom Quotation Required' : '1850'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500 disabled:opacity-40"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Unit price charged at factory dispatch gate
                  </p>
                </div>

                {/* Quantity Setting */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>4. Initial Ready Yard Quantity</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        min={0}
                        required
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        placeholder="25"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">Available in Yard</span>
                    </div>

                    <div>
                      <input
                        type="number"
                        min={1}
                        value={newProdMinOrderQty}
                        onChange={(e) => setNewProdMinOrderQty(e.target.value)}
                        placeholder="1"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">Min Order Lot</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: UPLOAD PRODUCT PHOTO */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>5. Upload Product Photo</span>
                  </p>
                  <span className="text-[10px] text-slate-400">Supports JPG, PNG, WEBP</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Photo Preview Card */}
                  <div className="sm:col-span-4 relative h-32 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-900 shadow-md">
                    <img
                      src={newProdPhotoUrl || PHOTO_PRESETS[0].url}
                      alt="Product Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-sm">
                      Live Preview
                    </span>
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-8 space-y-2">
                    {/* Native File Upload Button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all hover:border-amber-500/40 shadow-sm"
                      >
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>{newProdPhotoFileName ? `Change (${newProdPhotoFileName})` : 'Choose Photo From Device'}</span>
                      </button>
                    </div>

                    {/* Precast Presets Carousel */}
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">
                        Or pick a concrete factory preset:
                      </p>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {PHOTO_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setNewProdPhotoUrl(preset.url);
                              setNewProdPhotoFileName('');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] whitespace-nowrap border transition-all ${
                              newProdPhotoUrl === preset.url
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold text-[10px] uppercase tracking-wider">
                  Technical Specifications & Curing Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Structural reinforcement specs, 28-day water curing details..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>{isSubmitting ? 'Publishing Precast Product...' : 'Publish Product to Catalog →'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Extra Size Variant */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-slate-700 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Add Extra Size Variant</h2>

            <form onSubmit={(e) => handleCreateVariant(showVariantModal, e)} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Variant Name *</label>
                <input
                  type="text"
                  required
                  value={varName}
                  onChange={(e) => setVarName(e.target.value)}
                  placeholder="e.g. 4ft × 5ft (Jumbo With Frame)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Width (ft)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={varWidth}
                    onChange={(e) => setVarWidth(e.target.value)}
                    placeholder="4.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Height (ft)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={varHeight}
                    onChange={(e) => setVarHeight(e.target.value)}
                    placeholder="5.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Price in ₹ (Blank for Quote)</label>
                  <input
                    type="number"
                    value={varPriceRupees}
                    onChange={(e) => setVarPriceRupees(e.target.value)}
                    placeholder="e.g. 2400"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Yard Stock Units</label>
                  <input
                    type="number"
                    required
                    value={varStock}
                    onChange={(e) => setVarStock(e.target.value)}
                    placeholder="20"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVariantModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  Save Size Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400 text-xs">Loading admin products...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
