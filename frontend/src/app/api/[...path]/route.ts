import { NextRequest, NextResponse } from 'next/server';

// ─── Default In-Memory / Serverless Store ────────────────────────────────────
// Ensures the application works on Vercel even when the local backend server is closed.

interface Variant {
  id: string;
  name: string;
  sku: string;
  width?: number;
  height?: number;
  dimensionUnit: string;
  price: number;
  comparePrice?: number;
  stock: number;
  availability: string;
  attributes?: string;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subType?: string;
  unitOfSale: string;
  minOrderQuantity: number;
  isFeatured: boolean;
  sortOrder: number;
  images: { id: string; url: string; altText: string }[];
  variants: Variant[];
}

const INITIAL_PRODUCTS: Product[] = [
  // ── 🧱 CEMENT BRICKS & BLOCKS ─────────────────────────────────────────────
  {
    id: 'prod_brk_8x6',
    name: 'Cement Bricks & Blocks – 8×6 inches',
    slug: 'cement-bricks-8x6',
    description: 'Solid precast cement concrete construction bricks. Size: 8×6 inches. Made with 53-grade OPC cement for superior compressive load-bearing strength. 10,000+ pieces in stock.',
    category: 'BRICK',
    subType: 'Solid Concrete',
    unitOfSale: 'PIECE',
    minOrderQuantity: 100,
    isFeatured: true,
    sortOrder: 1,
    images: [{ id: 'img_brk_1', url: '/images/products/bricks.jpg', altText: 'Cement Bricks & Blocks – 8×6 inches' }],
    variants: [
      { id: 'v_brk_8x6_pc', name: '8×6 inches — Per Piece', sku: 'BRK-8x6-PC', width: 8, height: 6, dimensionUnit: 'in', price: 1000, stock: 10000, availability: 'IN_STOCK', sortOrder: 0 },
      { id: 'v_brk_8x6_1k', name: '8×6 inches — Lot of 1000 Bricks', sku: 'BRK-8x6-1K', width: 8, height: 6, dimensionUnit: 'in', price: 900000, stock: 10, availability: 'IN_STOCK', sortOrder: 1 },
    ],
  },
  {
    id: 'prod_brk_9x4',
    name: 'Cement Bricks & Blocks – 9×4 inches',
    slug: 'cement-bricks-9x4',
    description: 'Solid precast cement concrete construction bricks. Size: 9×4 inches. Standard masonry sizing, clean uniform edges, reduced mortar requirements. 10,000+ pieces in stock.',
    category: 'BRICK',
    subType: 'Solid Concrete',
    unitOfSale: 'PIECE',
    minOrderQuantity: 100,
    isFeatured: true,
    sortOrder: 2,
    images: [{ id: 'img_brk_2', url: '/images/products/bricks.jpg', altText: 'Cement Bricks & Blocks – 9×4 inches' }],
    variants: [
      { id: 'v_brk_9x4_pc', name: '9×4 inches — Per Piece', sku: 'BRK-9x4-PC', width: 9, height: 4, dimensionUnit: 'in', price: 800, stock: 10000, availability: 'IN_STOCK', sortOrder: 0 },
      { id: 'v_brk_9x4_1k', name: '9×4 inches — Lot of 1000 Bricks', sku: 'BRK-9x4-1K', width: 9, height: 4, dimensionUnit: 'in', price: 700000, stock: 10, availability: 'IN_STOCK', sortOrder: 1 },
    ],
  },

  // ── 🕳️ GAGULU (CEMENT WELL RINGS) ──────────────────────────────────────────
  {
    id: 'prod_gag_2ft',
    name: 'Gagulu Cement Ring – 2ft Diameter',
    slug: 'gagulu-cement-ring-2ft',
    description: 'Heavy-duty precast cement concrete well ring (Gagulu). Diameter: 2ft. Built with high-grade reinforced concrete for drainage channels, soak pits, and bore well protections.',
    category: 'POOL',
    subType: 'Gagulu (Rings)',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 3,
    images: [{ id: 'img_gag_1', url: '/images/products/gagulu.jpg', altText: 'Gagulu Cement Ring – 2ft Diameter' }],
    variants: [
      { id: 'v_gag_2ft', name: '2ft Diameter Ring', sku: 'GAG-2FT', width: 2, height: 1, dimensionUnit: 'ft', price: 18000, stock: 60, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_gag_3ft',
    name: 'Gagulu Cement Ring – 3ft Diameter',
    slug: 'gagulu-cement-ring-3ft',
    description: 'Heavy-duty precast cement concrete well ring (Gagulu). Diameter: 3ft. Durable reinforced structure for water wells, septic tanks, and construction sites.',
    category: 'POOL',
    subType: 'Gagulu (Rings)',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 4,
    images: [{ id: 'img_gag_2', url: '/images/products/gagulu.jpg', altText: 'Gagulu Cement Ring – 3ft Diameter' }],
    variants: [
      { id: 'v_gag_3ft', name: '3ft Diameter Ring', sku: 'GAG-3FT', width: 3, height: 1, dimensionUnit: 'ft', price: 22000, stock: 50, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_gag_4ft',
    name: 'Gagulu Cement Ring – 4ft Diameter',
    slug: 'gagulu-cement-ring-4ft',
    description: 'Heavy-duty precast cement concrete well ring (Gagulu). Diameter: 4ft. Heavy reinforced structure engineered for agricultural wells, water storage, and farm percolation.',
    category: 'POOL',
    subType: 'Gagulu (Rings)',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 5,
    images: [{ id: 'img_gag_3', url: '/images/products/gagulu.jpg', altText: 'Gagulu Cement Ring – 4ft Diameter' }],
    variants: [
      { id: 'v_gag_4ft', name: '4ft Diameter Ring', sku: 'GAG-4FT', width: 4, height: 1, dimensionUnit: 'ft', price: 36000, stock: 40, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },

  // ── 🪟 KODADA KETIKELU (HAND-MADE WINDOWS) ─────────────────────────────────
  {
    id: 'prod_kod_2x2',
    name: 'Kodada Ketikelu – 2ft × 2ft',
    slug: 'kodada-ketikelu-2x2',
    description: 'Hand-crafted precast cement window frame with royal blue iron security grill. Size: 2ft × 2ft. Built with high-strength OPC concrete, termite-proof and weather-resistant.',
    category: 'WINDOW',
    subType: 'Kodada (Hand-made)',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 6,
    images: [{ id: 'img_kod_1', url: '/images/products/kodada-ketikelu.jpg', altText: 'Kodada Ketikelu – 2ft × 2ft' }],
    variants: [
      { id: 'v_kod_2x2', name: '2ft × 2ft', sku: 'KOD-WIN-2x2', width: 2, height: 2, dimensionUnit: 'ft', price: 80000, stock: 50, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_kod_3x3',
    name: 'Kodada Ketikelu – 3ft × 3ft',
    slug: 'kodada-ketikelu-3x3',
    description: 'Hand-crafted precast cement window frame with royal blue iron security grill. Size: 3ft × 3ft. Superior strength, artisan-finished concrete, lifelong durability.',
    category: 'WINDOW',
    subType: 'Kodada (Hand-made)',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 7,
    images: [{ id: 'img_kod_2', url: '/images/products/kodada-ketikelu.jpg', altText: 'Kodada Ketikelu – 3ft × 3ft' }],
    variants: [
      { id: 'v_kod_3x3', name: '3ft × 3ft', sku: 'KOD-WIN-3x3', width: 3, height: 3, dimensionUnit: 'ft', price: 120000, stock: 40, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_kod_4x3',
    name: 'Kodada Ketikelu – 4ft × 3ft',
    slug: 'kodada-ketikelu-4x3',
    description: 'Hand-crafted precast cement window frame with royal blue iron security grill. Size: 4ft × 3ft. Elegant design and heavy-duty reinforced construction.',
    category: 'WINDOW',
    subType: 'Kodada (Hand-made)',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 8,
    images: [{ id: 'img_kod_3', url: '/images/products/kodada-ketikelu.jpg', altText: 'Kodada Ketikelu – 4ft × 3ft' }],
    variants: [
      { id: 'v_kod_4x3', name: '4ft × 3ft', sku: 'KOD-WIN-4x3', width: 4, height: 3, dimensionUnit: 'ft', price: 140000, stock: 35, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_kod_4x4',
    name: 'Kodada Ketikelu – 4ft × 4ft',
    slug: 'kodada-ketikelu-4x4',
    description: 'Large hand-crafted precast cement window frame with royal blue iron security grill. Size: 4ft × 4ft. Ideal for main living rooms, halls, and frontal home elevations.',
    category: 'WINDOW',
    subType: 'Kodada (Hand-made)',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 9,
    images: [{ id: 'img_kod_4', url: '/images/products/kodada-ketikelu.jpg', altText: 'Kodada Ketikelu – 4ft × 4ft' }],
    variants: [
      { id: 'v_kod_4x4', name: '4ft × 4ft', sku: 'KOD-WIN-4x4', width: 4, height: 4, dimensionUnit: 'ft', price: 160000, stock: 25, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },

  // ── 🏭 MACHINE KETIKELU (MACHINE-MADE WINDOWS) ─────────────────────────────
  {
    id: 'prod_mch_2x2',
    name: 'Machine Ketikelu – 2ft × 2ft',
    slug: 'machine-ketikelu-2x2',
    description: 'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 2ft × 2ft. Sharp edges and smooth industrial finish.',
    category: 'WINDOW',
    subType: 'Machine-made',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 10,
    images: [{ id: 'img_mch_1', url: '/images/products/machine-ketikelu.jpg', altText: 'Machine Ketikelu – 2ft × 2ft' }],
    variants: [
      { id: 'v_mch_2x2', name: '2ft × 2ft', sku: 'MCH-WIN-2x2', width: 2, height: 2, dimensionUnit: 'ft', price: 45000, stock: 60, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_mch_3x25',
    name: 'Machine Ketikelu – 3ft × 2½ft',
    slug: 'machine-ketikelu-3x2-5',
    description: 'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 3ft × 2.5ft. Standard kitchen and utility room sizing.',
    category: 'WINDOW',
    subType: 'Machine-made',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 11,
    images: [{ id: 'img_mch_2', url: '/images/products/machine-ketikelu.jpg', altText: 'Machine Ketikelu – 3ft × 2½ft' }],
    variants: [
      { id: 'v_mch_3x25', name: '3ft × 2½ft', sku: 'MCH-WIN-3x2.5', width: 3, height: 2.5, dimensionUnit: 'ft', price: 55000, stock: 50, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_mch_3x3',
    name: 'Machine Ketikelu – 3ft × 3ft',
    slug: 'machine-ketikelu-3x3',
    description: 'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 3ft × 3ft. Best-selling window for modern homes.',
    category: 'WINDOW',
    subType: 'Machine-made',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 12,
    images: [{ id: 'img_mch_3', url: '/images/products/machine-ketikelu.jpg', altText: 'Machine Ketikelu – 3ft × 3ft' }],
    variants: [
      { id: 'v_mch_3x3', name: '3ft × 3ft', sku: 'MCH-WIN-3x3', width: 3, height: 3, dimensionUnit: 'ft', price: 60000, stock: 50, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_mch_4x3',
    name: 'Machine Ketikelu – 4ft × 3ft',
    slug: 'machine-ketikelu-4x3',
    description: 'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 4ft × 3ft. Excellent airflow and natural sunlight.',
    category: 'WINDOW',
    subType: 'Machine-made',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 13,
    images: [{ id: 'img_mch_4', url: '/images/products/machine-ketikelu.jpg', altText: 'Machine Ketikelu – 4ft × 3ft' }],
    variants: [
      { id: 'v_mch_4x3', name: '4ft × 3ft', sku: 'MCH-WIN-4x3', width: 4, height: 3, dimensionUnit: 'ft', price: 80000, stock: 40, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_mch_4x4',
    name: 'Machine Ketikelu – 4ft × 4ft',
    slug: 'machine-ketikelu-4x4',
    description: 'Large machine-manufactured precast cement window frame with royal blue iron security grill. Size: 4ft × 4ft. Maximum structural strength and ventilation.',
    category: 'WINDOW',
    subType: 'Machine-made',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 14,
    images: [{ id: 'img_mch_5', url: '/images/products/machine-ketikelu.jpg', altText: 'Machine Ketikelu – 4ft × 4ft' }],
    variants: [
      { id: 'v_mch_4x4', name: '4ft × 4ft', sku: 'MCH-WIN-4x4', width: 4, height: 4, dimensionUnit: 'ft', price: 120000, stock: 30, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },

  // ── 💨 CEMENT VENTILATORS (JALI BLOCKS) ────────────────────────────────────
  {
    id: 'prod_vent_1x1',
    name: 'Cement Ventilator Jali – 1ft × 1ft',
    slug: 'cement-ventilator-1x1',
    description: 'Decorative precast cement ventilation jali block. Size: 1ft × 1ft. Geometric lattice design for bathrooms, storerooms, staircases, and boundary walls.',
    category: 'WINDOW',
    subType: 'Ventilator Jali',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 15,
    images: [{ id: 'img_vent_1', url: '/images/products/ventilators.jpg', altText: 'Cement Ventilator Jali – 1ft × 1ft' }],
    variants: [
      { id: 'v_vent_1x1', name: '1ft × 1ft', sku: 'VENT-1x1', width: 1, height: 1, dimensionUnit: 'ft', price: 16000, stock: 300, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
  {
    id: 'prod_vent_2x1',
    name: 'Cement Ventilator Jali – 2ft × 1ft',
    slug: 'cement-ventilator-2x1',
    description: 'Decorative precast cement ventilation jali block. Size: 2ft × 1ft. Diamond / flower lattice pattern providing ample breeze while preserving privacy.',
    category: 'WINDOW',
    subType: 'Ventilator Jali',
    unitOfSale: 'PIECE',
    minOrderQuantity: 1,
    isFeatured: true,
    sortOrder: 16,
    images: [{ id: 'img_vent_2', url: '/images/products/ventilators.jpg', altText: 'Cement Ventilator Jali – 2ft × 1ft' }],
    variants: [
      { id: 'v_vent_2x1', name: '2ft × 1ft', sku: 'VENT-2x1', width: 2, height: 1, dimensionUnit: 'ft', price: 22000, stock: 250, availability: 'IN_STOCK', sortOrder: 0 },
    ],
  },
];

// Global in-memory storage for serverless runtime
const store = {
  products: [...INITIAL_PRODUCTS],
  users: [
    {
      id: 'usr_admin',
      phone: '9912179771',
      email: 'prasad@prasadcement.com',
      password: 'prasad@123',
      name: 'PRASAD',
      role: 'ADMIN',
      addresses: [],
    },
    {
      id: 'usr_customer',
      phone: '8888888888',
      email: 'rajesh@gmail.com',
      password: 'rajesh@123',
      name: 'Rajesh Kumar',
      role: 'CUSTOMER',
      addresses: [
        {
          id: 'addr_1',
          label: 'Construction Site',
          line1: '45, Industrial Area',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500032',
          isDefault: true,
        },
      ],
    },
  ],
  deliveryZones: [
    { id: 'z1', name: 'Local (0-10 km)', pincodes: ['500001', '500002', '500003', '500004', '500005'], fee: 0 },
    { id: 'z2', name: 'City (10-30 km)', pincodes: ['500010', '500020', '500030', '500032', '500040', '500050'], fee: 150000 },
    { id: 'z3', name: 'District (30-60 km)', pincodes: ['501001', '501101', '501201', '501301', '502001'], fee: 350000 },
  ],
  settings: [
    { key: 'store_name', value: 'Sri Penchila LakshmiNarasimha Swamy Cement Work' },
    { key: 'store_phone', value: '+919912179771' },
    { key: 'store_whatsapp', value: '+918919526315' },
    { key: 'store_email', value: 'prasad@prasadcement.com' },
    { key: 'store_address', value: 'Jagtial - Velgatoor Road, Opposite to Sudha Hospital, Velagatoor, Velagatoor Mandal, Jagtial District, Telangana - 505526' },
  ],
  orders: [] as any[],
  quotes: [] as any[],
  otps: new Map<string, string>(),
};

// ─── Helper: Try forwarding to live backend if available ─────────────────────
async function tryProxy(req: NextRequest, path: string[]) {
  const backendBase = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
  const targetUrl = `${backendBase}/api/${path.join('/')}${req.nextUrl.search}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200); // 1.2s timeout

    let body: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        body = await req.clone().arrayBuffer();
      } catch {}
    }

    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      if (!['host', 'connection'].includes(key.toLowerCase())) {
        headers[key] = val;
      }
    });

    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    // If backend is closed / offline or on Vercel, fallback to serverless handler below
    return null;
  }
}

// ─── Universal Serverless Handler ───────────────────────────────────────────
async function handleServerless(req: NextRequest, path: string[]) {
  const method = req.method;
  const url = req.nextUrl;
  const route = path.join('/');

  // 1. PRODUCTS
  if (route === 'products' && method === 'GET') {
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search')?.toLowerCase();

    let items = store.products;
    if (category) {
      items = items.filter((p) => p.category === category);
    }
    if (search) {
      items = items.filter((p) => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
    }

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { total: items.length, page: 1, limit: 20, totalPages: 1 },
    });
  }

  // Single Product Detail
  if (path[0] === 'products' && path.length === 2 && method === 'GET') {
    const slug = path[1];
    const product = store.products.find((p) => p.slug === slug || p.id === slug);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  }

  // Quick update product / variant (Admin)
  if (path[0] === 'products' && path.length === 4 && path[2] === 'variants' && ['PATCH', 'PUT'].includes(method)) {
    const body = await req.json();
    const [_, prodId, __, varId] = path;
    const prod = store.products.find((p) => p.id === prodId || p.slug === prodId);
    if (prod) {
      const v = prod.variants.find((vr) => vr.id === varId);
      if (v) {
        if (body.stock !== undefined) v.stock = body.stock;
        if (body.price !== undefined) v.price = body.price;
        if (body.width !== undefined) v.width = body.width;
        if (body.height !== undefined) v.height = body.height;
        return NextResponse.json({ success: true, variant: v });
      }
    }
    return NextResponse.json({ success: true });
  }

  // 2. AUTH
  // Login
  if (route === 'auth/login' && method === 'POST') {
    const body = await req.json();
    const raw = (body.identifier || body.phone || body.email || '').trim().toLowerCase();
    const pwd = body.password;

    const user = store.users.find(
      (u) =>
        u.phone === raw ||
        u.phone === raw.replace(/\D/g, '').slice(-10) ||
        u.email.toLowerCase() === raw
    );

    if (!user || user.password !== pwd) {
      return NextResponse.json({ success: false, message: 'Invalid credentials. Please check your mobile/email and password.' }, { status: 401 });
    }

    const token = `tok_${user.role.toLowerCase()}_${Date.now()}`;
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      accessToken: token,
      refreshToken: `${token}_refresh`,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
      },
    });
  }

  // Register
  if (route === 'auth/register' && method === 'POST') {
    const body = await req.json();
    const cleanPhone = (body.phone || '').replace(/\D/g, '').slice(-10);

    const newUser = {
      id: `usr_${Date.now()}`,
      phone: cleanPhone,
      email: body.email ? body.email.toLowerCase().trim() : `${cleanPhone}@customer.pcp`,
      password: body.password,
      name: body.name,
      role: 'CUSTOMER',
      addresses: [],
    };

    store.users.push(newUser);
    const token = `tok_customer_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      accessToken: token,
      refreshToken: `${token}_refresh`,
      user: newUser,
    });
  }

  // Forgot Password
  if (route === 'auth/forgot-password' && method === 'POST') {
    const body = await req.json();
    const raw = (body.identifier || '').trim().toLowerCase();
    const user = store.users.find(
      (u) => u.phone === raw || u.phone === raw.replace(/\D/g, '').slice(-10) || u.email.toLowerCase() === raw
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'No account found with this credential' }, { status: 404 });
    }

    const demoOtp = '434818';
    store.otps.set(user.phone, demoOtp);

    return NextResponse.json({
      success: true,
      message: `Password reset OTP generated. In demo mode, your OTP is: ${demoOtp}`,
      phone: user.phone,
      email: user.email,
      demoOtp,
    });
  }

  // Reset Password
  if (route === 'auth/reset-password' && method === 'POST') {
    const body = await req.json();
    const raw = (body.identifier || '').trim().toLowerCase();
    const user = store.users.find(
      (u) => u.phone === raw || u.phone === raw.replace(/\D/g, '').slice(-10) || u.email.toLowerCase() === raw
    );

    if (user && body.newPassword) {
      user.password = body.newPassword;
      return NextResponse.json({ success: true, message: 'Password reset successfully!' });
    }

    return NextResponse.json({ success: false, message: 'Password reset failed' }, { status: 400 });
  }

  // Get current user (Auth me)
  if (route === 'auth/me' && method === 'GET') {
    const authHeader = req.headers.get('authorization') || '';
    const user = authHeader.includes('admin') ? store.users[0] : store.users[1];
    return NextResponse.json({ success: true, user });
  }

  // 3. DELIVERY ZONES & SETTINGS
  if ((route === 'orders/zones' || route === 'admin/delivery-zones') && method === 'GET') {
    return NextResponse.json({ success: true, zones: store.deliveryZones });
  }

  if (route === 'admin/settings' && method === 'GET') {
    return NextResponse.json({ success: true, settings: store.settings });
  }

  // 4. ORDERS & CART
  if (route === 'orders' && method === 'POST') {
    const body = await req.json();
    const order = {
      id: `ord_${Date.now()}`,
      orderNumber: `PCP-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'CONFIRMED',
      totalAmount: body.totalAmount || 0,
      createdAt: new Date().toISOString(),
      items: body.items || [],
    };
    store.orders.push(order);
    return NextResponse.json({ success: true, order });
  }

  if (route === 'orders' && method === 'GET') {
    return NextResponse.json({ success: true, orders: store.orders });
  }

  if (route === 'cart' && method === 'GET') {
    return NextResponse.json({ success: true, cart: { items: [], total: 0 } });
  }

  // 5. QUOTES & PRECAST CALCULATOR
  if (route === 'quotes/calculate-precast' && method === 'POST') {
    const body = await req.json();
    const w = parseFloat(body.width) || 3;
    const h = parseFloat(body.height) || 3;
    const baseSqFt = w * h;
    const estRupees = Math.round(baseSqFt * 120 + 200);
    return NextResponse.json({
      success: true,
      calculation: {
        sqFt: baseSqFt,
        estimatedPricePaise: estRupees * 100,
        estimatedPriceRupees: estRupees,
        unitRate: 120,
      },
    });
  }

  if (route === 'quotes' && method === 'POST') {
    const body = await req.json();
    const quote = {
      id: `qt_${Date.now()}`,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      ...body,
    };
    store.quotes.push(quote);
    return NextResponse.json({ success: true, quote });
  }

  // Fallback default
  return NextResponse.json({ success: true, message: 'Serverless response' });
}

// ─── Route Handlers ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const proxied = await tryProxy(req, path);
  if (proxied) return proxied;
  return handleServerless(req, path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const proxied = await tryProxy(req, path);
  if (proxied) return proxied;
  return handleServerless(req, path);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const proxied = await tryProxy(req, path);
  if (proxied) return proxied;
  return handleServerless(req, path);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const proxied = await tryProxy(req, path);
  if (proxied) return proxied;
  return handleServerless(req, path);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const proxied = await tryProxy(req, path);
  if (proxied) return proxied;
  return handleServerless(req, path);
}
