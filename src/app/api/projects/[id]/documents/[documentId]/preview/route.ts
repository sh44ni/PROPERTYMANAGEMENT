import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/server/authz';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';

type Ctx = { params: Promise<{ id: string; documentId: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const auth = await requireUser(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: projectId, documentId } = await ctx.params;
  const doc = await prisma.projectDocument.findFirst({
    where: { id: documentId, projectId, deletedAt: null },
  });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Prefer preview for HEIC/HEIF (or any future conversions)
  const previewPath = doc.previewStoragePath || doc.storagePath;
  const previewMime = doc.previewMimeType || doc.mimeType || 'application/octet-stream';

  const fileStat = await stat(previewPath);
  const stream = createReadStream(previewPath);

  return new NextResponse(Readable.toWeb(stream) as any, {
    headers: {
      'Content-Type': previewMime,
      'Content-Length': String(fileStat.size),
      // inline for modal/new-tab preview
      'Content-Disposition': `inline; filename="${encodeURIComponent(doc.originalFileName)}"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  });
}

