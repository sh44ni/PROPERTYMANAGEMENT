import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma'; // Uncomment when Prisma is set up
import type { Property, CreatePropertyInput } from '@/types';

// GET /api/properties - Get all properties
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        // TODO: Replace with Prisma query when database is connected
        // const properties = await prisma.property.findMany({
        //     where: {
        //         ...(projectId && { projectId }),
        //         ...(status && { status }),
        //         ...(type && { type }),
        //     },
        //     orderBy: { createdAt: 'desc' },
        //     include: { project: true }
        // });

        console.log('Query params:', { projectId, status, type });
        const properties: Property[] = [];

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
        const body: CreatePropertyInput = await request.json();

        if (!body.title) {
            return NextResponse.json(
                { error: 'Property title is required' },
                { status: 400 }
            );
        }

        // TODO: Replace with Prisma create when database is connected
        // const property = await prisma.property.create({
        //     data: {
        //         projectId: body.projectId,
        //         title: body.title,
        //         type: body.type,
        //         area: body.area,
        //         location: body.location,
        //         price: body.price || 0,
        //         bedrooms: body.bedrooms,
        //         bathrooms: body.bathrooms,
        //         description: body.description,
        //         images: body.images || [],
        //     }
        // });

        const property: Property = {
            id: `prop_${Date.now()}`,
            projectId: body.projectId || null,
            title: body.title,
            type: body.type,
            status: 'available',
            area: body.area || null,
            location: body.location || null,
            price: body.price || 0,
            bedrooms: body.bedrooms || null,
            bathrooms: body.bathrooms || null,
            description: body.description || null,
            images: body.images || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ data: property }, { status: 201 });
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json(
            { error: 'Failed to create property' },
            { status: 500 }
        );
    }
}
