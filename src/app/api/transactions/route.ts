import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import type { Transaction, CreateTransactionInput } from '@/types';

// Helper to generate transaction number
function generateTransactionNo(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN-${year}-${random}`;
}

// GET /api/transactions
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category'); // income, expense
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const customerId = searchParams.get('customerId');
        const propertyId = searchParams.get('propertyId');

        // TODO: Replace with Prisma query
        // const transactions = await prisma.transaction.findMany({
        //     where: {
        //         ...(category && { category }),
        //         ...(customerId && { customerId }),
        //         ...(propertyId && { propertyId }),
        //         ...(startDate && endDate && {
        //             date: {
        //                 gte: new Date(startDate),
        //                 lte: new Date(endDate),
        //             }
        //         }),
        //     },
        //     orderBy: { date: 'desc' },
        //     include: { customer: true, property: true, rental: true }
        // });

        console.log('Query:', { category, startDate, endDate, customerId, propertyId });
        const transactions: Transaction[] = [];

        return NextResponse.json({ data: transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

// POST /api/transactions
export async function POST(request: NextRequest) {
    try {
        const body: CreateTransactionInput = await request.json();

        if (!body.category || !body.type || !body.amount || !body.paidBy || !body.paymentMethod) {
            return NextResponse.json(
                { error: 'Category, type, amount, paidBy, and paymentMethod are required' },
                { status: 400 }
            );
        }

        // TODO: Replace with Prisma create
        // If this is a rent_payment, also update the rental's paidUntil date
        const transaction: Transaction = {
            id: `txn_${Date.now()}`,
            transactionNo: generateTransactionNo(),
            category: body.category,
            type: body.type,
            amount: body.amount,
            paidBy: body.paidBy,
            customerId: body.customerId || null,
            propertyId: body.propertyId || null,
            rentalId: body.rentalId || null,
            paymentMethod: body.paymentMethod,
            reference: body.reference || null,
            description: body.description || null,
            receiptImage: body.receiptImage || null,
            date: body.date || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ data: transaction }, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
