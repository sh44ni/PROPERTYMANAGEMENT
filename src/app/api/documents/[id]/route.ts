import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/documents/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        // TODO: Prisma query + return file for download
        console.log('Get document:', id);
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}

// DELETE /api/documents/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        // TODO: Prisma delete + delete actual file from storage
        console.log('Delete document:', id);
        return NextResponse.json({ message: 'Document deleted' });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
