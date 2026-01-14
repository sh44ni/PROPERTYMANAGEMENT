import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import type { UpdateTransactionInput } from '@/types';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/transactions/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        console.log('Get transaction:', id);
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
    }
}

// PUT /api/transactions/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body: UpdateTransactionInput = await request.json();
        console.log('Update transaction:', id, body);
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}

// DELETE /api/transactions/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        console.log('Delete transaction:', id);
        return NextResponse.json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}
