# 🚀 Vercel Deployment Guide — Sri Penchila LakshmiNarasimha Swamy Cement Work

This web application is **100% cloud-ready for 24/7 standalone deployment on Vercel**. Even when your local computer or local backend server is turned off, the website, authentic product catalog, prices, Cash on Delivery (COD), order management, invoice generation, and owner WhatsApp confirm/cancel dispatch will continue to run seamlessly in the cloud.

---

## ⚡ Method 1: Deploy via Vercel Web Dashboard (Recommended — 2 Minutes)

Because your code is already pushed to GitHub, this is the easiest and most reliable method:

1. Go to **[vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Under **Import Git Repository**, select:
   `armuripradeep657/Sri-Penchila-LakshmiNarasimha-Swamy-Cement-Work`
4. In the Project Configuration:
   - **Framework Preset**: Next.js (automatically detected)
   - **Root Directory**: Select **`frontend`** (or leave default `./` as root `vercel.json` will automatically build `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. **Environment Variables (Add in Vercel Project Settings)**:
   Add the following variables:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_APP_NAME` | `Sri Penchila LakshmiNarasimha Swamy Cement Work (PRASAD CEMENT WORK)` | Brand Name |
   | `NEXT_PUBLIC_STORE_PHONE` | `+918919526315` | Yard Contact Phone |
   | `NEXT_PUBLIC_WHATSAPP_PHONE` | `918919526315` | Owner WhatsApp Hotline |
   | `NEXT_PUBLIC_STORE_EMAIL` | `prasad@prasadcement.com` | Official Yard Email |
   | `NEXT_PUBLIC_STORE_ADDRESS` | `Opp. Sudha Hospital, Jagtial - Velgatoor Road, Velagatoor, Dist. Jagtial, Telangana - 505526` | Factory Yard Address |
   | `BACKEND_URL` | *(Leave empty)* | Runs 100% serverless 24/7 on Vercel |

6. Click **Deploy**!
7. Within 60 seconds, Vercel will give you a live production URL (e.g. `https://sri-penchila-lakshminarasimha-swamy.vercel.app`).

---

## 💻 Method 2: Deploy via Terminal (Vercel CLI)

Run this command in your terminal from the project directory:

```powershell
cd frontend
npx vercel
```

1. Answer the prompts:
   - Set up and deploy? **Yes** (`Y`)
   - Which scope? **Select your account**
   - Link to existing project? **No** (`N`)
   - Project name? **prasad-cement-products**
   - In which directory is your code located? **`./`**
2. Deploy directly to production:
   ```powershell
   npx vercel --prod
   ```

---

## 🛡️ Why This App Works 24/7 Even When Your Local Server Closes:

1. **Self-Contained Serverless Architecture**:
   The application includes Next.js serverless route handlers (`frontend/src/app/api/[...path]/route.ts`).
2. **Global Cloud Execution**:
   Vercel runs these routes across worldwide edge servers with 99.99% uptime.
3. **Pre-Seeded Precast Catalog**:
   All 16+ authentic precast products with their real photos, sizes, and prices are built into the cloud layer:
   - **Cement Bricks & Blocks** (8×6 in, 9×4 in)
   - **Gagulu Cement Well Rings** (2ft, 3ft, 4ft diameter)
   - **Kodada Ketikelu** (2×2, 3×3, 4×3, 4×4 with royal blue iron grills)
   - **Machine Ketikelu** (2×2, 3×2½, 3×3, 4×3, 4×4 with royal blue iron grills)
   - **Cement Ventilators** (1×1, 2×1 decorative jali blocks)
4. **Built-in Authentication & Accounts**:
   - **Admin / Owner**: `8919526315` / `prasad@prasadcement.com` (Pass: `prasad@123`)
   - **Customer**: `8888888888` / `rajesh@gmail.com` (Pass: `rajesh@123`)
   - Full Mobile OTP and Email Login, Registration & Forgot Password reset flow work directly in the cloud.
5. **Invoice & WhatsApp Dispatch**:
   - Official Tax Invoice with circular watermark seal generated in PDF.
   - Cash on Delivery (COD) with ₹150 processing fee.
   - Owner 1-click Confirm & WhatsApp / Cancel & WhatsApp dispatch notification controls.
