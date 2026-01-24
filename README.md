# 🏮 Amako Manga Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)

A premium, production-grade manga reading platform built with the latest web technologies. Optimized for performance, security, and developer experience.

---

## ✨ Features

- **📖 Advanced Reader**: Seamless chapter reading experience with optimized image delivery.
- **🔐 Secure Auth**: Robust authentication via NextAuth.js, including role-based access control (Admin/Moderator/User).
- **🛡️ Data Integrity**: Strict schema validation using Zod across all API endpoints.
- **⚡ Performance**: Built on Next.js 15 App Router with full React 19 support.
- **🧪 Automated Testing**: Comprehensive test suite including unit tests (Vitest) and E2E flows (Playwright).
- **☁️ Modern Storage**: Integrated with Cloudflare R2 for high-performance image hosting.
- **🎨 Premium UI**: Modern aesthetic with Tailwind CSS 4, featuring smooth micro-animations and responsive design.

---

## 🛠️ Tech Stack

- **Core**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React
- **Database**: Neon PostgreSQL with Prisma ORM (v6)
- **Validation**: Zod (Robust schema validation)
- **Testing**: Vitest (Unit/Integration), Playwright (E2E)
- **Auth**: NextAuth.js v4
- **Storage**: Cloudflare R2
- **Hosting**: Railway

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Cloudflare R2 Bucket (or S3-compatible)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/amako-v2.git
   cd amako-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Update .env.local with your credentials
   ```

4. **Database Initialization**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

We prioritize code quality with a dual-layer testing strategy.

```bash
# Run Unit & Integration tests (Vitest)
npm run test

# Run Watch Mode for development
npm run test:watch

# Run E2E tests (Playwright)
npm run e2e
```

---

## 📂 Project Structure

```text
amako_v2/
├── app/                  # Next.js App Router
│   ├── admin/           # Admin Dashboard
│   ├── api/             # Secure API Routes (Zod validated)
│   ├── components/      # Atomic UI Components
│   └── manga/           # Core Manga & Reader logic
├── lib/                 # Shared Utilities (Auth, Prisma, R2)
│   └── validations/     # Centralized Zod Schemas
├── prisma/              # DB Schema & Migrations
├── tests/               # E2E & Setup Configurations
└── scripts/             # Internal Maintenance Scripts
```

---

## 🛠️ Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Production build with Prisma generation.
- `npm run lint`: Runs ESLint for code quality.
- `npm run test`: Executes unit tests once.
- `npm run e2e`: Executes Playwright E2E tests.
- `npm run db:push`: Synchronizes Prisma schema with the database.

---

## 📄 License

Private Project. All rights reserved.

---

## 👤 Author

**Oyuka** - *Lead Developer*
