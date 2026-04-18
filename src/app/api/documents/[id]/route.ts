import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createReadStream } from 'fs';
import { stat, unlink } from 'fs/promises';
import { Readable } from 'stream';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/documents/[id] - Download/stream a document file
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const document = await prisma.document.findUnique({
            where: { id }
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        if (!document.filePath) {
            return NextResponse.json({ error: 'File not available' }, { status: 404 });
        }

        // Check file exists on disk
        try {
            await stat(document.filePath);
        } catch {
            return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const inline = searchParams.get('inline') === '1';

        const fileStat = await stat(document.filePath);
        const stream = createReadStream(document.filePath);

        return new NextResponse(Readable.toWeb(stream) as any, {
            headers: {
                'Content-Type': document.mimeType || 'application/octet-stream',
                'Content-Length': String(fileStat.size),
                'Content-Disposition': inline
                    ? `inline; filename="${encodeURIComponent(document.originalName)}"`
                    : `attachment; filename="${encodeURIComponent(document.originalName)}"`,
                'Cache-Control': 'private, max-age=0, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Error streaming document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}

// DELETE /api/documents/[id] - Delete a document and its file
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const document = await prisma.document.findUnique({
            where: { id }
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Delete file from disk if it exists
        if (document.filePath) {
            try {
                await unlink(document.filePath);
            } catch {
                console.warn('Could not delete file from disk:', document.filePath);
            }
        }

        // Delete database record
        await prisma.document.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
