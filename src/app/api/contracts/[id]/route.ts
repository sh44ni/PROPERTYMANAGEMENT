import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/contracts/[id]?type=rental|sale
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'rental' | 'sale' | null;

        if (type === 'rental') {
            const contract = await prisma.rentalContract.findUnique({
                where: { id },
                include: { tenant: { select: { id: true, name: true, email: true, phone: true } } }
            });
            if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
            return NextResponse.json({ data: contract, type: 'rental' });
        }

        if (type === 'sale') {
            const contract = await prisma.saleContract.findUnique({
                where: { id },
                include: {
                    buyer: { select: { id: true, name: true, email: true, phone: true } },
                    attachments: { orderBy: { uploadedAt: 'desc' } },
                    installments: { orderBy: { order: 'asc' } },
                }
            });
            if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
            return NextResponse.json({ data: contract, type: 'sale' });
        }

        return NextResponse.json({ error: 'type query parameter (rental|sale) is required' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching contract:', error);
        return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
    }
}

// PUT /api/contracts/[id]?type=rental|sale
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'rental' | 'sale' | null;
        const body = await request.json();

        if (type === 'rental') {
            const existing = await prisma.rentalContract.findUnique({ where: { id } });
            if (!existing) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

            const updated = await prisma.rentalContract.update({
                where: { id },
                data: {
                    status: body.status || existing.status,
                    landlordName: body.landlordName ?? existing.landlordName,
                    landlordCR: body.landlordCR ?? existing.landlordCR,
                    landlordPOBox: body.landlordPOBox ?? existing.landlordPOBox,
                    landlordPostalCode: body.landlordPostalCode ?? existing.landlordPostalCode,
                    landlordAddress: body.landlordAddress ?? existing.landlordAddress,
                    landlordPhone: body.landlordPhone ?? existing.landlordPhone,
                    landlordCivilId: body.landlordCivilId ?? existing.landlordCivilId,
                    tenantId: body.tenantId ?? existing.tenantId,
                    tenantName: body.tenantName ?? existing.tenantName,
                    tenantIdPassport: body.tenantIdPassport ?? existing.tenantIdPassport,
                    tenantLabourCard: body.tenantLabourCard ?? existing.tenantLabourCard,
                    tenantPhone: body.tenantPhone ?? existing.tenantPhone,
                    tenantEmail: body.tenantEmail ?? existing.tenantEmail,
                    tenantSponsor: body.tenantSponsor ?? existing.tenantSponsor,
                    tenantCR: body.tenantCR ?? existing.tenantCR,
                    tenantAddress: body.tenantAddress ?? existing.tenantAddress,
                    propertyLandNumber: body.propertyLandNumber ?? existing.propertyLandNumber,
                    propertyArea: body.propertyArea ?? existing.propertyArea,
                    propertyBuiltUpArea: body.propertyBuiltUpArea ?? existing.propertyBuiltUpArea,
                    propertyDistrictNumber: body.propertyDistrictNumber ?? existing.propertyDistrictNumber,
                    propertyStreetNumber: body.propertyStreetNumber ?? existing.propertyStreetNumber,
                    propertyLocation: body.propertyLocation ?? existing.propertyLocation,
                    propertyMapNumber: body.propertyMapNumber ?? existing.propertyMapNumber,
                    propertyBuildingName: body.propertyBuildingName ?? existing.propertyBuildingName,
                    propertyApartmentNumber: body.propertyApartmentNumber ?? existing.propertyApartmentNumber,
                    propertyFloorNumber: body.propertyFloorNumber ?? existing.propertyFloorNumber,
                    validFrom: body.validFrom ? new Date(body.validFrom) : existing.validFrom,
                    validTo: body.validTo ? new Date(body.validTo) : existing.validTo,
                    agreementPeriod: body.agreementPeriod ?? existing.agreementPeriod,
                    agreementPeriodUnit: body.agreementPeriodUnit ?? existing.agreementPeriodUnit,
                    monthlyRent: body.monthlyRent != null ? parseFloat(body.monthlyRent) : existing.monthlyRent,
                    paymentFrequency: body.paymentFrequency ?? existing.paymentFrequency,
                    landlordSignature: body.landlordSignature ?? existing.landlordSignature,
                    landlordSignDate: body.landlordSignDate ? new Date(body.landlordSignDate) : existing.landlordSignDate,
                    tenantSignature: body.tenantSignature ?? existing.tenantSignature,
                    tenantSignDate: body.tenantSignDate ? new Date(body.tenantSignDate) : existing.tenantSignDate,
                    notes: body.notes ?? existing.notes,
                    paymentTiming: body.paymentTiming ?? existing.paymentTiming,
                    paymentMonths: body.paymentMonths != null ? parseInt(body.paymentMonths) : existing.paymentMonths,
                },
                include: { tenant: { select: { id: true, name: true } } }
            });

            return NextResponse.json({ data: updated, type: 'rental' });
        }

        if (type === 'sale') {
            const existing = await prisma.saleContract.findUnique({ where: { id } });
            if (!existing) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

            const updated = await prisma.saleContract.update({
                where: { id },
                data: {
                    status: body.status ?? existing.status,
                    sellerNationalId: body.sellerNationalId ?? existing.sellerNationalId,
                    sellerName: body.sellerName ?? existing.sellerName,
                    sellerCR: body.sellerCR ?? existing.sellerCR,
                    sellerNationality: body.sellerNationality ?? existing.sellerNationality,
                    sellerAddress: body.sellerAddress ?? existing.sellerAddress,
                    sellerPhone: body.sellerPhone ?? existing.sellerPhone,
                    buyerId: body.buyerId ?? existing.buyerId,
                    buyerNationalId: body.buyerNationalId ?? existing.buyerNationalId,
                    buyerName: body.buyerName ?? existing.buyerName,
                    buyerCR: body.buyerCR ?? existing.buyerCR,
                    buyerNationality: body.buyerNationality ?? existing.buyerNationality,
                    buyerAddress: body.buyerAddress ?? existing.buyerAddress,
                    buyerPhone: body.buyerPhone ?? existing.buyerPhone,
                    propertyWilaya: body.propertyWilaya ?? existing.propertyWilaya,
                    propertyGovernorate: body.propertyGovernorate ?? existing.propertyGovernorate,
                    propertyPhase: body.propertyPhase ?? existing.propertyPhase,
                    propertyLandNumber: body.propertyLandNumber ?? existing.propertyLandNumber,
                    propertyArea: body.propertyArea ?? existing.propertyArea,
                    propertyBuiltUpArea: body.propertyBuiltUpArea ?? existing.propertyBuiltUpArea,
                    propertyDistrictNumber: body.propertyDistrictNumber ?? existing.propertyDistrictNumber,
                    propertyStreetNumber: body.propertyStreetNumber ?? existing.propertyStreetNumber,
                    propertyLocation: body.propertyLocation ?? existing.propertyLocation,
                    propertyMapNumber: body.propertyMapNumber ?? existing.propertyMapNumber,
                    totalPrice: body.totalPrice != null ? parseFloat(body.totalPrice) : existing.totalPrice,
                    totalPriceWords: body.totalPriceWords ?? existing.totalPriceWords,
                    depositAmount: body.depositAmount != null ? parseFloat(body.depositAmount) : existing.depositAmount,
                    depositAmountWords: body.depositAmountWords ?? existing.depositAmountWords,
                    depositDate: body.depositDate ? new Date(body.depositDate) : existing.depositDate,
                    remainingAmount: body.remainingAmount != null ? parseFloat(body.remainingAmount) : existing.remainingAmount,
                    remainingAmountWords: body.remainingAmountWords ?? existing.remainingAmountWords,
                    remainingDueDate: body.remainingDueDate ? new Date(body.remainingDueDate) : existing.remainingDueDate,
                    finalPaymentAmount: body.finalPaymentAmount != null ? parseFloat(body.finalPaymentAmount) : existing.finalPaymentAmount,
                    finalPaymentWords: body.finalPaymentWords ?? existing.finalPaymentWords,
                    constructionStartDate: body.constructionStartDate ? new Date(body.constructionStartDate) : existing.constructionStartDate,
                    constructionEndDate: body.constructionEndDate ? new Date(body.constructionEndDate) : existing.constructionEndDate,
                    notes: body.notes ?? existing.notes,
                    sellerSignature: body.sellerSignature ?? existing.sellerSignature,
                    buyerSignature: body.buyerSignature ?? existing.buyerSignature,
                },
                include: {
                    buyer: { select: { id: true, name: true } },
                    attachments: { orderBy: { uploadedAt: 'desc' } },
                }
            });

            return NextResponse.json({ data: updated, type: 'sale' });
        }

        return NextResponse.json({ error: 'type query parameter (rental|sale) is required' }, { status: 400 });
    } catch (error) {
        console.error('Error updating contract:', error);
        return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
    }
}

// DELETE /api/contracts/[id]?type=rental|sale
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'rental' | 'sale' | null;

        if (type === 'rental') {
            await prisma.rentalContract.delete({ where: { id } });
        } else if (type === 'sale') {
            await prisma.saleContract.delete({ where: { id } });
        } else {
            return NextResponse.json({ error: 'type query parameter (rental|sale) is required' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contract:', error);
        return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
    }
}
