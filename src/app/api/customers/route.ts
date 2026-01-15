import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/customers - Get all customers with optional search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const customers = await prisma.customer.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { idNumber1: { contains: search } },
                ]
            } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                rentals: {
                    select: {
                        id: true,
                        status: true,
                        monthlyRent: true,
                    }
                },
                transactions: {
                    select: {
                        id: true,
                        amount: true,
                        type: true,
                    }
                },
                _count: {
                    select: {
                        rentals: true,
                        transactions: true,
                    }
                }
            }
        });

        // Transform to include summary counts
        const customersWithStats = customers.map(customer => ({
            ...customer,
            currentRentals: customer.rentals?.filter(r => r.status === 'active').length || 0,
            totalPayments: customer.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0,
        }));

        return NextResponse.json({ data: customersWithStats });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || !body.phone) {
            return NextResponse.json(
                { error: 'Name and phone are required' },
                { status: 400 }
            );
        }

        const customer = await prisma.customer.create({
            data: {
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
            }
        });

        return NextResponse.json({ data: customer }, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}

// PUT /api/customers - Update a customer
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            );
        }

        const customer = await prisma.customer.update({
            where: { id: body.id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.email !== undefined && { email: body.email }),
                ...(body.phone && { phone: body.phone }),
                ...(body.nationality !== undefined && { nationality: body.nationality }),
                ...(body.address !== undefined && { address: body.address }),
                ...(body.idType1 !== undefined && { idType1: body.idType1 }),
                ...(body.idNumber1 !== undefined && { idNumber1: body.idNumber1 }),
                ...(body.idImage1 !== undefined && { idImage1: body.idImage1 }),
                ...(body.idType2 !== undefined && { idType2: body.idType2 }),
                ...(body.idNumber2 !== undefined && { idNumber2: body.idNumber2 }),
                ...(body.idImage2 !== undefined && { idImage2: body.idImage2 }),
                ...(body.notes !== undefined && { notes: body.notes }),
            }
        });

        return NextResponse.json({ data: customer });
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}

// DELETE /api/customers - Delete a customer
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            );
        }

        // Check if customer has active rentals
        const activeRentals = await prisma.rental.count({
            where: {
                customerId: id,
                status: 'active'
            }
        });

        if (activeRentals > 0) {
            return NextResponse.json(
                { error: 'Cannot delete customer with active rentals' },
                { status: 400 }
            );
        }

        await prisma.customer.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
