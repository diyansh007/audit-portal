// =============================================================================
// Storage Service Abstraction
//
// Dev  → LocalStorageProvider  (writes to public/uploads/)
// Prod → CloudflareR2Provider  (Cloudflare R2 via S3-compatible API)
//
// To switch: change the export at the bottom. Nothing else changes.
// =============================================================================

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Local filesystem — development only
// ---------------------------------------------------------------------------
class LocalStorageProvider {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(buffer, filename) {
    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(this.uploadDir, safeFilename);
    fs.writeFileSync(filePath, buffer);
    return {
      url: `/uploads/${safeFilename}`,
      filename: safeFilename,
      sizeBytes: buffer.length,
    };
  }

  getUrl(filename) {
    return `/uploads/${filename}`;
  }
}

// ---------------------------------------------------------------------------
// Cloudflare R2 — production
//
// R2 exposes an S3-compatible API. Install:
//   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
//
// Set these env vars in Cloudflare Pages / Workers:
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
//   R2_PUBLIC_URL  (your R2 public bucket URL or a custom domain)
//
// Cloudflare Pages deployment:
//   npx @cloudflare/next-on-pages
//   Then deploy with: wrangler pages deploy .vercel/output/static
// ---------------------------------------------------------------------------
class CloudflareR2Provider {
  constructor() {
    // Lazy-load the AWS SDK so it doesn't break the local dev build
    this._clientPromise = null;
  }

  async _getClient() {
    if (this._clientPromise) return this._clientPromise;
    const { S3Client } = await import('@aws-sdk/client-s3');
    this._clientPromise = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    return this._clientPromise;
  }

  async upload(buffer, filename) {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this._getClient();
    const safeFilename = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: safeFilename,
        Body: buffer,
        ContentType: 'image/jpeg', // caller can pass mime type if needed
      })
    );

    const url = `${process.env.R2_PUBLIC_URL}/${safeFilename}`;
    return { url, filename: safeFilename, sizeBytes: buffer.length };
  }

  getUrl(filename) {
    return `${process.env.R2_PUBLIC_URL}/${filename}`;
  }
}

// ---------------------------------------------------------------------------
// ✅ SWAP THIS LINE to switch providers:
//
//   Dev  → new LocalStorageProvider()
//   Prod → new CloudflareR2Provider()
//
// Or conditionally:
//   process.env.NODE_ENV === 'production'
//     ? new CloudflareR2Provider()
//     : new LocalStorageProvider()
// ---------------------------------------------------------------------------
export const storageService =
  process.env.NODE_ENV === 'production' && process.env.R2_ACCOUNT_ID
    ? new CloudflareR2Provider()
    : new LocalStorageProvider();

