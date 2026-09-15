# How to Publish Prasad Cement Products App to Google Play Store

This web application is 100% PWA (Progressive Web App) compliant and ready to be published to the Google Play Store as an official Android application package (`.aab` / `.apk`) using **Trusted Web Activities (TWA)**.

---

## Method 1: Instant 5-Minute Build via PWABuilder (Recommended)

1. **Deploy your website** to your production URL (e.g. `https://prasadcementproducts.com` or your Vercel/Render URL).
2. Visit [https://www.pwabuilder.com](https://www.pwabuilder.com).
3. Enter your live website URL and click **Start**.
4. PWABuilder will automatically validate your `manifest.json`, Service Worker, and icons.
5. Click **Package for Stores** -> Select **Google Play (Android)**.
6. Fill in the package details:
   - **Package ID**: `com.prasadcementproducts.app`
   - **App Name**: `Prasad Cement Products`
   - **Theme color**: `#0b0f19`
   - **Background color**: `#0b0f19`
7. Click **Generate Package**.
8. Download the generated `.zip` file containing:
   - Signed Android App Bundle (`.aab`) ready for Google Play Console.
   - `assetlinks.json` (already pre-configured in `frontend/public/.well-known/assetlinks.json`).

---

## Method 2: Command-Line Build using Google Bubblewrap CLI

1. Install Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```
2. Initialize the project:
   ```bash
   bubblewrap init --manifest="https://your-domain.com/manifest.json"
   ```
3. Build the signed release Android bundle:
   ```bash
   bubblewrap build
   ```
4. Output will be: `app-release-bundle.aab`.

---

## Uploading to Google Play Console

1. Open your [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - **App name**: Sri Lakshmi Penchila Narasimha Swamy Cement Work (Prasad Cement)
   - **Default language**: English (United States) / Telugu
   - **App or game**: App
   - **Free or paid**: Free
3. Go to **Production** -> **Create new release**.
4. Upload the generated `.aab` file.
5. Provide store listing details, screenshots, app icon (`icon-512.png`), and privacy policy.
6. Submit for review. Within 24-48 hours, the app will be live and downloadable for everyone on Android worldwide!
