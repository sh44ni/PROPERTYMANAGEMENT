import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireUser } from '@/lib/server/authz';
import { unlink } from 'fs/promises';
import {
  ALLOWED_EXTENSIONS,
  getExtension,
  getMaxUploadBytes,
  makeStoredFileName,
  maybeCreateHeicPreview,
  projectDocumentTypeDir,
  sanitizeFileName,
  writeBufferToFile,
} from '@/lib/server/projectDocumentsStorage';
import path from 'path';

type Ctx = { params: Promise<{ id: string; documentId: string }> };

async function safeUserIdFromToken(token: unknown) {
  const id = (token as any)?.id as string | undefined;
  if (!id) return null;
  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } }).catch(() => null);
  return exists?.id || null;
}

export async function GET(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: projectId, documentId } = await ctx.params;
  const doc = await prisma.projectDocument.findFirst({
    where: { id: documentId, projectId, deletedAt: null },
    include: { uploadedBy: { select: { id: true, name: true, email: true } } },
  });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: doc });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: projectId, documentId } = await ctx.params;
  const existing = await prisma.projectDocument.findFirst({
    where: { id: documentId, projectId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const notes = formData.get('notes') ? String(formData.get('notes')) : null;

  if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 });

  const maxBytes = getMaxUploadBytes();
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File too large. Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB` }, { status: 413 });
  }

  const originalFileName = sanitizeFileName(file.name || 'upload');
  const ext = getExtension(originalFileName);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const storageDir = projectDocumentTypeDir(projectId, existing.documentType);
  const storedFileName = makeStoredFileName(originalFileName);
  const storagePath = await writeBufferToFile(storageDir, storedFileName, buffer);

  const preview = await maybeCreateHeicPreview(buffer, originalFileName);
  let previewStoredFileName: string | null = null;
  let previewStoragePath: string | null = null;
  let previewMimeType: string | null = null;
  let previewFileSize: number | null = null;

  if (preview) {
    const previewBase = path.basename(storedFileName, path.extname(storedFileName));
    previewStoredFileName = `${previewBase}.preview.${preview.previewExt}`;
    previewStoragePath = await writeBufferToFile(storageDir, previewStoredFileName, preview.previewBuffer);
    previewMimeType = preview.previewMimeType;
    previewFileSize = preview.previewSize;
  }

  const actorUserId = await safeUserIdFromToken(auth.token);

  await prisma.projectDocument.update({
    where: { id: existing.id },
    data: {
      isActive: false,
      replacedAt: new Date(),
      replacedById: actorUserId,
    },
  });

  const created = await prisma.projectDocument.create({
    data: {
      projectId,
      documentType: existing.documentType,
      originalFileName: file.name,
      storedFileName,
      storagePath,
      mimeType: file.type || (ext === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
      fileSize: file.size,
      previewStoredFileName,
      previewStoragePath,
      previewMimeType,
      previewFileSize,
      notes,
      uploadedById: actorUserId,
    },
    include: { uploadedBy: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ data: created });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: projectId, documentId } = await ctx.params;
  const doc = await prisma.projectDocument.findFirst({
    where: { id: documentId, projectId, deletedAt: null },
  });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Remove files from disk (best-effort), then mark deleted in DB
  const pathsToDelete = [doc.storagePath, doc.previewStoragePath].filter(Boolean) as string[];
  for (const p of pathsToDelete) {
    try {
      await unlink(p);
    } catch {
      // ignore
    }
  }

  await prisma.projectDocument.update({
    where: { id: doc.id },
    data: {
      deletedAt: new Date(),
      isActive: false,
      replacedAt: null,
      replacedById: null,
    },
  });

  return NextResponse.json({ success: true });
}

