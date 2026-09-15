import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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

  // Hash passwords
  const adminPassword = await bcrypt.hash('905250', 12);
  const customerPassword = await bcrypt.hash('customer@123', 12);

  const admin = await prisma.user.create({
    data: {
      phone: '9912179771',
      email: 'armuriprasad@gmail.com',
      password: adminPassword,
      name: 'Prasad Armuri',
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      phone: '9848011223',
      email: 'suresh.babu@gmail.com',
      password: customerPassword,
      name: 'Suresh Babu',
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
      { key: 'store_phone', value: '+919912179771' },
      { key: 'store_whatsapp', value: '+919912179771' },
      { key: 'store_email', value: 'prasad@prasadcement.com' },
      { key: 'store_address', value: 'Plot No. 12, Industrial Area, Hyderabad, Telangana 500032' },
      { key: 'store_latitude', value: '17.3850' },
      { key: 'store_longitude', value: '78.4867' },
      { key: 'store_tagline', value: 'Quality Precast Cement Products for Every Construction Need' },
      { key: 'razorpay_enabled', value: 'false' },
      { key: 'google_maps_enabled', value: 'false' },
    ],
  });

  // ─── 16 INDIVIDUAL PRODUCTS BY SIZE ───────────────────────────────────────
  console.log('  → Creating 16 authentic products by size...');

  const productsData = [
    // 🧱 CEMENT BRICKS & BLOCKS
    {
      name: 'Cement Bricks & Blocks – 8×6 inches',
      slug: 'cement-bricks-8x6',
      description: 'Solid high-density precast cement concrete construction bricks. Size: 8×6 inches. Cast with premium 53-grade OPC cement for heavy-duty structural load-bearing capacity.',
      category: ProductCategory.BRICK,
      subType: 'Solid Concrete',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 100,
      isFeatured: true,
      sortOrder: 1,
      image: '/images/products/bricks.jpg',
      variants: [
        { name: '8×6 inches — Per Piece', sku: 'BRK-8x6-PC', width: 8, height: 6, dimensionUnit: 'in', price: 1000, stock: 10000, sortOrder: 0 },
        { name: '8×6 inches — Lot of 1000 Bricks', sku: 'BRK-8x6-1K', width: 8, height: 6, dimensionUnit: 'in', price: 900000, stock: 10, sortOrder: 1 },
      ],
    },
    {
      name: 'Cement Bricks & Blocks – 9×4 inches',
      slug: 'cement-bricks-9x4',
      description: 'Solid high-density precast cement concrete construction bricks. Size: 9×4 inches. Cast with premium 53-grade OPC cement for strong wall masonry and durable partitions.',
      category: ProductCategory.BRICK,
      subType: 'Solid Concrete',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 100,
      isFeatured: true,
      sortOrder: 2,
      image: '/images/products/bricks.jpg',
      variants: [
        { name: '9×4 inches — Per Piece', sku: 'BRK-9x4-PC', width: 9, height: 4, dimensionUnit: 'in', price: 800, stock: 10000, sortOrder: 0 },
        { name: '9×4 inches — Lot of 1000 Bricks', sku: 'BRK-9x4-1K', width: 9, height: 4, dimensionUnit: 'in', price: 700000, stock: 10, sortOrder: 1 },
      ],
    },

    // 🕳️ GAGULU (CEMENT WELL RINGS)
    {
      name: 'Gagulu Cement Ring – 2ft Diameter',
      slug: 'gagulu-cement-ring-2ft',
      description: 'Heavy-duty precast cement concrete well ring (Gagulu). Diameter: 2ft. Built with high-grade reinforced concrete for drainage channels, soak pits, and bore well protections.',
      category: ProductCategory.POOL,
      subType: 'Gagulu (Rings)',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 3,
      image: '/images/products/gagulu.jpg',
      variants: [
        { name: '2ft Diameter Ring', sku: 'GAG-2FT', width: 2, height: 1, dimensionUnit: 'ft', price: 18000, stock: 60, sortOrder: 0 },
      ],
    },
    {
      name: 'Gagulu Cement Ring – 3ft Diameter',
      slug: 'gagulu-cement-ring-3ft',
      description: 'Heavy-duty precast cement concrete well ring (Gagulu). Diameter: 3ft. Durable reinforced structure for water wells, septic tanks, and construction sites.',
      category: ProductCategory.POOL,
      subType: 'Gagulu (Rings)',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 4,
      image: '/images/products/gagulu.jpg',
      variants: [
        { name: '3ft Diameter Ring', sku: 'GAG-3FT', width: 3, height: 1, dimensionUnit: 'ft', price: 22000, stock: 50, sortOrder: 0 },
      ],
    },
    {
      name: 'Gagulu Cement Ring – 4ft Diameter',
      slug: 'gagulu-cement-ring-4ft',
      description: 'Heavy-duty precast cement concrete well ring (Gagulu). Diameter: 4ft. Heavy reinforced structure engineered for agricultural wells, water storage, and farm percolation.',
      category: ProductCategory.POOL,
      subType: 'Gagulu (Rings)',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 5,
      image: '/images/products/gagulu.jpg',
      variants: [
        { name: '4ft Diameter Ring', sku: 'GAG-4FT', width: 4, height: 1, dimensionUnit: 'ft', price: 36000, stock: 40, sortOrder: 0 },
      ],
    },

    // 🪟 KODADA KETIKELU (HAND-MADE WINDOWS)
    {
      name: 'Kodada Ketikelu – 2ft × 2ft',
      slug: 'kodada-ketikelu-2x2',
      description: 'Hand-crafted precast cement window frame with royal blue iron security grill. Size: 2ft × 2ft. Built with high-strength OPC concrete, termite-proof and weather-resistant.',
      category: ProductCategory.WINDOW,
      subType: 'Kodada (Hand-made)',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 6,
      image: '/images/products/kodada-ketikelu.jpg',
      variants: [
        { name: '2ft × 2ft', sku: 'KOD-WIN-2x2', width: 2, height: 2, dimensionUnit: 'ft', price: 80000, stock: 50, sortOrder: 0 },
      ],
    },
    {
      name: 'Kodada Ketikelu – 3ft × 3ft',
      slug: 'kodada-ketikelu-3x3',
      description: 'Hand-crafted precast cement window frame with royal blue iron security grill. Size: 3ft × 3ft. Superior strength, artisan-finished concrete, lifelong durability.',
      category: ProductCategory.WINDOW,
      subType: 'Kodada (Hand-made)',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 7,
      image: '/images/products/kodada-ketikelu.jpg',
      variants: [
        { name: '3ft × 3ft', sku: 'KOD-WIN-3x3', width: 3, height: 3, dimensionUnit: 'ft', price: 120000, stock: 40, sortOrder: 0 },
      ],
    },
    {
      name: 'Kodada Ketikelu – 4ft × 3ft',
      slug: 'kodada-ketikelu-4x3',
      description: 'Hand-crafted precast cement window frame with royal blue iron security grill. Size: 4ft × 3ft. Elegant design and heavy-duty reinforced construction.',
      category: ProductCategory.WINDOW,
      subType: 'Kodada (Hand-made)',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 8,
      image: '/images/products/kodada-ketikelu.jpg',
      variants: [
        { name: '4ft × 3ft', sku: 'KOD-WIN-4x3', width: 4, height: 3, dimensionUnit: 'ft', price: 140000, stock: 35, sortOrder: 0 },
      ],
    },
    {
      name: 'Kodada Ketikelu – 4ft × 4ft',
      slug: 'kodada-ketikelu-4x4',
      description: 'Large hand-crafted precast cement window frame with royal blue iron security grill. Size: 4ft × 4ft. Ideal for main living rooms, halls, and frontal home elevations.',
      category: ProductCategory.WINDOW,
      subType: 'Kodada (Hand-made)',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 9,
      image: '/images/products/kodada-ketikelu.jpg',
      variants: [
        { name: '4ft × 4ft', sku: 'KOD-WIN-4x4', width: 4, height: 4, dimensionUnit: 'ft', price: 160000, stock: 25, sortOrder: 0 },
      ],
    },

    // 🏭 MACHINE KETIKELU (MACHINE-MADE WINDOWS)
    {
      name: 'Machine Ketikelu – 2ft × 2ft',
      slug: 'machine-ketikelu-2x2',
      description: 'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 2ft × 2ft. Sharp edges and smooth industrial finish.',
      category: ProductCategory.WINDOW,
      subType: 'Machine-made',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 10,
      image: '/images/products/machine-ketikelu.jpg',
      variants: [
        { name: '2ft × 2ft', sku: 'MCH-WIN-2x2', width: 2, height: 2, dimensionUnit: 'ft', price: 45000, stock: 60, sortOrder: 0 },
      ],
    },
    {
      name: 'Machine Ketikelu – 3ft × 2½ft',
      slug: 'machine-ketikelu-3x2-5',
      description: 'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 3ft × 2.5ft. Standard kitchen and utility room sizing.',
      category: ProductCategory.WINDOW,
      subType: 'Machine-made',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 11,
      image: '/images/products/machine-ketikelu.jpg',
      variants: [
        { name: '3ft × 2½ft', sku: 'MCH-WIN-3x2.5', width: 3, height: 2.5, dimensionUnit: 'ft', price: 55000, stock: 50, sortOrder: 0 },
      ],
    },
    {
      name: 'Machine Ketikelu – 3ft × 3ft',
      slug: 'machine-ketikelu-3x3',
      description: 'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 3ft × 3ft. Best-selling window for modern homes.',
      category: ProductCategory.WINDOW,
      subType: 'Machine-made',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 12,
      image: '/images/products/machine-ketikelu.jpg',
      variants: [
        { name: '3ft × 3ft', sku: 'MCH-WIN-3x3', width: 3, height: 3, dimensionUnit: 'ft', price: 60000, stock: 50, sortOrder: 0 },
      ],
    },
    {
      name: 'Machine Ketikelu – 4ft × 3ft',
      slug: 'machine-ketikelu-4x3',
      description: 'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 4ft × 3ft. Excellent airflow and natural sunlight.',
      category: ProductCategory.WINDOW,
      subType: 'Machine-made',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 13,
      image: '/images/products/machine-ketikelu.jpg',
      variants: [
        { name: '4ft × 3ft', sku: 'MCH-WIN-4x3', width: 4, height: 3, dimensionUnit: 'ft', price: 80000, stock: 40, sortOrder: 0 },
      ],
    },
    {
      name: 'Machine Ketikelu – 4ft × 4ft',
      slug: 'machine-ketikelu-4x4',
      description: 'Large machine-manufactured precast cement window frame with royal blue iron security grill. Size: 4ft × 4ft. Maximum structural strength and ventilation.',
      category: ProductCategory.WINDOW,
      subType: 'Machine-made',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 14,
      image: '/images/products/machine-ketikelu.jpg',
      variants: [
        { name: '4ft × 4ft', sku: 'MCH-WIN-4x4', width: 4, height: 4, dimensionUnit: 'ft', price: 120000, stock: 30, sortOrder: 0 },
      ],
    },

    // 💨 CEMENT VENTILATORS (JALI BLOCKS)
    {
      name: 'Cement Ventilator Jali – 1ft × 1ft',
      slug: 'cement-ventilator-1x1',
      description: 'Decorative precast cement ventilation jali block. Size: 1ft × 1ft. Geometric lattice design for bathrooms, storerooms, staircases, and boundary walls.',
      category: ProductCategory.WINDOW,
      subType: 'Ventilator Jali',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 15,
      image: '/images/products/ventilators.jpg',
      variants: [
        { name: '1ft × 1ft', sku: 'VENT-1x1', width: 1, height: 1, dimensionUnit: 'ft', price: 16000, stock: 300, sortOrder: 0 },
      ],
    },
    {
      name: 'Cement Ventilator Jali – 2ft × 1ft',
      slug: 'cement-ventilator-2x1',
      description: 'Decorative precast cement ventilation jali block. Size: 2ft × 1ft. Diamond / flower lattice pattern providing ample breeze while preserving privacy.',
      category: ProductCategory.WINDOW,
      subType: 'Ventilator Jali',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 16,
      image: '/images/products/ventilators.jpg',
      variants: [
        { name: '2ft × 1ft', sku: 'VENT-2x1', width: 2, height: 1, dimensionUnit: 'ft', price: 22000, stock: 250, sortOrder: 0 },
      ],
    },
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category,
        subType: p.subType,
        unitOfSale: p.unitOfSale,
        minOrderQuantity: p.minOrderQuantity,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
        images: {
          create: [
            { url: p.image, altText: p.name, sortOrder: 0 },
          ],
        },
        variants: {
          create: p.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            width: v.width,
            height: v.height,
            dimensionUnit: v.dimensionUnit,
            price: v.price,
            stock: v.stock,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: v.sortOrder,
          })),
        },
      },
    });
  }

  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();

  console.log(`\n=================================================`);
  console.log(`✅ Prasad Cement Products database seeded successfully!`);
  console.log(`📦 ${productCount} Individual Products by Size`);
  console.log(`📐 ${variantCount} Variants with exact sizes and prices`);
  console.log(`👤 Admin: 9912179771 / armuriprasad@gmail.com (Password: 905250)`);
  console.log(`👤 Customer: 9848011223 / suresh.babu@gmail.com (Password: customer@123)`);
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
