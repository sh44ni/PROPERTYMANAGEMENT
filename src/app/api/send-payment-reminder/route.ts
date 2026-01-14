import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generateLatePaymentEmail } from "@/lib/email";

// Mock data - in production this would come from database
const getMockRentalById = (id: string) => {
    const mockRentals = [
        {
            id: 'rental-1',
            tenant: { name: 'Fatima Al-Harthi', email: 'fatima.harthi@email.com' },
            property: { name: 'Apartment 101 - Al Khuwair' },
            monthlyRent: 320,
            paidUntil: '2024-12-01',
        },
        {
            id: 'rental-2',
            tenant: { name: 'Mohammed Al-Lawati', email: 'mohammed.lawati@email.com' },
            property: { name: 'Apartment 202 - Qurum' },
            monthlyRent: 450,
            paidUntil: '2024-11-15',
        },
    ];
    return mockRentals.find(r => r.id === id);
};

// POST /api/send-payment-reminder - Send late payment reminder email
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { rentalId, tenantEmail, tenantName, propertyName, monthlyRent, paidUntil } = body;

        // If full data is provided, use it directly (for mock frontend)
        let rental;
        if (tenantEmail && tenantName && propertyName && monthlyRent && paidUntil) {
            rental = {
                id: rentalId,
                tenant: { name: tenantName, email: tenantEmail },
                property: { name: propertyName },
                monthlyRent: parseFloat(monthlyRent),
                paidUntil,
            };
        } else if (rentalId) {
            // Otherwise look up by ID
            rental = getMockRentalById(rentalId);
        }

        if (!rental) {
            return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        }

        if (!rental.tenant.email) {
            return NextResponse.json({ error: "Tenant has no email address" }, { status: 400 });
        }

        // Calculate days overdue
        const paidUntilDate = new Date(rental.paidUntil);
        const today = new Date();
        const diffTime = today.getTime() - paidUntilDate.getTime();
        const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        // Format due date
        const dueDate = paidUntilDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        // Generate email HTML
        const emailHtml = generateLatePaymentEmail({
            tenantName: rental.tenant.name,
            propertyName: rental.property.name,
            amountDue: rental.monthlyRent,
            daysOverdue,
            dueDate,
        });

        // Send email
        const result = await sendEmail({
            to: rental.tenant.email,
            subject: `Payment Reminder - ${rental.property.name}`,
            html: emailHtml,
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Payment reminder sent to ${rental.tenant.email}`,
                emailId: result.id,
            });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error("Error sending payment reminder:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send reminder" },
            { status: 500 }
        );
    }
}
