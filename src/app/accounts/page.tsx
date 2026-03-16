'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import {
    Plus,
    Search,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Building,
    Users,
    Calendar,
    CreditCard,
    FileText,
    Download,
    Eye,
    Trash2,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    ChevronDown,
    Upload,
    Receipt,
    FileCheck2,
} from 'lucide-react';
import Image from 'next/image';

// Types
interface Transaction {
    id: string;
    transactionNo: string;
    category: 'income' | 'expense';
    type: string;
    amount: number;
    paidBy: string;
    customerId?: string;
    customer?: { id: string; name: string };
    propertyId?: string;
    property?: { id: string; title?: string; ownerId?: string };
    projectId?: string;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque';
    reference?: string;
    description?: string;
    receiptImage?: string;
    status?: 'active' | 'cancelled';
    cancelledAt?: string;
    cancelReason?: string;
    date: string;
    createdAt: string;
    
    // Owner Payment
    ownerId?: string;
    owner?: { id: string; name: string };
    commissionRate?: number;
    commissionAmount?: number;
    netAmount?: number;

    // Tax Invoice
    taxInvoice?: { id: string; taxInvoiceNo: string } | null;
}

interface Owner {
    id: string;
    name: string;
}

interface Project {
    id: string;
    name: string;
}

interface Property {
    id: string;
    name: string;
    projectId?: string;
    ownerId?: string;
}

interface Customer {
    id: string;
    customerId: string;
    name: string;
}

interface Rental {
    id: string;
    tenantId: string;
    propertyId: string;
    monthlyRent: number;
    leaseStart: string;
    leaseEnd: string;
}

// Income types
const incomeTypes = [
    { value: 'rent_payment', label: 'Rent Payment' },
    { value: 'sale_payment', label: 'Sale Payment' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'other_income', label: 'Other Income' },
];

