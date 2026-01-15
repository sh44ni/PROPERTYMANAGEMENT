import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, generateLatePaymentEmail } from '@/lib/email';

// GET /api/cron/check-overdue - Check for overdue rentals and send notifications
// This endpoint should be called by a cron job daily (e.g., at 9 AM)
// Protect with a secret token in production
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (optional but recommended for production)
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && secret !== cronSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all active rentals that are overdue (paidUntil < today)
        const overdueRentals = await prisma.rental.findMany({
            where: {
                status: 'active',
                paidUntil: {
                    lt: today
                }
            },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });

        const results = {
            checked: overdueRentals.length,
            emailsSent: 0,
            emailsFailed: 0,
            updated: 0,
            details: [] as { rentalId: string; customerName: string; status: string; error?: string }[]
        };

        for (const rental of overdueRentals) {
            // Update payment status to overdue if not already
            if (rental.paymentStatus !== 'overdue') {
                await prisma.rental.update({
                    where: { id: rental.id },
                    data: { paymentStatus: 'overdue' }
                });
                results.updated++;
            }

            // Send email notification if customer has email
            if (rental.customer.email) {
                const paidUntilDate = rental.paidUntil || new Date();
                const diffTime = today.getTime() - new Date(paidUntilDate).getTime();
                const daysOverdue = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

                const dueDate = new Date(paidUntilDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                });

                const emailHtml = generateLatePaymentEmail({
                    tenantName: rental.customer.name,
                    propertyName: rental.property.title,
                    amountDue: rental.monthlyRent,
                    daysOverdue,
                    dueDate,
                });

                const result = await sendEmail({
                    to: rental.customer.email,
                    subject: `Payment Reminder - ${rental.property.title}`,
                    html: emailHtml,
                });

                if (result.success) {
                    results.emailsSent++;
                    results.details.push({
                        rentalId: rental.id,
                        customerName: rental.customer.name,
                        status: 'sent',
                    });
                } else {
                    results.emailsFailed++;
                    results.details.push({
                        rentalId: rental.id,
                        customerName: rental.customer.name,
                        status: 'failed',
                        error: result.error,
                    });
                }
            } else {
                results.details.push({
                    rentalId: rental.id,
                    customerName: rental.customer.name,
                    status: 'skipped',
                    error: 'No email address',
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Checked ${results.checked} overdue rentals`,
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error in overdue check cron:', error);
        return NextResponse.json(
            { error: 'Failed to process overdue check' },
            { status: 500 }
        );
    }
}
