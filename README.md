# 🏗️ Prasad Cement Products — Full-Stack E-Commerce Platform

A production-grade, full-stack e-commerce web application with rich micro-animations built for **"Prasad Cement Products"**, a manufacturer and supplier of precast cement and concrete construction items in Hyderabad, Telangana.

---

## 🌟 Key Features

### 🛒 Customer-Facing Storefront
- **Rich Industrial Design**: Dark concrete slate aesthetics, amber accents, glassmorphism cards, and micro-animations.
- **Precast Construction Catalog**:
  1. **Cement Windows**: Standard & Ventilation Jali frames with grill/no-grill options.
  2. **Cement Doors (Darwajas)**: Single & double precast frames with optional door leaves.
  3. **Cement Bricks**: Solid, hollow, and eco-friendly fly-ash bricks sold per unit or in bulk lots of 1,000.
  4. **Cement Pools**: Monolithic precast garden pools and modular swimming pools.
- **Dynamic Size Variant Selector**: Width × Height pill selectors with real-time price calculation.
- **Two Distinct Order Paths**:
  - **Standard Instant Checkout**: Cart + direct checkout for in-stock, fixed-price items.
  - **Request a Custom Quote**: For custom dimensions (e.g. 2.5ft × 5.5ft), large pool installations, or 10,000+ brick lots.
- **Mobile Number + OTP Authentication**: Passwordless login with development instant OTP (`123456`).
- **Interactive Delivery Zone Calculator**: Local (0-10km free), City (10-30km), and District (30-60km) truck dispatch rates.
- **Order Tracking Timeline**: Real-time progress tracker (Confirmed → Steam Curing → Truck Dispatch → Delivered).
- **Floating WhatsApp Enquiry**: Direct chat button with pre-filled product & quantity inquiries.
- **Razorpay Payment Gateway Integration**: UPI, Card, Netbanking checkout simulation.
- **Google Maps Integration**: Factory yard location and customer delivery site verification.

### ⚙️ Owner & Admin Portal (Prasad)
- **Executive Operations Dashboard**: Monthly revenue, order count, and low-stock alerts.
- **Product & Variant Inventory Management**: Add products, inline variant management (dimensions, prices, stock).
- **Order Fulfillment Desk**: Update status (Pending → Confirmed → In Production → Out for Delivery → Delivered).
- **Quote Pricing & Dispatch**: Review custom customer blueprints, set quoted price, and automatically notify customer via SMS/WhatsApp.
- **Delivery Zone Configuration**: Manage freight fees and pincode coverage.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database & ORM**: Prisma ORM with SQLite (zero-setup local development) and PostgreSQL (production ready via `schema.postgresql.prisma`).
- **Auth**: JWT tokens (Access + Refresh) with mobile OTP authentication.
- **Payments**: Razorpay API with dev sandbox simulation.
- **Storage**: Local filesystem uploads with Cloudinary support.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API Server

```bash
cd backend

# Install dependencies (already installed)
npm install

# Run database push & seed (already seeded with 9 products, 34 variants, and sample users)
npx prisma db push
npm run db:seed

# Start the backend in development mode
npm run dev
```

The backend runs at **`http://localhost:5000`**.
Health check: `http://localhost:5000/api/health`

### 2. Start the Frontend Application

In a new terminal:

```bash
cd frontend

# Start Next.js development server
npm run dev
```

The frontend runs at **`http://localhost:3000`**.

---

## 🔑 Official Owner Credentials & Access

| Role | Mobile Number | Email | Password | Description |
|---|---|---|---|---|
| **Owner (Admin)** | `9912179771` | `armuriprasad@gmail.com` | `905250` | Full administrative control: inventory, order fulfillment, quotes, factory settings. |
| **New Customers** | Any valid 10-digit number | Any email | Custom password / Google Auth | Self-service customer account creation via `/register` or 1-Click Google Sign-In. |

---

## ⚡ Supabase Database Setup

To run with Supabase:
1. Open your Supabase Dashboard and go to the **SQL Editor**.
2. Run the provided [`supabase-schema.sql`](./supabase-schema.sql) script.
3. In `backend/.env` and `frontend/.env.local`, set your `DATABASE_URL`, `DIRECT_URL`, and Supabase API keys.

---

## 📁 Project Structure

```
prasad-cement-products/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # SQLite schema (zero-setup dev)
│   │   ├── schema.postgresql.prisma   # PostgreSQL schema (production)
│   │   └── seed.ts                    # Seed script with 9 products & 34 variants
│   ├── src/
│   │   ├── index.ts                   # Express server entry point
│   │   ├── routes/                    # auth, products, cart, orders, quotes, admin, upload
│   │   ├── middleware/                # auth, admin check, Zod validation, error handling
│   │   ├── services/                  # db, otp, payment, notification, upload
│   │   └── types/                     # domain types & enums
│   └── .env                           # Local environment configuration
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Home with animated hero, categories, map
│   │   │   ├── products/              # Category listing with size & price filters
│   │   │   ├── products/[slug]/       # Product detail with variant selector & quote CTA
│   │   │   ├── cart/                  # Shopping cart & quantity adjustments
│   │   │   ├── checkout/              # Site delivery address & Razorpay checkout
│   │   │   ├── quote/                 # Custom dimensions quote builder
│   │   │   ├── orders/                # Order history & quote requests
│   │   │   ├── orders/[id]/           # Order tracking timeline & invoice
│   │   │   ├── login/                 # Mobile OTP login with quick demo buttons
│   │   │   └── admin/                 # Admin operations dashboard, products, orders, quotes
│   │   ├── components/                # Header, Footer, WhatsApp button
│   │   ├── context/                   # AuthContext & CartContext
│   │   └── lib/                       # API client & utility helpers
│   └── package.json
│
├── docker-compose.yml                 # PostgreSQL container definition
└── README.md
```
