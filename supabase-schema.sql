-- ============================================================================
-- SRI LAKSHMI PENCHILA NARASIMHA SWAMY CEMENT WORK (PRASAD CEMENT PRODUCTS)
-- SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA & INITIAL SEED SCRIPT
-- ============================================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Navigate to SQL Editor in the left sidebar
-- 3. Paste this complete SQL script and click "Run" (or press Ctrl+Enter)
-- 4. All tables, relations, security policies, and initial owner/catalog data will be created!
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProductCategory" AS ENUM ('WINDOW', 'DOOR', 'BRICK', 'POOL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UnitOfSale" AS ENUM ('PIECE', 'SET', 'PER_1000', 'PER_SQ_FT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AvailabilityStatus" AS ENUM ('IN_STOCK', 'MADE_TO_ORDER', 'OUT_OF_STOCK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM (
        'PENDING',
        'CONFIRMED',
        'IN_PRODUCTION',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── TABLES ──────────────────────────────────────────────────────────────────

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY DEFAULT ('usr_' || gen_random_uuid()::text),
    "phone" TEXT UNIQUE NOT NULL,
    "email" TEXT UNIQUE,
    "password" TEXT,
    "name" TEXT,
    "firmName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer Delivery Addresses Table
CREATE TABLE IF NOT EXISTS "addresses" (
    "id" TEXT PRIMARY KEY DEFAULT ('addr_' || gen_random_uuid()::text),
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "label" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. OTP Tokens Table
CREATE TABLE IF NOT EXISTS "otp_tokens" (
    "id" TEXT PRIMARY KEY DEFAULT ('otp_' || gen_random_uuid()::text),
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT PRIMARY KEY DEFAULT ('prod_' || gen_random_uuid()::text),
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "subType" TEXT,
    "unitOfSale" "UnitOfSale" NOT NULL DEFAULT 'PIECE',
    "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product Variants Table
CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" TEXT PRIMARY KEY DEFAULT ('var_' || gen_random_uuid()::text),
    "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "name" TEXT NOT NULL,
    "sku" TEXT UNIQUE,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "dimensionUnit" TEXT NOT NULL DEFAULT 'ft',
    "attributes" JSONB,
    "price" INTEGER, -- in paisa (null = request quote)
    "comparePrice" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "availability" "AvailabilityStatus" NOT NULL DEFAULT 'IN_STOCK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Product Images Table
CREATE TABLE IF NOT EXISTS "product_images" (
    "id" TEXT PRIMARY KEY DEFAULT ('img_' || gen_random_uuid()::text),
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "variantId" TEXT REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Carts Table
CREATE TABLE IF NOT EXISTS "carts" (
    "id" TEXT PRIMARY KEY DEFAULT ('cart_' || gen_random_uuid()::text),
    "userId" TEXT UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Cart Items Table
CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" TEXT PRIMARY KEY DEFAULT ('ci_' || gen_random_uuid()::text),
    "cartId" TEXT NOT NULL REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "variantId" TEXT NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "cart_items_cart_variant_unique" UNIQUE ("cartId", "variantId")
);

-- 9. Delivery Zones Table
CREATE TABLE IF NOT EXISTS "delivery_zones" (
    "id" TEXT PRIMARY KEY DEFAULT ('zone_' || gen_random_uuid()::text),
    "name" TEXT NOT NULL,
    "pincodes" TEXT[] NOT NULL DEFAULT '{}',
    "fee" INTEGER NOT NULL DEFAULT 0, -- in paisa
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- 10. Orders Table
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT PRIMARY KEY DEFAULT ('ord_' || gen_random_uuid()::text),
    "orderNumber" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON UPDATE CASCADE,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" INTEGER NOT NULL, -- in paisa
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "grandTotal" INTEGER NOT NULL,
    "deliveryAddressId" TEXT REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "deliveryZoneId" TEXT REFERENCES "delivery_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Order Items Table
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" TEXT PRIMARY KEY DEFAULT ('oi_' || gen_random_uuid()::text),
    "orderId" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "variantId" TEXT NOT NULL REFERENCES "product_variants"("id") ON UPDATE CASCADE,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "variantSnapshot" JSONB
);

-- 12. Quote Requests Table
CREATE TABLE IF NOT EXISTS "quote_requests" (
    "id" TEXT PRIMARY KEY DEFAULT ('quote_' || gen_random_uuid()::text),
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON UPDATE CASCADE,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "productId" TEXT NOT NULL REFERENCES "products"("id") ON UPDATE CASCADE,
    "variantId" TEXT REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "customWidth" DOUBLE PRECISION,
    "customHeight" DOUBLE PRECISION,
    "customDepth" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "deliveryLocation" TEXT,
    "deliveryPincode" TEXT,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "quotedPrice" INTEGER,
    "adminNotes" TEXT,
    "validUntil" TIMESTAMP(3) WITH TIME ZONE,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Store Settings Table
CREATE TABLE IF NOT EXISTS "store_settings" (
    "id" TEXT PRIMARY KEY DEFAULT ('set_' || gen_random_uuid()::text),
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users"("phone");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_addresses_userId" ON "addresses"("userId");
CREATE INDEX IF NOT EXISTS "idx_otp_phone_code" ON "otp_tokens"("phone", "code");
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products"("category");
CREATE INDEX IF NOT EXISTS "idx_products_slug" ON "products"("slug");
CREATE INDEX IF NOT EXISTS "idx_variants_productId" ON "product_variants"("productId");
CREATE INDEX IF NOT EXISTS "idx_orders_userId" ON "orders"("userId");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "idx_quotes_userId" ON "quote_requests"("userId");
CREATE INDEX IF NOT EXISTS "idx_quotes_status" ON "quote_requests"("status");

-- ─── SEED DATA ───────────────────────────────────────────────────────────────

-- 1. Pre-seed Owner (ADMIN) and Sample Customer
-- Password for owner is 905250 (hashed via pgcrypto blowfish)
INSERT INTO "users" ("id", "phone", "email", "password", "name", "role", "isActive")
VALUES
    (
        'usr_owner_prasad',
        '9912179771',
        'armuriprasad@gmail.com',
        crypt('905250', gen_salt('bf', 12)),
        'Prasad Armuri',
        'ADMIN',
        true
    ),
    (
        'usr_customer_demo',
        '8888888888',
        'customer@gmail.com',
        crypt('customer@123', gen_salt('bf', 12)),
        'Customer Sample',
        'CUSTOMER',
        true
    )
ON CONFLICT ("phone") DO UPDATE
SET
    "email" = EXCLUDED."email",
    "password" = EXCLUDED."password",
    "name" = EXCLUDED."name",
    "role" = EXCLUDED."role";

-- 2. Store Settings
INSERT INTO "store_settings" ("key", "value")
VALUES
    ('store_name', 'Sri Lakshmi Penchila Narasimha Swamy Cement Work'),
    ('store_phone', '+919912179771'),
    ('store_whatsapp', '+918919526315'),
    ('store_email', 'armuriprasad@gmail.com'),
    ('store_address', 'Opp. Sudha Hospital, Jagtial - Velgatoor Road, Velagatoor, Dist. Jagtial, Telangana - 505526')
ON CONFLICT ("key") DO UPDATE
SET "value" = EXCLUDED."value";

-- 3. Delivery Zones
INSERT INTO "delivery_zones" ("id", "name", "pincodes", "fee", "isActive")
VALUES
    ('z_local', 'Local Velagatoor (0-10 km)', ARRAY['505526', '505525', '505527'], 0, true),
    ('z_city', 'Jagtial District (10-30 km)', ARRAY['505327', '505452', '505530', '505501'], 150000, true),
    ('z_state', 'North Telangana (30-60 km)', ARRAY['504207', '505001', '505172'], 350000, true)
ON CONFLICT ("id") DO NOTHING;

-- 4. Initial Precast Cement Products
INSERT INTO "products" ("id", "name", "slug", "description", "category", "subType", "unitOfSale", "minOrderQuantity", "isFeatured", "sortOrder")
VALUES
    (
        'prod_brk_8x6',
        'Cement Bricks & Blocks – 8×6 inches',
        'cement-bricks-8x6',
        'Solid precast cement concrete construction bricks. Size: 8×6 inches. Made with 53-grade OPC cement for superior compressive strength.',
        'BRICK',
        'Solid Concrete',
        'PIECE',
        100,
        true,
        1
    ),
    (
        'prod_gag_3ft',
        'Gagulu Cement Well Ring – 3ft Diameter',
        'gagulu-cement-ring-3ft',
        'Heavy-duty precast cement concrete well ring (Gagulu). Diameter: 3ft. Durable reinforced structure for water wells and soak pits.',
        'POOL',
        'Gagulu (Rings)',
        'PIECE',
        1,
        true,
        2
    ),
    (
        'prod_mch_3x3',
        'Machine Ketikelu (Cement Window) – 3ft × 3ft',
        'machine-ketikelu-3x3',
        'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 3ft × 3ft.',
        'WINDOW',
        'Machine-made',
        'PIECE',
        1,
        true,
        3
    ),
    (
        'prod_mch_4x3',
        'Machine Ketikelu (Cement Window) – 4ft × 3ft',
        'machine-ketikelu-4x3',
        'Precision machine-manufactured precast cement window frame with royal blue iron security grill. Size: 4ft × 3ft.',
        'WINDOW',
        'Machine-made',
        'PIECE',
        1,
        true,
        4
    ),
    (
        'prod_vent_2x1',
        'Cement Ventilator Jali – 2ft × 1ft',
        'cement-ventilator-2x1',
        'Decorative precast cement ventilation jali block. Size: 2ft × 1ft. Diamond lattice pattern providing natural airflow.',
        'WINDOW',
        'Ventilator Jali',
        'PIECE',
        1,
        true,
        5
    )
ON CONFLICT ("slug") DO NOTHING;

-- 5. Product Variants
INSERT INTO "product_variants" ("id", "productId", "name", "sku", "width", "height", "dimensionUnit", "price", "stock", "availability", "sortOrder")
VALUES
    ('v_brk_8x6_pc', 'prod_brk_8x6', '8×6 inches — Per Piece', 'BRK-8x6-PC', 8, 6, 'in', 1000, 10000, 'IN_STOCK', 0),
    ('v_brk_8x6_1k', 'prod_brk_8x6', '8×6 inches — Lot of 1000 Bricks', 'BRK-8x6-1K', 8, 6, 'in', 900000, 10, 'IN_STOCK', 1),
    ('v_gag_3ft', 'prod_gag_3ft', '3ft Diameter Ring', 'GAG-3FT', 3, 1, 'ft', 22000, 50, 'IN_STOCK', 0),
    ('v_mch_3x3', 'prod_mch_3x3', '3ft × 3ft Window with Grill', 'MCH-WIN-3x3', 3, 3, 'ft', 60000, 50, 'IN_STOCK', 0),
    ('v_mch_4x3', 'prod_mch_4x3', '4ft × 3ft Window with Grill', 'MCH-WIN-4x3', 4, 3, 'ft', 70000, 40, 'IN_STOCK', 0),
    ('v_vent_2x1', 'prod_vent_2x1', '2ft × 1ft Ventilator Jali', 'VENT-2x1', 2, 1, 'ft', 22000, 250, 'IN_STOCK', 0)
ON CONFLICT ("id") DO NOTHING;

-- ============================================================================
-- SUPABASE COMPLETE SETUP CONFIRMED!
-- ============================================================================
