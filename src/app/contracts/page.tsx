'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Plus, FileCheck, Download, Trash2, X, Building, ChevronDown,
    FileText, Users, Loader2, Search, CheckCircle, AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Interfaces
interface RentalContract {
    id: string;
    contractNumber: string;
    contractType: 'rental';
    status: 'signed' | 'draft';
    landlordName: string;
    landlordCR?: string;
    landlordPOBox?: string;
    landlordPostalCode?: string;
    landlordAddress?: string;
    tenantName: string;
    tenantIdPassport: string;
    tenantLabourCard?: string;
    tenantPhone: string;
    tenantEmail?: string;
    tenantSponsor?: string;
    tenantCR?: string;
    validFrom: string;
    validTo: string;
    agreementPeriod?: string;
    monthlyRent: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    landlordSignature?: string;
    landlordSignDate?: string;
    tenantSignature?: string;
    tenantSignDate?: string;
    createdAt: string;
}

interface SaleContract {
    id: string;
    contractNumber: string;
    contractType: 'sale';
    status: 'signed' | 'draft';
    sellerId?: string;
    sellerName: string;
    sellerCR?: string;
    sellerNationality?: string;
    sellerAddress?: string;
    sellerPhone?: string;
    buyerId?: string;
    buyerName: string;
    buyerCR?: string;
    buyerNationality?: string;
    buyerAddress?: string;
    buyerPhone?: string;
    propertyWilaya: string;
    propertyGovernorate?: string;
    propertyPhase?: string;
    propertyLandNumber?: string;
    propertyArea?: string;
    totalPrice: number;
    totalPriceWords?: string;
    depositAmount: number;
    depositAmountWords?: string;
    depositDate?: string;
    remainingAmount: number;
    remainingAmountWords?: string;
    remainingDueDate?: string;
    finalPaymentAmount: number;
    finalPaymentAmountWords?: string;
    constructionStartDate?: string;
    constructionEndDate?: string;
    notes?: string;
    sellerSignature?: string;
    buyerSignature?: string;
    createdAt: string;
}

type Contract = RentalContract | SaleContract;

// Mock data
const mockRentalContracts: RentalContract[] = [
    {
        id: 'rc1',
        contractNumber: 'RC-2024-001',
        contractType: 'rental',
        status: 'signed',
        landlordName: 'Telal Al-Bidaya LLC',
        landlordCR: '1603540',
        landlordPOBox: '500',
        landlordPostalCode: '316',
        landlordAddress: 'Muscat, Sultanate of Oman',
        tenantName: 'Fatima Al-Harthi',
        tenantIdPassport: '12345678',
        tenantPhone: '+968 9999 1234',
        tenantEmail: 'fatima@email.com',
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        agreementPeriod: '12 months',
        monthlyRent: 450,
        paymentFrequency: 'monthly',
        createdAt: '2024-01-01',
    }
];

const mockSaleContracts: SaleContract[] = [
    {
        id: 'sc1',
        contractNumber: 'SC-2024-001',
        contractType: 'sale',
        status: 'signed',
        sellerName: 'Telal Al-Bidaya LLC',
        sellerId: '1603540',
        sellerNationality: 'Omani',
        sellerAddress: 'Muscat, Sultanate of Oman',
        sellerPhone: '+968 9917 1889',
        buyerName: 'Mohammed Al-Lawati',
        buyerId: '87654321',
        buyerNationality: 'Omani',
        buyerAddress: 'Al Khuwair, Muscat',
        buyerPhone: '+968 9876 5432',
        propertyWilaya: 'Muscat',
        propertyGovernorate: 'Muscat',
        propertyPhase: 'Phase 1',
        propertyLandNumber: 'A-15',
        propertyArea: '350',
        totalPrice: 75000,
        totalPriceWords: 'Seventy-Five Thousand',
        depositAmount: 15000,
        depositAmountWords: 'Fifteen Thousand',
        depositDate: '2024-01-15',
        remainingAmount: 40000,
        remainingAmountWords: 'Forty Thousand',
        remainingDueDate: '2024-06-01',
        finalPaymentAmount: 20000,
        finalPaymentAmountWords: 'Twenty Thousand',
        constructionStartDate: '2024-02-01',
        constructionEndDate: '2024-08-01',
        createdAt: '2024-01-15',
    }
];

