import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

// Get upload directory - use env var or default to public/uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads', 'documents');

// Ensure upload directory exists
async function ensureUploadDir() {
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
    } catch {
        // Directory already exists
    }
}

// GET /api/documents - Get all documents with optional filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const documents = await prisma.document.findMany({
            where: {
                ...(category && category !== 'all' && { category }),
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { originalName: { contains: search, mode: 'insensitive' } },
                    ]
                }),
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ data: documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

// POST /api/documents - Create a new document with file upload
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const name = formData.get('name') as string;
        const category = formData.get('category') as string;

        if (!file || !name) {
            return NextResponse.json(
                { error: 'File and name are required' },
                { status: 400 }
            );
        }

        await ensureUploadDir();

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(file.name);
        const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Determine file type from extension
        const fileType = ext.replace('.', '').toLowerCase() || 'unknown';

        // Create document record in database (fileUrl is set after we have the id)
        const document = await prisma.document.create({
            data: {
                name,
                originalName: file.name,
                type: fileType,
                category: category || 'other',
                size: file.size,
                mimeType: file.type,
                filePath: filePath,
                // Use API route URL so files are served regardless of UPLOAD_DIR location
                fileUrl: null,
            }
        });

        // Update with API-based URL now that we have the id
        await prisma.document.update({
            where: { id: document.id },
            data: { fileUrl: `/api/documents/${document.id}` }
        });

        const updatedDocument = await prisma.document.findUnique({ where: { id: document.id } });
        return NextResponse.json({ data: updatedDocument }, { status: 201 });
    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }
}

// DELETE /api/documents - Delete a document
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Document ID is required' },
                { status: 400 }
            );
        }

        // Get document to find file path
        const document = await prisma.document.findUnique({
            where: { id }
        });

        if (!document) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        // Delete file from disk if it exists
        if (document.filePath) {
            try {
                await unlink(document.filePath);
            } catch {
                console.warn('Could not delete file:', document.filePath);
            }
        }

        // Delete database record
        await prisma.document.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
