import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/properties - Get all properties
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const area = searchParams.get('area');

        const properties = await prisma.property.findMany({
            where: {
                ...(projectId && { projectId }),
                ...(status && { status }),
                ...(type && { type }),
                ...(area && { area }),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        return NextResponse.json({ data: properties });
    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json(
            { error: 'Failed to fetch properties' },
            { status: 500 }
        );
    }
}

// POST /api/properties - Create a new property
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
                title: body.title,
                type: body.type,
                status: body.status || 'available',
                area: body.area || null,
                location: body.location || null,
                price: body.price ? parseFloat(body.price) : 0,
                rentalPrice: body.rentalPrice ? parseFloat(body.rentalPrice) : 0,
                bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
                bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
                description: body.description || null,
                images: body.images || [],
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        // If property belongs to a project, update totalUnits count
        if (body.projectId) {
            await prisma.project.update({
                where: { id: body.projectId },
                data: { totalUnits: { increment: 1 } }
            });
        }

        return NextResponse.json({ data: property }, { status: 201 });
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json(
            { error: 'Failed to create property' },
            { status: 500 }
        );
    }
}

// PUT /api/properties - Update a property
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: 'Property ID is required' },
                { status: 400 }
            );
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
                ...(body.rentalPrice !== undefined && { rentalPrice: parseFloat(body.rentalPrice) }),
                ...(body.bedrooms !== undefined && { bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null }),
                ...(body.bathrooms !== undefined && { bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.images && { images: body.images }),
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        return NextResponse.json({ data: property });
    } catch (error) {
        console.error('Error updating property:', error);
        return NextResponse.json(
            { error: 'Failed to update property' },
            { status: 500 }
        );
    }
}

// DELETE /api/properties - Delete a property
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Property ID is required' },
                { status: 400 }
            );
        }

        // Get property to check projectId before deletion
        const property = await prisma.property.findUnique({
            where: { id }
        });

        if (!property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        await prisma.property.delete({
            where: { id }
        });

        // If property belonged to a project, decrement totalUnits
        if (property.projectId) {
            await prisma.project.update({
                where: { id: property.projectId },
                data: { totalUnits: { decrement: 1 } }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json(
            { error: 'Failed to delete property' },
            { status: 500 }
        );
    }
}