// Initial form states
const initialRentalForm = {
    landlordName: 'Telal Al-Bidaya LLC',
    landlordCR: '1603540',
    landlordPOBox: '500',
    landlordPostalCode: '316',
    landlordAddress: 'Muscat, Sultanate of Oman',
    tenantName: '',
    tenantIdPassport: '',
    tenantLabourCard: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantSponsor: '',
    tenantCR: '',
    validFrom: '',
    validTo: '',
    agreementPeriod: '',
    monthlyRent: '',
    paymentFrequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    landlordSignature: '',
    landlordSignDate: '',
    tenantSignature: '',
    tenantSignDate: '',
};

const initialSaleForm = {
    sellerId: '1603540',
    sellerName: 'Telal Al-Bidaya LLC',
    sellerCR: '1603540',
    sellerNationality: 'Omani',
    sellerAddress: 'Muscat, Sultanate of Oman',
    sellerPhone: '+968 9917 1889',
    buyerId: '',
    buyerName: '',
    buyerCR: '',
    buyerNationality: '',
    buyerAddress: '',
    buyerPhone: '',
    propertyWilaya: '',
    propertyGovernorate: '',
    propertyPhase: '',
    propertyLandNumber: '',
    propertyArea: '',
    totalPrice: '',
    totalPriceWords: '',
    depositAmount: '',
    depositAmountWords: '',
    depositDate: '',
    remainingAmount: '',
    remainingAmountWords: '',
    remainingDueDate: '',
    finalPaymentAmount: '',
    finalPaymentAmountWords: '',
    constructionStartDate: '',
    constructionEndDate: '',
    notes: '',
    sellerSignature: '',
    buyerSignature: '',
};

