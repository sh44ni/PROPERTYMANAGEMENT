import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { UpdateCustomerInput } from '@/types'; // We might reuse this or create UpdateOwnerInput later

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/owners/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const owner = await prisma.owner.findUnique({
            where: { id },
            include: {
                properties: true,
            }
        });

        if (!owner) {
            return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
        }

        return NextResponse.json({ data: owner });
    } catch (error) {
        console.error('Error fetching owner:', error);
        return NextResponse.json({ error: 'Failed to fetch owner' }, { status: 500 });
    }
}

// PUT /api/owners/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const owner = await prisma.owner.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.email !== undefined && { email: body.email }),
                ...(body.phone && { phone: body.phone }),
                ...(body.nationality !== undefined && { nationality: body.nationality }),
                ...(body.address !== undefined && { address: body.address }),
                ...(body.idType1 !== undefined && { idType1: body.idType1 }),
                ...(body.idNumber1 !== undefined && { idNumber1: body.idNumber1 }),
                ...(body.idImage1 !== undefined && { idImage1: body.idImage1 }),
                ...(body.idType2 !== undefined && { idType2: body.idType2 }),
                ...(body.idNumber2 !== undefined && { idNumber2: body.idNumber2 }),
                ...(body.idImage2 !== undefined && { idImage2: body.idImage2 }),
                ...(body.notes !== undefined && { notes: body.notes }),
            }
        });

        return NextResponse.json({ data: owner });
    } catch (error) {
        console.error('Error updating owner:', error);
        return NextResponse.json({ error: 'Failed to update owner' }, { status: 500 });
    }
}

// DELETE /api/owners/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if owner has properties
        const linkedProperties = await prisma.property.count({
            where: {
                ownerId: id
            }
        });

        if (linkedProperties > 0) {
            return NextResponse.json(
                { error: 'Cannot delete owner with active properties' },
                { status: 400 }
            );
        }

        await prisma.owner.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting owner:', error);
        return NextResponse.json({ error: 'Failed to delete owner' }, { status: 500 });
    }
}
