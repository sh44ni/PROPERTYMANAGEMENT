import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import type { Customer, CreateCustomerInput } from '@/types';

// GET /api/customers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        // TODO: Replace with Prisma query
        // const customers = await prisma.customer.findMany({
        //     where: search ? {
        //         OR: [
        //             { name: { contains: search, mode: 'insensitive' } },
        //             { phone: { contains: search } },
        //             { email: { contains: search, mode: 'insensitive' } },
        //         ]
        //     } : undefined,
        //     orderBy: { createdAt: 'desc' }
        // });

        console.log('Search:', search);
        const customers: Customer[] = [];

        return NextResponse.json({ data: customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

// POST /api/customers
export async function POST(request: NextRequest) {
    try {
        const body: CreateCustomerInput = await request.json();

        if (!body.name || !body.phone) {
            return NextResponse.json(
                { error: 'Name and phone are required' },
                { status: 400 }
            );
        }

        // TODO: Replace with Prisma create
        const customer: Customer = {
            id: `cust_${Date.now()}`,
            name: body.name,
            email: body.email || null,
            phone: body.phone,
            nationality: body.nationality || null,
            address: body.address || null,
            idType1: body.idType1 || null,
            idNumber1: body.idNumber1 || null,
            idImage1: body.idImage1 || null,
            idType2: body.idType2 || null,
            idNumber2: body.idNumber2 || null,
            idImage2: body.idImage2 || null,
            notes: body.notes || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ data: customer }, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
