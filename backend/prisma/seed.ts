import { PrismaClient } from '@prisma/client';
import { ProductCategory, UnitOfSale, AvailabilityStatus, UserRole } from '../src/types';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clean existing data ───────────────────────────────────────────────────
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.otpToken.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.storeSetting.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ─────────────────────────────────────────────────────────────────
  console.log('  → Creating users...');

  const admin = await prisma.user.create({
    data: {
      phone: '9999999999',
      name: 'Prasad (Admin)',
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      phone: '8888888888',
      name: 'Rajesh Kumar',
      role: UserRole.CUSTOMER,
      addresses: {
        create: [
          {
            label: 'Construction Site',
            line1: '45, Industrial Area',
            line2: 'Near Bypass Road',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500032',
            isDefault: true,
          },
        ],
      },
    },
  });

  // ─── Delivery Zones ───────────────────────────────────────────────────────
  console.log('  → Creating delivery zones...');

  await prisma.deliveryZone.createMany({
    data: [
      {
        name: 'Local (0-10 km)',
        pincodes: JSON.stringify(['500001', '500002', '500003', '500004', '500005']),
        fee: 0, // Free local delivery
      },
      {
        name: 'City (10-30 km)',
        pincodes: JSON.stringify(['500010', '500020', '500030', '500032', '500040', '500050']),
        fee: 150000, // ₹1,500
      },
      {
        name: 'District (30-60 km)',
        pincodes: JSON.stringify(['501001', '501101', '501201', '501301', '502001']),
        fee: 350000, // ₹3,500
      },
    ],
  });

  // ─── Store Settings ────────────────────────────────────────────────────────
  console.log('  → Creating store settings...');

  await prisma.storeSetting.createMany({
    data: [
      { key: 'store_name', value: 'Prasad Cement Products' },
      { key: 'store_phone', value: '+919999999999' },
      { key: 'store_whatsapp', value: '+919999999999' },
      { key: 'store_email', value: 'prasadcementproducts@gmail.com' },
      { key: 'store_address', value: 'Plot No. 12, Industrial Area, Hyderabad, Telangana 500032' },
      { key: 'store_latitude', value: '17.3850' },
      { key: 'store_longitude', value: '78.4867' },
      { key: 'store_tagline', value: 'Quality Precast Cement Products for Every Construction Need' },
      { key: 'razorpay_enabled', value: 'false' },
      { key: 'google_maps_enabled', value: 'false' },
    ],
  });

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────

  const img = (cat: string, name: string, i: number) =>
    `/images/products/${cat}/${name.toLowerCase().replace(/\s+/g, '-')}-${i}.jpg`;

  // 1. CEMENT WINDOWS
  console.log('  → Creating cement windows...');

  await prisma.product.create({
    data: {
      name: 'Standard Cement Window Frame',
      slug: 'standard-cement-window',
      description:
        'Durable precast cement window frames designed for residential and commercial buildings. Available with or without decorative grill patterns. Weather-resistant and maintenance-free construction that lasts for decades.',
      category: ProductCategory.WINDOW,
      subType: 'Standard',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 1,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80', altText: 'Standard cement window front view', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', altText: 'Standard cement window with grill', sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          {
            name: '2ft × 2ft (No Grill)',
            sku: 'WIN-STD-2x2-NG',
            width: 2, height: 2, dimensionUnit: 'ft',
            attributes: JSON.stringify({ grill: false }),
            price: 85000,
            stock: 25,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: '2ft × 2ft (With Grill)',
            sku: 'WIN-STD-2x2-G',
            width: 2, height: 2, dimensionUnit: 'ft',
            attributes: JSON.stringify({ grill: true }),
            price: 110000,
            stock: 20,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: '3ft × 3ft (No Grill)',
            sku: 'WIN-STD-3x3-NG',
            width: 3, height: 3, dimensionUnit: 'ft',
            attributes: JSON.stringify({ grill: false }),
            price: 145000,
            stock: 15,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 2,
          },
          {
            name: '3ft × 3ft (With Grill)',
            sku: 'WIN-STD-3x3-G',
            width: 3, height: 3, dimensionUnit: 'ft',
            attributes: JSON.stringify({ grill: true }),
            price: 175000,
            stock: 12,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 3,
          },
          {
            name: '3ft × 4ft (No Grill)',
            sku: 'WIN-STD-3x4-NG',
            width: 3, height: 4, dimensionUnit: 'ft',
            attributes: JSON.stringify({ grill: false }),
            price: 195000,
            stock: 10,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 4,
          },
          {
            name: '3ft × 4ft (With Grill)',
            sku: 'WIN-STD-3x4-G',
            width: 3, height: 4, dimensionUnit: 'ft',
            attributes: JSON.stringify({ grill: true }),
            price: 230000,
            stock: 8,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 5,
          },
          {
            name: 'Custom Size Window',
            sku: 'WIN-STD-CUSTOM',
            width: null, height: null, dimensionUnit: 'ft',
            attributes: JSON.stringify({ custom: true }),
            price: null,
            stock: 0,
            availability: AvailabilityStatus.MADE_TO_ORDER,
            sortOrder: 6,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Ventilation Cement Window',
      slug: 'ventilation-cement-window',
      description:
        'Specially designed precast cement ventilation windows with built-in airflow patterns. Perfect for bathrooms, kitchens, and utility rooms. Features decorative jali (lattice) patterns that allow air circulation while maintaining privacy.',
      category: ProductCategory.WINDOW,
      subType: 'Ventilation',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: false,
      sortOrder: 2,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', altText: 'Ventilation window lattice pattern', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: '1.5ft × 1.5ft Diamond Jali',
            sku: 'WIN-VENT-1.5x1.5',
            width: 1.5, height: 1.5, dimensionUnit: 'ft',
            attributes: JSON.stringify({ pattern: 'diamond' }),
            price: 55000,
            stock: 30,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: '2ft × 2ft Diamond Jali',
            sku: 'WIN-VENT-2x2',
            width: 2, height: 2, dimensionUnit: 'ft',
            attributes: JSON.stringify({ pattern: 'diamond' }),
            price: 75000,
            stock: 25,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: '2ft × 3ft Floral Jali',
            sku: 'WIN-VENT-2x3',
            width: 2, height: 3, dimensionUnit: 'ft',
            attributes: JSON.stringify({ pattern: 'floral' }),
            price: 95000,
            stock: 18,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  // 2. CEMENT DOORS (DARWAJAS)
  console.log('  → Creating cement doors...');

  await prisma.product.create({
    data: {
      name: 'Single Cement Door Frame (Darwaja)',
      slug: 'single-cement-door-frame',
      description:
        'Heavy-duty precast cement single door frame with superior strength and durability. Termite-proof, borer-proof, and completely weather-resistant. Available with or without the cement frame. Ideal for residential main doors and room entrances.',
      category: ProductCategory.DOOR,
      subType: 'Single',
      unitOfSale: UnitOfSale.SET,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 3,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80', altText: 'Single cement door frame', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: '3ft × 7ft (Frame Only)',
            sku: 'DOOR-SGL-3x7-FO',
            width: 3, height: 7, dimensionUnit: 'ft',
            attributes: JSON.stringify({ doorType: 'single', frameIncluded: true, doorLeafIncluded: false }),
            price: 250000,
            stock: 10,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: '3ft × 7ft (Frame + Precast Panel)',
            sku: 'DOOR-SGL-3x7-WD',
            width: 3, height: 7, dimensionUnit: 'ft',
            attributes: JSON.stringify({ doorType: 'single', frameIncluded: true, doorLeafIncluded: true }),
            price: 450000,
            stock: 8,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: '3.5ft × 7ft (Frame Only)',
            sku: 'DOOR-SGL-3.5x7-FO',
            width: 3.5, height: 7, dimensionUnit: 'ft',
            attributes: JSON.stringify({ doorType: 'single', frameIncluded: true, doorLeafIncluded: false }),
            price: 280000,
            stock: 8,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 2,
          },
          {
            name: '3.5ft × 7ft (Frame + Precast Panel)',
            sku: 'DOOR-SGL-3.5x7-WD',
            width: 3.5, height: 7, dimensionUnit: 'ft',
            attributes: JSON.stringify({ doorType: 'single', frameIncluded: true, doorLeafIncluded: true }),
            price: 520000,
            stock: 5,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 3,
          },
          {
            name: 'Custom Size Door Frame',
            sku: 'DOOR-SGL-CUSTOM',
            width: null, height: null, dimensionUnit: 'ft',
            attributes: JSON.stringify({ custom: true }),
            price: null,
            stock: 0,
            availability: AvailabilityStatus.MADE_TO_ORDER,
            sortOrder: 4,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Double Cement Door Frame (Darwaja)',
      slug: 'double-cement-door-frame',
      description:
        'Premium precast cement double door frame for main entrances, puja rooms, and grand entry gates. Superior structural integrity with architectural moldings that elevate building curb appeal.',
      category: ProductCategory.DOOR,
      subType: 'Double',
      unitOfSale: UnitOfSale.SET,
      minOrderQuantity: 1,
      isFeatured: false,
      sortOrder: 4,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80', altText: 'Double cement door frame', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: '5ft × 7ft (Frame Only)',
            sku: 'DOOR-DBL-5x7-FO',
            width: 5, height: 7, dimensionUnit: 'ft',
            attributes: JSON.stringify({ doorType: 'double', frameIncluded: true, doorLeafIncluded: false }),
            price: 420000,
            stock: 5,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: '5ft × 7ft (With Precast Doors)',
            sku: 'DOOR-DBL-5x7-WD',
            width: 5, height: 7, dimensionUnit: 'ft',
            attributes: JSON.stringify({ doorType: 'double', frameIncluded: true, doorLeafIncluded: true }),
            price: 780000,
            stock: 3,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: '6ft × 7ft (Frame Only)',
            sku: 'DOOR-DBL-6x7-FO',
            width: 6, height: 7, dimensionUnit: 'ft',
            attributes: JSON.stringify({ doorType: 'double', frameIncluded: true, doorLeafIncluded: false }),
            price: 480000,
            stock: 4,
            availability: AvailabilityStatus.MADE_TO_ORDER,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  // 3. CEMENT BRICKS
  console.log('  → Creating cement bricks...');

  await prisma.product.create({
    data: {
      name: 'High-Strength Solid Cement Brick',
      slug: 'solid-cement-brick',
      description:
        'High-density solid cement bricks manufactured with 53-grade OPC cement and graded aggregates. Engineered for load-bearing walls, foundations, and heavy structural masonry. Ultra-consistent dimensions reduce mortar requirements by up to 25%.',
      category: ProductCategory.BRICK,
      subType: 'Solid',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 100,
      isFeatured: true,
      sortOrder: 5,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80', altText: 'Solid cement bricks stack', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: 'Standard (9×4×3 in) — Per Unit',
            sku: 'BRK-SLD-9x4x3-PC',
            width: 9, height: 4, depth: 3, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'solid', bulkUnit: false }),
            price: 800,
            stock: 50000,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: 'Standard (9×4×3 in) — Lot of 1000',
            sku: 'BRK-SLD-9x4x3-1K',
            width: 9, height: 4, depth: 3, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'solid', bulkUnit: true, unitsPerLot: 1000 }),
            price: 700000,
            stock: 50,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: 'Heavy (12×6×4 in) — Per Unit',
            sku: 'BRK-SLD-12x6x4-PC',
            width: 12, height: 6, depth: 4, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'solid', bulkUnit: false }),
            price: 1500,
            stock: 20000,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 2,
          },
          {
            name: 'Heavy (12×6×4 in) — Lot of 1000',
            sku: 'BRK-SLD-12x6x4-1K',
            width: 12, height: 6, depth: 4, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'solid', bulkUnit: true, unitsPerLot: 1000 }),
            price: 1350000,
            stock: 20,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Lightweight Hollow Cement Block',
      slug: 'hollow-cement-brick',
      description:
        'Hollow precast concrete blocks ideal for internal partition walls, compound walls, and framed structures. Excellent thermal and acoustic insulation, light dead-load, and accelerated construction speed.',
      category: ProductCategory.BRICK,
      subType: 'Hollow',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 50,
      isFeatured: false,
      sortOrder: 6,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80', altText: 'Hollow cement blocks', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: 'Standard (16×8×8 in) — Per Block',
            sku: 'BRK-HLW-16x8x8-PC',
            width: 16, height: 8, depth: 8, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'hollow', bulkUnit: false }),
            price: 4500,
            stock: 10000,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: 'Standard (16×8×8 in) — Lot of 100',
            sku: 'BRK-HLW-16x8x8-100',
            width: 16, height: 8, depth: 8, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'hollow', bulkUnit: true, unitsPerLot: 100 }),
            price: 400000,
            stock: 100,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Eco-Friendly Fly Ash Cement Brick',
      slug: 'fly-ash-cement-brick',
      description:
        'Modern fly ash bricks combining thermal power fly ash with Portland cement and gypsum. Low water absorption, high compressive strength, sharp uniform edges, and lower carbon footprint.',
      category: ProductCategory.BRICK,
      subType: 'Fly Ash',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 500,
      isFeatured: false,
      sortOrder: 7,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80', altText: 'Fly ash bricks pallet', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: 'Standard (9×4×3 in) — Per Unit',
            sku: 'BRK-FLY-9x4x3-PC',
            width: 9, height: 4, depth: 3, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'fly-ash', bulkUnit: false }),
            price: 600,
            stock: 100000,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: 'Standard (9×4×3 in) — Lot of 1000',
            sku: 'BRK-FLY-9x4x3-1K',
            width: 9, height: 4, depth: 3, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'fly-ash', bulkUnit: true, unitsPerLot: 1000 }),
            price: 520000,
            stock: 100,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // 4. CEMENT POOLS
  console.log('  → Creating cement pools...');

  await prisma.product.create({
    data: {
      name: 'Precast Cement Garden Pool',
      slug: 'precast-garden-pool',
      description:
        'Ready-to-place monolithic precast cement garden pool basin for landscaping, Koi fish ponds, decorative fountains, and terrace gardens. Cured under controlled conditions with waterproof polymer sealants.',
      category: ProductCategory.POOL,
      subType: 'Garden',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 8,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80', altText: 'Precast garden pool', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: 'Small (4ft × 3ft × 2ft depth)',
            sku: 'POOL-GDN-4x3x2',
            width: 4, height: 3, depth: 2, dimensionUnit: 'ft',
            attributes: JSON.stringify({ poolType: 'garden', shape: 'rectangular' }),
            price: 850000,
            stock: 5,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: 'Medium (6ft × 4ft × 2.5ft depth)',
            sku: 'POOL-GDN-6x4x2.5',
            width: 6, height: 4, depth: 2.5, dimensionUnit: 'ft',
            attributes: JSON.stringify({ poolType: 'garden', shape: 'rectangular' }),
            price: 1450000,
            stock: 3,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: 'Large (8ft × 5ft × 3ft depth)',
            sku: 'POOL-GDN-8x5x3',
            width: 8, height: 5, depth: 3, dimensionUnit: 'ft',
            attributes: JSON.stringify({ poolType: 'garden', shape: 'rectangular' }),
            price: 2200000,
            stock: 2,
            availability: AvailabilityStatus.MADE_TO_ORDER,
            sortOrder: 2,
          },
          {
            name: 'Custom Landscape Dimensions',
            sku: 'POOL-GDN-CUSTOM',
            width: null, height: null, depth: null, dimensionUnit: 'ft',
            attributes: JSON.stringify({ custom: true }),
            price: null,
            stock: 0,
            availability: AvailabilityStatus.MADE_TO_ORDER,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Modular Precast Swimming Pool',
      slug: 'modular-swimming-pool',
      description:
        'Industrial-grade modular precast concrete swimming pools assembled from high-tensile interlocking panels. Designed for farmhouses, villas, resorts, and sports clubs. Quick on-site assembly with included reinforcement and sealants.',
      category: ProductCategory.POOL,
      subType: 'Swimming',
      unitOfSale: UnitOfSale.SET,
      minOrderQuantity: 1,
      isFeatured: false,
      sortOrder: 9,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', altText: 'Modular swimming pool', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: 'Compact Villa (12ft × 8ft × 4ft depth)',
            sku: 'POOL-SWM-12x8x4',
            width: 12, height: 8, depth: 4, dimensionUnit: 'ft',
            attributes: JSON.stringify({ poolType: 'swimming', installationIncluded: true }),
            price: null,
            stock: 0,
            availability: AvailabilityStatus.MADE_TO_ORDER,
            sortOrder: 0,
          },
          {
            name: 'Farmhouse Medium (20ft × 10ft × 5ft depth)',
            sku: 'POOL-SWM-20x10x5',
            width: 20, height: 10, depth: 5, dimensionUnit: 'ft',
            attributes: JSON.stringify({ poolType: 'swimming', installationIncluded: true }),
            price: null,
            stock: 0,
            availability: AvailabilityStatus.MADE_TO_ORDER,
            sortOrder: 1,
          },
          {
            name: 'Full Resort (30ft × 15ft × 6ft depth)',
            sku: 'POOL-SWM-30x15x6',
            width: 30, height: 15, depth: 6, dimensionUnit: 'ft',
            attributes: JSON.stringify({ poolType: 'swimming', installationIncluded: true }),
            price: null,
            stock: 0,
            availability: AvailabilityStatus.MADE_TO_ORDER,
            sortOrder: 2,
          },
          {
            name: 'Custom Architecture Blueprint',
            sku: 'POOL-SWM-CUSTOM',
            width: null, height: null, depth: null, dimensionUnit: 'ft',
            attributes: JSON.stringify({ custom: true, installationIncluded: true }),
            price: null,
            stock: 0,
            availability: AvailabilityStatus.MADE_TO_ORDER,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();

  console.log(`\n=================================================`);
  console.log(`✅ Prasad Cement Products database seeded successfully!`);
  console.log(`📦 ${productCount} Products across Windows, Doors, Bricks, Pools`);
  console.log(`📐 ${variantCount} Variants with size & option pricing`);
  console.log(`👤 Admin: 9999999999 (OTP: 123456)`);
  console.log(`👤 Customer: 8888888888 (OTP: 123456)`);
  console.log(`=================================================\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
