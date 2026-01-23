# Railway Deployment Guide

## Prerequisites
1. Railway account (sign up at https://railway.app)
2. All environment variables ready (see .env.example)
3. GitHub repository connected

## Deployment Steps

### 1. Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project (or create new)
railway link
```

### 2. Set Environment Variables
Go to Railway dashboard → Your Project → Variables tab

Add these variables:
```
DATABASE_URL=<your-neon-postgresql-url>
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXT_PUBLIC_FRONTEND_URL=<your-cloudflare-pages-url>
R2_ENDPOINT=<your-r2-endpoint>
R2_ACCESS_KEY_ID=<your-r2-access-key>
R2_SECRET_ACCESS_KEY=<your-r2-secret-key>
R2_BUCKET_NAME=manga-images
R2_PUBLIC_URL=<your-r2-public-url>
NODE_ENV=production
```

### 3. Deploy
```bash
# Deploy from CLI
railway up

# Or push to GitHub (if connected to GitHub)
git push origin main
```

### 4. Get Your Railway URL
After deployment, Railway will provide a URL like:
`https://your-app.up.railway.app`

### 5. Update Frontend URL
After getting your Railway URL, update:
- Cloudflare Pages env var: `NEXT_PUBLIC_API_URL=https://your-app.up.railway.app`

## Verify Deployment

Test these endpoints:
```bash
# Health check (create this endpoint if needed)
curl https://your-app.up.railway.app/api/health

# Auth endpoint
curl -X POST https://your-app.up.railway.app/api/auth/signin
```

## Common Issues

### Build Fails
- Check Railway logs
- Ensure `prisma generate` runs before build
- Verify Node version (Railway uses Node 18 by default)

### Database Connection
- Ensure DATABASE_URL is correct
- Neon PostgreSQL requires `?sslmode=require`

### CORS Errors
- Verify NEXT_PUBLIC_FRONTEND_URL is set correctly
- Check middleware.ts is included in deployment

## Cost
Railway provides $5/month free credit. Your backend should use:
- ~500MB memory
- Minimal CPU
- ~$0-1/month (within free tier for your traffic)
