import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedJson, errorJson } from '@/lib/api-cache';

// Helper: Calculate payment status based on paidUntil date
function calculatePaymentStatus(paidUntil: Date | null): string {
    if (!paidUntil) return 'unpaid';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paidDate = new Date(paidUntil);
    paidDate.setHours(0, 0, 0, 0);

    if (paidDate >= today) return 'paid';
    return 'overdue';
}

// GET /api/rentals - Get all rentals
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const customerId = searchParams.get('customerId');
        const status = searchParams.get('status');
        const paymentStatus = searchParams.get('paymentStatus');

        const rentals = await prisma.rental.findMany({
            where: {
                ...(propertyId && { propertyId }),
                ...(customerId && { customerId }),
                ...(status && { status }),
                ...(paymentStatus && { paymentStatus }),
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                propertyId: true,
                customerId: true,
                startDate: true,
                endDate: true,
                monthlyRent: true,
                depositAmount: true,
                paymentDay: true,
                status: true,
                paidUntil: true,
                paymentStatus: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                property: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        area: true,
                        location: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        // Recalculate payment status dynamically for active rentals.
        const rentalsWithStatus = rentals.map((rental) => ({
            ...rental,
            paymentStatus:
                rental.status === 'active'
                    ? calculatePaymentStatus(rental.paidUntil)
                    : rental.paymentStatus,
        }));

        return cachedJson({ data: rentalsWithStatus }, { cdn: 15, swr: 60 });
    } catch (error) {
        console.error('Error fetching rentals:', error);
        return errorJson('Failed to fetch rentals');
    }
}

// POST /api/rentals - Create a new rental
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.propertyId || !body.customerId || !body.startDate || !body.endDate || !body.monthlyRent) {
            return NextResponse.json(
                { error: 'Property, customer, dates, and monthly rent are required' },
                { status: 400 }
            );
        }

        // Check if property is already rented
        const existingActiveRental = await prisma.rental.findFirst({
            where: {
                propertyId: body.propertyId,
                status: 'active'
            }
        });

        if (existingActiveRental) {
            return NextResponse.json(
                { error: 'This property already has an active rental' },
                { status: 400 }
            );
        }

        // Create rental in a transaction
        const [rental] = await prisma.$transaction([
            prisma.rental.create({
                data: {
                    propertyId: body.propertyId,
                    customerId: body.customerId,
                    startDate: new Date(body.startDate),
                    endDate: new Date(body.endDate),
                    monthlyRent: parseFloat(body.monthlyRent),
                    depositAmount: body.depositAmount ? parseFloat(body.depositAmount) : 0,
                    paymentDay: body.paymentDay || 1,
                    status: 'active',
                    paidUntil: body.paidUntil ? new Date(body.paidUntil) : null,
                    paymentStatus: body.paidUntil ? 'paid' : 'unpaid',
                    notes: body.notes || null,
                },
                include: {
                    property: { select: { id: true, title: true } },
                    customer: { select: { id: true, name: true, email: true, phone: true } }
                }
            }),
            // Update property status to rented
            prisma.property.update({
                where: { id: body.propertyId },
                data: { status: 'rented' }
            })
        ]);

        return NextResponse.json({ data: rental }, { status: 201 });
    } catch (error) {
        console.error('Error creating rental:', error);
        return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 });
    }
}

// PUT /api/rentals - Update a rental
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: 'Rental ID is required' },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {};

        if (body.endDate) updateData.endDate = new Date(body.endDate);
        if (body.monthlyRent !== undefined) updateData.monthlyRent = parseFloat(body.monthlyRent);
        if (body.depositAmount !== undefined) updateData.depositAmount = parseFloat(body.depositAmount);
        if (body.paymentDay !== undefined) updateData.paymentDay = parseInt(body.paymentDay);
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.paidUntil !== undefined) {
            updateData.paidUntil = body.paidUntil ? new Date(body.paidUntil) : null;
            updateData.paymentStatus = body.paidUntil ? calculatePaymentStatus(new Date(body.paidUntil)) : 'unpaid';
        }

        // Handle status changes
        if (body.status && body.status !== 'active') {
            updateData.status = body.status;

            // Get rental to find property
            const rental = await prisma.rental.findUnique({
                where: { id: body.id },
                select: { propertyId: true }
            });

            if (rental) {
                // Set property back to available when rental ends
                await prisma.property.update({
                    where: { id: rental.propertyId },
                    data: { status: 'available' }
                });
            }
        }

        const rental = await prisma.rental.update({
            where: { id: body.id },
            data: updateData,
            include: {
                property: { select: { id: true, title: true } },
                customer: { select: { id: true, name: true, email: true, phone: true } }
            }
        });

        return NextResponse.json({ data: rental });
    } catch (error) {
        console.error('Error updating rental:', error);
        return NextResponse.json({ error: 'Failed to update rental' }, { status: 500 });
    }
}

// DELETE /api/rentals - Delete a rental
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Rental ID is required' },
                { status: 400 }
            );
        }

        // Get rental to find property
        const rental = await prisma.rental.findUnique({
            where: { id },
            select: { propertyId: true, status: true }
        });

        if (!rental) {
            return NextResponse.json(
                { error: 'Rental not found' },
                { status: 404 }
            );
        }

        // Delete rental and update property status if it was active
        await prisma.$transaction([
            prisma.rental.delete({ where: { id } }),
            ...(rental.status === 'active' ? [
                prisma.property.update({
                    where: { id: rental.propertyId },
                    data: { status: 'available' }
                })
            ] : [])
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting rental:', error);
        return NextResponse.json({ error: 'Failed to delete rental' }, { status: 500 });
    }
}
