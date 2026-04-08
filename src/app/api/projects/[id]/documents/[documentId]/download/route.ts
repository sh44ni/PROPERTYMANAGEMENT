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

  const fileStat = await stat(doc.storagePath);
  const stream = createReadStream(doc.storagePath);

  return new NextResponse(Readable.toWeb(stream) as any, {
    headers: {
      'Content-Type': doc.mimeType || 'application/octet-stream',
      'Content-Length': String(fileStat.size),
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.originalFileName)}"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  });
}

