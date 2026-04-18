'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface RentalContractView {
    id: string;
    contractNumber: string;
    contractType: 'rental';
    landlordName?: string;
    landlordCR?: string;
    landlordPOBox?: string;
    landlordPostalCode?: string;
    landlordAddress?: string;
    landlordPhone?: string;
    landlordCivilId?: string;
    tenantName?: string;
    tenantIdPassport?: string;
    tenantLabourCard?: string;
    tenantPhone?: string;
    tenantEmail?: string;
    tenantSponsor?: string;
    tenantAddress?: string;
    propertyLandNumber?: string;
    propertyArea?: string;
    propertyBuiltUpArea?: string;
    propertyDistrictNumber?: string;
    propertyStreetNumber?: string;
    propertyLocation?: string;
    propertyMapNumber?: string;
    propertyBuildingName?: string;
    propertyApartmentNumber?: string;
    propertyFloorNumber?: string;
    validFrom?: string;
    validTo?: string;
    agreementPeriod?: string;
    agreementPeriodUnit?: string;
    monthlyRent?: number;
    paymentFrequency?: string;
    paymentTiming?: string;
    paymentMonths?: number;
    notes?: string;
    status?: string;
    createdAt?: string;
}

interface SaleContractView {
    id: string;
    contractNumber: string;
    contractType: 'sale';
    sellerName?: string;
    sellerNationalId?: string;
    sellerCR?: string;
    sellerNationality?: string;
    sellerAddress?: string;
    sellerPhone?: string;
    buyerName?: string;
    buyerNationalId?: string;
    buyerNationality?: string;
    buyerAddress?: string;
    buyerPhone?: string;
    propertyWilaya?: string;
    propertyGovernorate?: string;
    propertyPhase?: string;
    propertyLandNumber?: string;
    propertyArea?: string;
    propertyBuiltUpArea?: string;
    propertyLocation?: string;
    totalPrice?: number;
    totalPriceWords?: string;
    depositAmount?: number;
    depositDate?: string;
    remainingAmount?: number;
    remainingDueDate?: string;
    finalPaymentAmount?: number;
    constructionStartDate?: string;
    constructionEndDate?: string;
    notes?: string;
    status?: string;
    createdAt?: string;
}

type ContractView = RentalContractView | SaleContractView;

const fd = (d?: string | null) => {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return d; }
};

const fc = (n?: number | null) => {
    if (n == null) return '—';
    return `OMR ${n.toFixed(3)}`;
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
    if (!value) return null;
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2 border-b border-border last:border-0">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide sm:w-48 shrink-0">{label}</span>
            <span className="text-sm font-medium">{String(value)}</span>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#cea26e] uppercase tracking-wider mb-3 pb-1 border-b-2 border-[#cea26e]/30">{title}</h3>
            <div className="space-y-0">{children}</div>
        </div>
    );
}

