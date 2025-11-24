
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const storageService = {
  // Added 'extension' parameter defaulting to 'png'
  async saveImage(imageBuffer: ArrayBuffer, prefix: string = 'img', extension: string = 'png'): Promise<string> {
    const filename = `${prefix}_${randomUUID()}.${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(imageBuffer);

    await fs.promises.writeFile(filepath, buffer);

    return `/uploads/${filename}`;
  },

  async deleteImage(url: string): Promise<void> {
    if (!url.startsWith('/uploads/')) return;
    const filename = url.replace('/uploads/', '');
    const filepath = path.join(UPLOAD_DIR, filename);
    try {
      await fs.promises.unlink(filepath);
    } catch (e) {
      console.error("Failed to delete image:", e);
    }
  }
};
