'use client';

import { useState, useMemo } from 'react';
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
    propertyId?: string;
    projectId?: string;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque';
    reference?: string;
    description?: string;
    receiptImage?: string;
    date: string;
    createdAt: string;
}

interface Project {
    id: string;
    name: string;
}

interface Property {
    id: string;
    name: string;
    projectId?: string;
}

interface Customer {
    id: string;
    customerId: string;
    name: string;
}

// Mock data
const mockProjects: Project[] = [
    { id: 'proj1', name: 'Al Khuwair Residences' },
    { id: 'proj2', name: 'Qurum Heights' },
    { id: 'proj3', name: 'Mawaleh Commercial' },
];

const mockProperties: Property[] = [
    { id: 'p1', name: 'Villa A1 - Al Khuwair', projectId: 'proj1' },
    { id: 'p2', name: 'Apartment 101 - Qurum', projectId: 'proj2' },
    { id: 'p3', name: 'Shop G1 - Mawaleh', projectId: 'proj3' },
];

const mockCustomers: Customer[] = [
    { id: 'c1', customerId: 'CUS-0001', name: 'Ahmed Al-Balushi' },
    { id: 'c2', customerId: 'CUS-0002', name: 'Fatima Al-Harthi' },
    { id: 'c3', customerId: 'CUS-0003', name: 'Mohammed Al-Lawati' },
];

// Rental interface
interface Rental {
    id: string;
    tenantId: string;
    propertyId: string;
    monthlyRent: number;
    leaseStart: string;
    leaseEnd: string;
}

// Mock rentals - linking customers to their rented properties
const mockRentals: Rental[] = [
    { id: 'r1', tenantId: 'c2', propertyId: 'p2', monthlyRent: 450, leaseStart: '2024-01-01', leaseEnd: '2024-12-31' },
    { id: 'r2', tenantId: 'c3', propertyId: 'p3', monthlyRent: 320, leaseStart: '2024-02-01', leaseEnd: '2025-01-31' },
];

const mockTransactions: Transaction[] = [
    {
        id: 'txn-1',
        transactionNo: 'TXN-0001',
        category: 'income',
        type: 'rent_payment',
        amount: 450,
        paidBy: 'Fatima Al-Harthi',
        customerId: 'c2',
        propertyId: 'p2',
        projectId: 'proj2',
        paymentMethod: 'bank_transfer',
        date: '2024-01-10',
        createdAt: '2024-01-10',
    },
    {
        id: 'txn-2',
        transactionNo: 'TXN-0002',
        category: 'expense',
        type: 'maintenance',
        amount: 120,
        paidBy: 'Al Waha Maintenance',
        projectId: 'proj1',
        propertyId: 'p1',
        paymentMethod: 'cash',
        description: 'AC repair and servicing',
        date: '2024-01-08',
        createdAt: '2024-01-08',
    },
    {
        id: 'txn-3',
        transactionNo: 'TXN-0003',
        category: 'income',
        type: 'deposit',
        amount: 900,
        paidBy: 'Mohammed Al-Lawati',
        customerId: 'c3',
        propertyId: 'p3',
        projectId: 'proj3',
        paymentMethod: 'cheque',
        reference: 'CHQ-12345',
        date: '2024-01-05',
        createdAt: '2024-01-05',
    },
];