export default function ContractViewPage() {
    const { id } = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const type = (searchParams.get('type') as 'rental' | 'sale') || 'rental';

    const [contract, setContract] = useState<ContractView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`/api/contracts/${id}?type=${type}`)
            .then(r => r.json())
            .then(d => {
                if (d.data) {
                    setContract({ ...d.data, contractType: type });
                } else {
                    setError(d.error || 'Contract not found');
                }
            })
            .catch(() => setError('Failed to load contract'))
            .finally(() => setLoading(false));
    }, [id, type]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#cea26e]" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !contract) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <p className="text-muted-foreground">{error || 'Contract not found'}</p>
                    <Link href="/contracts"><Button variant="outline">Back to Contracts</Button></Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <Link href="/contracts">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button
                            size="sm"
                            className="bg-[#cea26e] hover:bg-[#c49b63] text-white"
                            onClick={async () => {
                                const endpoint = type === 'rental' ? '/api/generate-rental-pdf' : '/api/generate-sale-pdf';
                                const res = await fetch(endpoint, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ contract }),
                                });
                                if (res.ok) {
                                    const blob = await res.blob();
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${contract.contractNumber}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }
                            }}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Contract Card */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0">
                    {/* Header */}
                    <div className="bg-[#1a1a2e] text-white px-6 py-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                                {type === 'rental' ? 'Tenancy Agreement' : 'Sale Contract'}
                            </p>
                            <h1 className="text-xl font-bold">{contract.contractNumber}</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-white/60">Date</p>
                            <p className="text-sm font-semibold">{fd(contract.createdAt)}</p>
                            <p className="text-xs mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    contract.status === 'signed' ? 'bg-green-500/20 text-green-300'
                                    : 'bg-yellow-500/20 text-yellow-300'
                                }`}>{contract.status}</span>
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        {contract.contractType === 'rental' ? (
                            <>
                                {/* Rental Contract View */}
                                <Section title="Landlord Details (First Party)">
                                    <Field label="Name" value={(contract as RentalContractView).landlordName} />
                                    <Field label="CR No" value={(contract as RentalContractView).landlordCR} />
                                    <Field label="P.O. Box" value={(contract as RentalContractView).landlordPOBox} />
                                    <Field label="Postal Code" value={(contract as RentalContractView).landlordPostalCode} />
                                    <Field label="Phone" value={(contract as RentalContractView).landlordPhone} />
                                    <Field label="Civil / National ID" value={(contract as RentalContractView).landlordCivilId} />
                                    <Field label="Address" value={(contract as RentalContractView).landlordAddress} />
                                </Section>

                                <Section title="Tenant Details (Second Party)">
                                    <Field label="Name" value={(contract as RentalContractView).tenantName} />
                                    <Field label="ID / Passport" value={(contract as RentalContractView).tenantIdPassport} />
                                    <Field label="Labour Card" value={(contract as RentalContractView).tenantLabourCard} />
                                    <Field label="Phone" value={(contract as RentalContractView).tenantPhone} />
                                    <Field label="Email" value={(contract as RentalContractView).tenantEmail} />
                                    <Field label="Sponsor" value={(contract as RentalContractView).tenantSponsor} />
                                    <Field label="Address" value={(contract as RentalContractView).tenantAddress} />
                                </Section>

                                <Section title="Property Details">
                                    <Field label="Building Name" value={(contract as RentalContractView).propertyBuildingName} />
                                    <Field label="Apartment No" value={(contract as RentalContractView).propertyApartmentNumber} />
                                    <Field label="Floor" value={(contract as RentalContractView).propertyFloorNumber} />
                                    <Field label="Location" value={(contract as RentalContractView).propertyLocation} />
                                    <Field label="Land Number" value={(contract as RentalContractView).propertyLandNumber} />
                                    <Field label="Area (sqm)" value={(contract as RentalContractView).propertyArea} />
                                    <Field label="Built-up Area (sqm)" value={(contract as RentalContractView).propertyBuiltUpArea} />
                                    <Field label="District" value={(contract as RentalContractView).propertyDistrictNumber} />
                                    <Field label="Street / Block" value={(contract as RentalContractView).propertyStreetNumber} />
                                    <Field label="Map / Plan No" value={(contract as RentalContractView).propertyMapNumber} />
                                </Section>

                                <Section title="Contract Terms">
                                    <Field label="Valid From" value={fd((contract as RentalContractView).validFrom)} />
                                    <Field label="Valid To" value={fd((contract as RentalContractView).validTo)} />
                                    <Field label="Duration" value={(contract as RentalContractView).agreementPeriod ? `${(contract as RentalContractView).agreementPeriod} ${(contract as RentalContractView).agreementPeriodUnit || 'months'}` : undefined} />
                                    <Field label="Monthly Rent" value={fc((contract as RentalContractView).monthlyRent)} />
                                    <Field label="Payment Frequency" value={(contract as RentalContractView).paymentFrequency} />
                                    <Field label="Payment Type" value={(contract as RentalContractView).paymentTiming === 'deferred' ? 'Deferred (مؤخر)' : 'Advance (مقدم)'} />
                                    <Field label="Payment Months" value={(contract as RentalContractView).paymentMonths} />
                                </Section>

                                {(contract as RentalContractView).notes && (
                                    <Section title="Notes">
                                        <div className="text-sm">{(contract as RentalContractView).notes}</div>
                                    </Section>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Sale Contract View */}
                                <Section title="Seller Details (First Party)">
                                    <Field label="Name" value={(contract as SaleContractView).sellerName} />
                                    <Field label="National ID" value={(contract as SaleContractView).sellerNationalId} />
                                    <Field label="CR No" value={(contract as SaleContractView).sellerCR} />
                                    <Field label="Nationality" value={(contract as SaleContractView).sellerNationality} />
                                    <Field label="Phone" value={(contract as SaleContractView).sellerPhone} />
                                    <Field label="Address" value={(contract as SaleContractView).sellerAddress} />
                                </Section>

                                <Section title="Buyer Details (Second Party)">
                                    <Field label="Name" value={(contract as SaleContractView).buyerName} />
                                    <Field label="National ID" value={(contract as SaleContractView).buyerNationalId} />
                                    <Field label="Nationality" value={(contract as SaleContractView).buyerNationality} />
                                    <Field label="Phone" value={(contract as SaleContractView).buyerPhone} />
                                    <Field label="Address" value={(contract as SaleContractView).buyerAddress} />
                                </Section>

                                <Section title="Property Details">
                                    <Field label="Wilaya" value={(contract as SaleContractView).propertyWilaya} />
                                    <Field label="Governorate" value={(contract as SaleContractView).propertyGovernorate} />
                                    <Field label="Phase" value={(contract as SaleContractView).propertyPhase} />
                                    <Field label="Land Number" value={(contract as SaleContractView).propertyLandNumber} />
                                    <Field label="Area (sqm)" value={(contract as SaleContractView).propertyArea} />
                                    <Field label="Built-up Area (sqm)" value={(contract as SaleContractView).propertyBuiltUpArea} />
                                    <Field label="Location" value={(contract as SaleContractView).propertyLocation} />
                                </Section>

                                <Section title="Payment Terms">
                                    <Field label="Total Price" value={fc((contract as SaleContractView).totalPrice)} />
                                    <Field label="Price in Words" value={(contract as SaleContractView).totalPriceWords} />
                                    <Field label="Deposit" value={fc((contract as SaleContractView).depositAmount)} />
                                    <Field label="Deposit Date" value={fd((contract as SaleContractView).depositDate)} />
                                    <Field label="Remaining Amount" value={fc((contract as SaleContractView).remainingAmount)} />
                                    <Field label="Remaining Due" value={fd((contract as SaleContractView).remainingDueDate)} />
                                    <Field label="Final Payment" value={fc((contract as SaleContractView).finalPaymentAmount)} />
                                </Section>

                                <Section title="Construction Timeline">
                                    <Field label="Start Date" value={fd((contract as SaleContractView).constructionStartDate)} />
                                    <Field label="End Date" value={fd((contract as SaleContractView).constructionEndDate)} />
                                </Section>

                                {(contract as SaleContractView).notes && (
                                    <Section title="Notes">
                                        <div className="text-sm">{(contract as SaleContractView).notes}</div>
                                    </Section>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
