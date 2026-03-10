import { mkdirSync, writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCAL_STORAGE_DIR = resolve(__dirname, '../../uploads');

/**
 * Local filesystem storage provider.
 * Used as a fallback when S3 is not configured (no AWS credentials).
 * Same interface as s3.provider.js so they're interchangeable.
 */
const localStorageProvider = {
  async upload(key, body, contentType) {
    const filePath = resolve(LOCAL_STORAGE_DIR, key);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, body);
    logger.info(`Local storage uploaded: ${key}`);
    return key;
  },

  async uploadFile(file, keyPrefix) {
    const key = `${keyPrefix}/${Date.now()}-${file.originalname}`;
    await this.upload(key, file.buffer, file.mimetype);
    const url = `/uploads/${key}`;
    return { s3Key: key, url };
  },

  async getSignedUrl(key) {
    return `/uploads/${key}`;
  },

  async download(key) {
    const filePath = resolve(LOCAL_STORAGE_DIR, key);
    if (!existsSync(filePath)) {
      throw new Error(`File not found in local storage: ${key}`);
    }
    const buffer = readFileSync(filePath);
    return { buffer, contentType: 'application/octet-stream' };
  },

  async delete(key) {
    const filePath = resolve(LOCAL_STORAGE_DIR, key);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      logger.info(`Local storage deleted: ${key}`);
    }
  },

  getPublicUrl(key) {
    return `/uploads/${key}`;
  },
};

// --- Decide which provider to use ---
let activeProvider;

async function getProvider() {
  if (activeProvider) return activeProvider;

  if (env.aws.accessKeyId && env.aws.secretAccessKey) {
    const s3Module = await import('./s3.provider.js');
    activeProvider = s3Module.default;
    logger.info('Storage: using AWS S3');
  } else {
    activeProvider = localStorageProvider;
    logger.info('Storage: using local filesystem (no AWS credentials configured)');
  }

  return activeProvider;
}

/**
 * Storage provider that auto-selects S3 or local filesystem.
 * Proxies all calls to the active provider.
 */
const storageProvider = {
  async upload(key, body, contentType) {
    const p = await getProvider();
    return p.upload(key, body, contentType);
  },
  async uploadFile(file, keyPrefix) {
    const p = await getProvider();
    return p.uploadFile(file, keyPrefix);
  },
  async getSignedUrl(key, expiresIn) {
    const p = await getProvider();
    return p.getSignedUrl(key, expiresIn);
  },
  async download(key) {
    const p = await getProvider();
    return p.download(key);
  },
  async delete(key) {
    const p = await getProvider();
    return p.delete(key);
  },
  getPublicUrl(key) {
    // Sync method - needs immediate resolution
    if (env.aws.accessKeyId && env.aws.secretAccessKey) {
      return `https://${env.aws.s3Bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
    }
    return `/uploads/${key}`;
  },
};

export default storageProvider;
