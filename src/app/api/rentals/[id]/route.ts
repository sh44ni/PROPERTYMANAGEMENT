import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import type { UpdateRentalInput } from '@/types';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/rentals/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        console.log('Get rental:', id);
        return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to fetch rental' }, { status: 500 });
    }
}

// PUT /api/rentals/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body: UpdateRentalInput = await request.json();
        // TODO: Prisma update
        console.log('Update rental:', id, body);
        return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to update rental' }, { status: 500 });
    }
}

// DELETE /api/rentals/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        // TODO: Prisma delete, also set property status back to 'available'
        console.log('Delete rental:', id);
        return NextResponse.json({ message: 'Rental deleted' });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to delete rental' }, { status: 500 });
    }
}
