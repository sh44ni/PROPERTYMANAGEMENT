import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import type { Document, CreateDocumentInput } from '@/types';

// GET /api/documents
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        // TODO: Replace with Prisma query
        // const documents = await prisma.document.findMany({
        //     where: {
        //         ...(category && { category }),
        //         ...(search && {
        //             OR: [
        //                 { name: { contains: search, mode: 'insensitive' } },
        //                 { originalName: { contains: search, mode: 'insensitive' } },
        //             ]
        //         }),
        //     },
        //     orderBy: { createdAt: 'desc' }
        // });

        console.log('Query:', { category, search });
        const documents: Document[] = [];

        return NextResponse.json({ data: documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

// POST /api/documents
export async function POST(request: NextRequest) {
    try {
        const body: CreateDocumentInput = await request.json();

        if (!body.name || !body.originalName) {
            return NextResponse.json(
                { error: 'Document name is required' },
                { status: 400 }
            );
        }

        // TODO: Replace with Prisma create
        // Also handle actual file storage (local or cloud)
        const document: Document = {
            id: `doc_${Date.now()}`,
            name: body.name,
            originalName: body.originalName,
            type: body.type,
            category: body.category,
            size: body.size,
            mimeType: body.mimeType,
            filePath: body.filePath || null,
            fileUrl: body.fileUrl || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ data: document }, { status: 201 });
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }
}
