import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/areas - Get all areas with cities
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cityId = searchParams.get('cityId');

        const areas = await prisma.area.findMany({
            where: cityId ? { cityId } : undefined,
            orderBy: [{ city: { name: 'asc' } }, { name: 'asc' }],
            include: {
                city: { select: { id: true, name: true } }
            }
        });

        const cities = await prisma.city.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { areas: true } }
            }
        });

        return NextResponse.json({
            data: {
                areas: areas.map(a => ({
                    id: a.id,
                    name: a.name,
                    city: a.city.name,
                    cityId: a.cityId,
                })),
                cities: cities.map(c => ({
                    id: c.id,
                    name: c.name,
                    areasCount: c._count.areas,
                })),
            }
        });
    } catch (error) {
        console.error('Error fetching areas:', error);
        return NextResponse.json({ error: 'Failed to fetch areas' }, { status: 500 });
    }
}

// POST /api/areas - Create a new area
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || !body.cityId) {
            return NextResponse.json(
                { error: 'Area name and city are required' },
                { status: 400 }
            );
        }

        // Check if area already exists in this city
        const existing = await prisma.area.findFirst({
            where: {
                name: { equals: body.name, mode: 'insensitive' },
                cityId: body.cityId,
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'This area already exists in the selected city' },
                { status: 400 }
            );
        }

        const area = await prisma.area.create({
            data: {
                name: body.name,
                cityId: body.cityId,
            },
            include: {
                city: { select: { id: true, name: true } }
            }
        });

        return NextResponse.json({
            data: {
                id: area.id,
                name: area.name,
                city: area.city.name,
                cityId: area.cityId,
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating area:', error);
        return NextResponse.json({ error: 'Failed to create area' }, { status: 500 });
    }
}

// PUT /api/areas - Update an area
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Area ID is required' }, { status: 400 });
        }

        if (!body.name || !body.cityId) {
            return NextResponse.json(
                { error: 'Area name and city are required' },
                { status: 400 }
            );
        }

        // Check for duplicate
        const existing = await prisma.area.findFirst({
            where: {
                name: { equals: body.name, mode: 'insensitive' },
                cityId: body.cityId,
                NOT: { id },
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'This area already exists in the selected city' },
                { status: 400 }
            );
        }

        const area = await prisma.area.update({
            where: { id },
            data: {
                name: body.name,
                cityId: body.cityId,
            },
            include: {
                city: { select: { id: true, name: true } }
            }
        });

        return NextResponse.json({
            data: {
                id: area.id,
                name: area.name,
                city: area.city.name,
                cityId: area.cityId,
            }
        });
    } catch (error) {
        console.error('Error updating area:', error);
        return NextResponse.json({ error: 'Failed to update area' }, { status: 500 });
    }
}

// DELETE /api/areas - Delete an area
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Area ID is required' }, { status: 400 });
        }

        await prisma.area.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting area:', error);
        return NextResponse.json({ error: 'Failed to delete area' }, { status: 500 });
    }
}
