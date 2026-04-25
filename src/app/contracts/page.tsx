'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Plus, FileCheck, Download, Trash2, X, Building, ChevronDown,
    FileText, Users, Loader2, Search, CheckCircle, AlertCircle, MapPin,
    Pencil, Paperclip, Eye
} from 'lucide-react';
import { numberToArabicWords } from '@/lib/arabicWords';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContractRowSkeleton } from '@/components/ui/skeleton';

interface Customer {
    id: string;
    customerId: string;
    name: string;
    email: string;
    phone: string;
    idNumber: string;
    address: string;
}

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
    landlordPhone?: string;
    landlordCivilId?: string;
    tenantName: string;
    tenantIdPassport: string;
    tenantLabourCard?: string;
    tenantPhone: string;
    tenantEmail?: string;
    tenantSponsor?: string;
    tenantCR?: string;
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
    validFrom: string;
    validTo: string;
    agreementPeriod?: string;
    agreementPeriodUnit?: 'months' | 'years';
    monthlyRent: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    landlordSignature?: string;
    landlordSignDate?: string;
    tenantSignature?: string;
    tenantSignDate?: string;
    notes?: string;
    paymentTiming?: 'advance' | 'deferred';
    paymentMonths?: number;
    createdAt: string;
}

interface SaleContractAttachment {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: string;
}

interface SaleContractInstallment {
    id?: string;
    label?: string;
    amount: number;
    amountWords?: string;
    dueDate?: string;
    order: number;
}

interface SaleContract {
    id: string;
    contractNumber: string;
    contractType: 'sale';
    status: 'signed' | 'draft';
    projectId?: string;
    projectName?: string;
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
    propertyBuiltUpArea?: string;
    propertyDistrictNumber?: string;
    propertyStreetNumber?: string;
    propertyLocation?: string;
    propertyMapNumber?: string;
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
    attachments?: SaleContractAttachment[];
    installments?: SaleContractInstallment[];
    createdAt: string;
}

type Contract = RentalContract | SaleContract;

// Initial form states
const initialRentalForm = {
    landlordName: 'Telal Al-Bidaya LLC',
    landlordCR: '1603540',
    landlordPOBox: '500',
    landlordPostalCode: '316',
    landlordAddress: 'Muscat, Sultanate of Oman',
    landlordPhone: '99371889 / 91939730',
    landlordCivilId: '',
    tenantName: '',
    tenantIdPassport: '',
    tenantLabourCard: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantSponsor: '',
    tenantCR: '',
    tenantAddress: '',
    propertyLandNumber: '',
    propertyArea: '',
    propertyBuiltUpArea: '',
    propertyDistrictNumber: '',
    propertyStreetNumber: '',
    propertyLocation: '',
    propertyMapNumber: '',
    propertyBuildingName: '',
    propertyApartmentNumber: '',
    propertyFloorNumber: '',
    validFrom: '',
    validTo: '',
    agreementPeriod: '',
    agreementPeriodUnit: 'months' as 'months' | 'years',
    monthlyRent: '',
    paymentFrequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    landlordSignature: '',
    landlordSignDate: '',
    tenantSignature: '',
    tenantSignDate: '',
    notes: '',
    paymentTiming: 'advance' as 'advance' | 'deferred',
    paymentMonths: '',
};

const initialSaleForm = {
    projectId: '',
    sellerNationalId: '1603540',
    sellerName: 'Telal Al-Bidaya LLC',
    sellerCR: '1603540',
    sellerNationality: 'Omani',
    sellerAddress: 'Muscat, Sultanate of Oman',
    sellerPhone: '+968 9917 1889',
    buyerNationalId: '',
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
    propertyBuiltUpArea: '',
    propertyDistrictNumber: '',
    propertyStreetNumber: '',
    propertyLocation: '',
    propertyMapNumber: '',
    totalPrice: '',
    totalPriceWords: '',
    depositAmount: '',
    depositAmountWords: '',
    depositDate: '',
    remainingAmount: '',
    remainingAmountWords: '',
    remainingDueDate: '',
    finalPaymentAmount: '',
    finalPaymentWords: '',
    constructionStartDate: '',
    constructionEndDate: '',
    contractNotes: '',
    notes: '',
    sellerSignature: '',
    buyerSignature: '',
};

