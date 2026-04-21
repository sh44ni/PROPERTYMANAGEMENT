import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedJson, errorJson } from '@/lib/api-cache';

// Helper to generate sequential transaction number
async function generateTransactionNo(): Promise<string> {
    const year = new Date().getFullYear();
    const lastTransaction = await prisma.transaction.findFirst({
        where: {
            transactionNo: { startsWith: `TXN-${year}` }
        },
        orderBy: { createdAt: 'desc' }
    });

    let seq = 1;
    if (lastTransaction) {
        const parts = lastTransaction.transactionNo.split('-');
        seq = parseInt(parts[2] || '0') + 1;
    }

    return `TXN-${year}-${seq.toString().padStart(5, '0')}`;
}

// Helper to generate sequential Owner Payment voucher
async function generateOwnerPaymentNo(): Promise<string> {
    const lastPayment = await prisma.transaction.findFirst({
        where: {
            transactionNo: { startsWith: 'CP' }
        },
        orderBy: { createdAt: 'desc' }
    });

    let seq = 1;
    if (lastPayment && lastPayment.transactionNo.length === 7) {
        seq = parseInt(lastPayment.transactionNo.substring(2)) + 1;
    }

    return `CP${seq.toString().padStart(5, '0')}`;
}

// GET /api/transactions - Get all transactions with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category'); // income, expense
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const customerId = searchParams.get('customerId');
        const propertyId = searchParams.get('propertyId');
        const rentalId = searchParams.get('rentalId');
        const type = searchParams.get('type');
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 0, 1000) : undefined;

        const transactions = await prisma.transaction.findMany({
            where: {
                ...(category && { category }),
                ...(type && { type }),
                ...(customerId && { customerId }),
                ...(propertyId && { propertyId }),
                ...(rentalId && { rentalId }),
                ...(startDate && endDate && {
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                }),
            },
            orderBy: { date: 'desc' },
            ...(limit ? { take: limit } : {}),
            select: {
                id: true,
                transactionNo: true,
                category: true,
                type: true,
                amount: true,
                paidBy: true,
                customerId: true,
                propertyId: true,
                rentalId: true,
                ownerId: true,
                paymentMethod: true,
                reference: true,
                description: true,
                commissionRate: true,
                commissionAmount: true,
                netAmount: true,
                receiptImage: true,
                status: true,
                cancelledAt: true,
                cancelReason: true,
                date: true,
                createdAt: true,
                updatedAt: true,
                customer: { select: { id: true, name: true } },
                property: { select: { id: true, title: true, ownerId: true } },
                rental: { select: { id: true, monthlyRent: true } },
                owner: { select: { id: true, name: true } },
                taxInvoice: { select: { id: true, taxInvoiceNo: true } },
            },
        });

        return cachedJson({ data: transactions }, { cdn: 10, swr: 45 });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return errorJson('Failed to fetch transactions');
    }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.category || !body.type || !body.amount || !body.paidBy || !body.paymentMethod) {
            return NextResponse.json(
                { error: 'Category, type, amount, paidBy, and paymentMethod are required' },
                { status: 400 }
            );
        }

        const transactionNo = body.type === 'owner_payment' ? await generateOwnerPaymentNo() : await generateTransactionNo();
        const transactionDate = body.date ? new Date(body.date) : new Date();

        // Create the transaction
        const transaction = await prisma.transaction.create({
            data: {
                transactionNo,
                category: body.category,
                type: body.type,
                amount: parseFloat(body.amount),
                paidBy: body.paidBy,
                customerId: body.customerId || null,
                propertyId: body.propertyId || null,
                rentalId: body.rentalId || null,
                ownerId: body.ownerId || null,
                commissionRate: body.commissionRate ? parseFloat(body.commissionRate) : null,
                commissionAmount: body.commissionAmount ? parseFloat(body.commissionAmount) : null,
                netAmount: body.netAmount ? parseFloat(body.netAmount) : null,
                paymentMethod: body.paymentMethod,
                reference: body.reference || null,
                description: body.description || null,
                receiptImage: body.receiptImage || null,
                date: transactionDate,
            },
            include: {
                customer: { select: { id: true, name: true } },
                property: { select: { id: true, title: true } },
                rental: { select: { id: true, monthlyRent: true, paidUntil: true } },
                owner: { select: { id: true, name: true } }
            }
        });

        // If this is a rent payment, update the rental's paidUntil date
        if (body.type === 'rent_payment' && body.rentalId) {
            const rental = await prisma.rental.findUnique({
                where: { id: body.rentalId },
                select: { paidUntil: true, monthlyRent: true, startDate: true }
            });

            if (rental) {
                // Calculate how many months this payment covers (minimum 1 if amount >= monthlyRent)
                const paidAmount = parseFloat(body.amount);
                const monthsCovered = rental.monthlyRent > 0
                    ? Math.max(1, Math.floor(paidAmount / rental.monthlyRent))
                    : 1;

                // Start from paidUntil if it's in the future, otherwise start from today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                let baseDate: Date;
                if (rental.paidUntil && new Date(rental.paidUntil) > today) {
                    baseDate = new Date(rental.paidUntil);
                } else {
                    // Paid up from today
                    baseDate = today;
                }
                const newPaidUntil = new Date(baseDate);
                newPaidUntil.setMonth(newPaidUntil.getMonth() + monthsCovered);

                await prisma.rental.update({
                    where: { id: body.rentalId },
                    data: {
                        paidUntil: newPaidUntil,
                        paymentStatus: 'paid'
                    }
                });
            }
        }

        return NextResponse.json({ data: transaction }, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}

// PUT /api/transactions - Update a transaction
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: 'Transaction ID is required' },
                { status: 400 }
            );
        }

        const transaction = await prisma.transaction.update({
            where: { id: body.id },
            data: {
                ...(body.category && { category: body.category }),
                ...(body.type && { type: body.type }),
                ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
                ...(body.paidBy && { paidBy: body.paidBy }),
                ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
                ...(body.reference !== undefined && { reference: body.reference }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.date && { date: new Date(body.date) }),
            },
            include: {
                customer: { select: { id: true, name: true } },
                property: { select: { id: true, title: true } },
                owner: { select: { id: true, name: true } }
            }
        });

        return NextResponse.json({ data: transaction });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}

// DELETE /api/transactions - Delete a transaction
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Transaction ID is required' },
                { status: 400 }
            );
        }

        await prisma.transaction.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}
