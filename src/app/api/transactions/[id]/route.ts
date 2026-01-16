import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/transactions/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                customer: { select: { id: true, name: true } },
                property: true,
                rental: { select: { id: true } },
            },
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        return NextResponse.json({ data: transaction });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
    }
}

// PATCH /api/transactions/[id] - Update transaction (used for cancel)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if transaction exists
        const existing = await prisma.transaction.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Build update data
        const updateData: any = {};

        // Handle cancel action
        if (body.status === 'cancelled') {
            if (existing.status === 'cancelled') {
                return NextResponse.json({ error: 'Transaction is already cancelled' }, { status: 400 });
            }
            updateData.status = 'cancelled';
            updateData.cancelledAt = new Date();
            updateData.cancelReason = body.cancelReason || 'No reason provided';
        }

        // Allow other field updates if provided
        if (body.description !== undefined) updateData.description = body.description;
        if (body.reference !== undefined) updateData.reference = body.reference;

        const transaction = await prisma.transaction.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ data: transaction });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}

// PUT /api/transactions/[id] - Full update
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const transaction = await prisma.transaction.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ data: transaction });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}

// DELETE /api/transactions/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await prisma.transaction.delete({ where: { id } });

        return NextResponse.json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}

