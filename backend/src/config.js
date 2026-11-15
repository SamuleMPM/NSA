import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const BACKEND_ROOT = path.resolve(currentDir, '..');
export const REPO_ROOT = path.resolve(BACKEND_ROOT, '..');
export const FRONTEND_DIST = path.resolve(REPO_ROOT, 'frontend', 'dist');

export const HOST = process.env.HOST || '127.0.0.1';
export const PORT = Number.parseInt(process.env.PORT || '4000', 10);
export const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(BACKEND_ROOT, 'data', 'aerohealth.db');
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
export const BODY_LIMIT_BYTES = Number.parseInt(process.env.BODY_LIMIT_BYTES || String(2 * 1024 * 1024), 10);
export const APP_VERSION = '1.0.0';
