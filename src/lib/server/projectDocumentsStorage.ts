import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import crypto from 'crypto';
import sharp from 'sharp';

const DEFAULT_MAX_UPLOAD_MB = 25;

export const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'heic',
  'heif',
]);

export function getMaxUploadBytes() {
  const mb = Number(process.env.MAX_UPLOAD_MB || DEFAULT_MAX_UPLOAD_MB);
  const safeMb = Number.isFinite(mb) && mb > 0 ? mb : DEFAULT_MAX_UPLOAD_MB;
  return safeMb * 1024 * 1024;
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function getExtension(fileName: string) {
  const ext = path.extname(fileName || '').replace('.', '').toLowerCase();
  return ext;
}

export function getProjectDocumentBaseDir() {
  // Store outside /public to avoid unauthenticated access
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'projects');
}

export async function ensureDir(dirPath: string) {
  await mkdir(dirPath, { recursive: true });
}

export function makeStoredFileName(originalName: string) {
  const ext = getExtension(originalName);
  const base = sanitizeFileName(originalName.replace(/\.[^/.]+$/, ''));
  const id = crypto.randomUUID();
  return `${Date.now()}_${id}_${base}.${ext || 'bin'}`;
}

export function projectDocumentTypeDir(projectId: string, documentType: string) {
  return path.join(getProjectDocumentBaseDir(), projectId, 'documents', documentType);
}

export async function writeBufferToFile(storageDir: string, storedFileName: string, buffer: Buffer) {
  await ensureDir(storageDir);
  const storagePath = path.join(storageDir, storedFileName);
  await writeFile(storagePath, buffer);
  return storagePath;
}

export async function maybeCreateHeicPreview(inputBuffer: Buffer, originalName: string) {
  const ext = getExtension(originalName);
  if (ext !== 'heic' && ext !== 'heif') return null;

  // Convert to JPG for broad preview support
  const previewBuffer = await sharp(inputBuffer, { failOn: 'none' })
    .rotate()
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  return {
    previewBuffer,
    previewExt: 'jpg' as const,
    previewMimeType: 'image/jpeg' as const,
    previewSize: previewBuffer.length,
  };
}

