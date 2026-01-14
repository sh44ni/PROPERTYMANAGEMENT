import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma'; // Uncomment when Prisma is set up
import type { UpdatePropertyInput } from '@/types';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/properties/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // TODO: Replace with Prisma query
        // const property = await prisma.property.findUnique({
        //     where: { id },
        //     include: { project: true, rentals: true }
        // });

        console.log('Get property:', id);
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    } catch (error) {
        console.error('Error fetching property:', error);
        return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
    }
}

// PUT /api/properties/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body: UpdatePropertyInput = await request.json();

        // TODO: Replace with Prisma update
        // const property = await prisma.property.update({
        //     where: { id },
        //     data: body
        // });

        console.log('Update property:', id, body);
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    } catch (error) {
        console.error('Error updating property:', error);
        return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
    }
}

// DELETE /api/properties/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // TODO: Replace with Prisma delete
        // await prisma.property.delete({ where: { id } });

        console.log('Delete property:', id);
        return NextResponse.json({ message: 'Property deleted' });
    } catch (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
    }
}
