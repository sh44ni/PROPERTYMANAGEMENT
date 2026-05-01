import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        const projectId = searchParams.get('projectId'); // filter sale contracts by project

        let rentalContracts: any[] = [];
        let saleContracts: any[] = [];

        if (type !== 'sale') {
            rentalContracts = await prisma.rentalContract.findMany({
                orderBy: { createdAt: 'desc' },
                include: { tenant: { select: { id: true, name: true, email: true, phone: true } } }
            });
        }

        if (type !== 'rental') {
            saleContracts = await prisma.saleContract.findMany({
                where: projectId ? { projectId } : undefined,
                orderBy: { createdAt: 'desc' },
                include: {
                    buyer: { select: { id: true, name: true, email: true, phone: true } },
                    project: { select: { id: true, name: true } },
                    installments: { orderBy: { order: 'asc' } },
                }
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

            // Auto-create customer if no tenantId provided
            let tenantId = body.tenantId || null;
            if (!tenantId && body.tenantName) {
                const newCustomer = await prisma.customer.create({
                    data: {
                        name: body.tenantName,
                        phone: body.tenantPhone || '',
                        email: body.tenantEmail || null,
                        idNumber1: body.tenantIdPassport || null,
                        address: body.tenantAddress || null,
                    }
                });
                tenantId = newCustomer.id;
            }

            const contract = await prisma.rentalContract.create({
                data: {
                    contractNumber,
                    status: body.status || 'signed',
                    landlordName: body.landlordName,
                    landlordCR: body.landlordCR || null,
                    landlordPOBox: body.landlordPOBox || null,
                    landlordPostalCode: body.landlordPostalCode || null,
                    landlordAddress: body.landlordAddress || null,
                    landlordPhone: body.landlordPhone || null,
                    landlordCivilId: body.landlordCivilId || null,
                    tenantId,
                    tenantName: body.tenantName,
                    tenantIdPassport: body.tenantIdPassport,
                    tenantLabourCard: body.tenantLabourCard || null,
                    tenantPhone: body.tenantPhone,
                    tenantEmail: body.tenantEmail || null,
                    tenantSponsor: body.tenantSponsor || null,
                    tenantCR: body.tenantCR || null,
                    tenantAddress: body.tenantAddress || null,
                    propertyLandNumber: body.propertyLandNumber || null,
                    propertyArea: body.propertyArea || null,
                    propertyBuiltUpArea: body.propertyBuiltUpArea || null,
                    propertyDistrictNumber: body.propertyDistrictNumber || null,
                    propertyStreetNumber: body.propertyStreetNumber || null,
                    propertyLocation: body.propertyLocation || null,
                    propertyMapNumber: body.propertyMapNumber || null,
                    propertyBuildingName: body.propertyBuildingName || null,
                    propertyApartmentNumber: body.propertyApartmentNumber || null,
                    propertyFloorNumber: body.propertyFloorNumber || null,
                    validFrom: new Date(body.validFrom),
                    validTo: new Date(body.validTo),
                    agreementPeriod: body.agreementPeriod || null,
                    agreementPeriodUnit: body.agreementPeriodUnit || 'months',
                    monthlyRent: parseFloat(body.monthlyRent),
                    paymentFrequency: body.paymentFrequency || 'monthly',
                    landlordSignature: body.landlordSignature || null,
                    landlordSignDate: body.landlordSignDate ? new Date(body.landlordSignDate) : null,
                    tenantSignature: body.tenantSignature || null,
                    tenantSignDate: body.tenantSignDate ? new Date(body.tenantSignDate) : null,
                    notes: body.notes || null,
                    paymentTiming: body.paymentTiming || 'advance',
                    paymentMonths: body.paymentMonths ? parseInt(body.paymentMonths) : null,
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

            // Auto-create customer for buyer if no buyerId provided
            let buyerId = body.buyerId || null;
            if (!buyerId && body.buyerName) {
                const newBuyer = await prisma.customer.create({
                    data: {
                        name: body.buyerName,
                        phone: body.buyerPhone || '',
                        email: null,
                        idNumber1: body.buyerNationalId || null,
                        address: body.buyerAddress || null,
                        nationality: body.buyerNationality || null,
                    }
                });
                buyerId = newBuyer.id;
            }

            const contract = await prisma.saleContract.create({
                data: {
                    contractNumber,
                    status: body.status || 'signed',
                    projectId: body.projectId || null,
                    sellerNationalId: body.sellerNationalId || null,
                    sellerName: body.sellerName,
                    sellerCR: body.sellerCR || null,
                    sellerNationality: body.sellerNationality || null,
                    sellerAddress: body.sellerAddress || null,
                    sellerPhone: body.sellerPhone || null,
                    buyerId,
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
                    propertyBuiltUpArea: body.propertyBuiltUpArea || null,
                    propertyDistrictNumber: body.propertyDistrictNumber || null,
                    propertyStreetNumber: body.propertyStreetNumber || null,
                    propertyLocation: body.propertyLocation || null,
                    propertyMapNumber: body.propertyMapNumber || null,
                    totalPrice: parseFloat(body.totalPrice),
                    totalPriceWords: body.totalPriceWords || null,
                    constructionStartDate: body.constructionStartDate ? new Date(body.constructionStartDate) : null,
                    constructionEndDate: body.constructionEndDate ? new Date(body.constructionEndDate) : null,
                    contractNotes: body.contractNotes || null,
                    notes: body.notes || null,
                    sellerSignature: body.sellerSignature || null,
                    buyerSignature: body.buyerSignature || null,
                    installments: body.installments?.length
                        ? {
                            create: body.installments.map((inst: any) => ({
                                amount: parseFloat(inst.amount),
                                amountWords: inst.amountWords || null,
                                dueDate: inst.dueDate ? new Date(inst.dueDate) : null,
                                label: inst.label || null,
                                order: inst.order ?? 0,
                            })),
                        }
                        : undefined,
                },
                include: {
                    buyer: { select: { id: true, name: true } },
                    installments: { orderBy: { order: 'asc' } },
                }
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
