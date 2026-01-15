import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, generateLatePaymentEmail } from '@/lib/email';

// POST /api/send-payment-reminder - Send late payment reminder email manually
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { rentalId } = body;

        if (!rentalId) {
            return NextResponse.json({ error: 'Rental ID is required' }, { status: 400 });
        }

        // Fetch rental with property and customer
        const rental = await prisma.rental.findUnique({
            where: { id: rentalId },
            include: {
                property: {
                    select: { id: true, title: true, location: true }
                },
                customer: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            }
        });

        if (!rental) {
            return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
        }

        if (!rental.customer.email) {
            return NextResponse.json({ error: 'Tenant has no email address' }, { status: 400 });
        }

        // Calculate days overdue
        const paidUntilDate = rental.paidUntil || rental.startDate;
        const today = new Date();
        const diffTime = today.getTime() - new Date(paidUntilDate).getTime();
        const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        // Format due date
        const dueDate = new Date(paidUntilDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

        // Generate email HTML
        const emailHtml = generateLatePaymentEmail({
            tenantName: rental.customer.name,
            propertyName: rental.property.title,
            amountDue: rental.monthlyRent,
            daysOverdue,
            dueDate,
        });

        // Send email
        const result = await sendEmail({
            to: rental.customer.email,
            subject: `Payment Reminder - ${rental.property.title}`,
            html: emailHtml,
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Payment reminder sent to ${rental.customer.email}`,
                emailId: result.id,
            });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Error sending payment reminder:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send reminder' },
            { status: 500 }
        );
    }
}
