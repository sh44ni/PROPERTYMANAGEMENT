import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import {
    ALLOWED_EXTENSIONS,
    getExtension,
    getMaxUploadBytes,
    makeStoredFileName,
    sanitizeFileName,
    writeBufferToFile,
} from '@/lib/server/projectDocumentsStorage';

type Ctx = { params: Promise<{ id: string }> };

function contractDocumentBaseDir(contractId: string) {
    const baseDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'contracts');
    return path.join(baseDir, contractId, 'attachments');
}

// GET /api/contracts/[id]/documents - List attachments for a sale contract
export async function GET(request: NextRequest, ctx: Ctx) {
    try {
        const { id } = await ctx.params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'sale' | null;

        if (type !== 'sale') {
            return NextResponse.json({ error: 'Only sale contracts support attachments' }, { status: 400 });
        }

        const contract = await prisma.saleContract.findUnique({
            where: { id },
            include: { attachments: { orderBy: { uploadedAt: 'desc' } } }
        });

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        return NextResponse.json({ data: contract.attachments });
    } catch (error) {
        console.error('Error fetching contract documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

// POST /api/contracts/[id]/documents - Upload attachment(s) to a sale contract
export async function POST(request: NextRequest, ctx: Ctx) {
    try {
        const { id } = await ctx.params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'sale' | null;

        if (type !== 'sale') {
            return NextResponse.json({ error: 'Only sale contracts support attachments' }, { status: 400 });
        }

        const contract = await prisma.saleContract.findUnique({ where: { id } });
        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const nameOverride = formData.get('name') as string | null;

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
        }

        const maxBytes = getMaxUploadBytes();
        const storageDir = contractDocumentBaseDir(id);
        const created = [];

        for (const file of files) {
            if (!file || typeof (file as any).arrayBuffer !== 'function') continue;
            if (file.size > maxBytes) {
                return NextResponse.json({ error: `File too large. Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB` }, { status: 413 });
            }

            const originalFileName = sanitizeFileName(file.name || 'upload');
            const ext = getExtension(originalFileName);
            if (!ALLOWED_EXTENSIONS.has(ext) && ext !== 'doc' && ext !== 'docx' && ext !== 'xlsx' && ext !== 'xls') {
                return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 });
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const storedFileName = makeStoredFileName(originalFileName);
            const storagePath = await writeBufferToFile(storageDir, storedFileName, buffer);

            const record = await prisma.saleContractDocument.create({
                data: {
                    saleContractId: id,
                    name: nameOverride || originalFileName,
                    originalName: file.name,
                    storedFileName,
                    storagePath,
                    mimeType: file.type || 'application/octet-stream',
                    fileSize: file.size,
                }
            });

            created.push(record);
        }

        return NextResponse.json({ data: created }, { status: 201 });
    } catch (error) {
        console.error('Error uploading contract document:', error);
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }
}
