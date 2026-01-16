import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cities - Get all cities
export async function GET(request: NextRequest) {
    try {
        const cities = await prisma.city.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { areas: true } }
            }
        });

        return NextResponse.json({
            data: cities.map(c => ({
                id: c.id,
                name: c.name,
                areasCount: c._count.areas,
            }))
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
        return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }
}

// POST /api/cities - Create a new city
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { error: 'City name is required' },
                { status: 400 }
            );
        }

        // Check if city already exists (case-insensitive)
        const existingCity = await prisma.city.findFirst({
            where: {
                name: {
                    equals: body.name.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (existingCity) {
            return NextResponse.json(
                { error: 'This city already exists' },
                { status: 400 }
            );
        }

        const city = await prisma.city.create({
            data: { name: body.name.trim() },
        });

        return NextResponse.json({
            data: {
                id: city.id,
                name: city.name,
                areasCount: 0,
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating city:', error);
        return NextResponse.json({ error: 'Failed to create city' }, { status: 500 });
    }
}

// DELETE /api/cities - Delete a city
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'City ID is required' }, { status: 400 });
        }

        await prisma.city.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting city:', error);
        return NextResponse.json({ error: 'Failed to delete city' }, { status: 500 });
    }
}
