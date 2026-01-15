import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RentalContract, SaleContract } from '@prisma/client';

// Helper to generate sequential contract number
async function generateContractNo(type: 'rental' | 'sale'): Promise<string> {
    const prefix = type === 'rental' ? 'RNT' : 'SLE';
    const year = new Date().getFullYear();

    const tableName = type === 'rental' ? 'rentalContract' : 'saleContract';
    // @ts-expect-error - dynamic table access
    const lastContract = await prisma[tableName].findFirst({
        where: {
            contractNumber: { startsWith: `${prefix}-${year}` }
        },
        orderBy: { createdAt: 'desc' }
    });

    let seq = 1;
    if (lastContract) {
        const parts = lastContract.contractNumber.split('-');
        seq = parseInt(parts[2] || '0') + 1;
    }

    return `${prefix}-${year}-${seq.toString().padStart(4, '0')}`;
}

// GET /api/contracts - Get all contracts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // rental, sale, or null for all

        let rentalContracts: RentalContract[] = [];
        let saleContracts: SaleContract[] = [];

        if (type !== 'sale') {
            rentalContracts = await prisma.rentalContract.findMany({
                orderBy: { createdAt: 'desc' },
                include: { tenant: { select: { id: true, name: true, email: true, phone: true } } }
            });
        }

        if (type !== 'rental') {
            saleContracts = await prisma.saleContract.findMany({
                orderBy: { createdAt: 'desc' },
                include: { buyer: { select: { id: true, name: true, email: true, phone: true } } }
            });
        }

        return NextResponse.json({
            data: {
                rental: rentalContracts,
                sale: saleContracts,
            }
        });
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }
}

// POST /api/contracts - Create a new contract
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const contractType = body.contractType as 'rental' | 'sale';

        if (contractType === 'rental') {
            if (!body.tenantName || !body.tenantIdPassport || !body.tenantPhone ||
                !body.validFrom || !body.validTo || !body.monthlyRent) {
                return NextResponse.json(
                    { error: 'Tenant details, dates, and rent are required' },
                    { status: 400 }
                );
            }

            const contractNumber = await generateContractNo('rental');

            const contract = await prisma.rentalContract.create({
                data: {
                    contractNumber,
                    status: body.status || 'signed',
                    landlordName: body.landlordName,
                    landlordCR: body.landlordCR || null,
                    landlordPOBox: body.landlordPOBox || null,
                    landlordPostalCode: body.landlordPostalCode || null,
                    landlordAddress: body.landlordAddress || null,
                    tenantId: body.tenantId || null,
                    tenantName: body.tenantName,
                    tenantIdPassport: body.tenantIdPassport,
                    tenantLabourCard: body.tenantLabourCard || null,
                    tenantPhone: body.tenantPhone,
                    tenantEmail: body.tenantEmail || null,
                    tenantSponsor: body.tenantSponsor || null,
                    tenantCR: body.tenantCR || null,
                    validFrom: new Date(body.validFrom),
                    validTo: new Date(body.validTo),
                    agreementPeriod: body.agreementPeriod || null,
                    monthlyRent: parseFloat(body.monthlyRent),
                    paymentFrequency: body.paymentFrequency || 'monthly',
                    landlordSignature: body.landlordSignature || null,
                    landlordSignDate: body.landlordSignDate ? new Date(body.landlordSignDate) : null,
                    tenantSignature: body.tenantSignature || null,
                    tenantSignDate: body.tenantSignDate ? new Date(body.tenantSignDate) : null,
                },
                include: { tenant: { select: { id: true, name: true } } }
            });

            return NextResponse.json({ data: contract, type: 'rental' }, { status: 201 });

        } else if (contractType === 'sale') {
            if (!body.buyerName || !body.propertyWilaya || !body.totalPrice) {
                return NextResponse.json(
                    { error: 'Buyer name, property location, and total price are required' },
                    { status: 400 }
                );
            }

            const contractNumber = await generateContractNo('sale');

            const contract = await prisma.saleContract.create({
                data: {
                    contractNumber,
                    status: body.status || 'signed',
                    sellerNationalId: body.sellerNationalId || null,
                    sellerName: body.sellerName,
                    sellerCR: body.sellerCR || null,
                    sellerNationality: body.sellerNationality || null,
                    sellerAddress: body.sellerAddress || null,
                    sellerPhone: body.sellerPhone || null,
                    buyerId: body.buyerId || null,
                    buyerNationalId: body.buyerNationalId || null,
                    buyerName: body.buyerName,
                    buyerCR: body.buyerCR || null,
                    buyerNationality: body.buyerNationality || null,
                    buyerAddress: body.buyerAddress || null,
                    buyerPhone: body.buyerPhone || null,
                    propertyWilaya: body.propertyWilaya,
                    propertyGovernorate: body.propertyGovernorate || null,
                    propertyPhase: body.propertyPhase || null,
                    propertyLandNumber: body.propertyLandNumber || null,
                    propertyArea: body.propertyArea || null,
                    totalPrice: parseFloat(body.totalPrice),
                    totalPriceWords: body.totalPriceWords || null,
                    depositAmount: body.depositAmount ? parseFloat(body.depositAmount) : 0,
                    depositAmountWords: body.depositAmountWords || null,
                    depositDate: body.depositDate ? new Date(body.depositDate) : null,
                    remainingAmount: body.remainingAmount ? parseFloat(body.remainingAmount) : 0,
                    remainingAmountWords: body.remainingAmountWords || null,
                    remainingDueDate: body.remainingDueDate ? new Date(body.remainingDueDate) : null,
                    finalPaymentAmount: body.finalPaymentAmount ? parseFloat(body.finalPaymentAmount) : 0,
                    finalPaymentWords: body.finalPaymentWords || null,
                    constructionStartDate: body.constructionStartDate ? new Date(body.constructionStartDate) : null,
                    constructionEndDate: body.constructionEndDate ? new Date(body.constructionEndDate) : null,
                    notes: body.notes || null,
                    sellerSignature: body.sellerSignature || null,
                    buyerSignature: body.buyerSignature || null,
                },
                include: { buyer: { select: { id: true, name: true } } }
            });

            return NextResponse.json({ data: contract, type: 'sale' }, { status: 201 });
        }

        return NextResponse.json({ error: 'Invalid contract type' }, { status: 400 });
    } catch (error) {
        console.error('Error creating contract:', error);
        return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
    }
}

// DELETE /api/contracts - Delete a contract
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type') as 'rental' | 'sale';

        if (!id || !type) {
            return NextResponse.json(
                { error: 'Contract ID and type are required' },
                { status: 400 }
            );
        }

        if (type === 'rental') {
            await prisma.rentalContract.delete({ where: { id } });
        } else {
            await prisma.saleContract.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contract:', error);
        return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
    }
}
