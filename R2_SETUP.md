# Cloudflare R2 Setup Guide

## Step 1: Create R2 Bucket

1. Go to https://dash.cloudflare.com
2. Click **R2 Object Storage** in left sidebar
3. Click **Create bucket**
4. Enter bucket name: `manga-images` (lowercase, hyphens only)
5. Click **Create bucket**

## Step 2: Get API Credentials

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure token:
   - **Token name**: `manga-platform-upload`
   - **Permissions**: Object Read & Write
   - **Apply to bucket**: Select `manga-images`
4. Click **Create API Token**
5. **SAVE THESE VALUES** (shown only once):
   ```
   Access Key ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Secret Access Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   Endpoint: https://<account-id>.r2.cloudflarestorage.com
   ```

## Step 3: Enable Public Access

### Option A: R2.dev Subdomain (Quickest)
1. Go to your `manga-images` bucket
2. Click **Settings** tab
3. Under **Public access**, click **Allow Access**
4. You'll get a URL like: `https://pub-xxxxxxxxxxxxx.r2.dev`
5. **SAVE THIS URL** as your `R2_PUBLIC_URL`

### Option B: Custom Domain (Optional - Do Later)
1. In bucket settings, click **Connect Domain**
2. Enter subdomain: `images.yourdomain.com`
3. Follow DNS setup instructions
4. Use this as `R2_PUBLIC_URL`: `https://images.yourdomain.com`

## Step 4: Upload Images

### Via Wrangler CLI (Recommended)
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Upload a single file
wrangler r2 object put manga-images/chapters/1/page-001.jpg --file ./local-file.jpg

# Upload multiple files (repeat for each image)
wrangler r2 object put manga-images/chapters/1/page-002.jpg --file ./page-002.jpg
```

### Via Dashboard (Drag & Drop)
1. Go to your bucket in R2 dashboard
2. Click **Upload**
3. Drag and drop files
4. Create folders by typing path: `chapters/1/filename.jpg`

## Step 5: Test Public Access

After uploading, test an image URL:
```
https://pub-xxxxxxxxxxxxx.r2.dev/chapters/1/page-001.jpg
```

Paste this URL in your browser - you should see the image.

## Step 6: Update Database URLs

After ALL images are uploaded:

1. Get your old Vercel Blob URL pattern (from existing database records)
2. Get your new R2 public URL (from Step 3)
3. Edit `scripts/migrate-urls-to-r2.sql`:
   - Replace `YOUR-VERCEL-BLOB-URL` with actual Vercel Blob domain
   - Replace `pub-xxxxx.r2.dev` with your actual R2 URL
4. Run the SQL script on your Neon database

## Environment Variables

Add these to your `.env.local` (and later to Railway):

```env
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id-from-step-2
R2_SECRET_ACCESS_KEY=your-secret-access-key-from-step-2
R2_BUCKET_NAME=manga-images
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

## Cost Estimate

- **Storage**: $0.015/GB/month
  - 8GB = $0.12/month
  - 20GB = $0.30/month
- **Egress**: $0 (FREE!)
- **API requests**: $0.36 per million writes (negligible for your use case)

Expected monthly cost: **$0.10 - $0.50**

## Troubleshooting

### Images don't load
- Check public access is enabled
- Verify R2_PUBLIC_URL is correct
- Test direct URL in browser

### Upload fails
- Check API token has correct permissions
- Verify R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
- Check file size (R2 supports up to 5GB per file)

### CORS errors
- R2 automatically handles CORS for public buckets
- If using custom domain, check Cloudflare settings