// Expense types
const expenseTypes = [
    { value: 'land_purchase', label: 'Land Purchase' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'legal_fees', label: 'Legal Fees' },
    { value: 'commission', label: 'Commission' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'taxes', label: 'Taxes' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other_expense', label: 'Other Expense' },
];

export default function AccountsPage() {
    const { t, language } = useLanguage();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isOwnerPaymentOpen, setIsOwnerPaymentOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [cancellingTransaction, setCancellingTransaction] = useState<Transaction | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelSearch, setCancelSearch] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        category: 'income' as 'income' | 'expense',
        type: 'rent_payment',
        amount: '',
        paidBy: '',
        customerId: '',
        propertyId: '',
        projectId: '',
        rentalId: '',
        paymentMethod: 'cash' as 'cash' | 'card' | 'bank_transfer' | 'cheque',
        reference: '',
        description: '',
        receiptImage: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [ownerPaymentData, setOwnerPaymentData] = useState({
        amount: '',
        commissionRate: '',
        ownerId: '',
        propertyId: '',
        projectId: '',
        paymentMethod: 'bank_transfer' as 'cash' | 'card' | 'bank_transfer' | 'cheque',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeForm, setShakeForm] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({ show: false, type: 'success', message: '' });
    const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

    // Dropdown states
    const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
    const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);

    // Search states for dropdowns
    const [projectSearch, setProjectSearch] = useState('');
    const [propertySearch, setPropertySearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [ownerSearch, setOwnerSearch] = useState('');

    // Tax Invoice state
    const [isTaxInvoiceOpen, setIsTaxInvoiceOpen] = useState(false);
    const [taxInvoiceTxnSearch, setTaxInvoiceTxnSearch] = useState('');
    const [taxInvoiceTxnDropdownOpen, setTaxInvoiceTxnDropdownOpen] = useState(false);
    const [selectedTaxInvoiceTxn, setSelectedTaxInvoiceTxn] = useState<Transaction | null>(null);
    const [savedTaxInvoice, setSavedTaxInvoice] = useState<{ id: string; taxInvoiceNo: string } | null>(null);
    const [isDownloadingTaxInvoicePdf, setIsDownloadingTaxInvoicePdf] = useState(false);
    const [taxInvoiceForm, setTaxInvoiceForm] = useState({
        paymentMethod: 'cash' as 'cash' | 'card' | 'bank_transfer' | 'cheque',
        ownerTaxNumber: '',
        tenantTaxNumber: '',
        discount: '0',
        taxRate: '5',
    });
    const [isSubmittingTaxInvoice, setIsSubmittingTaxInvoice] = useState(false);

    // Tax Invoice live calculations
    const taxCalc = useMemo(() => {
        const base = selectedTaxInvoiceTxn?.amount ?? 0;
        const discount = parseFloat(taxInvoiceForm.discount) || 0;
        const taxRate = parseFloat(taxInvoiceForm.taxRate) || 0;
        const netBeforeTax = Math.max(0, base - discount);
        const vatAmount = netBeforeTax * (taxRate / 100);
        const netAfterTax = netBeforeTax + vatAmount;
        return { base, discount, netBeforeTax, vatAmount, netAfterTax, taxRate };
    }, [selectedTaxInvoiceTxn, taxInvoiceForm.discount, taxInvoiceForm.taxRate]);

    const showToast = (type: 'success' | 'error' | 'info', message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
    };

    // Fetch all data from APIs
    const fetchData = async () => {
        try {
            setLoading(true);
            const [txnRes, projRes, propRes, custRes, rentalRes, ownerRes] = await Promise.all([
                fetch('/api/transactions'),
                fetch('/api/projects'),
                fetch('/api/properties'),
                fetch('/api/customers'),
                fetch('/api/rentals'),
                fetch('/api/owners'),
            ]);
            const txnData = await txnRes.json();
            const projData = await projRes.json();
            const propData = await propRes.json();
            const custData = await custRes.json();
            const rentalData = await rentalRes.json();
            const ownerData = await ownerRes.json();

            if (txnData.data) {
                const transformedTxns: Transaction[] = txnData.data.map((t: any) => ({
                    id: t.id,
                    transactionNo: t.transactionNo || 'TXN-' + t.id.substring(0, 4).toUpperCase(),
                    category: t.category || 'expense',
                    type: t.type || 'other_expense',
                    amount: t.amount,
                    paidBy: t.paidBy || t.description || '',
                    customerId: t.customerId || undefined,
                    customer: t.customer || undefined,
                    propertyId: t.propertyId || undefined,
                    property: t.property || undefined,
                    projectId: t.projectId || undefined,
                    paymentMethod: t.paymentMethod || 'cash',
                    reference: t.reference || undefined,
                    description: t.description || undefined,
                    status: t.status || 'active',
                    cancelledAt: t.cancelledAt || undefined,
                    cancelReason: t.cancelReason || undefined,
                    date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
                    createdAt: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '',
                    ownerId: t.ownerId || undefined,
                    owner: t.owner || undefined,
                    commissionRate: t.commissionRate || undefined,
                    commissionAmount: t.commissionAmount || undefined,
                    netAmount: t.netAmount || undefined,
                    taxInvoice: t.taxInvoice || null,
                }));
                setTransactions(transformedTxns);
            }

            if (projData.data) {
                setProjects(projData.data.map((p: any) => ({ id: p.id, name: p.name })));
            }

            if (propData.data) {
                setProperties(propData.data.map((p: any) => ({ 
                    id: p.id, 
                    name: p.title || p.name, 
                    projectId: p.projectId,
                    ownerId: p.ownerId
                })));
            }

            if (custData.data) {
                setCustomers(custData.data.map((c: any) => ({
                    id: c.id,
                    customerId: 'CUS-' + c.id.substring(0, 4).toUpperCase(),
                    name: c.name,
                })));
            }

            if (rentalData.data) {
                setRentals(rentalData.data.map((r: any) => ({
                    id: r.id,
                    tenantId: r.customerId,
                    propertyId: r.propertyId,
                    monthlyRent: r.monthlyRent,
                    leaseStart: r.startDate,
                    leaseEnd: r.endDate,
                })));
            }
            
            if (ownerData.data) {
                setOwners(ownerData.data.map((o: any) => ({
                    id: o.id,
                    name: o.name,
                    phone: o.phone || '',
                })));

                // Supplement properties state with owner's linked properties
                // (ensures ownerId is always correctly wired even if property API omits it)
                if (propData.data) {
                    const propsFromApi = propData.data.map((p: any) => ({
                        id: p.id,
                        name: p.title || p.name,
                        projectId: p.projectId,
                        ownerId: p.ownerId || null,
                    }));
                    // Merge: for each property in any owner's properties array, patch ownerId
                    const ownerPropertyMap: Record<string, string> = {};
                    ownerData.data.forEach((o: any) => {
                        (o.properties || []).forEach((prop: any) => {
                            ownerPropertyMap[prop.id] = o.id;
                        });
                    });
                    const merged = propsFromApi.map((p: any) => ({
                        ...p,
                        ownerId: ownerPropertyMap[p.id] || p.ownerId || null,
                    }));
                    setProperties(merged);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle URL params for actions
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'issue') {
            setIsCreateOpen(true);
            // Clear the URL param
            router.replace('/accounts', { scroll: false });
        } else if (action === 'cancel') {
            setIsCancelOpen(true);
            router.replace('/accounts', { scroll: false });
        }
    }, [searchParams, router]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-OM', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getProject = (id?: string) => projects.find(p => p.id === id);
    const getProperty = (id?: string) => properties.find(p => p.id === id);
    const getCustomer = (id?: string) => customers.find(c => c.id === id);
    const getOwner = (id?: string) => owners.find(o => o.id === id);

    // Calculate totals (excluding cancelled transactions)
    const totalIncome = transactions
        .filter(t => t.category === 'income' && t.status !== 'cancelled')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.category === 'expense' && t.status !== 'cancelled')
        .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            // Tab filter
            if (activeTab === 'income' && txn.category !== 'income') return false;
            if (activeTab === 'expense' && txn.category !== 'expense') return false;

            // Search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const project = getProject(txn.projectId);
                const property = getProperty(txn.propertyId);
                return (
                    txn.transactionNo.toLowerCase().includes(searchLower) ||
                    txn.paidBy.toLowerCase().includes(searchLower) ||
                    project?.name.toLowerCase().includes(searchLower) ||
                    property?.name.toLowerCase().includes(searchLower)
                );
            }
            return true;
        });
    }, [transactions, activeTab, searchQuery]);

    const currentTypeOptions = formData.category === 'income' ? incomeTypes : expenseTypes;

    const resetForm = () => {
        setFormData({
            category: 'income',
            type: 'rent_payment',
            amount: '',
            paidBy: '',
            customerId: '',
            propertyId: '',
            projectId: '',
            rentalId: '',
            paymentMethod: 'cash',
            reference: '',
            description: '',
            receiptImage: '',
            date: new Date().toISOString().split('T')[0],
        });
        setFormErrors({});
    };

    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, receiptImage: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleCreateTransaction = async () => {
        const errors: Record<string, boolean> = {};
        if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = true;
        if (!(formData.category === 'income' && formData.type === 'rent_payment') && !formData.projectId) errors.projectId = true;
        if (formData.category === 'income' && !formData.customerId) errors.customerId = true;
        if (formData.category === 'expense' && !formData.paidBy.trim()) errors.paidBy = true;
        if (!formData.date) errors.date = true;

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const customer = getCustomer(formData.customerId);
            const paidByValue = formData.category === 'income' ? (customer?.name || formData.paidBy) : formData.paidBy;

            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: formData.category,
                    type: formData.type,
                    amount: parseFloat(formData.amount),
                    paidBy: paidByValue,
                    description: formData.description || paidByValue,
                    customerId: formData.category === 'income' ? formData.customerId : undefined,
                    propertyId: formData.propertyId || undefined,
                    rentalId: formData.type === 'rent_payment' && formData.rentalId ? formData.rentalId : undefined,
                    paymentMethod: formData.paymentMethod,
                    reference: formData.reference || undefined,
                    date: formData.date,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create transaction');
            }

            resetForm();
            setIsCreateOpen(false);
            showToast('success', 'Transaction created successfully!');
            fetchData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to create transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateOwnerPayment = async () => {
        const errors: Record<string, boolean> = {};
        if (!ownerPaymentData.amount || parseFloat(ownerPaymentData.amount) <= 0) errors.amount = true;
        if (!ownerPaymentData.commissionRate || parseFloat(ownerPaymentData.commissionRate) < 0) errors.commissionRate = true;
        if (!ownerPaymentData.ownerId) errors.ownerId = true;
        if (!ownerPaymentData.date) errors.date = true;

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const owner = getOwner(ownerPaymentData.ownerId);
            const grossAmount = parseFloat(ownerPaymentData.amount);
            const commissionRate = parseFloat(ownerPaymentData.commissionRate);
            const commissionAmount = grossAmount * (commissionRate / 100);
            const netAmount = grossAmount - commissionAmount;

            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: 'expense',
                    type: 'owner_payment',
                    amount: netAmount, 
                    commissionRate: commissionRate,
                    commissionAmount: commissionAmount,
                    netAmount: netAmount,
                    paidBy: owner?.name || 'Owner',
                    ownerId: ownerPaymentData.ownerId,
                    propertyId: ownerPaymentData.propertyId || undefined,
                    paymentMethod: ownerPaymentData.paymentMethod,
                    description: ownerPaymentData.description || `Payment to ${owner?.name}`,
                    date: ownerPaymentData.date,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create owner payment');
            }

            setOwnerPaymentData({
                amount: '',
                commissionRate: '',
                ownerId: '',
                propertyId: '',
                projectId: '',
                paymentMethod: 'bank_transfer',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
            setIsOwnerPaymentOpen(false);
            showToast('success', 'Owner payment created successfully!');
            fetchData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to create owner payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCancelTransaction = (txn: Transaction) => {
        setCancellingTransaction(txn);
        setCancelReason('');
        setIsCancelOpen(true);
    };

    const handleCancelTransaction = async () => {
        if (!cancellingTransaction) return;
        if (!cancelReason.trim()) {
            showToast('error', 'Please provide a reason for cancellation');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/transactions/${cancellingTransaction.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'cancelled',
                    cancelReason: cancelReason.trim(),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to cancel transaction');
            }

            setIsCancelOpen(false);
            setCancellingTransaction(null);
            setCancelReason('');
            if (selectedTransaction?.id === cancellingTransaction.id) {
                setSelectedTransaction(null);
            }
            showToast('success', 'Receipt cancelled successfully');
            fetchData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to cancel transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadPdf = async (txn: Transaction) => {
        setDownloadingPdf(txn.id);
        showToast('info', 'Generating PDF...');

        try {
            const project = getProject(txn.projectId);
            const property = getProperty(txn.propertyId);

            const response = await fetch('/api/generate-receipt-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receipt: {
                        transactionNo: txn.transactionNo,
                        category: txn.category,
                        amount: txn.amount,
                        paidBy: txn.paidBy,
                        type: txn.type,
                        paymentMethod: txn.paymentMethod,
                        date: txn.date,
                        reference: txn.reference,
                        description: txn.description,
                        projectName: project?.name,
                        propertyName: property?.name,
                        commissionRate: txn.commissionRate,
                        commissionAmount: txn.commissionAmount,
                        netAmount: txn.netAmount,
                    }
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt-${txn.transactionNo}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                showToast('success', 'PDF downloaded');
            } else {
                const err = await response.json();
                showToast('error', err.error || 'Failed to generate PDF');
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            showToast('error', 'Failed to download PDF');
        } finally {
            setDownloadingPdf(null);
        }
    };

    const resetTaxInvoiceModal = () => {
        setSelectedTaxInvoiceTxn(null);
        setSavedTaxInvoice(null);
        setTaxInvoiceTxnSearch('');
        setTaxInvoiceTxnDropdownOpen(false);
        setTaxInvoiceForm({
            paymentMethod: 'cash',
            ownerTaxNumber: '',
            tenantTaxNumber: '',
            discount: '0',
            taxRate: '5',
        });
    };

    const handleCreateTaxInvoice = async () => {
        if (!selectedTaxInvoiceTxn) {
            showToast('error', 'Please select a receipt first');
            return;
        }
        setIsSubmittingTaxInvoice(true);
        try {
            const response = await fetch('/api/tax-invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId: selectedTaxInvoiceTxn.id,
                    ownerTaxNumber: taxInvoiceForm.ownerTaxNumber || undefined,
                    tenantTaxNumber: taxInvoiceForm.tenantTaxNumber || undefined,
                    paymentMethod: taxInvoiceForm.paymentMethod,
                    baseAmount: taxCalc.base,
                    discount: taxCalc.discount,
                    taxRate: taxCalc.taxRate,
                    date: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create tax invoice');
            }

            const result = await response.json();
            setSavedTaxInvoice({ id: result.data.id, taxInvoiceNo: result.data.taxInvoiceNo });
            showToast('success', `Tax invoice ${result.data.taxInvoiceNo} created!`);
            fetchData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to create tax invoice');
        } finally {
            setIsSubmittingTaxInvoice(false);
        }
    };

    const handleDownloadTaxInvoicePdf = async () => {
        if (!selectedTaxInvoiceTxn) return;
        setIsDownloadingTaxInvoicePdf(true);
        showToast('info', 'Generating Tax Invoice PDF...');
        try {
            const owner = getOwner(selectedTaxInvoiceTxn.property?.ownerId) || getOwner(selectedTaxInvoiceTxn.ownerId);
            const tenant = selectedTaxInvoiceTxn.customer;
            const property = getProperty(selectedTaxInvoiceTxn.propertyId);

            const invoiceNo = savedTaxInvoice?.taxInvoiceNo || selectedTaxInvoiceTxn.taxInvoice?.taxInvoiceNo || 'DRAFT';
            const response = await fetch('/api/generate-tax-invoice-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taxInvoice: {
                        taxInvoiceNo: invoiceNo,
                        date: new Date().toISOString(),
                        transactionNo: selectedTaxInvoiceTxn.transactionNo,
                        transactionDate: selectedTaxInvoiceTxn.date,
                        ownerName: owner?.name || selectedTaxInvoiceTxn.paidBy || 'N/A',
                        tenantName: tenant?.name || selectedTaxInvoiceTxn.paidBy || 'N/A',
                        contractNumber: property?.name,
                        ownerTaxNumber: taxInvoiceForm.ownerTaxNumber || undefined,
                        tenantTaxNumber: taxInvoiceForm.tenantTaxNumber || undefined,
                        paymentMethod: taxInvoiceForm.paymentMethod,
                        baseAmount: taxCalc.base,
                        discount: taxCalc.discount,
                        netBeforeTax: taxCalc.netBeforeTax,
                        taxRate: taxCalc.taxRate,
                        vatAmount: taxCalc.vatAmount,
                        netAfterTax: taxCalc.netAfterTax,
                        notes: selectedTaxInvoiceTxn.description,
                    }
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tax-invoice-${invoiceNo}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                showToast('success', 'Tax Invoice PDF downloaded!');
            } else {
                const err = await response.json();
                showToast('error', err.error || 'Failed to generate PDF');
            }
        } catch (error) {
            showToast('error', 'Failed to download Tax Invoice PDF');
        } finally {
            setIsDownloadingTaxInvoicePdf(false);
        }
    };

    const getTypeLabel = (type: string) => {
        return [...incomeTypes, ...expenseTypes].find(t => t.value === type)?.label || type;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t.accounts.title}</h1>
                        <p className="text-sm text-muted-foreground">{t.accounts.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#cea26e] hover:bg-[#b8915f] text-white text-xs sm:text-sm"
                        >
                            <Receipt className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5 shrink-0" />
                            <span className="truncate">{language === 'ar' ? 'إصدار إيصال' : 'Issue Receipt'}</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="text-xs sm:text-sm"
                            onClick={() => {
                                // Find uncancelled receipts to select from
                                const activeReceipts = transactions.filter(t => t.status !== 'cancelled' && t.category === 'income');
                                if (activeReceipts.length === 0) {
                                    showToast('error', 'No active receipts to cancel');
                                    return;
                                }
                                setIsCancelOpen(true);
                            }}
                        >
                            <X className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5 shrink-0" />
                            <span className="truncate">{language === 'ar' ? 'إلغاء إيصال' : 'Cancel Receipt'}</span>
                        </Button>
                        <Button
                            onClick={() => setIsOwnerPaymentOpen(true)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm"
                        >
                            <Building className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5 shrink-0" />
                            <span className="truncate">{language === 'ar' ? 'سداد الملاك' : 'Owner Payment'}</span>
                        </Button>
                        <Button
                            onClick={() => {
                                resetTaxInvoiceModal();
                                setIsTaxInvoiceOpen(true);
                            }}
                            variant="outline"
                            className="border-[#cea26e] text-[#cea26e] hover:bg-[#cea26e] hover:text-white text-xs sm:text-sm"
                        >
                            <FileCheck2 className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5 shrink-0" />
                            <span className="truncate">{language === 'ar' ? 'فاتورة ضريبية' : 'Tax Invoice'}</span>
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t.stats.totalIncome}</p>
                                <p className="text-xl font-bold text-green-600">OMR {formatCurrency(totalIncome)}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t.stats.totalExpenses}</p>
                                <p className="text-xl font-bold text-red-600">OMR {formatCurrency(totalExpenses)}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#cea26e]/10">
                                <DollarSign className="h-5 w-5 text-[#cea26e]" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t.stats.netIncome}</p>
                                <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    OMR {formatCurrency(netIncome)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                    {(['all', 'income', 'expense'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                                ? tab === 'income' ? 'bg-green-500 text-white'
                                    : tab === 'expense' ? 'bg-red-500 text-white'
                                        : 'bg-white shadow text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab === 'all' ? t.common.all : tab === 'income' ? t.accounts.income : t.accounts.expenses}
                            <Badge variant="outline" className="ml-2 text-[10px]">
                                {transactions.filter(t => tab === 'all' || t.category === tab).length}
                            </Badge>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
                    <Input
                        type="search"
                        placeholder={`${t.common.search}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rtl:pl-4 rtl:pr-10 bg-card border-border"
                    />
                </div>

                {/* Transactions List */}
                <div className="space-y-3">
                    {filteredTransactions.map((txn) => {
                        const project = getProject(txn.projectId);
                        const property = getProperty(txn.propertyId);
                        const isIncome = txn.category === 'income';

                        return (
                            <Card
                                key={txn.id}
                                className="p-4 shadow-sm border-0 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden"
                                onClick={() => setSelectedTransaction(txn)}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Icon */}
                                    <div className={`p-2.5 rounded-xl shrink-0 ${isIncome ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                        {isIncome ? (
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>

                                    {/* Details + Amount row (flex-1, min-w-0 to allow truncation) */}
                                    <div className="flex-1 min-w-0">
                                        {/* Top row: badges */}
                                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                            <Badge variant="outline" className="text-[9px] h-4 border-[#cea26e]/30 text-[#cea26e]">
                                                {txn.transactionNo}
                                            </Badge>
                                            <Badge className={`text-[9px] h-4 border-0 ${isIncome ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                                {getTypeLabel(txn.type)}
                                            </Badge>
                                        </div>
                                        {/* Middle row: name */}
                                        <p className="text-sm font-medium truncate">{txn.paidBy}</p>
                                        {/* Bottom row: project + amount on mobile, project on desktop */}
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <p className="text-xs text-muted-foreground truncate">
                                                {project?.name} {property ? `• ${property.name}` : ''}
                                            </p>
                                            {/* Amount shown inline on mobile */}
                                            <p className={`text-sm font-bold shrink-0 sm:hidden ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                                {isIncome ? '+' : '-'}OMR {formatCurrency(txn.amount)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount & Date — hidden on mobile (shown inline above) */}
                                    <div className="text-right hidden sm:block shrink-0">
                                        <p className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                            {isIncome ? '+' : '-'}OMR {formatCurrency(txn.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formatDate(txn.date)}</p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-0.5 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => { e.stopPropagation(); setSelectedTransaction(txn); }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            disabled={downloadingPdf === txn.id || txn.status === 'cancelled'}
                                            onClick={(e) => { e.stopPropagation(); handleDownloadPdf(txn); }}
                                        >
                                            {downloadingPdf === txn.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                        </Button>
                                        {isIncome && txn.status !== 'cancelled' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                title={txn.taxInvoice ? `Tax Invoice: ${txn.taxInvoice.taxInvoiceNo}` : 'Create Tax Invoice'}
                                                className={`h-8 w-8 p-0 ${txn.taxInvoice ? 'text-[#cea26e]' : 'text-muted-foreground'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    resetTaxInvoiceModal();
                                                    setSelectedTaxInvoiceTxn(txn);
                                                    if (txn.taxInvoice) {
                                                        setSavedTaxInvoice({ id: '', taxInvoiceNo: txn.taxInvoice.taxInvoiceNo });
                                                    }
                                                    setIsTaxInvoiceOpen(true);
                                                }}
                                            >
                                                <FileCheck2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Cancelled Badge */}
                                    {txn.status === 'cancelled' && (
                                        <div className="absolute top-0 right-0 left-0 bottom-0 bg-background/80 rounded-xl flex items-center justify-center">
                                            <div className="text-center px-4">
                                                <Badge className="bg-red-500 text-white mb-1">CANCELLED</Badge>
                                                <p className="text-xs text-muted-foreground">
                                                    {txn.cancelReason}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {txn.cancelledAt ? new Date(txn.cancelledAt).toLocaleString() : ''}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                        <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t.common.noItems}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t.customers.addFirst}</p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t.accounts.addTransaction}
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Transaction Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsCreateOpen(open);
                setProjectDropdownOpen(false);
                setPropertyDropdownOpen(false);
                setCustomerDropdownOpen(false);
            }}>
                <DialogContent className={`max-w-lg max-h-[90vh] overflow-y-auto ${shakeForm ? 'animate-shake' : ''}`}>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">{t.accounts.addTransaction}</h2>
                        <p className="text-sm text-muted-foreground">{t.accounts.subtitle}</p>
                    </div>

                    <div className="space-y-4">
                        {/* Category Toggle */}
                        <div className="flex gap-2 p-1 bg-muted rounded-lg">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, category: 'income', type: 'rent_payment' })}
                                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-colors rounded-md flex items-center justify-center gap-2 ${formData.category === 'income'
                                    ? 'bg-green-500 text-white'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <TrendingUp className="h-4 w-4" />
                                {t.accounts.income}
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, category: 'expense', type: 'maintenance' })}
                                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-colors rounded-md flex items-center justify-center gap-2 ${formData.category === 'expense'
                                    ? 'bg-red-500 text-white'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <TrendingDown className="h-4 w-4" />
                                {t.accounts.expense}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Type */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Type *</label>
                                <select
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {currentTypeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Amount (OMR) *</label>
                                <Input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        setFormData({ ...formData, amount: e.target.value });
                                        if (formErrors.amount) setFormErrors({ ...formErrors, amount: false });
                                    }}
                                    placeholder="e.g., 500"
                                    className={formErrors.amount ? 'border-destructive' : ''}
                                />
                            </div>
                        </div>

                        {/* Project Selector - Searchable (NOT shown for rent_payment since auto-populated) */}
                        {!(formData.category === 'income' && formData.type === 'rent_payment') && (
                            <div className="relative">
                                <label className="text-sm font-medium mb-1.5 block">Project *</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProjectDropdownOpen(!projectDropdownOpen);
                                        setPropertyDropdownOpen(false);
                                        setCustomerDropdownOpen(false);
                                        setProjectSearch('');
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg border text-left text-sm ${formErrors.projectId ? 'border-destructive bg-destructive/5' : 'border-border bg-background'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-[#cea26e]" />
                                        {getProject(formData.projectId)?.name || <span className="text-muted-foreground">Select project...</span>}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {formErrors.projectId && <p className="text-xs text-destructive mt-1">Project is required</p>}
                                {projectDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                        {/* Search Input */}
                                        <div className="p-2 border-b border-border">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Search projects..."
                                                    value={projectSearch}
                                                    onChange={(e) => setProjectSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        {/* Options */}
                                        <div className="max-h-60 overflow-y-auto">
                                            {projects
                                                .filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
                                                .map(project => (
                                                    <button
                                                        key={project.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, projectId: project.id, propertyId: '' });
                                                            setProjectDropdownOpen(false);
                                                            setProjectSearch('');
                                                            if (formErrors.projectId) setFormErrors({ ...formErrors, projectId: false });
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0 ${formData.projectId === project.id ? 'bg-[#cea26e]/10' : ''
                                                            }`}
                                                    >
                                                        <Building className="h-5 w-5 text-[#cea26e] shrink-0" />
                                                        <span className="text-sm font-medium">{project.name}</span>
                                                        {formData.projectId === project.id && (
                                                            <CheckCircle className="h-4 w-4 text-[#cea26e] ml-auto" />
                                                        )}
                                                    </button>
                                                ))}
                                            {projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No projects found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                        )}

                        {/* Property Display for rent_payment (auto-populated, read-only) */}
                        {formData.category === 'income' && formData.type === 'rent_payment' && formData.propertyId && (
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Property <span className="text-muted-foreground font-normal">(From Rental)</span></label>
                                <div className="flex items-center gap-2 px-3 py-3 rounded-lg border border-[#cea26e]/30 bg-[#cea26e]/5 text-sm">
                                    <FileText className="h-4 w-4 text-[#cea26e]" />
                                    <span className="font-medium">{getProperty(formData.propertyId)?.name}</span>
                                    <span className="text-muted-foreground text-xs ml-auto">Auto-filled</span>
                                </div>
                            </div>
                        )}

                        {/* Property Selector - Searchable (for non-rent_payment with project selected) */}
                        {!(formData.category === 'income' && formData.type === 'rent_payment') && formData.projectId && (
                            <div className="relative">
                                <label className="text-sm font-medium mb-1.5 block">Property <span className="text-muted-foreground font-normal">(Optional)</span></label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPropertyDropdownOpen(!propertyDropdownOpen);
                                        setProjectDropdownOpen(false);
                                        setCustomerDropdownOpen(false);
                                        setPropertySearch('');
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-border bg-background text-left text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        {getProperty(formData.propertyId)?.name || <span className="text-muted-foreground">Select property...</span>}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${propertyDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {propertyDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                        {/* Search Input */}
                                        <div className="p-2 border-b border-border">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Search properties..."
                                                    value={propertySearch}
                                                    onChange={(e) => setPropertySearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        {/* Options */}
                                        <div className="max-h-60 overflow-y-auto">
                                            {properties
                                                .filter(p => p.projectId === formData.projectId && p.name.toLowerCase().includes(propertySearch.toLowerCase()))
                                                .map(property => (
                                                    <button
                                                        key={property.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, propertyId: property.id });
                                                            setPropertyDropdownOpen(false);
                                                            setPropertySearch('');
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0 ${formData.propertyId === property.id ? 'bg-[#cea26e]/10' : ''
                                                            }`}
                                                    >
                                                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                                        <span className="text-sm font-medium">{property.name}</span>
                                                        {formData.propertyId === property.id && (
                                                            <CheckCircle className="h-4 w-4 text-[#cea26e] ml-auto" />
                                                        )}
                                                    </button>
                                                ))}
                                            {properties.filter(p => p.projectId === formData.projectId && p.name.toLowerCase().includes(propertySearch.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No properties found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Customer (for income) or Paid To (for expense) */}
                        {formData.category === 'income' ? (
                            <div className="relative">
                                <label className="text-sm font-medium mb-1.5 block">Customer *</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomerDropdownOpen(!customerDropdownOpen);
                                        setProjectDropdownOpen(false);
                                        setPropertyDropdownOpen(false);
                                        setCustomerSearch('');
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg border text-left text-sm ${formErrors.customerId ? 'border-destructive bg-destructive/5' : 'border-border bg-background'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        {getCustomer(formData.customerId)?.name || <span className="text-muted-foreground">Select customer...</span>}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${customerDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {formErrors.customerId && <p className="text-xs text-destructive mt-1">Customer is required</p>}
                                {customerDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                        {/* Search Input */}
                                        <div className="p-2 border-b border-border">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Search by name or ID..."
                                                    value={customerSearch}
                                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        {/* Options */}
                                        <div className="max-h-60 overflow-y-auto">
                                            {customers
                                                .filter(c =>
                                                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                    c.customerId.toLowerCase().includes(customerSearch.toLowerCase())
                                                )
                                                .map(customer => (
                                                    <button
                                                        key={customer.id}
                                                        type="button"
                                                        onClick={() => {
                                                            // For rent_payment, check if customer has active rental
                                                            if (formData.type === 'rent_payment') {
                                                                const customerRental = rentals.find(r =>
                                                                    r.tenantId === customer.id &&
                                                                    new Date(r.leaseEnd) >= new Date()
                                                                );
                                                                if (customerRental) {
                                                                    const rentalProperty = properties.find(p => p.id === customerRental.propertyId);
                                                                    setFormData({
                                                                        ...formData,
                                                                        customerId: customer.id,
                                                                        paidBy: customer.name,
                                                                        propertyId: customerRental.propertyId,
                                                                        projectId: rentalProperty?.projectId || '',
                                                                        amount: customerRental.monthlyRent.toString()
                                                                    });
                                                                } else {
                                                                    setFormData({ ...formData, customerId: customer.id, paidBy: customer.name });
                                                                }
                                                            } else {
                                                                setFormData({ ...formData, customerId: customer.id, paidBy: customer.name });
                                                            }
                                                            setCustomerDropdownOpen(false);
                                                            setCustomerSearch('');
                                                            if (formErrors.customerId) setFormErrors({ ...formErrors, customerId: false });
                                                            if (formErrors.amount) setFormErrors({ ...formErrors, amount: false });
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0 ${formData.customerId === customer.id ? 'bg-[#cea26e]/10' : ''
                                                            }`}
                                                    >
                                                        <div className="h-9 w-9 rounded-full bg-[#cea26e]/10 flex items-center justify-center shrink-0">
                                                            <Users className="h-4 w-4 text-[#cea26e]" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{customer.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {customer.customerId}
                                                                {formData.type === 'rent_payment' && rentals.some(r => r.tenantId === customer.id && new Date(r.leaseEnd) >= new Date()) && (
                                                                    <span className="text-green-600 ml-1">• Has Active Rental</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        {formData.customerId === customer.id && (
                                                            <CheckCircle className="h-4 w-4 text-[#cea26e] shrink-0" />
                                                        )}
                                                    </button>
                                                ))}
                                            {customers.filter(c =>
                                                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                c.customerId.toLowerCase().includes(customerSearch.toLowerCase())
                                            ).length === 0 && (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        No customers found
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Paid To *</label>
                                <Input
                                    value={formData.paidBy}
                                    onChange={(e) => {
                                        setFormData({ ...formData, paidBy: e.target.value });
                                        if (formErrors.paidBy) setFormErrors({ ...formErrors, paidBy: false });
                                    }}
                                    placeholder="Contractor, Vendor, etc."
                                    className={formErrors.paidBy ? 'border-destructive' : ''}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {/* Payment Method */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Payment Method</label>
                                <select
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Date *</label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => {
                                        setFormData({ ...formData, date: e.target.value });
                                        if (formErrors.date) setFormErrors({ ...formErrors, date: false });
                                    }}
                                    className={formErrors.date ? 'border-destructive' : ''}
                                />
                            </div>
                        </div>

                        {/* Reference */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Reference <span className="text-muted-foreground font-normal">(Optional)</span></label>
                            <Input
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                placeholder="Transaction ID, Cheque No., etc."
                            />
                        </div>

                        {/* Receipt Upload */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Receipt Image <span className="text-muted-foreground font-normal">(Optional)</span></label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleReceiptUpload}
                                className="hidden"
                                id="receipt-upload"
                            />
                            {formData.receiptImage ? (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                                    <Image src={formData.receiptImage} alt="Receipt" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, receiptImage: '' })}
                                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="receipt-upload"
                                    className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <Upload className="h-5 w-5" />
                                    <span className="text-xs">Upload Receipt</span>
                                </label>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
                            <textarea
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Transaction notes..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="outline"
                            className="flex-1"
                            disabled={isSubmitting}
                            onClick={() => {
                                setIsCreateOpen(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={`flex-1 text-white ${formData.category === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                            onClick={handleCreateTransaction}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                `Add ${formData.category === 'income' ? 'Income' : 'Expense'}`
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Owner Payment Dialog */}
            <Dialog open={isOwnerPaymentOpen} onOpenChange={(open) => {
                if (!open) {
                    setOwnerPaymentData({
                        amount: '',
                        commissionRate: '',
                        ownerId: '',
                        propertyId: '',
                        projectId: '',
                        paymentMethod: 'bank_transfer',
                        description: '',
                        date: new Date().toISOString().split('T')[0],
                    });
                    setFormErrors({});
                }
                setIsOwnerPaymentOpen(open);
            }}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-zinc-800/10">
                            <Building className="h-5 w-5 text-zinc-800" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{language === 'ar' ? 'سداد الملاك' : 'Issue Owner Payment'}</h2>
                            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إنشاء إيصال سداد لمالك العقار' : 'Create a payment receipt for property owner'}</p>
                        </div>
                    </div>

                    <div className="grid gap-5 py-2">
                        {/* Owner Selection */}
                        <div className="relative">
                            <label className="text-sm font-medium mb-1.5 block">Property Owner *</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setOwnerDropdownOpen(!ownerDropdownOpen);
                                    setPropertyDropdownOpen(false);
                                    setOwnerSearch('');
                                }}
                                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg border text-left text-sm ${formErrors.ownerId ? 'border-destructive bg-destructive/5' : 'border-border bg-background'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    {getOwner(ownerPaymentData.ownerId)?.name || <span className="text-muted-foreground">Select owner...</span>}
                                </div>
                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${ownerDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {formErrors.ownerId && <p className="text-xs text-destructive mt-1">Owner is required</p>}
                            {ownerDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-border">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search owners..."
                                                value={ownerSearch}
                                                onChange={(e) => setOwnerSearch(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-zinc-800/50"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {owners
                                            .filter(o => o.name.toLowerCase().includes(ownerSearch.toLowerCase()))
                                            .map(owner => (
                                                <button
                                                    key={owner.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setOwnerPaymentData({ ...ownerPaymentData, ownerId: owner.id, propertyId: '' });
                                                        setOwnerDropdownOpen(false);
                                                        setOwnerSearch('');
                                                        if (formErrors.ownerId) setFormErrors({ ...formErrors, ownerId: false });
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-3.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0 ${ownerPaymentData.ownerId === owner.id ? 'bg-zinc-800/10' : ''
                                                        }`}
                                                >
                                                    <div className="h-9 w-9 rounded-full bg-zinc-800/10 flex items-center justify-center shrink-0">
                                                        <Users className="h-4 w-4 text-zinc-800" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{owner.name}</p>
                                                        {(owner as any).phone && <p className="text-xs text-muted-foreground">{(owner as any).phone}</p>}
                                                    </div>
                                                    {ownerPaymentData.ownerId === owner.id && (
                                                        <CheckCircle className="h-4 w-4 text-zinc-800 ml-auto shrink-0" />
                                                    )}
                                                </button>
                                            ))}
                                        {owners.filter(o => o.name.toLowerCase().includes(ownerSearch.toLowerCase())).length === 0 && (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                No owners found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Property Selection */}
                        <div className="relative">
                            <label className="text-sm font-medium mb-1.5 block">Property <span className="text-muted-foreground font-normal">(Optional)</span></label>
                            <button
                                type="button"
                                disabled={!ownerPaymentData.ownerId}
                                onClick={() => {
                                    setPropertyDropdownOpen(!propertyDropdownOpen);
                                    setOwnerDropdownOpen(false);
                                    setPropertySearch('');
                                }}
                                className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-border bg-background text-left text-sm disabled:bg-muted disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {getProperty(ownerPaymentData.propertyId)?.name || <span className="text-muted-foreground">{ownerPaymentData.ownerId ? 'Select property...' : 'Select an owner first'}</span>}
                                </div>
                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${propertyDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {propertyDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-border">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search properties..."
                                                value={propertySearch}
                                                onChange={(e) => setPropertySearch(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-zinc-800/50"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {properties
                                            .filter(p => p.ownerId === ownerPaymentData.ownerId && p.name.toLowerCase().includes(propertySearch.toLowerCase()))
                                            .map(property => (
                                                <button
                                                    key={property.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setOwnerPaymentData({ ...ownerPaymentData, propertyId: property.id });
                                                        setPropertyDropdownOpen(false);
                                                        setPropertySearch('');
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-3.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0 ${ownerPaymentData.propertyId === property.id ? 'bg-zinc-800/10' : ''
                                                        }`}
                                                >
                                                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                                    <span className="text-sm font-medium">{property.name}</span>
                                                    {ownerPaymentData.propertyId === property.id && (
                                                        <CheckCircle className="h-4 w-4 text-zinc-800 ml-auto" />
                                                    )}
                                                </button>
                                            ))}
                                        {properties.filter(p => p.ownerId === ownerPaymentData.ownerId && p.name.toLowerCase().includes(propertySearch.toLowerCase())).length === 0 && (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                No properties found for this owner
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Financial Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Gross Amount (Rent) *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">OMR</span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={ownerPaymentData.amount}
                                        onChange={(e) => {
                                            setOwnerPaymentData({ ...ownerPaymentData, amount: e.target.value });
                                            if (formErrors.amount) setFormErrors({ ...formErrors, amount: false });
                                        }}
                                        className={`pl-12 ${formErrors.amount ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {formErrors.amount && <p className="text-xs text-destructive mt-1">Amount is required</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Commission % *</label>
                                <div className="relative">
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={ownerPaymentData.commissionRate}
                                        onChange={(e) => {
                                            setOwnerPaymentData({ ...ownerPaymentData, commissionRate: e.target.value });
                                            if (formErrors.commissionRate) setFormErrors({ ...formErrors, commissionRate: false });
                                        }}
                                        className={`pr-8 ${formErrors.commissionRate ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {formErrors.commissionRate && <p className="text-xs text-destructive mt-1">Commission rate is required</p>}
                            </div>
                        </div>

                        {/* Auto calculations */}
                        {(ownerPaymentData.amount && ownerPaymentData.commissionRate) ? (
                            <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Commission Deducted</p>
                                    <p className="text-sm font-medium text-red-500">
                                        OMR {((parseFloat(ownerPaymentData.amount) * parseFloat(ownerPaymentData.commissionRate)) / 100).toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Net Payout to Owner</p>
                                    <p className="text-lg font-bold text-green-600">
                                        OMR {(parseFloat(ownerPaymentData.amount) - ((parseFloat(ownerPaymentData.amount) * parseFloat(ownerPaymentData.commissionRate)) / 100)).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        {/* Payment Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Credit Account (Payment Method)</label>
                                <select
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                    value={ownerPaymentData.paymentMethod}
                                    onChange={(e) => setOwnerPaymentData({ ...ownerPaymentData, paymentMethod: e.target.value as any })}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Date *</label>
                                <Input
                                    type="date"
                                    value={ownerPaymentData.date}
                                    onChange={(e) => {
                                        setOwnerPaymentData({ ...ownerPaymentData, date: e.target.value });
                                        if (formErrors.date) setFormErrors({ ...formErrors, date: false });
                                    }}
                                    className={formErrors.date ? 'border-destructive' : ''}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
                            <textarea
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px] resize-none"
                                value={ownerPaymentData.description}
                                onChange={(e) => setOwnerPaymentData({ ...ownerPaymentData, description: e.target.value })}
                                placeholder="Payment notes..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            disabled={isSubmitting}
                            onClick={() => setIsOwnerPaymentOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 text-white bg-zinc-800 hover:bg-zinc-700"
                            onClick={handleCreateOwnerPayment}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Record Payment'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Transaction Dialog */}
            <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0" showCloseButton={false}>
                    {selectedTransaction && (() => {
                        const project = getProject(selectedTransaction.projectId);
                        const property = getProperty(selectedTransaction.propertyId);
                        const isIncome = selectedTransaction.category === 'income';

                        return (
                            <>
                                {/* Header */}
                                <div className={`relative p-6 ${isIncome ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
                                    <button
                                        onClick={() => setSelectedTransaction(null)}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    <div className="text-center text-white">
                                        <Badge className="bg-white/20 text-white mb-2">{selectedTransaction.transactionNo}</Badge>
                                        <p className="text-4xl font-bold">
                                            {isIncome ? '+' : '-'}OMR {formatCurrency(selectedTransaction.amount)}
                                        </p>
                                        <p className="text-sm text-white/80 mt-2">{getTypeLabel(selectedTransaction.type)}</p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Users className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">{isIncome ? 'Received From' : 'Paid To'}</p>
                                                <p className="text-sm font-medium">{selectedTransaction.paidBy}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Date</p>
                                                <p className="text-sm font-medium">{formatDate(selectedTransaction.date)}</p>
                                            </div>
                                        </div>
                                        {project && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <Building className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Project</p>
                                                    <p className="text-sm font-medium">{project.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        {property && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Property</p>
                                                    <p className="text-sm font-medium">{property.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedTransaction.type === 'owner_payment' && selectedTransaction.commissionRate !== undefined && (
                                            <>
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Commission Deducted</p>
                                                        <p className="text-sm font-medium text-red-500">
                                                            {selectedTransaction.commissionRate}% 
                                                            ({formatCurrency(selectedTransaction.commissionAmount || 0)})
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Gross Amount (Rent)</p>
                                                        <p className="text-sm font-medium text-green-600">
                                                            OMR {formatCurrency((selectedTransaction.amount + (selectedTransaction.commissionAmount || 0)))}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Payment Method</p>
                                                <p className="text-sm font-medium capitalize">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        {selectedTransaction.reference && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Reference</p>
                                                    <p className="text-sm font-medium">{selectedTransaction.reference}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {selectedTransaction.description && (
                                        <div className="p-4 rounded-lg bg-muted/30">
                                            <p className="text-xs text-muted-foreground mb-1">Description</p>
                                            <p className="text-sm">{selectedTransaction.description}</p>
                                        </div>
                                    )}

                                    {/* Receipt Image */}
                                    {selectedTransaction.receiptImage && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-2">Receipt</p>
                                            <div className="relative h-40 rounded-lg overflow-hidden bg-muted">
                                                <Image src={selectedTransaction.receiptImage} alt="Receipt" fill className="object-contain" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-border">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            disabled={downloadingPdf === selectedTransaction.id}
                                            onClick={() => handleDownloadPdf(selectedTransaction)}
                                        >
                                            {downloadingPdf === selectedTransaction.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4 mr-2" />
                                            )}
                                            Download PDF
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-orange-500 hover:bg-orange-500 hover:text-white"
                                            onClick={() => {
                                                openCancelTransaction(selectedTransaction);
                                                setSelectedTransaction(null);
                                            }}
                                            disabled={selectedTransaction.status === 'cancelled'}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            {selectedTransaction.status === 'cancelled' ? 'Cancelled' : 'Cancel Receipt'}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Cancel Receipt Confirmation Dialog */}
            <Dialog open={isCancelOpen} onOpenChange={(open) => {
                if (!open) {
                    setCancellingTransaction(null);
                    setCancelReason('');
                    setCancelSearch('');
                }
                setIsCancelOpen(open);
            }}>
                <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
                    {!cancellingTransaction ? (
                        <>
                            <div className="text-center mb-4">
                                <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                                    <X className="h-6 w-6 text-orange-500" />
                                </div>
                                <h2 className="text-lg font-semibold">Cancel Receipt</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Search and select a receipt to cancel
                                </p>
                            </div>

                            {/* Search Input */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by ID, name, or amount..."
                                    value={cancelSearch}
                                    onChange={(e) => setCancelSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-auto">
                                {transactions
                                    .filter(t => t.status !== 'cancelled' && t.category === 'income')
                                    .filter(t => {
                                        if (!cancelSearch) return true;
                                        const search = cancelSearch.toLowerCase();
                                        return (
                                            t.transactionNo.toLowerCase().includes(search) ||
                                            t.paidBy.toLowerCase().includes(search) ||
                                            t.amount.toString().includes(search)
                                        );
                                    })
                                    .map(txn => (
                                        <div
                                            key={txn.id}
                                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => setCancellingTransaction(txn)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{txn.transactionNo}</p>
                                                    <p className="text-sm text-muted-foreground">{txn.paidBy}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-green-600">OMR {formatCurrency(txn.amount)}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDate(txn.date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {transactions.filter(t => t.status !== 'cancelled' && t.category === 'income').length === 0 && (
                                    <p className="text-center text-muted-foreground py-4">No active receipts to cancel</p>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => setIsCancelOpen(false)}
                            >
                                Close
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-4">
                                <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                                    <AlertCircle className="h-6 w-6 text-orange-500" />
                                </div>
                                <h2 className="text-lg font-semibold">Cancel Receipt</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Are you sure you want to cancel <span className="font-medium">{cancellingTransaction.transactionNo}</span>?
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    This action will mark the receipt as cancelled and cannot be undone.
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="text-sm font-medium mb-1.5 block">Reason for Cancellation *</label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="e.g., Duplicate entry, Incorrect amount, Customer request..."
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        setCancellingTransaction(null);
                                        setCancelReason('');
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={handleCancelTransaction}
                                    disabled={isSubmitting || !cancelReason.trim()}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        'Cancel Receipt'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Tax Invoice Dialog */}
            <Dialog open={isTaxInvoiceOpen} onOpenChange={(open) => {
                if (!open) resetTaxInvoiceModal();
                setIsTaxInvoiceOpen(open);
            }}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-[#cea26e]/10">
                            <FileCheck2 className="h-6 w-6 text-[#cea26e]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">
                                {language === 'ar' ? 'فاتورة ضريبية' : 'Tax Invoice'}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {savedTaxInvoice ? savedTaxInvoice.taxInvoiceNo : (language === 'ar' ? 'إنشاء فاتورة ضريبية جديدة' : 'Create a new VAT tax invoice')}
                            </p>
                        </div>
                        {savedTaxInvoice && (
                            <Badge className="ml-auto bg-green-500/10 text-green-600 border-0">
                                <CheckCircle className="h-3 w-3 mr-1" /> Saved
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-4">

                        {/* Step 1: Select Receipt */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Receipt / Invoice *
                                <span className="text-muted-foreground font-normal ml-1">(Income transactions only)</span>
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    disabled={!!savedTaxInvoice}
                                    onClick={() => setTaxInvoiceTxnDropdownOpen(prev => !prev)}
                                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-border bg-background text-left text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-[#cea26e]" />
                                        {selectedTaxInvoiceTxn ? (
                                            <span className="font-medium">{selectedTaxInvoiceTxn.transactionNo} — {selectedTaxInvoiceTxn.paidBy} — OMR {selectedTaxInvoiceTxn.amount.toFixed(3)}</span>
                                        ) : (
                                            <span className="text-muted-foreground">Select a receipt...</span>
                                        )}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${taxInvoiceTxnDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {taxInvoiceTxnDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                        <div className="p-2 border-b border-border">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Search by No, name, amount..."
                                                    value={taxInvoiceTxnSearch}
                                                    onChange={(e) => setTaxInvoiceTxnSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {transactions
                                                .filter(t => t.category === 'income' && t.status !== 'cancelled')
                                                .filter(t => {
                                                    if (!taxInvoiceTxnSearch) return true;
                                                    const s = taxInvoiceTxnSearch.toLowerCase();
                                                    return (
                                                        t.transactionNo.toLowerCase().includes(s) ||
                                                        t.paidBy.toLowerCase().includes(s) ||
                                                        t.amount.toString().includes(s)
                                                    );
                                                })
                                                .map(txn => (
                                                    <button
                                                        key={txn.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTaxInvoiceTxn(txn);
                                                            setTaxInvoiceTxnDropdownOpen(false);
                                                            setTaxInvoiceTxnSearch('');
                                                            setTaxInvoiceForm(prev => ({
                                                                ...prev,
                                                                paymentMethod: (txn.paymentMethod as any) || 'cash',
                                                            }));
                                                        }}
                                                        className={`w-full flex items-center justify-between gap-3 p-3.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0 ${selectedTaxInvoiceTxn?.id === txn.id ? 'bg-[#cea26e]/10' : ''}`}
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium">{txn.transactionNo}</p>
                                                            <p className="text-xs text-muted-foreground">{txn.paidBy} • {formatDate(txn.date)}</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-sm font-bold text-green-600">OMR {txn.amount.toFixed(3)}</p>
                                                            {txn.taxInvoice && (
                                                                <Badge className="text-[9px] bg-[#cea26e]/10 text-[#cea26e] border-0">{txn.taxInvoice.taxInvoiceNo}</Badge>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            {transactions.filter(t => t.category === 'income' && t.status !== 'cancelled').length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center py-4">No active income receipts</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Auto-filled info */}
                        {selectedTaxInvoiceTxn && (
                            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Date / التاريخ</p>
                                    <p className="text-sm font-medium">{formatDate(selectedTaxInvoiceTxn.date)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Base Amount / المبلغ</p>
                                    <p className="text-sm font-bold text-green-600">OMR {selectedTaxInvoiceTxn.amount.toFixed(3)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Owner / المالك</p>
                                    <p className="text-sm font-medium truncate">
                                        {getOwner(selectedTaxInvoiceTxn.property?.ownerId)?.name ||
                                            getOwner(selectedTaxInvoiceTxn.ownerId)?.name || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Tenant / المستأجر</p>
                                    <p className="text-sm font-medium truncate">
                                        {selectedTaxInvoiceTxn.customer?.name || selectedTaxInvoiceTxn.paidBy || '—'}
                                    </p>
                                </div>
                                {selectedTaxInvoiceTxn.description && (
                                    <div className="col-span-2">
                                        <p className="text-[10px] text-muted-foreground mb-0.5">Notes / ملاحظات</p>
                                        <p className="text-sm">{selectedTaxInvoiceTxn.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manual Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Payment Method</label>
                                <select
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                    value={taxInvoiceForm.paymentMethod}
                                    disabled={!!savedTaxInvoice}
                                    onChange={(e) => setTaxInvoiceForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                                >
                                    <option value="cash">Cash / نقداً</option>
                                    <option value="card">Card / بطاقة</option>
                                    <option value="bank_transfer">Bank Transfer / تحويل</option>
                                    <option value="cheque">Cheque / شيك</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Discount (OMR)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    disabled={!!savedTaxInvoice}
                                    value={taxInvoiceForm.discount}
                                    onChange={(e) => setTaxInvoiceForm(prev => ({ ...prev, discount: e.target.value }))}
                                    placeholder="0.000"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Owner Tax No <span className="text-muted-foreground">(Optional)</span></label>
                                <Input
                                    type="text"
                                    disabled={!!savedTaxInvoice}
                                    value={taxInvoiceForm.ownerTaxNumber}
                                    onChange={(e) => setTaxInvoiceForm(prev => ({ ...prev, ownerTaxNumber: e.target.value }))}
                                    placeholder="e.g. OM123456"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Tenant Tax No <span className="text-muted-foreground">(Optional)</span></label>
                                <Input
                                    type="text"
                                    disabled={!!savedTaxInvoice}
                                    value={taxInvoiceForm.tenantTaxNumber}
                                    onChange={(e) => setTaxInvoiceForm(prev => ({ ...prev, tenantTaxNumber: e.target.value }))}
                                    placeholder="e.g. OM789012"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Tax Rate (%)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    disabled={!!savedTaxInvoice}
                                    value={taxInvoiceForm.taxRate}
                                    onChange={(e) => setTaxInvoiceForm(prev => ({ ...prev, taxRate: e.target.value }))}
                                    placeholder="5"
                                />
                            </div>
                        </div>

                        {/* Live Calculations */}
                        {selectedTaxInvoiceTxn && (
                            <div className="rounded-lg border border-[#cea26e]/30 bg-[#cea26e]/5 overflow-hidden">
                                <div className="px-4 py-2 bg-[#cea26e]/10 border-b border-[#cea26e]/20">
                                    <p className="text-xs font-medium text-[#cea26e]">Auto Calculations / الحسابات التلقائية</p>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Base Amount</p>
                                        <p className="text-sm font-medium">OMR {taxCalc.base.toFixed(3)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Discount</p>
                                        <p className="text-sm font-medium text-orange-500">− OMR {taxCalc.discount.toFixed(3)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Net Before Tax / الصافي قبل الضريبة</p>
                                        <p className="text-sm font-semibold">OMR {taxCalc.netBeforeTax.toFixed(3)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">VAT ({taxCalc.taxRate}%) / ضريبة القيمة المضافة</p>
                                        <p className="text-sm font-medium">OMR {taxCalc.vatAmount.toFixed(3)}</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-[#cea26e]/20">
                                        <p className="text-[10px] text-muted-foreground">Net After Tax / الإجمالي شامل الضريبة</p>
                                        <p className="text-xl font-bold text-[#cea26e]">OMR {taxCalc.netAfterTax.toFixed(3)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            {!savedTaxInvoice ? (
                                <Button
                                    className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                                    onClick={handleCreateTaxInvoice}
                                    disabled={isSubmittingTaxInvoice || !selectedTaxInvoiceTxn}
                                >
                                    {isSubmittingTaxInvoice ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                    ) : (
                                        <><CheckCircle className="h-4 w-4 mr-2" /> {language === 'ar' ? 'حفظ الفاتورة' : 'Save Tax Invoice'}</>
                                    )}
                                </Button>
                            ) : null}
                            <Button
                                variant="outline"
                                className="flex-1 border-[#cea26e] text-[#cea26e] hover:bg-[#cea26e] hover:text-white"
                                onClick={handleDownloadTaxInvoicePdf}
                                disabled={isDownloadingTaxInvoicePdf || !selectedTaxInvoiceTxn}
                            >
                                {isDownloadingTaxInvoicePdf ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                                ) : (
                                    <><Download className="h-4 w-4 mr-2" /> {language === 'ar' ? 'طباعة / تنزيل' : 'Print / Download PDF'}</>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Toast Notification */}
            {
                toast.show && (
                    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' :
                            toast.type === 'error' ? 'bg-red-500' :
                                'bg-blue-500'
                            } text-white`}>
                            {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
                            {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
                            {toast.type === 'info' && <Download className="h-5 w-5" />}
                            <span className="text-sm font-medium">{toast.message}</span>
                        </div>
                    </div>
                )
            }
        </DashboardLayout >
    );
}
