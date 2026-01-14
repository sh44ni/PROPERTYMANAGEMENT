import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import type { RentalContract, SaleContract, CreateRentalContractInput, CreateSaleContractInput } from '@/types';

// Helper to generate contract number
function generateContractNo(type: 'rental' | 'sale'): string {
    const prefix = type === 'rental' ? 'RC' : 'SC';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${random}`;
}

// GET /api/contracts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // rental, sale, or null for all

        // TODO: Replace with Prisma queries
        // const rentalContracts = type !== 'sale' ? await prisma.rentalContract.findMany({
        //     orderBy: { createdAt: 'desc' },
        //     include: { tenant: true }
        // }) : [];
        // const saleContracts = type !== 'rental' ? await prisma.saleContract.findMany({
        //     orderBy: { createdAt: 'desc' },
        //     include: { buyer: true }
        // }) : [];

        console.log('Type filter:', type);
        const rentalContracts: RentalContract[] = [];
        const saleContracts: SaleContract[] = [];

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

// POST /api/contracts
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const contractType = body.contractType as 'rental' | 'sale';

        if (contractType === 'rental') {
            const input: CreateRentalContractInput = body;

            if (!input.tenantName || !input.tenantIdPassport || !input.tenantPhone ||
                !input.validFrom || !input.validTo || !input.monthlyRent) {
                return NextResponse.json(
                    { error: 'Tenant details, dates, and rent are required' },
                    { status: 400 }
                );
            }

            const contract: RentalContract = {
                id: `rc_${Date.now()}`,
                contractNumber: generateContractNo('rental'),
                status: 'signed',
                landlordName: input.landlordName,
                landlordCR: input.landlordCR || null,
                landlordPOBox: input.landlordPOBox || null,
                landlordPostalCode: input.landlordPostalCode || null,
                landlordAddress: input.landlordAddress || null,
                tenantId: input.tenantId || null,
                tenantName: input.tenantName,
                tenantIdPassport: input.tenantIdPassport,
                tenantLabourCard: input.tenantLabourCard || null,
                tenantPhone: input.tenantPhone,
                tenantEmail: input.tenantEmail || null,
                tenantSponsor: input.tenantSponsor || null,
                tenantCR: input.tenantCR || null,
                validFrom: input.validFrom,
                validTo: input.validTo,
                agreementPeriod: input.agreementPeriod || null,
                monthlyRent: input.monthlyRent,
                paymentFrequency: input.paymentFrequency || 'monthly',
                landlordSignature: null,
                landlordSignDate: null,
                tenantSignature: null,
                tenantSignDate: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            return NextResponse.json({ data: contract, type: 'rental' }, { status: 201 });
        } else if (contractType === 'sale') {
            const input: CreateSaleContractInput = body;

            if (!input.buyerName || !input.propertyWilaya || !input.totalPrice) {
                return NextResponse.json(
                    { error: 'Buyer name, property location, and total price are required' },
                    { status: 400 }
                );
            }

            const contract: SaleContract = {
                id: `sc_${Date.now()}`,
                contractNumber: generateContractNo('sale'),
                status: 'signed',
                sellerNationalId: input.sellerNationalId || null,
                sellerName: input.sellerName,
                sellerCR: input.sellerCR || null,
                sellerNationality: input.sellerNationality || null,
                sellerAddress: input.sellerAddress || null,
                sellerPhone: input.sellerPhone || null,
                buyerId: input.buyerId || null,
                buyerNationalId: input.buyerNationalId || null,
                buyerName: input.buyerName,
                buyerCR: input.buyerCR || null,
                buyerNationality: input.buyerNationality || null,
                buyerAddress: input.buyerAddress || null,
                buyerPhone: input.buyerPhone || null,
                propertyWilaya: input.propertyWilaya,
                propertyGovernorate: input.propertyGovernorate || null,
                propertyPhase: input.propertyPhase || null,
                propertyLandNumber: input.propertyLandNumber || null,
                propertyArea: input.propertyArea || null,
                totalPrice: input.totalPrice,
                totalPriceWords: input.totalPriceWords || null,
                depositAmount: input.depositAmount || 0,
                depositAmountWords: input.depositAmountWords || null,
                depositDate: input.depositDate || null,
                remainingAmount: input.remainingAmount || 0,
                remainingAmountWords: input.remainingAmountWords || null,
                remainingDueDate: input.remainingDueDate || null,
                finalPaymentAmount: input.finalPaymentAmount || 0,
                finalPaymentWords: input.finalPaymentWords || null,
                constructionStartDate: input.constructionStartDate || null,
                constructionEndDate: input.constructionEndDate || null,
                notes: input.notes || null,
                sellerSignature: null,
                buyerSignature: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            return NextResponse.json({ data: contract, type: 'sale' }, { status: 201 });
        }

        return NextResponse.json({ error: 'Invalid contract type' }, { status: 400 });
    } catch (error) {
        console.error('Error creating contract:', error);
        return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
    }
}
