import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all tax invoices
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const transactionId = searchParams.get('transactionId');

        if (transactionId) {
            const taxInvoice = await prisma.taxInvoice.findUnique({
                where: { transactionId },
            });
            return NextResponse.json({ data: taxInvoice });
        }

        const taxInvoices = await prisma.taxInvoice.findMany({
            include: {
                transaction: {
                    include: {
                        customer: true,
                        owner: true,
                        property: {
                            include: {
                                project: true
                            }
                        },
                        rental: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        
        return NextResponse.json({ data: taxInvoices });
    } catch (error: any) {
        console.error("Error fetching tax invoices:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch tax invoices" },
            { status: 500 }
        );
    }
}

// Generate new Tax Invoice Number
async function generateTaxInvoiceNo() {
    const lastInvoice = await prisma.taxInvoice.findFirst({
        orderBy: {
            taxInvoiceNo: 'desc'
        }
    });

    if (!lastInvoice) {
        return 'TAX00001';
    }

    const lastNumber = parseInt(lastInvoice.taxInvoiceNo.replace('TAX', ''));
    const nextNumber = lastNumber + 1;
    return `TAX${nextNumber.toString().padStart(5, '0')}`;
}

// POST create a new tax invoice
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            transactionId, 
            ownerTaxNumber, 
            tenantTaxNumber, 
            paymentMethod, 
            baseAmount, 
            discount, 
            taxRate, 
            date 
        } = body;

        if (!transactionId || baseAmount === undefined || discount === undefined || taxRate === undefined) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if transaction exists
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) {
            return NextResponse.json(
                { error: "Original transaction not found" },
                { status: 404 }
            );
        }

        // Check if tax invoice already exists for this transaction
        const existingInvoice = await prisma.taxInvoice.findUnique({
            where: { transactionId }
        });

        if (existingInvoice) {
            return NextResponse.json(
                { error: "A tax invoice already exists for this transaction" },
                { status: 400 }
            );
        }

        // Auto calculate values
        const netBeforeTax = baseAmount - discount;
        const vatAmount = netBeforeTax * (taxRate / 100);
        const netAfterTax = netBeforeTax + vatAmount;

        const taxInvoiceNo = await generateTaxInvoiceNo();

        const taxInvoice = await prisma.taxInvoice.create({
            data: {
                taxInvoiceNo,
                transactionId,
                ownerTaxNumber,
                tenantTaxNumber,
                paymentMethod,
                baseAmount,
                discount,
                netBeforeTax,
                taxRate,
                vatAmount,
                netAfterTax,
                date: date ? new Date(date) : undefined
            },
            include: {
                transaction: true
            }
        });

        return NextResponse.json(
            { message: "Tax invoice created successfully", data: taxInvoice },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Error creating tax invoice:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create tax invoice" },
            { status: 500 }
        );
    }
}
