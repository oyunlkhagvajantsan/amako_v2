# Amako Website Deployment

This is a Next.js manga reading platform built with:
- **Frontend:** Next.js 16, React 19, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js
- **UI Components:** Lucide React icons

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/amako-website.git
cd amako-website

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Set up database
npx prisma migrate dev
npx prisma db push

# 5. Run development server
npm run dev
```

Visit `http://localhost:3000`

## 📦 Project Structure

```
amako_website/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── genres/            # Browse by genre
│   ├── manga/             # Manga details & reader
│   └── profile/           # User profile
├── lib/                   # Utility functions
├── prisma/                # Database schema & migrations
├── public/                # Static assets
│   └── uploads/          # User-uploaded images (gitignored)
└── scripts/              # Utility scripts
```

## 🌐 Deployment

See [Vercel Deployment Guide](./vercel_deployment_guide.md) for detailed instructions.

**Quick Deploy:**
1. Push to GitHub
2. Import to Vercel
3. Set up Neon PostgreSQL
4. Add environment variables
5. Deploy!

## 🔐 Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your domain URL
- `NEXTAUTH_SECRET` - Random secret key

Optional:
- SMTP credentials for email (forgot password feature)

## 📝 Features

- 📚 Browse manga library
- 📖 Chapter reader with image viewer
- 🔐 User authentication & profiles
- 🔒 Premium chapter system
- 👨‍💼 Admin panel for content management
- 📱 Fully responsive (mobile, tablet, desktop)
- 🌍 Mongolian & English support

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code

# Custom scripts
node scripts/convert-to-webp.js  # Convert images to WebP
```

## 📄 License

Private project - All rights reserved

## 👤 Author

Created by Oyuka
