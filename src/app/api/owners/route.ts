import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/owners - Get all owners with optional search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const owners = await prisma.owner.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { idNumber1: { contains: search } },
                ]
            } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                properties: true,
                _count: {
                    select: {
                        properties: true
                    }
                }
            }
        });

        // Add stats count property similar to how customers does
        const ownersWithStats = owners.map(owner => ({
            ...owner,
            propertiesCount: owner._count.properties
        }));

        return NextResponse.json({ data: ownersWithStats });
    } catch (error) {
        console.error('Error fetching owners:', error);
        return NextResponse.json({ error: 'Failed to fetch owners' }, { status: 500 });
    }
}

// POST /api/owners - Create a new owner
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || !body.phone) {
            return NextResponse.json(
                { error: 'Name and phone are required' },
                { status: 400 }
            );
        }

        const owner = await prisma.owner.create({
            data: {
                name: body.name,
                email: body.email || null,
                phone: body.phone,
                nationality: body.nationality || null,
                address: body.address || null,
                idType1: body.idType1 || null,
                idNumber1: body.idNumber1 || null,
                idImage1: body.idImage1 || null,
                idType2: body.idType2 || null,
                idNumber2: body.idNumber2 || null,
                idImage2: body.idImage2 || null,
                notes: body.notes || null,
            }
        });

        return NextResponse.json({ data: owner }, { status: 201 });
    } catch (error) {
        console.error('Error creating owner:', error);
        return NextResponse.json({ error: 'Failed to create owner' }, { status: 500 });
    }
}

// PUT /api/owners - Update an owner
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: 'Owner ID is required' },
                { status: 400 }
            );
        }

        const owner = await prisma.owner.update({
            where: { id: body.id },
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

// DELETE /api/owners - Delete an owner
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Owner ID is required' },
                { status: 400 }
            );
        }

        // Check if owner has properties
        const linkedProperties = await prisma.property.count({
            where: {
                ownerId: id
            }
        });

        if (linkedProperties > 0) {
            return NextResponse.json(
                { error: 'Cannot delete owner because they are assigned to existing properties' },
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
