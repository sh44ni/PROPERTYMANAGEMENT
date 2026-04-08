import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireUser } from '@/lib/server/authz';
import { PROJECT_DOCUMENT_TYPE_KEYS, getProjectDocumentTypeConfig } from '@/lib/projectDocumentTypes';
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

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: projectId } = await ctx.params;
  const docs = await prisma.projectDocument.findMany({
    where: { projectId, deletedAt: null, isActive: true },
    orderBy: [{ documentType: 'asc' }, { uploadedAt: 'desc' }],
    include: { uploadedBy: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({
    data: {
      projectId,
      allowedTypes: PROJECT_DOCUMENT_TYPE_KEYS,
      documents: docs,
    },
  });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: projectId } = await ctx.params;
  const formData = await request.formData();
  const documentType = String(formData.get('documentType') || '');
  const files = formData.getAll('files') as File[];
  const notes = formData.get('notes') ? String(formData.get('notes')) : null;

  if (!documentType || !PROJECT_DOCUMENT_TYPE_KEYS.includes(documentType as any)) {
    return NextResponse.json({ error: 'Invalid documentType' }, { status: 400 });
  }

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
  }

  const docConfig = getProjectDocumentTypeConfig(documentType);
  if (!docConfig) return NextResponse.json({ error: 'Invalid documentType' }, { status: 400 });
  if (!docConfig.allowMultiple && files.length > 1) {
    return NextResponse.json({ error: 'This document type only allows a single file' }, { status: 400 });
  }

  const maxBytes = getMaxUploadBytes();

  // For single-file types: replacing is implemented as "upload new => deactivate old".
  if (!docConfig.allowMultiple) {
    await prisma.projectDocument.updateMany({
      where: { projectId, documentType, isActive: true, deletedAt: null },
      data: {
        isActive: false,
        replacedAt: new Date(),
        replacedById: (auth.token as any)?.id || null,
      },
    });
  }

  const created = [];

  for (const file of files) {
    if (!file || typeof (file as any).arrayBuffer !== 'function') continue;
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

    const storageDir = projectDocumentTypeDir(projectId, documentType);
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

    const record = await prisma.projectDocument.create({
      data: {
        projectId,
        documentType,
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
        uploadedById: (auth.token as any)?.id || null,
      },
      include: { uploadedBy: { select: { id: true, name: true, email: true } } },
    });

    created.push(record);
  }

  return NextResponse.json({ data: created }, { status: 201 });
}

