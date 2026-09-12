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
  const adminPassword = await bcrypt.hash('prasad@123', 12);
  const customerPassword = await bcrypt.hash('rajesh@123', 12);

  const admin = await prisma.user.create({
    data: {
      phone: '9912179771',
      password: adminPassword,
      name: 'PRASAD',
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      phone: '8888888888',
      password: customerPassword,
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

  // 1. KODADA KETIKELU (Hand-made Cement Windows with Grills)
  console.log('  → Creating Kodada Ketikelu (Hand-made Windows)...');

  await prisma.product.create({
    data: {
      name: 'Kodada Ketikelu (Hand-made Cement Window)',
      slug: 'kodada-ketikelu',
      description:
        'Traditional hand-crafted precast cement window frames with decorative iron grills. Each window is meticulously made by skilled artisans ensuring superior strength and beautiful designs. Termite-proof, weather-resistant, and built to last for decades. Ideal for residential homes and commercial buildings.',
      category: ProductCategory.WINDOW,
      subType: 'Kodada (Hand-made)',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 1,
      images: {
        create: [
          { url: '/images/products/kodada-ketikelu.jpg', altText: 'Kodada Ketikelu hand-made cement windows with grills', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: '2ft × 2ft',
            sku: 'KOD-WIN-2x2',
            width: 2, height: 2, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'kodada', grill: true }),
            price: 80000, // ₹800
            stock: 30,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: '3ft × 3ft',
            sku: 'KOD-WIN-3x3',
            width: 3, height: 3, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'kodada', grill: true }),
            price: 120000, // ₹1,200
            stock: 25,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: '4ft × 3ft',
            sku: 'KOD-WIN-4x3',
            width: 4, height: 3, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'kodada', grill: true }),
            price: 140000, // ₹1,400
            stock: 20,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 2,
          },
          {
            name: '4ft × 4ft',
            sku: 'KOD-WIN-4x4',
            width: 4, height: 4, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'kodada', grill: true }),
            price: 160000, // ₹1,600
            stock: 15,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  // 2. MACHINE KETIKELU (Machine-made Cement Windows)
  console.log('  → Creating Machine Ketikelu (Machine-made Windows)...');

  await prisma.product.create({
    data: {
      name: 'Machine Ketikelu (Machine-made Cement Window)',
      slug: 'machine-ketikelu',
      description:
        'Precision machine-manufactured precast cement window frames with ornamental iron grills. Uniform finish, exact dimensions, and cost-effective pricing. Perfect for large construction projects requiring consistent quality across all window units.',
      category: ProductCategory.WINDOW,
      subType: 'Machine-made',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 2,
      images: {
        create: [
          { url: '/images/products/machine-ketikelu.jpg', altText: 'Machine Ketikelu machine-made cement windows with grills', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: '2ft × 2ft',
            sku: 'MCH-WIN-2x2',
            width: 2, height: 2, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'machine', grill: true }),
            price: 45000, // ₹450
            stock: 40,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: '3ft × 2½ft',
            sku: 'MCH-WIN-3x2.5',
            width: 3, height: 2.5, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'machine', grill: true }),
            price: 55000, // ₹550
            stock: 35,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: '3ft × 3ft',
            sku: 'MCH-WIN-3x3',
            width: 3, height: 3, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'machine', grill: true }),
            price: 60000, // ₹600
            stock: 30,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 2,
          },
          {
            name: '4ft × 3ft',
            sku: 'MCH-WIN-4x3',
            width: 4, height: 3, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'machine', grill: true }),
            price: 80000, // ₹800
            stock: 20,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 3,
          },
          {
            name: '4ft × 4ft',
            sku: 'MCH-WIN-4x4',
            width: 4, height: 4, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'machine', grill: true }),
            price: 120000, // ₹1,200
            stock: 15,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 4,
          },
        ],
      },
    },
  });

  // 3. VENTILATORS (Cement Jali / Lattice Blocks)
  console.log('  → Creating Ventilators (Cement Jali)...');

  await prisma.product.create({
    data: {
      name: 'Ventilators (Cement Jali Blocks)',
      slug: 'cement-ventilators',
      description:
        'Beautiful decorative precast cement ventilation blocks with traditional jali (lattice) patterns. Available in diamond, floral, and geometric designs. Perfect for bathroom windows, compound walls, staircase ventilation, and decorative partitions. Provides airflow while maintaining privacy.',
      category: ProductCategory.WINDOW,
      subType: 'Ventilator Jali',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 3,
      images: {
        create: [
          { url: '/images/products/ventilators.jpg', altText: 'Cement ventilator jali blocks with decorative patterns', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: '1ft × 1ft',
            sku: 'VENT-1x1',
            width: 1, height: 1, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'ventilator', pattern: 'assorted' }),
            price: 16000, // ₹160
            stock: 200,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: '2ft × 1ft',
            sku: 'VENT-2x1',
            width: 2, height: 1, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'ventilator', pattern: 'assorted' }),
            price: 22000, // ₹220
            stock: 150,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // 4. GAGULU (Cement Rings for Wells & Drainage)
  console.log('  → Creating Gagulu (Cement Rings)...');

  await prisma.product.create({
    data: {
      name: 'Gagulu (Cement Rings)',
      slug: 'cement-gagulu-rings',
      description:
        'Heavy-duty precast cement concrete rings (Gagulu) for wells, bore wells, drainage systems, soak pits, and septic tanks. Manufactured with high-grade cement and reinforced for maximum durability. Water-tight joints and long-lasting construction.',
      category: ProductCategory.POOL,
      subType: 'Gagulu (Rings)',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 1,
      isFeatured: true,
      sortOrder: 4,
      images: {
        create: [
          { url: '/images/products/gagulu.jpg', altText: 'Cement Gagulu rings for wells and drainage', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: '2ft Diameter Ring',
            sku: 'GAG-2FT',
            width: 2, height: 1, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'gagulu', shape: 'round', diameter: '2ft' }),
            price: 18000, // ₹180
            stock: 50,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: '3ft Diameter Ring',
            sku: 'GAG-3FT',
            width: 3, height: 1, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'gagulu', shape: 'round', diameter: '3ft' }),
            price: 22000, // ₹220
            stock: 40,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: '4ft Diameter Ring',
            sku: 'GAG-4FT',
            width: 4, height: 1, dimensionUnit: 'ft',
            attributes: JSON.stringify({ type: 'gagulu', shape: 'round', diameter: '4ft' }),
            price: 36000, // ₹360
            stock: 30,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  // 5. CEMENT BRICKS / BLOCKS
  console.log('  → Creating Cement Bricks...');

  await prisma.product.create({
    data: {
      name: 'Cement Bricks & Blocks',
      slug: 'cement-bricks',
      description:
        'High-quality solid cement bricks and concrete blocks for all types of construction. Manufactured with 53-grade OPC cement for superior compressive strength. Uniform dimensions ensure reduced mortar usage and faster wall construction. Available in bulk for large projects.',
      category: ProductCategory.BRICK,
      subType: 'Solid',
      unitOfSale: UnitOfSale.PIECE,
      minOrderQuantity: 100,
      isFeatured: true,
      sortOrder: 5,
      images: {
        create: [
          { url: '/images/products/bricks.jpg', altText: 'Cement bricks and blocks stacked in yard', sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          {
            name: '8×6 inches — Per Piece',
            sku: 'BRK-8x6-PC',
            width: 8, height: 6, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'solid', bulkUnit: false }),
            price: 1000, // ₹10 per piece
            stock: 10000,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 0,
          },
          {
            name: '9×4 inches — Per Piece',
            sku: 'BRK-9x4-PC',
            width: 9, height: 4, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'solid', bulkUnit: false }),
            price: 800, // ₹8 per piece
            stock: 10000,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 1,
          },
          {
            name: '8×6 inches — Lot of 1000',
            sku: 'BRK-8x6-1K',
            width: 8, height: 6, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'solid', bulkUnit: true, unitsPerLot: 1000 }),
            price: 900000, // ₹9,000 per 1000
            stock: 10,
            availability: AvailabilityStatus.IN_STOCK,
            sortOrder: 2,
          },
          {
            name: '9×4 inches — Lot of 1000',
            sku: 'BRK-9x4-1K',
            width: 9, height: 4, dimensionUnit: 'in',
            attributes: JSON.stringify({ brickType: 'solid', bulkUnit: true, unitsPerLot: 1000 }),
            price: 700000, // ₹7,000 per 1000
            stock: 10,
            availability: AvailabilityStatus.IN_STOCK,
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
  console.log(`👤 Admin: 9912179771 (Password: prasad@123)`);
  console.log(`👤 Customer: 8888888888 (Password: rajesh@123)`);
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
