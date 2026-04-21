import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedJson, json, errorJson } from '@/lib/api-cache';

/**
 * GET /api/owners
 *
 * Lists owners with counts only. Previously this loaded every linked project
 * and property row just to count them; now we use `_count` so the DB returns
 * numbers directly.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const [owners, rentedByOwner] = await Promise.all([
            prisma.owner.findMany({
                where: search
                    ? {
                          OR: [
                              { name: { contains: search, mode: 'insensitive' } },
                              { phone: { contains: search } },
                              { email: { contains: search, mode: 'insensitive' } },
                              { idNumber1: { contains: search } },
                          ],
                      }
                    : undefined,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    nationality: true,
                    address: true,
                    idType1: true,
                    idNumber1: true,
                    idImage1: true,
                    idType2: true,
                    idNumber2: true,
                    idImage2: true,
                    notes: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            properties: true,
                            projects: true,
                        },
                    },
                },
            }),
            prisma.property.groupBy({
                by: ['ownerId'],
                where: { status: 'rented', ownerId: { not: null } },
                _count: { _all: true },
            }),
        ]);

        const rentedMap = new Map<string, number>();
        for (const row of rentedByOwner) {
            if (row.ownerId) rentedMap.set(row.ownerId, row._count._all);
        }

        const ownersWithStats = owners.map((owner) => ({
            ...owner,
            propertiesCount: owner._count.properties,
            projectsCount: owner._count.projects,
            rentedProperties: rentedMap.get(owner.id) ?? 0,
        }));

        return cachedJson({ data: ownersWithStats }, { cdn: 30, swr: 120 });
    } catch (error) {
        console.error('Error fetching owners:', error);
        return errorJson('Failed to fetch owners');
    }
}

// POST /api/owners - Create a new owner
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || !body.phone) {
            return errorJson('Name and phone are required', 400);
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
            },
        });

        return json({ data: owner }, 201);
    } catch (error) {
        console.error('Error creating owner:', error);
        return errorJson('Failed to create owner');
    }
}

// PUT /api/owners - Update an owner
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) return errorJson('Owner ID is required', 400);

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
            },
        });

        return json({ data: owner });
    } catch (error) {
        console.error('Error updating owner:', error);
        return errorJson('Failed to update owner');
    }
}

// DELETE /api/owners - Delete an owner
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return errorJson('Owner ID is required', 400);

        const linkedProperties = await prisma.property.count({ where: { ownerId: id } });

        if (linkedProperties > 0) {
            return errorJson('Cannot delete owner because they are assigned to existing properties', 400);
        }

        await prisma.owner.delete({ where: { id } });

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting owner:', error);
        return errorJson('Failed to delete owner');
    }
}
