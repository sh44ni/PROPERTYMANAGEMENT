import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createReadStream } from 'fs';
import { stat, unlink } from 'fs/promises';
import { Readable } from 'stream';

type Ctx = { params: Promise<{ id: string; documentId: string }> };

// GET /api/contracts/[id]/documents/[documentId] - Stream/download a sale contract attachment
export async function GET(request: NextRequest, ctx: Ctx) {
    try {
        const { id, documentId } = await ctx.params;
        const { searchParams } = new URL(request.url);
        const inline = searchParams.get('inline') === '1';

        const doc = await prisma.saleContractDocument.findFirst({
            where: { id: documentId, saleContractId: id }
        });

        if (!doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        try {
            await stat(doc.storagePath);
        } catch {
            return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
        }

        const fileStat = await stat(doc.storagePath);
        const stream = createReadStream(doc.storagePath);

        return new NextResponse(Readable.toWeb(stream) as any, {
            headers: {
                'Content-Type': doc.mimeType || 'application/octet-stream',
                'Content-Length': String(fileStat.size),
                'Content-Disposition': inline
                    ? `inline; filename="${encodeURIComponent(doc.originalName)}"`
                    : `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
                'Cache-Control': 'private, max-age=0, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Error streaming contract document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}

// DELETE /api/contracts/[id]/documents/[documentId] - Delete a sale contract attachment
export async function DELETE(request: NextRequest, ctx: Ctx) {
    try {
        const { id, documentId } = await ctx.params;

        const doc = await prisma.saleContractDocument.findFirst({
            where: { id: documentId, saleContractId: id }
        });

        if (!doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Delete file from disk
        if (doc.storagePath) {
            try {
                await unlink(doc.storagePath);
            } catch {
                console.warn('Could not delete file from disk:', doc.storagePath);
            }
        }

        await prisma.saleContractDocument.delete({ where: { id: documentId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contract document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
