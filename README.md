# Temple Management System (TMS)

A modern, secure, and production-ready enterprise **Temple Management System (TMS)** engineered for Indian temples, shrines, and religious charitable trusts. The system integrates daily physical temple operations with a global public devotee portal.

---

## 🏛️ System Overview

The platform is architected into two primary interfaces powered by a single full-stack Next.js and Prisma ORM core:

1. **Public Devotee Portal (`/`)**
   - **Hero & Spiritual Intro**: Dedicated to Sanatana Dharma, daily darshan, Annadan feeding, and cultural preservation.
   - **Live Aarti & Darshan Schedule**: Real-time schedule for Mangala, Shringar, Rajbhog, Sandhya, and Shayan Aartis.
   - **Online Donations with 80G PDF Receipts**: Categories (Annadan Mahaprasad, Temple Development, Gau Seva, Veda Pathshala, General Fund). Supports PAN validation, one-time contributions, and anonymous donations.
   - **Prasad & Devotional Store (E-Commerce)**: Fresh consecration dates, shelf-life indicators, shopping cart, pickup at counter or safe express home delivery, and stock reservations.
   - **Puja & Seva Bookings**: Browse daily and special rituals (Maharudrabhishek, Ram Archana, Chandi Homa). Date picker with real-time slot capacity checks (preventing overbooking) and family Sankalpa particulars.
   - **Multimedia Gallery & Festivals**: High-definition albums for sanctum shringar, Kartik Deepotsav, and festival schedules.
   - **Devotee Self-Service Portal**: View donation history, download digitally signed 80G PDF receipts, track prasad shipments, and access seva passes.
   - **Bilingual Interface**: One-click instant switching between English and Hindi (हिंदी).

2. **Admin Operations Control Center (`/admin`)**
   - **Executive Dashboard**: Live operational KPI cards for donations (Today, This Month, All Time), store revenue, pending fulfillment alerts, low-stock warnings, and recent transaction feeds.
   - **Donations & Receipts Ledger**: Full ledger with search, category/date filters, offline donation recording (Cash, Cheque, Counter UPI, Bank Transfer), CSV export, and PDF receipt downloads.
   - **Prasad Store & Fulfillment**: Product catalog management, SKU tracking, inventory thresholds, and multi-stage order dispatch pipeline (`PENDING` → `CONFIRMED` → `PROCESSING` → `READY_FOR_PICKUP` / `SHIPPED` → `DELIVERED`).
   - **Centralized Inventory Management**: Raw materials (A2 Cow Ghee, Saffron, Rice, Packaging boxes, Incense) with immutable stock movement logs and automatic low-stock alerts.
   - **Seva Scheduling & Priest Roster**: Configure sevas, daily quotas, and print/view the daily priest (Pujari) roster with family Sankalpa names and Gotras.
   - **Accounts & Financial Management**: Real-time double-entry ledger, expense voucher recording with vendor links, income vs. expense surplus/deficit calculations, and CSV export.
   - **Content Management System (CMS)**: Publish festivals, announcements, ticker notices, and photo gallery albums.
   - **Staff & Access Control (RBAC)**: Manage staff accounts, role assignment, and access deactivation.
   - **Temple Settings**: Configurable temple identity, darshan timings, 80G tax registration numbers, and contact information.

---

## 🛠️ Technology Stack

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components + Client interactivity, TypeScript. |
| **Styling** | Tailwind CSS v4 | Custom Indian temple palette (Sacred Maroon `#7B1113`, Saffron `#E58A13`, Warm Cream `#FDFBF7`). |
| **Icons** | Lucide React | High quality devotional and administrative SVG icons. |
| **Database & ORM** | Prisma ORM | Relational schema with foreign keys, constraints, and audit logs. Dual SQLite (local dev) / PostgreSQL (production) ready. |
| **Security & Auth** | JWT + PBKDF2/Bcrypt | Multi-role RBAC server authorization, HttpOnly secure cookies. |
| **Payments** | Razorpay + Dev Sandbox | Cryptographic HMAC-SHA256 signature verification, webhook support, and safe local test mode. |
| **PDF Engine** | jsPDF + AutoTable | Digitally formatted, tamper-evident 80G Donation Receipts and Seva Passes. |

---

## 🔐 Role-Based Access Control (RBAC) Accounts

The system includes pre-seeded administrative roles for testing and operations:

| Role | Email | Password | Allowed Modules |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@mandir.org` | `Admin@Mandir2026!` | Full Master Access to all modules, staff, and settings. |
| **Temple Admin** | `trustee@mandir.org` | `Staff@Mandir2026!` | Operations, donations, store, sevas, inventory, financials. |
| **Accountant** | `accounts@mandir.org` | `Staff@Mandir2026!` | Financial ledger, expense vouchers, revenue reports, CSV export. |
| **Donation Manager**| `donation@mandir.org` | `Staff@Mandir2026!` | Donation ledger, offline cash/counter entry, 80G receipts. |
| **Store Manager** | `store@mandir.org` | `Staff@Mandir2026!` | Prasad catalog, order fulfillment pipeline, shipping tracking. |
| **Seva Manager** | `seva@mandir.org` | `Staff@Mandir2026!` | Seva slots, daily priest Sankalpa roster, ritual scheduling. |
| **Devotee (Public)** | `devotee@example.com` | `Devotee@Mandir2026!` | Devotee dashboard, donation receipts, prasad orders, seva passes. |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
# Clone or navigate to the project directory
cd project

# Install dependencies
npm install

# Initialize and sync SQLite database
npx prisma db push

# Seed authentic temple data
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- Public Devotee Portal: `http://localhost:3000`
- Administrative Control Center: `http://localhost:3000/admin`
- Staff Login: `http://localhost:3000/admin/login`

---

## 🧪 Automated Test Suite

A comprehensive test suite is provided to verify all core workflows:
```bash
npx tsx test_tms_workflows.ts
```

Tests run:
1. Database connectivity & relational seed verification.
2. Online donation creation & cryptographic signature validation.
3. Automated 80G PDF receipt generation.
4. Prasad store checkout with automatic inventory stock decrement.
5. Seva booking capacity enforcement and double-booking prevention.
6. Official Seva Pass PDF generation.
7. Double-entry financial income vs. expense accounting.

---

## 🐘 Production PostgreSQL Deployment

To switch from SQLite to PostgreSQL for production deployment:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your production database URL in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@db-host:5432/temple_prod?schema=public"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```
4. Build and start Next.js:
   ```bash
   npm run build
   npm run start
   ```

---

## 📜 Compliance & 80G Tax Exemption Note

Any tax exemption or 80G-related receipt functionality is fully configurable via the Admin Settings panel (`/admin/settings`). It defaults to the trust's valid registration order number. If the temple trust does not hold a valid 80G certificate, tax deduction can be disabled with a single toggle in the settings.