export default function ContractsPage() {
    const { t, language } = useLanguage();
    const [rentalContracts, setRentalContracts] = useState<RentalContract[]>([]);
    const [saleContracts, setSaleContracts] = useState<SaleContract[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'rental' | 'sale'>('all');

    // Rental: property selector (rentals only — fetches /api/properties)
    const [rentalProperties, setRentalProperties] = useState<any[]>([]);
    const [selectedRentalPropertyId, setSelectedRentalPropertyId] = useState('');

    // Sale: project + unit selector
    const [saleProjects, setSaleProjects] = useState<any[]>([]);
    const [saleProjectUnits, setSaleProjectUnits] = useState<any[]>([]);
    const [selectedSaleProjectId, setSelectedSaleProjectId] = useState('');
    const [selectedSaleUnitId, setSelectedSaleUnitId] = useState('');
    const [loadingSaleUnits, setLoadingSaleUnits] = useState(false);

    // Customer selector state
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    // Editing state
    const [editingContractId, setEditingContractId] = useState<string | null>(null);
    const [editingContractType, setEditingContractType] = useState<'rental' | 'sale' | null>(null);

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

    // Project selector for sale form
    const [saleProjectDropdownOpen, setSaleProjectDropdownOpen] = useState(false);
    const [saleProjectSearch, setSaleProjectSearch] = useState('');

    // Sale installments state
    const [installmentCount, setInstallmentCount] = useState<number>(1);
    const [installments, setInstallments] = useState<Array<{
        id?: string;
        amount: string;
        amountWords: string;
        dueDate: string;
        notes: string;
        order: number;
    }>>([{ amount: '', amountWords: '', dueDate: '', notes: '', order: 0 }]);

    const updateInstallmentCount = (count: number) => {
        const n = Math.max(1, Math.min(50, count));
        setInstallmentCount(n);
        setInstallments(prev => {
            const next = [...prev];
            while (next.length < n) {
                next.push({ amount: '', amountWords: '', dueDate: '', notes: '', order: next.length });
            }
            return next.slice(0, n).map((item, i) => ({ ...item, order: i }));
        });
    };

    const updateInstallment = (index: number, field: string, value: string) => {
        setInstallments(prev => {
            const next = [...prev];
            const updated = { ...next[index], [field]: value };
            if (field === 'amount') {
                const num = parseFloat(value);
                updated.amountWords = isNaN(num) || num === 0 ? '' : numberToArabicWords(num);
            }
            next[index] = updated;
            return next;
        });
    };

    // Sale attachments state
    const [saleAttachmentFiles, setSaleAttachmentFiles] = useState<File[]>([]);
    const saleAttachmentInputRef = useRef<HTMLInputElement>(null);

    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // PDF generation state
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Fetch contracts from API
    const fetchContracts = async () => {
        try {
            setLoading(true);
            const [contractsRes, customersRes, propertiesRes, projectsRes] = await Promise.all([
                fetch('/api/contracts'),
                fetch('/api/customers'),
                fetch('/api/properties'),
                fetch('/api/projects'),
            ]);
            
            const result = await contractsRes.json();
            const customersResult = await customersRes.json();
            const propertiesResult = await propertiesRes.json();
            const projectsResult = await projectsRes.json();

            if (customersResult.data) {
                const transformedCusts: Customer[] = customersResult.data.map((c: any) => ({
                    id: c.id,
                    customerId: 'CUS-' + c.id.substring(0, 4).toUpperCase(),
                    name: c.name,
                    email: c.email || '',
                    phone: c.phone || '',
                    idNumber: c.idNumber1 || '',
                    address: c.address || '',
                }));
                setCustomers(transformedCusts);
            }

            if (propertiesResult.data) {
                setRentalProperties(propertiesResult.data.filter((p: any) => p.status !== 'sold'));
            }

            if (projectsResult.data) {
                setSaleProjects(projectsResult.data);
            }

            if (result.data) {
                // API returns { data: { rental: [...], sale: [...] } }
                const rentals: RentalContract[] = (result.data.rental || []).map((c: any) => ({
                    id: c.id,
                    contractNumber: c.contractNumber || 'RC-' + c.id.substring(0, 4).toUpperCase(),
                    contractType: 'rental' as const,
                    status: c.status || 'signed',
                    // Landlord
                    landlordName: c.landlordName || 'Telal Al-Bidaya LLC',
                    landlordCR: c.landlordCR || '',
                    landlordPOBox: c.landlordPOBox || '',
                    landlordPostalCode: c.landlordPostalCode || '',
                    landlordAddress: c.landlordAddress || '',
                    landlordPhone: c.landlordPhone || '',
                    landlordCivilId: c.landlordCivilId || '',
                    // Tenant
                    tenantName: c.tenantName || c.tenant?.name || '',
                    tenantIdPassport: c.tenantIdPassport || '',
                    tenantLabourCard: c.tenantLabourCard || '',
                    tenantPhone: c.tenantPhone || '',
                    tenantEmail: c.tenantEmail || '',
                    tenantSponsor: c.tenantSponsor || '',
                    tenantCR: c.tenantCR || '',
                    tenantAddress: c.tenantAddress || '',
                    // Property
                    propertyLandNumber: c.propertyLandNumber || '',
                    propertyArea: c.propertyArea || '',
                    propertyBuiltUpArea: c.propertyBuiltUpArea || '',
                    propertyDistrictNumber: c.propertyDistrictNumber || '',
                    propertyStreetNumber: c.propertyStreetNumber || '',
                    propertyLocation: c.propertyLocation || '',
                    propertyMapNumber: c.propertyMapNumber || '',
                    propertyBuildingName: c.propertyBuildingName || '',
                    propertyApartmentNumber: c.propertyApartmentNumber || '',
                    propertyFloorNumber: c.propertyFloorNumber || '',
                    // Contract Terms
                    validFrom: c.validFrom ? new Date(c.validFrom).toISOString().split('T')[0] : '',
                    validTo: c.validTo ? new Date(c.validTo).toISOString().split('T')[0] : '',
                    agreementPeriod: c.agreementPeriod || '',
                    agreementPeriodUnit: c.agreementPeriodUnit || 'months',
                    monthlyRent: c.monthlyRent || 0,
                    paymentFrequency: c.paymentFrequency || 'monthly',
                    // Signatures
                    landlordSignature: c.landlordSignature || '',
                    landlordSignDate: c.landlordSignDate ? new Date(c.landlordSignDate).toISOString().split('T')[0] : '',
                    tenantSignature: c.tenantSignature || '',
                    tenantSignDate: c.tenantSignDate ? new Date(c.tenantSignDate).toISOString().split('T')[0] : '',
                    notes: c.notes || '',
                    paymentTiming: (c.paymentTiming as 'advance' | 'deferred') || 'advance',
                    paymentMonths: c.paymentMonths || undefined,
                    createdAt: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
                }));

                const sales: SaleContract[] = (result.data.sale || []).map((c: any) => ({
                    id: c.id,
                    contractNumber: c.contractNumber || 'SC-' + c.id.substring(0, 4).toUpperCase(),
                    contractType: 'sale' as const,
                    status: c.status || 'signed',
                    projectId: c.projectId || '',
                    projectName: c.project?.name || '',
                    sellerNationalId: c.sellerNationalId || '',
                    sellerName: c.sellerName || 'Telal Al-Bidaya LLC',
                    sellerCR: c.sellerCR || '',
                    sellerNationality: c.sellerNationality || '',
                    sellerAddress: c.sellerAddress || '',
                    sellerPhone: c.sellerPhone || '',
                    buyerId: c.buyerId,
                    buyerNationalId: c.buyerNationalId || '',
                    buyerName: c.buyerName || c.buyer?.name || '',
                    buyerCR: c.buyerCR || '',
                    buyerNationality: c.buyerNationality || '',
                    buyerAddress: c.buyerAddress || '',
                    buyerPhone: c.buyerPhone || '',
                    propertyWilaya: c.propertyWilaya || '',
                    propertyGovernorate: c.propertyGovernorate || '',
                    propertyPhase: c.propertyPhase || '',
                    propertyLandNumber: c.propertyLandNumber || '',
                    propertyArea: c.propertyArea || '',
                    propertyBuiltUpArea: c.propertyBuiltUpArea || '',
                    propertyDistrictNumber: c.propertyDistrictNumber || '',
                    propertyStreetNumber: c.propertyStreetNumber || '',
                    propertyLocation: c.propertyLocation || '',
                    propertyMapNumber: c.propertyMapNumber || '',
                    totalPrice: c.totalPrice || 0,
                    totalPriceWords: c.totalPriceWords || '',
                    depositAmount: c.depositAmount || 0,
                    depositAmountWords: c.depositAmountWords || '',
                    depositDate: c.depositDate ? new Date(c.depositDate).toISOString().split('T')[0] : '',
                    remainingAmount: c.remainingAmount || 0,
                    remainingAmountWords: c.remainingAmountWords || '',
                    remainingDueDate: c.remainingDueDate ? new Date(c.remainingDueDate).toISOString().split('T')[0] : '',
                    finalPaymentAmount: c.finalPaymentAmount || 0,
                    finalPaymentWords: c.finalPaymentWords || '',
                    constructionStartDate: c.constructionStartDate ? new Date(c.constructionStartDate).toISOString().split('T')[0] : '',
                    constructionEndDate: c.constructionEndDate ? new Date(c.constructionEndDate).toISOString().split('T')[0] : '',
                    notes: c.notes || '',
                    sellerSignature: c.sellerSignature || '',
                    buyerSignature: c.buyerSignature || '',
                    attachments: c.attachments || [],
                    installments: c.installments || [],
                    createdAt: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
                }));

                setRentalContracts(rentals);
                setSaleContracts(sales);
            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
            showToast('Failed to load contracts', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Rental: auto-fill form when a property is selected
    const handleRentalPropertySelect = (propertyId: string) => {
        setSelectedRentalPropertyId(propertyId);
        const prop = rentalProperties.find((p: any) => p.id === propertyId);
        if (!prop) return;
        setRentalForm(prev => ({
            ...prev,
            propertyBuildingName: prop.projectName || prop.title || prev.propertyBuildingName,
            propertyApartmentNumber: prop.unitNumber || prop.title || prev.propertyApartmentNumber,
            propertyFloorNumber: prop.floor ? String(prop.floor) : prev.propertyFloorNumber,
            propertyLocation: prop.location || prop.area || prev.propertyLocation,
            monthlyRent: prop.price ? String(prop.price) : prev.monthlyRent,
        }));
    };

    // Sale: load units when a project is selected
    const handleSaleProjectSelect = async (projectId: string) => {
        setSelectedSaleProjectId(projectId);
        setSelectedSaleUnitId('');
        setSaleProjectUnits([]);
        setSaleForm(prev => ({ ...prev, projectId }));
        if (!projectId) return;
        setLoadingSaleUnits(true);
        try {
            const res = await fetch(`/api/properties?projectId=${projectId}`);
            const data = await res.json();
            if (data.data) setSaleProjectUnits(data.data);
        } catch { /* silent */ } finally {
            setLoadingSaleUnits(false);
        }
        // Auto-fill wilaya/location from project
        const project = saleProjects.find((p: any) => p.id === projectId);
        if (project) {
            setSaleForm(prev => ({
                ...prev,
                projectId,
                propertyWilaya: project.city || prev.propertyWilaya,
                propertyLocation: project.location || project.address || prev.propertyLocation,
            }));
        }
    };

    // Sale: auto-fill form when a unit is selected
    const handleSaleUnitSelect = (unitId: string) => {
        setSelectedSaleUnitId(unitId);
        const unit = saleProjectUnits.find((u: any) => u.id === unitId);
        if (!unit) return;
        setSaleForm(prev => ({
            ...prev,
            propertyPhase: unit.unitNumber || prev.propertyPhase,
            totalPrice: unit.price ? String(unit.price) : prev.totalPrice,
        }));
    };

    useEffect(() => {
        fetchContracts();
    }, []);

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

    // Open edit dialog for an existing contract
    const handleEditContract = (contract: Contract) => {
        if (contract.contractType === 'rental') {
            const rc = contract as RentalContract;
            setEditingContractId(rc.id);
            setEditingContractType('rental');
            setRentalForm({
                landlordName: rc.landlordName || '',
                landlordCR: rc.landlordCR || '',
                landlordPOBox: rc.landlordPOBox || '',
                landlordPostalCode: rc.landlordPostalCode || '',
                landlordAddress: rc.landlordAddress || '',
                landlordPhone: rc.landlordPhone || '',
                landlordCivilId: rc.landlordCivilId || '',
                tenantName: rc.tenantName || '',
                tenantIdPassport: rc.tenantIdPassport || '',
                tenantLabourCard: rc.tenantLabourCard || '',
                tenantPhone: rc.tenantPhone || '',
                tenantEmail: rc.tenantEmail || '',
                tenantSponsor: rc.tenantSponsor || '',
                tenantCR: rc.tenantCR || '',
                tenantAddress: rc.tenantAddress || '',
                propertyLandNumber: rc.propertyLandNumber || '',
                propertyArea: rc.propertyArea || '',
                propertyBuiltUpArea: rc.propertyBuiltUpArea || '',
                propertyDistrictNumber: rc.propertyDistrictNumber || '',
                propertyStreetNumber: rc.propertyStreetNumber || '',
                propertyLocation: rc.propertyLocation || '',
                propertyMapNumber: rc.propertyMapNumber || '',
                propertyBuildingName: rc.propertyBuildingName || '',
                propertyApartmentNumber: rc.propertyApartmentNumber || '',
                propertyFloorNumber: rc.propertyFloorNumber || '',
                validFrom: rc.validFrom || '',
                validTo: rc.validTo || '',
                agreementPeriod: rc.agreementPeriod || '',
                agreementPeriodUnit: (rc.agreementPeriodUnit as 'months' | 'years') || 'months',
                monthlyRent: rc.monthlyRent ? String(rc.monthlyRent) : '',
                paymentFrequency: (rc.paymentFrequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly',
                landlordSignature: rc.landlordSignature || '',
                landlordSignDate: rc.landlordSignDate || '',
                tenantSignature: rc.tenantSignature || '',
                tenantSignDate: rc.tenantSignDate || '',
                notes: rc.notes || '',
                paymentTiming: (rc.paymentTiming as 'advance' | 'deferred') || 'advance',
                paymentMonths: rc.paymentMonths ? String(rc.paymentMonths) : '',
            });
            setIsRentalOpen(true);
        } else {
            const sc = contract as SaleContract;
            setEditingContractId(sc.id);
            setEditingContractType('sale');
            setSaleForm({
                projectId: sc.projectId || '',
                sellerNationalId: sc.sellerNationalId || '1603540',
                sellerName: sc.sellerName || 'Telal Al-Bidaya LLC',
                sellerCR: sc.sellerCR || '1603540',
                sellerNationality: sc.sellerNationality || 'Omani',
                sellerAddress: sc.sellerAddress || 'Muscat, Sultanate of Oman',
                sellerPhone: sc.sellerPhone || '+968 9917 1889',
                buyerNationalId: sc.buyerNationalId || '',
                buyerName: sc.buyerName || '',
                buyerCR: sc.buyerCR || '',
                buyerNationality: sc.buyerNationality || '',
                buyerAddress: sc.buyerAddress || '',
                buyerPhone: sc.buyerPhone || '',
                propertyWilaya: sc.propertyWilaya || '',
                propertyGovernorate: sc.propertyGovernorate || '',
                propertyPhase: sc.propertyPhase || '',
                propertyLandNumber: sc.propertyLandNumber || '',
                propertyArea: sc.propertyArea || '',
                propertyBuiltUpArea: sc.propertyBuiltUpArea || '',
                propertyDistrictNumber: sc.propertyDistrictNumber || '',
                propertyStreetNumber: sc.propertyStreetNumber || '',
                propertyLocation: sc.propertyLocation || '',
                propertyMapNumber: sc.propertyMapNumber || '',
                totalPrice: sc.totalPrice ? String(sc.totalPrice) : '',
                totalPriceWords: sc.totalPriceWords || '',
                depositAmount: sc.depositAmount ? String(sc.depositAmount) : '',
                depositAmountWords: sc.depositAmountWords || '',
                depositDate: sc.depositDate || '',
                remainingAmount: sc.remainingAmount ? String(sc.remainingAmount) : '',
                remainingAmountWords: sc.remainingAmountWords || '',
                remainingDueDate: sc.remainingDueDate || '',
                finalPaymentAmount: sc.finalPaymentAmount ? String(sc.finalPaymentAmount) : '',
                finalPaymentWords: sc.finalPaymentWords || '',
                constructionStartDate: sc.constructionStartDate || '',
                constructionEndDate: sc.constructionEndDate || '',
                contractNotes: (sc as any).contractNotes || '',
                notes: sc.notes || '',
                sellerSignature: sc.sellerSignature || '',
                buyerSignature: sc.buyerSignature || '',
            });
            setSaleAttachmentFiles([]);
            // Load existing installments
            if (sc.installments && sc.installments.length > 0) {
                const loaded = sc.installments.map((inst, i) => ({
                    id: inst.id,
                    amount: inst.amount ? String(inst.amount) : '',
                    amountWords: inst.amountWords || (inst.amount ? numberToArabicWords(inst.amount) : ''),
                    dueDate: inst.dueDate ? inst.dueDate.substring(0, 10) : '',
                    notes: inst.label || '',
                    order: i,
                }));
                setInstallments(loaded);
                setInstallmentCount(loaded.length);
            } else {
                setInstallments([{ amount: '', amountWords: '', dueDate: '', notes: '', order: 0 }]);
                setInstallmentCount(1);
            }
            setIsSaleOpen(true);
        }
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

        try {
            const isEditing = !!editingContractId && editingContractType === 'rental';
            const url = isEditing ? `/api/contracts/${editingContractId}?type=rental` : '/api/contracts';
            const method = isEditing ? 'PUT' : 'POST';

            const apiResponse = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractType: 'rental',
                    status: 'signed',
                    ...rentalForm,
                    monthlyRent: parseFloat(rentalForm.monthlyRent),
                    paymentMonths: rentalForm.paymentMonths ? parseInt(rentalForm.paymentMonths) : null,
                }),
            });

            if (!apiResponse.ok) {
                const error = await apiResponse.json();
                throw new Error(error.error || 'Failed to save contract');
            }

            const result = await apiResponse.json();
            const savedContract = result.data;
            const contractNumber = savedContract.contractNumber || 'RC-' + savedContract.id.substring(0, 4).toUpperCase();

            // Generate PDF
            const pdfResponse = await fetch('/api/generate-rental-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contract: { ...rentalForm, ...savedContract, contractNumber } }),
            });

            if (pdfResponse.ok) {
                const blob = await pdfResponse.blob();
                const url2 = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url2;
                link.download = `${contractNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url2);
            } else {
                showToast('Contract saved but PDF generation failed', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to save contract', 'error');
            setIsSubmittingRental(false);
            return;
        }

        showToast(editingContractId ? 'Contract updated successfully' : 'Contract created successfully');
        setIsRentalOpen(false);
        setRentalForm(initialRentalForm);
        setEditingContractId(null);
        setEditingContractType(null);
        setIsSubmittingRental(false);
        fetchContracts();
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

        try {
            const isEditing = !!editingContractId && editingContractType === 'sale';
            const url = isEditing ? `/api/contracts/${editingContractId}?type=sale` : '/api/contracts';
            const method = isEditing ? 'PUT' : 'POST';

            const apiResponse = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractType: 'sale',
                    status: 'signed',
                    ...saleForm,
                    totalPrice: parseFloat(saleForm.totalPrice) || 0,
                    installments: installments
                        .filter(inst => inst.amount && parseFloat(inst.amount) > 0)
                        .map((inst, i) => ({
                            id: inst.id,
                            amount: parseFloat(inst.amount),
                            amountWords: inst.amountWords || '',
                            dueDate: inst.dueDate || null,
                            label: inst.notes || null,
                            order: i,
                        })),
                }),
            });

            if (!apiResponse.ok) {
                const error = await apiResponse.json();
                throw new Error(error.error || 'Failed to save contract');
            }

            const result = await apiResponse.json();
            const savedContract = result.data;

            // Upload attachments if any
            if (saleAttachmentFiles.length > 0) {
                const attachFormData = new FormData();
                saleAttachmentFiles.forEach(f => attachFormData.append('files', f));
                await fetch(`/api/contracts/${savedContract.id}/documents?type=sale`, {
                    method: 'POST',
                    body: attachFormData,
                }).catch(() => showToast('Contract saved but some attachments failed to upload', 'error'));
            }

            // Generate PDF
            const contractNumber = savedContract.contractNumber || 'SC-' + savedContract.id.substring(0, 4).toUpperCase();
            const pdfInstallments = installments
                .filter(inst => inst.amount && parseFloat(inst.amount) > 0)
                .map((inst, i) => ({
                    amount: parseFloat(inst.amount),
                    amountWords: inst.amountWords || '',
                    dueDate: inst.dueDate || null,
                    label: inst.notes || `الدفعة ${i + 1}`,
                    order: i,
                }));
            const pdfResponse = await fetch('/api/generate-sale-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract: {
                        ...saleForm,
                        ...savedContract,
                        contractNumber,
                        installments: pdfInstallments,
                        totalPriceWords: numberToArabicWords(parseFloat(saleForm.totalPrice) || 0),
                    }
                }),
            });

            if (pdfResponse.ok) {
                const blob = await pdfResponse.blob();
                const pdfUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `${contractNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(pdfUrl);
            } else {
                showToast('Contract saved but PDF generation failed', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to save contract', 'error');
            setIsSubmittingSale(false);
            return;
        }

        showToast(editingContractId ? 'Contract updated successfully' : 'Contract created successfully');
        setIsSaleOpen(false);
        setSaleForm(initialSaleForm);
        setSaleAttachmentFiles([]);
        setInstallments([{ amount: '', amountWords: '', dueDate: '', notes: '', order: 0 }]);
        setInstallmentCount(1);
        setEditingContractId(null);
        setEditingContractType(null);
        setIsSubmittingSale(false);
        fetchContracts();
    };

    // Delete handler
    const handleDelete = async () => {
        if (!deletingContract) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/contracts?id=${deletingContract.id}&type=${deletingContract.contractType}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete contract');
            }

            showToast('Contract deleted');
            setIsDeleteOpen(false);
            setDeletingContract(null);
            fetchContracts();
        } catch (error: any) {
            showToast(error.message || 'Failed to delete contract', 'error');
        } finally {
            setIsDeleting(false);
        }
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
                        <Button onClick={() => { setEditingContractId(null); setEditingContractType(null); setRentalForm(initialRentalForm); setIsRentalOpen(true); }} className="flex-1 sm:flex-none bg-[#cea26e] hover:bg-[#c49b63] text-white">
                            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            {t.contracts.rental}
                        </Button>
                        <Button onClick={() => { setEditingContractId(null); setEditingContractType(null); setSaleForm(initialSaleForm); setSaleAttachmentFiles([]); setIsSaleOpen(true); }} variant="outline" className="flex-1 sm:flex-none border-[#cea26e] text-[#cea26e] hover:bg-[#cea26e]/10">
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

                    <div className="flex flex-wrap gap-2">
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
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <ContractRowSkeleton key={i} />)
                    ) : filteredContracts.length === 0 ? (
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
                                        <a
                                            href={`/contracts/${contract.id}/view?type=${contract.contractType}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                            title="View Contract"
                                        >
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        </a>
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
                                            onClick={() => handleEditContract(contract)}
                                            className="p-2 hover:bg-[#cea26e]/10 text-muted-foreground hover:text-[#cea26e] rounded-lg transition-colors"
                                            title="Edit Contract"
                                        >
                                            <Pencil className="h-4 w-4" />
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
                <Dialog open={isRentalOpen} onOpenChange={(v) => { if (!v) { setIsRentalOpen(false); setEditingContractId(null); setEditingContractType(null); } }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingContractId && editingContractType === 'rental' ? 'Edit Rental Contract' : 'Create Rental Contract'}</DialogTitle>
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
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                                        <Input value={rentalForm.landlordPhone} onChange={(e) => setRentalForm({ ...rentalForm, landlordPhone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Civil ID / National ID</label>
                                        <Input value={rentalForm.landlordCivilId} onChange={(e) => setRentalForm({ ...rentalForm, landlordCivilId: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                                        <Input value={rentalForm.landlordAddress} onChange={(e) => setRentalForm({ ...rentalForm, landlordAddress: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Tenant Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Users className="h-4 w-4 text-[#cea26e]" />
                                        Tenant (Second Party)
                                    </h3>
                                </div>
                                
                                {/* Tenant Selector */}
                                <div className="mb-4 relative">
                                    <label className="text-xs font-semibold text-[#cea26e] mb-1 block">Select Existing Tenant (Auto-fill)</label>
                                    <button
                                        type="button"
                                        onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-[#cea26e]/30 bg-background text-left text-sm h-10 hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Search className="h-3 w-3" /> Search and select a tenant...
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                    {customerDropdownOpen && (
                                        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
                                            <div className="p-2 border-b border-border">
                                                <Input
                                                    placeholder="Search by name, ID, or phone..."
                                                    value={customerSearch}
                                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                                    className="h-8"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="max-h-48 overflow-y-auto">
                                                {customers.filter(c => 
                                                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                                                    c.idNumber.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                    c.phone.includes(customerSearch)
                                                ).length === 0 ? (
                                                    <p className="p-3 text-sm text-muted-foreground text-center">No customers found</p>
                                                ) : (
                                                    customers.filter(c => 
                                                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                                                        c.idNumber.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                        c.phone.includes(customerSearch)
                                                    ).map(customer => (
                                                        <button
                                                            key={customer.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setRentalForm({
                                                                    ...rentalForm,
                                                                    tenantName: customer.name,
                                                                    tenantIdPassport: customer.idNumber,
                                                                    tenantPhone: customer.phone,
                                                                    tenantEmail: customer.email,
                                                                    tenantAddress: customer.address
                                                                });
                                                                
                                                                // Clear errors for auto-filled fields
                                                                const newErrors = { ...rentalFormErrors };
                                                                if (customer.name) newErrors.tenantName = false;
                                                                if (customer.idNumber) newErrors.tenantIdPassport = false;
                                                                if (customer.phone) newErrors.tenantPhone = false;
                                                                setRentalFormErrors(newErrors);
                                                                
                                                                showToast(`Auto-filled details for ${customer.name}`, 'success');
                                                                setCustomerDropdownOpen(false);
                                                                setCustomerSearch('');
                                                            }}
                                                            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b border-border/50 text-left"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium">{customer.name}</p>
                                                                <p className="text-xs text-muted-foreground">{customer.idNumber} • {customer.phone}</p>
                                                            </div>
                                                            <div className="text-xs bg-[#cea26e]/10 text-[#cea26e] px-2 py-1 rounded">
                                                                Select
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-3">
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
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                                        <Input value={rentalForm.tenantAddress} onChange={(e) => setRentalForm({ ...rentalForm, tenantAddress: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Property Data Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-[#cea26e]" />
                                    Property Data (أمانة بيانات العقار)
                                </h3>
                                {/* Quick-fill from existing properties */}
                                <div className="mb-3">
                                    <label className="text-xs font-semibold text-[#cea26e] mb-1 block">Quick-fill from Property (Auto-fill)</label>
                                    <select
                                        value={selectedRentalPropertyId}
                                        onChange={(e) => handleRentalPropertySelect(e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-[#cea26e]/30 bg-background text-sm"
                                    >
                                        <option value="">— Select a property to auto-fill —</option>
                                        {rentalProperties.map((p: any) => (
                                            <option key={p.id} value={p.id}>
                                                {p.title || p.unitNumber || p.id} {p.location ? `• ${p.location}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Building Name / اسم المبنى</label>
                                        <Input value={rentalForm.propertyBuildingName} onChange={(e) => setRentalForm({ ...rentalForm, propertyBuildingName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Building Number / رقم المبنى</label>
                                        <Input value={rentalForm.propertyApartmentNumber} onChange={(e) => setRentalForm({ ...rentalForm, propertyApartmentNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Road / Street No / رقم الطريق / السكة</label>
                                        <Input value={rentalForm.propertyStreetNumber} onChange={(e) => setRentalForm({ ...rentalForm, propertyStreetNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Complex Number / رقم المجمع</label>
                                        <Input value={rentalForm.propertyDistrictNumber} onChange={(e) => setRentalForm({ ...rentalForm, propertyDistrictNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Land Number</label>
                                        <Input value={rentalForm.propertyLandNumber} onChange={(e) => setRentalForm({ ...rentalForm, propertyLandNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Area (sqm)</label>
                                        <Input value={rentalForm.propertyArea} onChange={(e) => setRentalForm({ ...rentalForm, propertyArea: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Built-up Area (sqm)</label>
                                        <Input value={rentalForm.propertyBuiltUpArea} onChange={(e) => setRentalForm({ ...rentalForm, propertyBuiltUpArea: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                                        <Input value={rentalForm.propertyLocation} onChange={(e) => setRentalForm({ ...rentalForm, propertyLocation: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Map/Plan Number</label>
                                        <Input value={rentalForm.propertyMapNumber} onChange={(e) => setRentalForm({ ...rentalForm, propertyMapNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Floor Number / رقم الطابق</label>
                                        <Input value={rentalForm.propertyFloorNumber} onChange={(e) => setRentalForm({ ...rentalForm, propertyFloorNumber: e.target.value })} />
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
                                        <div className="flex gap-2">
                                            <Input value={rentalForm.agreementPeriod} onChange={(e) => setRentalForm({ ...rentalForm, agreementPeriod: e.target.value })} placeholder="e.g., 12" className="flex-1" />
                                            <select
                                                value={rentalForm.agreementPeriodUnit}
                                                onChange={(e) => setRentalForm({ ...rentalForm, agreementPeriodUnit: e.target.value as 'months' | 'years' })}
                                                className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                                            >
                                                <option value="months">Months / شهر</option>
                                                <option value="years">Years / سنة</option>
                                            </select>
                                        </div>
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
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Payment Type / نوع الدفع</label>
                                        <select
                                            value={rentalForm.paymentTiming}
                                            onChange={(e) => setRentalForm({ ...rentalForm, paymentTiming: e.target.value as 'advance' | 'deferred' })}
                                            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                                        >
                                            <option value="advance">Advance (مقدم)</option>
                                            <option value="deferred">Deferred (مؤخر)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Number of Months / عدد الأشهر</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={rentalForm.paymentMonths}
                                            onChange={(e) => setRentalForm({ ...rentalForm, paymentMonths: e.target.value })}
                                            placeholder="e.g., 3"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Notes / ملاحظات</label>
                                        <textarea
                                            value={rentalForm.notes}
                                            onChange={(e) => setRentalForm({ ...rentalForm, notes: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none h-20"
                                            placeholder="Any additional notes..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => { setIsRentalOpen(false); setEditingContractId(null); setEditingContractType(null); }} disabled={isSubmittingRental}>Cancel</Button>
                            <Button onClick={handleCreateRental} disabled={isSubmittingRental} className="bg-[#cea26e] hover:bg-[#c49b63]">
                                {isSubmittingRental ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {editingContractId && editingContractType === 'rental' ? 'Save Changes' : 'Generate & Save'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Sale Contract Dialog */}
                <Dialog open={isSaleOpen} onOpenChange={(v) => { if (!v) { setIsSaleOpen(false); setEditingContractId(null); setEditingContractType(null); } }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingContractId && editingContractType === 'sale' ? 'Edit Sale Contract' : 'Create Sale Contract'}</DialogTitle>
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
                                        <Input value={saleForm.sellerNationalId} onChange={(e) => setSaleForm({ ...saleForm, sellerNationalId: e.target.value })} />
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
                                        <Input value={saleForm.buyerNationalId} onChange={(e) => setSaleForm({ ...saleForm, buyerNationalId: e.target.value })} />
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
                                {/* Quick-fill from projects/units */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="text-xs font-semibold text-[#cea26e] mb-1 block">Project (Auto-fill)</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setSaleProjectDropdownOpen(!saleProjectDropdownOpen)}
                                                className="w-full flex items-center justify-between rounded-md border border-[#cea26e]/30 bg-background px-3 py-2 text-sm text-left"
                                            >
                                                <span className={selectedSaleProjectId ? 'text-foreground' : 'text-muted-foreground'}>
                                                    {saleProjects.find((p: any) => p.id === selectedSaleProjectId)?.name || '— Select Project —'}
                                                </span>
                                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${saleProjectDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {saleProjectDropdownOpen && (
                                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                                    <div className="p-2 border-b border-border">
                                                        <div className="relative">
                                                            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                                            <Input
                                                                placeholder="Search projects..."
                                                                value={saleProjectSearch}
                                                                onChange={(e) => setSaleProjectSearch(e.target.value)}
                                                                className="pl-8 h-8 text-xs"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto">
                                                        <button
                                                            type="button"
                                                            onClick={() => { handleSaleProjectSelect(''); setSaleProjectDropdownOpen(false); setSaleProjectSearch(''); }}
                                                            className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/50"
                                                        >
                                                            — None —
                                                        </button>
                                                        {saleProjects
                                                            .filter((p: any) => p.name.toLowerCase().includes(saleProjectSearch.toLowerCase()))
                                                            .map((p: any) => (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    onClick={() => { handleSaleProjectSelect(p.id); setSaleProjectDropdownOpen(false); setSaleProjectSearch(''); }}
                                                                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50 ${selectedSaleProjectId === p.id ? 'bg-[#cea26e]/10 font-medium' : ''}`}
                                                                >
                                                                    <span>{p.name}</span>
                                                                    {selectedSaleProjectId === p.id && <CheckCircle className="h-4 w-4 text-[#cea26e]" />}
                                                                </button>
                                                            ))
                                                        }
                                                        {saleProjects.filter((p: any) => p.name.toLowerCase().includes(saleProjectSearch.toLowerCase())).length === 0 && (
                                                            <div className="px-3 py-4 text-center text-sm text-muted-foreground">No projects found</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[#cea26e] mb-1 block">Unit (Auto-fill)</label>
                                        <select
                                            value={selectedSaleUnitId}
                                            onChange={(e) => handleSaleUnitSelect(e.target.value)}
                                            disabled={!selectedSaleProjectId || loadingSaleUnits}
                                            className="w-full px-3 py-2 rounded-md border border-[#cea26e]/30 bg-background text-sm disabled:opacity-50"
                                        >
                                            <option value="">— Select Unit —</option>
                                            {saleProjectUnits.map((u: any) => (
                                                <option key={u.id} value={u.id}>{u.unitNumber || u.title} {u.price ? `• OMR ${u.price}` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
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
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Built-up Area (sqm)</label>
                                        <Input value={saleForm.propertyBuiltUpArea} onChange={(e) => setSaleForm({ ...saleForm, propertyBuiltUpArea: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">District Number</label>
                                        <Input value={saleForm.propertyDistrictNumber} onChange={(e) => setSaleForm({ ...saleForm, propertyDistrictNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Street/Block Number</label>
                                        <Input value={saleForm.propertyStreetNumber} onChange={(e) => setSaleForm({ ...saleForm, propertyStreetNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                                        <Input value={saleForm.propertyLocation} onChange={(e) => setSaleForm({ ...saleForm, propertyLocation: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Map/Plan Number</label>
                                        <Input value={saleForm.propertyMapNumber} onChange={(e) => setSaleForm({ ...saleForm, propertyMapNumber: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#cea26e]" />
                                    Payment Details
                                </h3>
                                {/* Total price */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Total Price (OMR) *</label>
                                        <Input
                                            type="number"
                                            value={saleForm.totalPrice}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const num = parseFloat(val);
                                                setSaleForm({
                                                    ...saleForm,
                                                    totalPrice: val,
                                                    totalPriceWords: isNaN(num) || num === 0 ? '' : numberToArabicWords(num),
                                                });
                                                if (saleFormErrors.totalPrice) setSaleFormErrors({ ...saleFormErrors, totalPrice: false });
                                            }}
                                            className={saleFormErrors.totalPrice ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Total Price in Words (auto)</label>
                                        <Input
                                            value={saleForm.totalPriceWords}
                                            onChange={(e) => setSaleForm({ ...saleForm, totalPriceWords: e.target.value })}
                                            placeholder="يُملأ تلقائياً"
                                            className="text-xs"
                                            dir="rtl"
                                        />
                                    </div>
                                </div>

                                {/* Installments */}
                                <div className="flex items-center gap-3 mb-3">
                                    <label className="text-xs font-semibold text-foreground whitespace-nowrap">Number of Installments</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={installmentCount}
                                        onChange={(e) => updateInstallmentCount(parseInt(e.target.value) || 1)}
                                        className="w-24"
                                    />
                                </div>

                                <div className="space-y-3">
                                    {installments.map((inst, idx) => (
                                        <div key={idx} className="border border-border rounded-md p-3 bg-background">
                                            <div className="text-xs font-semibold text-[#cea26e] mb-2">
                                                الدفعة {idx + 1}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Amount (OMR)</label>
                                                    <Input
                                                        type="number"
                                                        value={inst.amount}
                                                        onChange={(e) => updateInstallment(idx, 'amount', e.target.value)}
                                                        placeholder="0.000"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Amount in Arabic (auto)</label>
                                                    <Input
                                                        value={inst.amountWords}
                                                        onChange={(e) => updateInstallment(idx, 'amountWords', e.target.value)}
                                                        placeholder="يُملأ تلقائياً"
                                                        className="text-xs"
                                                        dir="rtl"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
                                                    <Input
                                                        type="date"
                                                        value={inst.dueDate}
                                                        onChange={(e) => updateInstallment(idx, 'dueDate', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                                                    <Input
                                                        value={inst.notes}
                                                        onChange={(e) => updateInstallment(idx, 'notes', e.target.value)}
                                                        placeholder="e.g. مقدم، دفعة أولى…"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                        <label className="text-xs font-semibold text-[#cea26e] mb-1 block">ملاحظات العقد (تظهر في العقد)</label>
                                        <textarea
                                            value={saleForm.contractNotes}
                                            onChange={(e) => setSaleForm({ ...saleForm, contractNotes: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-[#cea26e]/40 bg-background text-sm resize-none h-20"
                                            placeholder="مدة انتهاء المقاول من الإنشاءات وتجهيز المنزل..."
                                            dir="rtl"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">هذا الحقل يظهر في قسم ملاحظات العقد المطبوع</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">Internal Notes (not printed)</label>
                                        <textarea
                                            value={saleForm.notes}
                                            onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none h-16"
                                            placeholder="ملاحظات داخلية..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-[#cea26e]" />
                                    Attachments / المرفقات
                                </h3>
                                <input
                                    ref={saleAttachmentInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.doc,.docx,.xlsx,.xls"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setSaleAttachmentFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                {saleAttachmentFiles.length > 0 && (
                                    <div className="space-y-1 mb-3">
                                        {saleAttachmentFiles.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 rounded-md bg-background border border-border text-sm">
                                                <span className="truncate flex-1">{f.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSaleAttachmentFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                    className="ml-2 text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button type="button" variant="outline" size="sm" onClick={() => saleAttachmentInputRef.current?.click()}>
                                    <Paperclip className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                                    Add Files
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">PDF, images, Word, Excel accepted</p>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => { setIsSaleOpen(false); setEditingContractId(null); setEditingContractType(null); setInstallments([{ amount: '', amountWords: '', dueDate: '', notes: '', order: 0 }]); setInstallmentCount(1); }} disabled={isSubmittingSale}>Cancel</Button>
                            <Button onClick={handleCreateSale} disabled={isSubmittingSale} className="bg-[#cea26e] hover:bg-[#c49b63]">
                                {isSubmittingSale ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {editingContractId && editingContractType === 'sale' ? 'Save Changes' : 'Generate & Save'}
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
