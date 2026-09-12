# 🚀 Vercel Deployment Guide — Prasad Cement Products

This application is configured for **100% 24/7 standalone deployment on Vercel**. Even when your local computer or local backend server is turned off, the website and its product catalog, sizes, prices, and authentication will continue to work seamlessly.

---

## Method 1: Deploy via Vercel Web Dashboard (Recommended — 2 Minutes)

Because your code is already pushed to GitHub, this is the easiest and most reliable method:

1. Go to **[vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Under **Import Git Repository**, select:
   `armuripradeep657/Sri-Penchila-LakshmiNarasimha-Swamy-Cement-Work`
4. In the Project Configuration:
   - **Framework Preset**: Next.js (automatically detected)
   - **Root Directory**: Click *Edit* and select **`frontend`** (or leave default if using root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. **Environment Variables**:
   Add the following (optional, defaults are already provided):
   | Variable | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_APP_NAME` | `Prasad Cement Products` |
   | `NEXT_PUBLIC_STORE_PHONE` | `+919912179771` |
   | `NEXT_PUBLIC_WHATSAPP_PHONE` | `919912179771` |
   | `NEXT_PUBLIC_STORE_EMAIL` | `prasad@prasadcement.com` |
6. Click **Deploy**!
7. Within 60 seconds, Vercel will give you a live production URL (e.g. `https://sri-penchila-lakshminarasimha-swamy.vercel.app`).

---

## Method 2: Deploy via Terminal (Vercel CLI)

Run this command in your PowerShell terminal from the project root:

```powershell
cd c:\Users\armur\.gemini\antigravity-ide\scratch\prasad-cement-products\frontend
npx vercel
```

1. It will open your browser to authorize your Vercel account.
2. Answer the prompts:
   - Set up and deploy? **Yes** (`Y`)
   - Which scope? **Select your account**
   - Link to existing project? **No** (`N`)
   - Project name? **prasad-cement-products**
   - In which directory is your code located? **`./`**
3. To deploy directly to production:
   ```powershell
   npx vercel --prod
   ```

---

## 🛡️ Why This App Never Shuts Down When Your Local Server Closes:

1. **Self-Contained Serverless API**:
   The frontend includes universal Next.js serverless route handlers (`frontend/src/app/api/[...path]/route.ts`).
2. **Cloud Execution**:
   Vercel runs these API routes across edge servers in India and globally with 99.99% uptime.
3. **Pre-Seeded Catalog**:
   All 5 authentic products from your yard with their real photos, sizes, and prices are built directly into the serverless layer:
   - **Kodada Ketikelu** (2×2, 3×3, 4×3, 4×4 with royal blue grills)
   - **Machine Ketikelu** (2×2, 3×2½, 3×3, 4×3, 4×4 with royal blue grills)
   - **Cement Ventilators** (1×1, 2×1 authentic jali blocks)
   - **Gagulu Rings** (2ft, 3ft, 4ft authentic well rings)
   - **Cement Bricks & Blocks** (8×6, 9×4 authentic yard bricks)
4. **Built-in Authentication**:
   - **Admin**: `9912179771` / `prasad@prasadcement.com` (Pass: `prasad@123`)
   - **Customer**: `8888888888` / `rajesh@gmail.com` (Pass: `rajesh@123`)
   - Full Registration & Forgot Password reset flow works directly in the cloud.
