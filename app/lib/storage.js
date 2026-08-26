// =============================================================================
// Storage Service Abstraction
// Dev: local filesystem (public/uploads/)
// Prod: swap LocalStorageProvider → VercelBlobProvider
// =============================================================================

import fs from 'fs';
import path from 'path';

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

// Swap this line to use VercelBlobProvider in production
export const storageService = new LocalStorageProvider();