export default function ContractsPage() {
    const { t, language } = useLanguage();
    const [rentalContracts, setRentalContracts] = useState<RentalContract[]>(mockRentalContracts);
    const [saleContracts, setSaleContracts] = useState<SaleContract[]>(mockSaleContracts);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'rental' | 'sale'>('all');

    // Rental form state
    const [isRentalOpen, setIsRentalOpen] = useState(false);
    const [rentalForm, setRentalForm] = useState(initialRentalForm);
    const [rentalFormErrors, setRentalFormErrors] = useState<Record<string, boolean>>({});
    const [isSubmittingRental, setIsSubmittingRental] = useState(false);
    const [shakeRentalForm, setShakeRentalForm] = useState(false);

    // Sale form state
    const [isSaleOpen, setIsSaleOpen] = useState(false);
    const [saleForm, setSaleForm] = useState(initialSaleForm);
    const [saleFormErrors, setSaleFormErrors] = useState<Record<string, boolean>>({});
    const [isSubmittingSale, setIsSubmittingSale] = useState(false);
    const [shakeSaleForm, setShakeSaleForm] = useState(false);

    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingContract, setDeletingContract] = useState<Contract | null>(null);

    // PDF generation state
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Combine contracts for display
    const allContracts: Contract[] = [...rentalContracts, ...saleContracts];

    // Filter contracts
    const filteredContracts = allContracts
        .filter(c => {
            if (activeTab === 'all') return true;
            return c.contractType === activeTab;
        })
        .filter(c => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return c.contractNumber.toLowerCase().includes(query) ||
                (c.contractType === 'rental' && (c as RentalContract).tenantName.toLowerCase().includes(query)) ||
                (c.contractType === 'sale' && (c as SaleContract).buyerName.toLowerCase().includes(query));
        });

    const formatDate = (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatCurrency = (amount: number) => {
        return `OMR ${amount.toFixed(3)}`;
    };

    // Rental handlers
    const handleCreateRental = async () => {
        const errors: Record<string, boolean> = {};
        if (!rentalForm.tenantName.trim()) errors.tenantName = true;
        if (!rentalForm.tenantIdPassport.trim()) errors.tenantIdPassport = true;
        if (!rentalForm.tenantPhone.trim()) errors.tenantPhone = true;
        if (!rentalForm.validFrom) errors.validFrom = true;
        if (!rentalForm.validTo) errors.validTo = true;
        if (!rentalForm.monthlyRent || parseFloat(rentalForm.monthlyRent) <= 0) errors.monthlyRent = true;

        setRentalFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeRentalForm(true);
            setTimeout(() => setShakeRentalForm(false), 500);
            return;
        }

        setIsSubmittingRental(true);

        // Create new contract
        const newContract: RentalContract = {
            id: `rc${Date.now()}`,
            contractNumber: `RC-2024-${String(rentalContracts.length + 1).padStart(3, '0')}`,
            contractType: 'rental',
            status: 'signed',
            ...rentalForm,
            monthlyRent: parseFloat(rentalForm.monthlyRent),
            createdAt: new Date().toISOString().split('T')[0],
        };

        // Generate PDF
        try {
            const response = await fetch('/api/generate-rental-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contract: newContract }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${newContract.contractNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                showToast('Contract saved but PDF generation failed', 'error');
            }
        } catch {
            showToast('Contract saved but PDF generation failed', 'error');
        }

        setRentalContracts([...rentalContracts, newContract]);
        showToast(`Contract ${newContract.contractNumber} created successfully`);
        setIsRentalOpen(false);
        setRentalForm(initialRentalForm);
        setIsSubmittingRental(false);
    };

    // Sale handlers
    const handleCreateSale = async () => {
        const errors: Record<string, boolean> = {};
        if (!saleForm.buyerName.trim()) errors.buyerName = true;
        if (!saleForm.propertyWilaya.trim()) errors.propertyWilaya = true;
        if (!saleForm.totalPrice || parseFloat(saleForm.totalPrice) <= 0) errors.totalPrice = true;

        setSaleFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeSaleForm(true);
            setTimeout(() => setShakeSaleForm(false), 500);
            return;
        }

        setIsSubmittingSale(true);

        // Create new contract
        const newContract: SaleContract = {
            id: `sc${Date.now()}`,
            contractNumber: `SC-2024-${String(saleContracts.length + 1).padStart(3, '0')}`,
            contractType: 'sale',
            status: 'signed',
            ...saleForm,
            totalPrice: parseFloat(saleForm.totalPrice) || 0,
            depositAmount: parseFloat(saleForm.depositAmount) || 0,
            remainingAmount: parseFloat(saleForm.remainingAmount) || 0,
            finalPaymentAmount: parseFloat(saleForm.finalPaymentAmount) || 0,
            createdAt: new Date().toISOString().split('T')[0],
        };

        // Generate PDF
        try {
            const response = await fetch('/api/generate-sale-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contract: newContract }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${newContract.contractNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                showToast('Contract saved but PDF generation failed', 'error');
            }
        } catch {
            showToast('Contract saved but PDF generation failed', 'error');
        }

        setSaleContracts([...saleContracts, newContract]);
        showToast(`Contract ${newContract.contractNumber} created successfully`);
        setIsSaleOpen(false);
        setSaleForm(initialSaleForm);
        setIsSubmittingSale(false);
    };

    // Delete handler
    const handleDelete = () => {
        if (!deletingContract) return;

        if (deletingContract.contractType === 'rental') {
            setRentalContracts(rentalContracts.filter(c => c.id !== deletingContract.id));
        } else {
            setSaleContracts(saleContracts.filter(c => c.id !== deletingContract.id));
        }

        showToast('Contract deleted');
        setIsDeleteOpen(false);
        setDeletingContract(null);
    };

    // Download PDF
    const handleDownloadPdf = async (contract: Contract) => {
        setGeneratingPdfId(contract.id);

        try {
            const endpoint = contract.contractType === 'rental' ? '/api/generate-rental-pdf' : '/api/generate-sale-pdf';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contract }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${contract.contractNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                showToast('PDF downloaded');
            } else {
                showToast('Failed to generate PDF', 'error');
            }
        } catch {
            showToast('Failed to generate PDF', 'error');
        }

        setGeneratingPdfId(null);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Toast */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right ${toast.type === 'success' ? 'bg-green-600' : 'bg-destructive'
                        } text-white`}>
                        {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {toast.message}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#cea26e]">{t.contracts.title}</h1>
                        <p className="text-muted-foreground text-sm">{t.contracts.subtitle}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button onClick={() => setIsRentalOpen(true)} className="flex-1 sm:flex-none bg-[#cea26e] hover:bg-[#c49b63] text-white">
                            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.contracts.rental}
                        </Button>
                        <Button onClick={() => setIsSaleOpen(true)} variant="outline" className="flex-1 sm:flex-none border-[#cea26e] text-[#cea26e] hover:bg-[#cea26e]/10">
                            <FileCheck className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.contracts.sale}
                        </Button>
                    </div>
                </div>

                {/* Search and Tabs */}
                <div className="space-y-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={`${t.common.search}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex gap-2">
                        {(['all', 'rental', 'sale'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'bg-[#cea26e] text-white'
                                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {tab === 'all' ? `${t.common.all} (${allContracts.length})` :
                                    tab === 'rental' ? `${t.contracts.rental} (${rentalContracts.length})` :
                                        `${t.contracts.sale} (${saleContracts.length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contracts List */}
                <div className="space-y-3">
                    {filteredContracts.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-8 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No contracts found</p>
                        </div>
                    ) : (
                        filteredContracts.map(contract => (
                            <div key={contract.id} className="bg-card border border-border rounded-xl p-4 hover:border-[#cea26e]/30 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${contract.contractType === 'rental'
                                                ? 'bg-blue-500/10 text-blue-500'
                                                : 'bg-orange-500/10 text-orange-500'
                                                }`}>
                                                {contract.contractType === 'rental' ? 'Rental' : 'Sale'}
                                            </span>
                                            <span className="font-semibold">{contract.contractNumber}</span>
                                        </div>
                                        <p className="text-sm">
                                            {contract.contractType === 'rental'
                                                ? (contract as RentalContract).tenantName
                                                : (contract as SaleContract).buyerName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {contract.contractType === 'rental'
                                                ? `${formatCurrency((contract as RentalContract).monthlyRent)}/month`
                                                : formatCurrency((contract as SaleContract).totalPrice)}
                                            {' • '}
                                            {formatDate(contract.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDownloadPdf(contract)}
                                            disabled={generatingPdfId === contract.id}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                            title="Download PDF"
                                        >
                                            {generatingPdfId === contract.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeletingContract(contract);
                                                setIsDeleteOpen(true);
                                            }}
                                            className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Rental Contract Dialog */}
                <Dialog open={isRentalOpen} onOpenChange={setIsRentalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Rental Contract</DialogTitle>
                        </DialogHeader>
                        <div className={`space-y-6 ${shakeRentalForm ? 'animate-shake' : ''}`}>
                            {/* Landlord Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Building className="h-4 w-4 text-[#cea26e]" />
                                    Landlord (First Party)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                                        <Input value={rentalForm.landlordName} onChange={(e) => setRentalForm({ ...rentalForm, landlordName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">CR No</label>
                                        <Input value={rentalForm.landlordCR} onChange={(e) => setRentalForm({ ...rentalForm, landlordCR: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">P.O. Box</label>
                                        <Input value={rentalForm.landlordPOBox} onChange={(e) => setRentalForm({ ...rentalForm, landlordPOBox: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Postal Code</label>
                                        <Input value={rentalForm.landlordPostalCode} onChange={(e) => setRentalForm({ ...rentalForm, landlordPostalCode: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                                        <Input value={rentalForm.landlordAddress} onChange={(e) => setRentalForm({ ...rentalForm, landlordAddress: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Tenant Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-[#cea26e]" />
                                    Tenant (Second Party)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                                        <Input
                                            value={rentalForm.tenantName}
                                            onChange={(e) => {
                                                setRentalForm({ ...rentalForm, tenantName: e.target.value });
                                                if (rentalFormErrors.tenantName) setRentalFormErrors({ ...rentalFormErrors, tenantName: false });
                                            }}
                                            className={rentalFormErrors.tenantName ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">ID/Passport *</label>
                                        <Input
                                            value={rentalForm.tenantIdPassport}
                                            onChange={(e) => {
                                                setRentalForm({ ...rentalForm, tenantIdPassport: e.target.value });
                                                if (rentalFormErrors.tenantIdPassport) setRentalFormErrors({ ...rentalFormErrors, tenantIdPassport: false });
                                            }}
                                            className={rentalFormErrors.tenantIdPassport ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Labour Card</label>
                                        <Input value={rentalForm.tenantLabourCard} onChange={(e) => setRentalForm({ ...rentalForm, tenantLabourCard: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Phone *</label>
                                        <Input
                                            value={rentalForm.tenantPhone}
                                            onChange={(e) => {
                                                setRentalForm({ ...rentalForm, tenantPhone: e.target.value });
                                                if (rentalFormErrors.tenantPhone) setRentalFormErrors({ ...rentalFormErrors, tenantPhone: false });
                                            }}
                                            className={rentalFormErrors.tenantPhone ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                                        <Input value={rentalForm.tenantEmail} onChange={(e) => setRentalForm({ ...rentalForm, tenantEmail: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Sponsor Name</label>
                                        <Input value={rentalForm.tenantSponsor} onChange={(e) => setRentalForm({ ...rentalForm, tenantSponsor: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Terms Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#cea26e]" />
                                    Contract Terms
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Valid From *</label>
                                        <Input
                                            type="date"
                                            value={rentalForm.validFrom}
                                            onChange={(e) => {
                                                setRentalForm({ ...rentalForm, validFrom: e.target.value });
                                                if (rentalFormErrors.validFrom) setRentalFormErrors({ ...rentalFormErrors, validFrom: false });
                                            }}
                                            className={rentalFormErrors.validFrom ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Valid To *</label>
                                        <Input
                                            type="date"
                                            value={rentalForm.validTo}
                                            onChange={(e) => {
                                                setRentalForm({ ...rentalForm, validTo: e.target.value });
                                                if (rentalFormErrors.validTo) setRentalFormErrors({ ...rentalFormErrors, validTo: false });
                                            }}
                                            className={rentalFormErrors.validTo ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Agreement Period</label>
                                        <Input value={rentalForm.agreementPeriod} onChange={(e) => setRentalForm({ ...rentalForm, agreementPeriod: e.target.value })} placeholder="e.g., 12 months" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Monthly Rent (OMR) *</label>
                                        <Input
                                            type="number"
                                            value={rentalForm.monthlyRent}
                                            onChange={(e) => {
                                                setRentalForm({ ...rentalForm, monthlyRent: e.target.value });
                                                if (rentalFormErrors.monthlyRent) setRentalFormErrors({ ...rentalFormErrors, monthlyRent: false });
                                            }}
                                            className={rentalFormErrors.monthlyRent ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Payment Frequency</label>
                                        <select
                                            value={rentalForm.paymentFrequency}
                                            onChange={(e) => setRentalForm({ ...rentalForm, paymentFrequency: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}
                                            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setIsRentalOpen(false)} disabled={isSubmittingRental}>Cancel</Button>
                            <Button onClick={handleCreateRental} disabled={isSubmittingRental} className="bg-[#cea26e] hover:bg-[#c49b63]">
                                {isSubmittingRental ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Generate & Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Sale Contract Dialog */}
                <Dialog open={isSaleOpen} onOpenChange={setIsSaleOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Sale Contract</DialogTitle>
                        </DialogHeader>
                        <div className={`space-y-6 ${shakeSaleForm ? 'animate-shake' : ''}`}>
                            {/* Seller Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Building className="h-4 w-4 text-[#cea26e]" />
                                    Seller (First Party)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                                        <Input value={saleForm.sellerName} onChange={(e) => setSaleForm({ ...saleForm, sellerName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">National ID</label>
                                        <Input value={saleForm.sellerId} onChange={(e) => setSaleForm({ ...saleForm, sellerId: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">CR No</label>
                                        <Input value={saleForm.sellerCR} onChange={(e) => setSaleForm({ ...saleForm, sellerCR: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Nationality</label>
                                        <Input value={saleForm.sellerNationality} onChange={(e) => setSaleForm({ ...saleForm, sellerNationality: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                                        <Input value={saleForm.sellerAddress} onChange={(e) => setSaleForm({ ...saleForm, sellerAddress: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                                        <Input value={saleForm.sellerPhone} onChange={(e) => setSaleForm({ ...saleForm, sellerPhone: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Buyer Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-[#cea26e]" />
                                    Buyer (Second Party)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                                        <Input
                                            value={saleForm.buyerName}
                                            onChange={(e) => {
                                                setSaleForm({ ...saleForm, buyerName: e.target.value });
                                                if (saleFormErrors.buyerName) setSaleFormErrors({ ...saleFormErrors, buyerName: false });
                                            }}
                                            className={saleFormErrors.buyerName ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">National ID</label>
                                        <Input value={saleForm.buyerId} onChange={(e) => setSaleForm({ ...saleForm, buyerId: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Nationality</label>
                                        <Input value={saleForm.buyerNationality} onChange={(e) => setSaleForm({ ...saleForm, buyerNationality: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                                        <Input value={saleForm.buyerPhone} onChange={(e) => setSaleForm({ ...saleForm, buyerPhone: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                                        <Input value={saleForm.buyerAddress} onChange={(e) => setSaleForm({ ...saleForm, buyerAddress: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Property Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Building className="h-4 w-4 text-[#cea26e]" />
                                    Property Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Wilaya *</label>
                                        <Input
                                            value={saleForm.propertyWilaya}
                                            onChange={(e) => {
                                                setSaleForm({ ...saleForm, propertyWilaya: e.target.value });
                                                if (saleFormErrors.propertyWilaya) setSaleFormErrors({ ...saleFormErrors, propertyWilaya: false });
                                            }}
                                            className={saleFormErrors.propertyWilaya ? 'border-destructive' : ''}
                                            placeholder="e.g., Muscat"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Governorate</label>
                                        <Input value={saleForm.propertyGovernorate} onChange={(e) => setSaleForm({ ...saleForm, propertyGovernorate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Phase</label>
                                        <Input value={saleForm.propertyPhase} onChange={(e) => setSaleForm({ ...saleForm, propertyPhase: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Land Number</label>
                                        <Input value={saleForm.propertyLandNumber} onChange={(e) => setSaleForm({ ...saleForm, propertyLandNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Area (sqm)</label>
                                        <Input value={saleForm.propertyArea} onChange={(e) => setSaleForm({ ...saleForm, propertyArea: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#cea26e]" />
                                    Payment Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Total Price (OMR) *</label>
                                        <Input
                                            type="number"
                                            value={saleForm.totalPrice}
                                            onChange={(e) => {
                                                setSaleForm({ ...saleForm, totalPrice: e.target.value });
                                                if (saleFormErrors.totalPrice) setSaleFormErrors({ ...saleFormErrors, totalPrice: false });
                                            }}
                                            className={saleFormErrors.totalPrice ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Price in Words</label>
                                        <Input value={saleForm.totalPriceWords} onChange={(e) => setSaleForm({ ...saleForm, totalPriceWords: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Deposit Amount</label>
                                        <Input type="number" value={saleForm.depositAmount} onChange={(e) => setSaleForm({ ...saleForm, depositAmount: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Deposit Date</label>
                                        <Input type="date" value={saleForm.depositDate} onChange={(e) => setSaleForm({ ...saleForm, depositDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Remaining Amount</label>
                                        <Input type="number" value={saleForm.remainingAmount} onChange={(e) => setSaleForm({ ...saleForm, remainingAmount: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Remaining Due Date</label>
                                        <Input type="date" value={saleForm.remainingDueDate} onChange={(e) => setSaleForm({ ...saleForm, remainingDueDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Final Payment</label>
                                        <Input type="number" value={saleForm.finalPaymentAmount} onChange={(e) => setSaleForm({ ...saleForm, finalPaymentAmount: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Construction Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3">Construction Timeline</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                                        <Input type="date" value={saleForm.constructionStartDate} onChange={(e) => setSaleForm({ ...saleForm, constructionStartDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                                        <Input type="date" value={saleForm.constructionEndDate} onChange={(e) => setSaleForm({ ...saleForm, constructionEndDate: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                                        <textarea
                                            value={saleForm.notes}
                                            onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none h-20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setIsSaleOpen(false)} disabled={isSubmittingSale}>Cancel</Button>
                            <Button onClick={handleCreateSale} disabled={isSubmittingSale} className="bg-[#cea26e] hover:bg-[#c49b63]">
                                {isSubmittingSale ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Generate & Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete Contract</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground">
                            Are you sure you want to delete <span className="font-semibold text-foreground">{deletingContract?.contractNumber}</span>? This action cannot be undone.
                        </p>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
