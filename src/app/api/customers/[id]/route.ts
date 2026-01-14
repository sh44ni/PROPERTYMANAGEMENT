import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import type { UpdateCustomerInput } from '@/types';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/customers/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        // TODO: Prisma query
        console.log('Get customer:', id);
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
    }
}

// PUT /api/customers/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body: UpdateCustomerInput = await request.json();
        // TODO: Prisma update
        console.log('Update customer:', id, body);
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}

// DELETE /api/customers/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        // TODO: Prisma delete
        console.log('Delete customer:', id);
        return NextResponse.json({ message: 'Customer deleted' });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