export default function AccountsPage() {
    const { t, language } = useLanguage();
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [projects] = useState<Project[]>(mockProjects);
    const [properties] = useState<Property[]>(mockProperties);
    const [customers] = useState<Customer[]>(mockCustomers);
    const [rentals] = useState<Rental[]>(mockRentals);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        category: 'income' as 'income' | 'expense',
        type: 'rent_payment',
        amount: '',
        paidBy: '',
        customerId: '',
        propertyId: '',
        projectId: '',
        paymentMethod: 'cash' as 'cash' | 'card' | 'bank_transfer' | 'cheque',
        reference: '',
        description: '',
        receiptImage: '',
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

    // Search states for dropdowns
    const [projectSearch, setProjectSearch] = useState('');
    const [propertySearch, setPropertySearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');

    const incomeTypes = [
        { value: 'rent_payment', label: t.accounts.rentPayment },
        { value: 'sale_payment', label: t.accounts.salePayment },
        { value: 'deposit', label: t.accounts.deposit },
        { value: 'other_income', label: t.accounts.otherIncome },
    ];

    const expenseTypes = [
        { value: 'land_purchase', label: t.accounts.landPurchase },
        { value: 'maintenance', label: t.accounts.maintenance },
        { value: 'legal_fees', label: t.accounts.legalFees },
        { value: 'commission', label: t.accounts.commission },
        { value: 'utilities', label: t.accounts.utilities },
        { value: 'taxes', label: t.accounts.taxes },
        { value: 'insurance', label: t.accounts.insurance },
        { value: 'other_expense', label: t.accounts.otherExpense },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-OM' : 'en-OM', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const showToast = (type: 'success' | 'error' | 'info', message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
    };

    const getProject = (id?: string) => projects.find(p => p.id === id);
    const getProperty = (id?: string) => properties.find(p => p.id === id);
    const getCustomer = (id?: string) => customers.find(c => c.id === id);

    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.category === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.category === 'expense')
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
        // For rent_payment, project is auto-populated from rental, so skip validation
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
        await new Promise(resolve => setTimeout(resolve, 800));

        const customer = getCustomer(formData.customerId);

        const newTransaction: Transaction = {
            id: `txn-${Date.now()}`,
            transactionNo: `TXN-${String(transactions.length + 1).padStart(4, '0')}`,
            category: formData.category,
            type: formData.type,
            amount: parseFloat(formData.amount),
            paidBy: formData.category === 'income' ? (customer?.name || formData.paidBy) : formData.paidBy,
            customerId: formData.category === 'income' ? formData.customerId : undefined,
            propertyId: formData.propertyId || undefined,
            projectId: formData.projectId,
            paymentMethod: formData.paymentMethod,
            reference: formData.reference || undefined,
            description: formData.description || undefined,
            receiptImage: formData.receiptImage || undefined,
            date: formData.date,
            createdAt: new Date().toISOString().split('T')[0],
        };

        setTransactions([newTransaction, ...transactions]);
        resetForm();
        setIsSubmitting(false);
        setIsCreateOpen(false);
        showToast('success', `${t.messages.created}`);
    };

    const openDeleteTransaction = (txn: Transaction) => {
        setDeletingTransaction(txn);
        setIsDeleteOpen(true);
    };

    const handleDeleteTransaction = async () => {
        if (!deletingTransaction) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        setTransactions(transactions.filter(t => t.id !== deletingTransaction.id));
        setIsSubmitting(false);
        setIsDeleteOpen(false);
        setDeletingTransaction(null);
        if (selectedTransaction?.id === deletingTransaction.id) {
            setSelectedTransaction(null);
        }
        showToast('success', t.accounts.transactionDeleted);
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
                showToast('success', t.contracts.pdfDownloaded);
            } else {
                const err = await response.json();
                showToast('error', err.error || t.contracts.pdfFailed);
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            showToast('error', t.contracts.pdfFailed);
        } finally {
            setDownloadingPdf(null);
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
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                    >
                        <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t.accounts.addTransaction}
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t.accounts.totalIncome}</p>
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
                                <p className="text-xs text-muted-foreground">{t.accounts.totalExpenses}</p>
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
                                <p className="text-xs text-muted-foreground">{t.accounts.netIncome}</p>
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
                <div className="relative max-w-md">
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
                                className="p-4 shadow-sm border-0 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => setSelectedTransaction(txn)}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className={`p-3 rounded-xl ${isIncome ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                        {isIncome ? (
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-[9px] h-4 border-[#cea26e]/30 text-[#cea26e]">
                                                {txn.transactionNo}
                                            </Badge>
                                            <Badge className={`text-[9px] h-4 border-0 ${isIncome ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                                {getTypeLabel(txn.type)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium truncate">{txn.paidBy}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {project?.name} {property ? `• ${property.name}` : ''}
                                        </p>
                                    </div>

                                    {/* Amount & Date */}
                                    <div className="text-right rtl:text-left">
                                        <p className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                            {isIncome ? '+' : '-'}OMR {formatCurrency(txn.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formatDate(txn.date)}</p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-1">
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
                                            disabled={downloadingPdf === txn.id}
                                            onClick={(e) => { e.stopPropagation(); handleDownloadPdf(txn); }}
                                        >
                                            {downloadingPdf === txn.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); openDeleteTransaction(txn); }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                        <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t.accounts.noTransactions}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t.accounts.addFirstTransaction}</p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                        >
                            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
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
                        <p className="text-sm text-muted-foreground">{t.accounts.recordTransaction}</p>
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
                                <label className="text-sm font-medium mb-1.5 block">{t.properties.type} *</label>
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
                                <label className="text-sm font-medium mb-1.5 block">{t.accounts.amount} *</label>
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
                                        {getProject(formData.projectId)?.name || <span className="text-muted-foreground">{t.accounts.selectProject}</span>}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {formErrors.projectId && <p className="text-xs text-destructive mt-1">{t.accounts.projectRequired}</p>}
                                {projectDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                        {/* Search Input */}
                                        <div className="p-2 border-b border-border">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
                                                <input
                                                    type="text"
                                                    placeholder={t.accounts.searchProjects}
                                                    value={projectSearch}
                                                    onChange={(e) => setProjectSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50"
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
                                                            <CheckCircle className="h-4 w-4 text-[#cea26e] ml-auto rtl:mr-auto rtl:ml-0" />
                                                        )}
                                                    </button>
                                                ))}
                                            {projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    {t.projects.noProjects}
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
                                <label className="text-sm font-medium mb-1.5 block">{t.rentals.property} <span className="text-muted-foreground font-normal">({t.accounts.fromRental})</span></label>
                                <div className="flex items-center gap-2 px-3 py-3 rounded-lg border border-[#cea26e]/30 bg-[#cea26e]/5 text-sm">
                                    <FileText className="h-4 w-4 text-[#cea26e]" />
                                    <span className="font-medium">{getProperty(formData.propertyId)?.name}</span>
                                    <span className="text-muted-foreground text-xs ml-auto rtl:mr-auto rtl:ml-0">{t.accounts.autoFilled}</span>
                                </div>
                            </div>
                        )}

                        {/* Property Selector - Searchable (for non-rent_payment with project selected) */}
                        {!(formData.category === 'income' && formData.type === 'rent_payment') && formData.projectId && (
                            <div className="relative">
                                <label className="text-sm font-medium mb-1.5 block">{t.rentals.property} <span className="text-muted-foreground font-normal">({t.accounts.optional})</span></label>
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
                                        {getProperty(formData.propertyId)?.name || <span className="text-muted-foreground">{t.rentals.selectProperty}</span>}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${propertyDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {propertyDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                        {/* Search Input */}
                                        <div className="p-2 border-b border-border">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
                                                <input
                                                    type="text"
                                                    placeholder={t.rentals.searchProperties}
                                                    value={propertySearch}
                                                    onChange={(e) => setPropertySearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50"
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
                                                            <CheckCircle className="h-4 w-4 text-[#cea26e] ml-auto rtl:mr-auto rtl:ml-0" />
                                                        )}
                                                    </button>
                                                ))}
                                            {properties.filter(p => p.projectId === formData.projectId && p.name.toLowerCase().includes(propertySearch.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    {t.rentals.noProperties}
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
                                <label className="text-sm font-medium mb-1.5 block">{t.customers.title} *</label>
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
                                        {getCustomer(formData.customerId)?.name || <span className="text-muted-foreground">{t.rentals.selectCustomer}</span>}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${customerDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {formErrors.customerId && <p className="text-xs text-destructive mt-1">{t.rentals.customerRequired}</p>}
                                {customerDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                        {/* Search Input */}
                                        <div className="p-2 border-b border-border">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
                                                <input
                                                    type="text"
                                                    placeholder={t.accounts.searchCustomers}
                                                    value={customerSearch}
                                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50"
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
                                                            <CheckCircle className="h-4 w-4 text-[#cea26e] shrink-0 ml-auto rtl:mr-auto rtl:ml-0" />
                                                        )}
                                                    </button>
                                                ))}
                                            {customers.filter(c =>
                                                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                c.customerId.toLowerCase().includes(customerSearch.toLowerCase())
                                            ).length === 0 && (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        {t.accounts.noCustomers}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.accounts.paidTo} *</label>
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
                                <label className="text-sm font-medium mb-1.5 block">{t.accounts.paymentMethod}</label>
                                <select
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'card' | 'bank_transfer' | 'cheque' })}
                                >
                                    <option value="cash">{t.accounts.cash}</option>
                                    <option value="card">{t.accounts.card}</option>
                                    <option value="bank_transfer">{t.accounts.bankTransfer}</option>
                                    <option value="cheque">{t.accounts.cheque}</option>
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.accounts.date} *</label>
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
                            <label className="text-sm font-medium mb-1.5 block">{t.accounts.reference} <span className="text-muted-foreground font-normal">({t.accounts.optional})</span></label>
                            <Input
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                placeholder={t.accounts.transactionID}
                            />
                        </div>

                        {/* Receipt Upload */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.accounts.receiptImage} <span className="text-muted-foreground font-normal">({t.accounts.optional})</span></label>
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
                                        className="absolute top-2 right-2 rtl:right-auto rtl:left-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
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
                                    <span className="text-xs">{t.accounts.uploadReceipt}</span>
                                </label>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.accounts.description} <span className="text-muted-foreground font-normal">({t.accounts.optional})</span></label>
                            <textarea
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={t.accounts.transactionNotes}
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
                            {t.common.cancel}
                        </Button>
                        <Button
                            className={`flex-1 text-white ${formData.category === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                            onClick={handleCreateTransaction}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t.rentals.saving}
                                </>
                            ) : (
                                formData.category === 'income' ? t.accounts.addIncome : t.accounts.addExpense
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
                                        className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
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
                                                <p className="text-xs text-muted-foreground">{isIncome ? t.accounts.receivedFrom : t.accounts.paidTo}</p>
                                                <p className="text-sm font-medium">{selectedTransaction.paidBy}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t.accounts.date}</p>
                                                <p className="text-sm font-medium">{formatDate(selectedTransaction.date)}</p>
                                            </div>
                                        </div>
                                        {project && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <Building className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{t.projects.projectName}</p>
                                                    <p className="text-sm font-medium">{project.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        {property && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{t.rentals.property}</p>
                                                    <p className="text-sm font-medium">{property.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t.accounts.paymentMethod}</p>
                                                <p className="text-sm font-medium capitalize">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        {selectedTransaction.reference && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{t.accounts.reference}</p>
                                                    <p className="text-sm font-medium">{selectedTransaction.reference}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {selectedTransaction.description && (
                                        <div className="p-4 rounded-lg bg-muted/30">
                                            <p className="text-xs text-muted-foreground mb-1">{t.accounts.description}</p>
                                            <p className="text-sm">{selectedTransaction.description}</p>
                                        </div>
                                    )}

                                    {/* Receipt Image */}
                                    {selectedTransaction.receiptImage && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-2">{t.accounts.receiptImage}</p>
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
                                            {t.statements.downloadPdf}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-destructive hover:bg-destructive hover:text-white"
                                            onClick={() => {
                                                setSelectedTransaction(null);
                                                openDeleteTransaction(selectedTransaction);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={(open) => {
                if (!open) setDeletingTransaction(null);
                setIsDeleteOpen(open);
            }}>
                <DialogContent className="max-w-md">
                    {deletingTransaction && (
                        <>
                            <div className="text-center mb-4">
                                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                    <AlertCircle className="h-6 w-6 text-destructive" />
                                </div>
                                <h2 className="text-lg font-semibold">{t.accounts.deleteTransaction}</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t.accounts.deleteConfirm} <span className="font-medium">{deletingTransaction.transactionNo}</span>?
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        setIsDeleteOpen(false);
                                        setDeletingTransaction(null);
                                    }}
                                >
                                    {t.common.cancel}
                                </Button>
                                <Button
                                    className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                                    onClick={handleDeleteTransaction}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {t.rentals.deleting}
                                        </>
                                    ) : (
                                        t.common.delete
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Toast Notification */}
            {toast.show && (
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
            )}
        </DashboardLayout>
    );
}
