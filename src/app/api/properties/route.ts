import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedJson, errorJson } from '@/lib/api-cache';

// GET /api/properties - Get all properties
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const area = searchParams.get('area');
        // Lightweight mode: only the fields /rentals needs for its property picker.
        const mode = searchParams.get('mode');

        if (mode === 'lite') {
            const properties = await prisma.property.findMany({
                where: {
                    ...(projectId && { projectId }),
                    ...(status && { status }),
                    ...(type && { type }),
                    ...(area && { area }),
                },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                    area: true,
                    location: true,
                    price: true,
                },
            });
            return cachedJson({ data: properties }, { cdn: 30, swr: 120 });
        }

        const properties = await prisma.property.findMany({
            where: {
                ...(projectId && { projectId }),
                ...(status && { status }),
                ...(type && { type }),
                ...(area && { area }),
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                type: true,
                status: true,
                unitNumber: true,
                area: true,
                location: true,
                price: true,
                bedrooms: true,
                bathrooms: true,
                balconies: true,
                floor: true,
                electricityMeter: true,
                maintenance: true,
                projectId: true,
                ownerId: true,
                images: true,
                createdAt: true,
                updatedAt: true,
                project: { select: { id: true, name: true, city: true, districtName: true } },
                owner: { select: { id: true, name: true, phone: true } },
                rentals: {
                    where: { status: 'active' },
                    select: {
                        id: true,
                        monthlyRent: true,
                        startDate: true,
                        endDate: true,
                        customer: { select: { id: true, name: true, phone: true } },
                    },
                    take: 1,
                },
            },
        });

        return cachedJson({ data: properties }, { cdn: 30, swr: 120 });
    } catch (error) {
        console.error('Error fetching properties:', error);
        return errorJson('Failed to fetch properties');
    }
}

// POST /api/properties - Create a new property (unit)
// NOTE: does NOT touch project.totalUnits — that is the building's fixed capacity set at project creation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.title || !body.type) {
            return NextResponse.json(
                { error: 'Property title and type are required' },
                { status: 400 }
            );
        }

        const property = await prisma.property.create({
            data: {
                projectId: body.projectId || null,
                unitNumber: body.unitNumber || null,
                title: body.title,
                type: body.type,
                status: body.status || 'available',
                area: body.area || null,
                location: body.location || null,
                price: body.price ? parseFloat(body.price) : 0,
                bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
                bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
                description: body.description || null,
                images: body.images || [],
                maintenance: body.maintenance != null ? String(body.maintenance) : null,
                balconies: body.balconies ? parseInt(body.balconies) : null,
                floor: body.floor != null ? String(body.floor) : null,
                electricityMeter: body.electricityMeter || null,
                ownerId: body.ownerId || null,
            },
            include: {
                project: { select: { id: true, name: true } },
                owner: { select: { id: true, name: true } },
            }
        });

        return NextResponse.json({ data: property }, { status: 201 });
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
    }
}

// PUT /api/properties - Update a property (unit)
// NOTE: does NOT touch project.totalUnits even when projectId changes
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const property = await prisma.property.update({
            where: { id: body.id },
            data: {
                ...(body.projectId !== undefined && { projectId: body.projectId || null }),
                ...(body.title && { title: body.title }),
                ...(body.type && { type: body.type }),
                ...(body.status && { status: body.status }),
                ...(body.area !== undefined && { area: body.area }),
                ...(body.location !== undefined && { location: body.location }),
                ...(body.price !== undefined && { price: parseFloat(body.price) }),
                ...(body.bedrooms !== undefined && { bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null }),
                ...(body.bathrooms !== undefined && { bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.images && { images: body.images }),
                ...(body.maintenance !== undefined && { maintenance: body.maintenance != null ? String(body.maintenance) : null }),
                ...(body.balconies !== undefined && { balconies: body.balconies ? parseInt(body.balconies) : null }),
                ...(body.floor !== undefined && { floor: body.floor != null ? String(body.floor) : null }),
                ...(body.electricityMeter !== undefined && { electricityMeter: body.electricityMeter }),
                ...(body.ownerId !== undefined && { ownerId: body.ownerId || null }),
            },
            include: {
                project: { select: { id: true, name: true } },
                owner: { select: { id: true, name: true } },
            }
        });

        return NextResponse.json({ data: property });
    } catch (error) {
        console.error('Error updating property:', error);
        return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
    }
}

// DELETE /api/properties - Delete a property (unit)
// NOTE: does NOT touch project.totalUnits — capacity is fixed
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const property = await prisma.property.findUnique({ where: { id } });
        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        await prisma.property.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
    }
}
