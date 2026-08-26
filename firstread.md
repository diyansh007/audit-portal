# CS Civil Surgeon Hospital Nagpur — Audit Photo Archive & Location Explorer

This document provides a comprehensive overview of the implemented features, technology stack, directory structure, and production deployment guides for the CS Civil Surgeon Hospital Audit Portal.



## 1. Project Overview & Workflow

The portal acts as a **geographic archive and visual history of hospital audits** across Maharashtra (specifically Nagpur and surrounding districts). Field auditors upload geo-tagged photos from their device, and the system automatically normalizes the location, creates map markers, and groups the evidence by location and date.

### Completed User Workflow:
1. **Auditor Input**: The auditor enters a Date, Location Name, Title (optional), Notes (optional), and uploads multiple field photographs.
2. **Auto-Geocoding**: The system automatically normalizes the typed location name into coordinates (e.g. Nagpur/Wardha) and maps it.
3. **Dynamic Organization**: Photos are filed under the location and visit date folder structures dynamically.
4. **Visual Explorer**: Admins and senior officials can explore audits using the interactive map or the folder sidebar.
5. **Civil Surgeon Analytics**: A government-ready analytics dashboard provides aggregate graphs and progress tracking.

---

## 2. Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript / ES6 (No TypeScript, purely JS/JSX)
- **Styling**: Tailwind CSS & Vanilla CSS (custom design variables in `globals.css`)
- **Map Library**: Leaflet (via dynamically loaded CDN resources for SSR safety)
- **Charts & Graphs**: Chart.js & `react-chartjs-2`
- **Icons**: Lucide React
- **Data Storage**: JSON-file backed store (`data/store.json`) for persistent local mock database
- **Storage Service**: Abstracted local filesystem storage (auto-saves to `public/uploads/`) with Cloudflare R2 ready-to-go provider.

---

## 3. Implemented Features

### 🗺️ Map & Explorer (Home Experience)
- **Nagpur Centered**: The map starts pre-zoomed (`Zoom: 8`) and centered on Nagpur, keeping all adjacent audit locations (Wardha, Hinganghat, Beltarodi, Amravati) immediately visible.
- **Maharashtra Constraint**: Map boundaries are strictly locked to the bounds of Maharashtra (`SW [15.6, 72.6]`, `NE [22.2, 80.9]`), preventing the map canvas from drifting out of the state.
- **Left Location Sidebar**: A folder-style list of locations on the left displaying the number of visits and photo count. Searching/filtering through locations is done in real-time. Clicking a folder flies the map to the location and opens its detail panel.
- **Interactive Custom Pins**: Clean, custom DivIcon HTML markers showing the location name. Active pins enlarge and highlight in warm gold.
- **Location Detail Panel**: A floating card showing cover photo, coordinate metadata, visit metrics, and a quick redirect to see audit history.

### 📊 Civil Surgeon Dashboard (`/dashboard`)
- **KPI Panels**: Displays active locations, total audits, total photo uploads, and audits conducted in the current month.
- **Visits Monthly Trend (Bar Chart)**: Visual representation of audit visits conducted over the last 12 months.
- **Visits by Location (Doughnut Chart)**: Distribution of audit frequency across Nagpur, Wardha, Hinganghat, Beltarodi, and Amravati.
- **Photo Upload Activity (Line Chart)**: Illustrates visual evidence gathering volume over time.
- **Heatmap Grid**: Heat-map styled view showing calendar month audit intensity.
- **Recent Audit Activity Table**: A clean tabular log of recently logged visits, their completion status, and quick links to review evidence.

### 📁 Photo Gallery & Lightbox Viewer
- **Stacked Visit Cards**: In-depth location page showing visits as layered editorial cards.
- **Masonry Grid**: Renders uploaded photographs in a responsive masonry columns grid layout.
- **Immersive Dark Lightbox**: Full-screen photo browser supporting ←/→ keyboard navigation, a horizontal thumbnail strip, and file metadata display.

### 📤 Upload Flow & Auto-Organization
- **Drag-and-Drop Dropzone**: Select multiple photos, with image-focused previews and one-click removal options.
- **Auto-Geocoding**: Converts entered text locations to coordinates automatically on submit.
- **Real-time Progress Tracker**: Visual progress feedback bar while organizing files.

---

## 4. Directory Structure

```text
app/
├── app/
│   ├── api/
│   │   ├── locations/             # GET all locations
│   │   ├── visits/                # GET & POST visits (auto-geocoding)
│   │   ├── photos/upload/         # POST multipart file upload
│   │   └── photos/[id]/           # GET photos for a visit
│   ├── dashboard/                 # Analytics Page
│   │   ├── page.jsx               # Server Component (Data Fetching)
│   │   └── DashboardClient.jsx    # Client Component (ChartJS render)
│   ├── location/
│   │   └── [slug]/
│   │       ├── page.jsx           # Location overview Page
│   │       ├── LocationPageClient.jsx
│   │       └── visit/[id]/
│   │           ├── page.jsx       # Visit detail gallery Page
│   │           └── VisitPageClient.jsx
│   ├── globals.css                # Typography & custom CSS variables
│   ├── layout.jsx                 # Font preconnects & global metadata
│   ├── not-found.jsx              # Custom 404 page
│   └── page.jsx                   # Home Map + Sidebar component
├── components/
│   ├── gallery/                   # PhotoGrid & PhotoViewer Lightbox
│   ├── map/                       # AuditMap & LocationPanel
│   ├── ui/                        # FloatingNav
│   └── upload/                    # UploadModal & PhotoPreview
├── lib/
│   ├── demo-data.js               # Initial seed data
│   ├── geocoding.js               # Geocoding mock service
│   ├── storage.js                 # Filesystem & Cloudflare R2 storage provider
│   └── store.js                   # JSON-file database engine
├── public/
│   └── uploads/                   # Local uploads directory
├── jsconfig.json                  # Path alias config (@/*)
├── package.json                   # Scripts and dependencies
└── next.config.js                 # Image domains & Turbopack configurations
```

---

## 5. Running the Application

To run the project locally, navigate to the `app/` subfolder:

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 6. Cloudflare Production Deployment

The project is architected to run seamlessly on **Cloudflare Pages** and store media on **Cloudflare R2** with zero codebase modifications.

### Step 1: Storage Configuration (Cloudflare R2)
1. Create a Bucket in the Cloudflare R2 dashboard (e.g., `audit-photos`).
2. Generate an API Token with Edit permissions for S3.
3. Configure the following environment variables in your Cloudflare Pages dashboard:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL` (the public bucket URL or custom domain mapped to your bucket)

When these env vars are present, `lib/storage.js` automatically routes media uploads to R2 instead of the local filesystem.

### Step 2: Database Configuration (Cloudflare D1)
1. Run `wrangler d1 create audit-portal-db` to spin up a D1 SQLite database.
2. Bind the database to your app in your `wrangler.toml` configuration:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "audit-portal-db"
   database_id = "<your-db-id>"
   ```
3. Update `lib/store.js` to query `env.DB` using wrangler bindings (detailed template instructions are in `lib/store.js`).

### Step 3: Build & Deploy
Deploy to Cloudflare Pages using the Next.js on Pages adapter:
```bash
# Build static outputs compatible with Cloudflare workers
npx @cloudflare/next-on-pages

# Deploy to Cloudflare Pages
wrangler pages deploy .vercel/output/static
```
