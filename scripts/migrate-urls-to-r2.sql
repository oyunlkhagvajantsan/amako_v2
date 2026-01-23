-- Migration Script: Update Image URLs from Vercel Blob to R2
-- Run this AFTER uploading images to R2
-- 
-- IMPORTANT: Update the placeholder URLs below with your actual values:
-- - Replace 'https://YOUR-VERCEL-BLOB-URL' with your actual Vercel Blob URL pattern
-- - Replace 'https://pub-xxxxx.r2.dev' with your actual R2 public URL

-- Step 1: Backup current data (recommended)
-- You can run: pg_dump $DATABASE_URL > backup-before-migration.sql

-- Step 2: Update ChapterImage URLs
-- This replaces Vercel Blob URLs with R2 URLs
UPDATE "ChapterImage" 
SET "imageUrl" = REPLACE(
    "imageUrl", 
    'https://YOUR-VERCEL-BLOB-URL',  -- Replace with your Vercel Blob domain
    'https://pub-xxxxx.r2.dev'        -- Replace with your R2 public URL
)
WHERE "imageUrl" LIKE 'https://YOUR-VERCEL-BLOB-URL%';

-- Step 3: Update Manga cover images (if stored in Vercel Blob)
UPDATE "Manga" 
SET "coverImage" = REPLACE(
    "coverImage", 
    'https://YOUR-VERCEL-BLOB-URL',  -- Replace with your Vercel Blob domain
    'https://pub-xxxxx.r2.dev'        -- Replace with your R2 public URL
)
WHERE "coverImage" LIKE 'https://YOUR-VERCEL-BLOB-URL%';

-- Step 4: Verify the migration
-- Check a few random images to ensure URLs are correct
SELECT "id", "imageUrl" FROM "ChapterImage" LIMIT 10;
SELECT "id", "coverImage" FROM "Manga" WHERE "coverImage" IS NOT NULL LIMIT 5;

-- Step 5: Test the images
-- Copy one of the new URLs and paste it in your browser to verify it loads
