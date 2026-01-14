import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/contracts/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // rental or sale

        // TODO: Query appropriate table based on type
        console.log('Get contract:', id, type);
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
    }
}

// DELETE /api/contracts/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // rental or sale

        // TODO: Delete from appropriate table based on type
        // if (type === 'rental') {
        //     await prisma.rentalContract.delete({ where: { id } });
        // } else if (type === 'sale') {
        //     await prisma.saleContract.delete({ where: { id } });
        // }

        console.log('Delete contract:', id, type);
        return NextResponse.json({ message: 'Contract deleted' });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
    }
}
