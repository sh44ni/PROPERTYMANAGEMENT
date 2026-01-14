import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import type { Rental, CreateRentalInput } from '@/types';

// GET /api/rentals
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const customerId = searchParams.get('customerId');
        const status = searchParams.get('status');

        // TODO: Replace with Prisma query
        // const rentals = await prisma.rental.findMany({
        //     where: {
        //         ...(propertyId && { propertyId }),
        //         ...(customerId && { customerId }),
        //         ...(status && { status }),
        //     },
        //     orderBy: { createdAt: 'desc' },
        //     include: { property: true, customer: true }
        // });

        console.log('Query:', { propertyId, customerId, status });
        const rentals: Rental[] = [];

        return NextResponse.json({ data: rentals });
    } catch (error) {
        console.error('Error fetching rentals:', error);
        return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 });
    }
}

// POST /api/rentals
export async function POST(request: NextRequest) {
    try {
        const body: CreateRentalInput = await request.json();

        if (!body.propertyId || !body.customerId || !body.startDate || !body.endDate || !body.monthlyRent) {
            return NextResponse.json(
                { error: 'Property, customer, dates, and monthly rent are required' },
                { status: 400 }
            );
        }

        // TODO: Replace with Prisma create
        // Also update property status to 'rented'
        const rental: Rental = {
            id: `rental_${Date.now()}`,
            propertyId: body.propertyId,
            customerId: body.customerId,
            startDate: body.startDate,
            endDate: body.endDate,
            monthlyRent: body.monthlyRent,
            depositAmount: body.depositAmount || 0,
            paymentDay: body.paymentDay || 1,
            status: 'active',
            paidUntil: null,
            paymentStatus: 'paid',
            notes: body.notes || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ data: rental }, { status: 201 });
    } catch (error) {
        console.error('Error creating rental:', error);
        return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 });
    }
}
