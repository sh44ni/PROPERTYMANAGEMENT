import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedJson, json, errorJson } from '@/lib/api-cache';

/**
 * GET /api/customers
 *
 * Lists customers with their stats (`currentRentals`, `totalPayments`).
 * Previously this loaded every rental + every transaction per customer just
 * to count/sum them in JS. Now we run two lightweight `groupBy` queries in
 * parallel so the DB returns just the numbers we need.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const [customers, activeRentalsByCustomer, paymentsByCustomer] = await Promise.all([
            prisma.customer.findMany({
                where: search
                    ? {
                          OR: [
                              { name: { contains: search, mode: 'insensitive' } },
                              { phone: { contains: search } },
                              { email: { contains: search, mode: 'insensitive' } },
                              { idNumber1: { contains: search } },
                          ],
                      }
                    : undefined,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    nationality: true,
                    address: true,
                    idType1: true,
                    idNumber1: true,
                    idImage1: true,
                    idType2: true,
                    idNumber2: true,
                    idImage2: true,
                    notes: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.rental.groupBy({
                by: ['customerId'],
                where: { status: 'active' },
                _count: { _all: true },
            }),
            prisma.transaction.groupBy({
                by: ['customerId'],
                where: {
                    status: { not: 'cancelled' },
                    customerId: { not: null },
                },
                _sum: { amount: true },
            }),
        ]);

        const rentalsMap = new Map<string, number>();
        for (const row of activeRentalsByCustomer) {
            if (row.customerId) rentalsMap.set(row.customerId, row._count._all);
        }
        const paymentsMap = new Map<string, number>();
        for (const row of paymentsByCustomer) {
            if (row.customerId) paymentsMap.set(row.customerId, row._sum.amount ?? 0);
        }

        const customersWithStats = customers.map((c) => ({
            ...c,
            currentRentals: rentalsMap.get(c.id) ?? 0,
            totalPayments: paymentsMap.get(c.id) ?? 0,
        }));

        return cachedJson({ data: customersWithStats }, { cdn: 20, swr: 60 });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return errorJson('Failed to fetch customers');
    }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || !body.phone) {
            return errorJson('Name and phone are required', 400);
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
            },
        });

        return json({ data: customer }, 201);
    } catch (error) {
        console.error('Error creating customer:', error);
        return errorJson('Failed to create customer');
    }
}

// PUT /api/customers - Update a customer
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) return errorJson('Customer ID is required', 400);

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
            },
        });

        return json({ data: customer });
    } catch (error) {
        console.error('Error updating customer:', error);
        return errorJson('Failed to update customer');
    }
}

// DELETE /api/customers - Delete a customer
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return errorJson('Customer ID is required', 400);

        const activeRentals = await prisma.rental.count({
            where: { customerId: id, status: 'active' },
        });

        if (activeRentals > 0) {
            return errorJson('Cannot delete customer with active rentals', 400);
        }

        await prisma.customer.delete({ where: { id } });

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return errorJson('Failed to delete customer');
    }
}
