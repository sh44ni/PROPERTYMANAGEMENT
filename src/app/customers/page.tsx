'use client';

import { useState, useRef } from 'react';
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
    Users,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    FileText,
    Home,
    Key,
    AlertCircle,
    CheckCircle,
    X,
    Loader2,
    Pencil,
    Trash2,
    Upload,
    Calendar,
    Building2,
    DollarSign,
    Clock,
    AlertTriangle,
    Eye,
} from 'lucide-react';
import Image from 'next/image';

// Types
interface CustomerActivity {
    id: string;
    type: 'receipt'; // Only receipt-based logging
    receiptNumber: string;
    amount: number;
    date: string;
}

interface Customer {
    id: string;
    customerId: string;
    name: string;
    email: string;
    phone: string;
    idNumber: string; // Required - National ID / Passport
    idDocumentFront?: string; // Optional - front of ID
    idDocumentBack?: string; // Optional - back of ID
    address: string;
    nationality: string;
    createdAt: string;
    // Activity summary
    propertiesBought: number;
    propertiesRented: number;
    currentRentals: number;
    totalPayments: number;
    receipts: CustomerActivity[]; // Receipt-based logging
}

// Mock Data
const mockCustomers: Customer[] = [
    {
        id: '1',
        customerId: 'CUS-0001',
        name: 'Ahmed Al-Balushi',
        email: 'ahmed.balushi@email.com',
        phone: '+968 9123 4567',
        idNumber: 'OM-12345678',
        address: 'Al Khuwair, Muscat',
        nationality: 'Omani',
        createdAt: '2024-06-15',
        propertiesBought: 1,
        propertiesRented: 0,
        currentRentals: 0,
        totalPayments: 85000,
        receipts: [
            { id: '1', type: 'receipt', receiptNumber: 'RCP-0001', amount: 85000, date: '2024-06-20' },
        ],
    },
    {
        id: '2',
        customerId: 'CUS-0002',
        name: 'Fatima Al-Harthi',
        email: 'fatima.harthi@email.com',
        phone: '+968 9234 5678',
        idNumber: 'OM-23456789',
        address: 'Qurum, Muscat',
        nationality: 'Omani',
        createdAt: '2024-07-10',
        propertiesBought: 0,
        propertiesRented: 1,
        currentRentals: 1,
        totalPayments: 1920,
        receipts: [
            { id: '1', type: 'receipt', receiptNumber: 'RCP-0002', amount: 320, date: '2024-08-01' },
            { id: '2', type: 'receipt', receiptNumber: 'RCP-0005', amount: 320, date: '2024-09-01' },
            { id: '3', type: 'receipt', receiptNumber: 'RCP-0008', amount: 320, date: '2024-10-01' },
            { id: '4', type: 'receipt', receiptNumber: 'RCP-0011', amount: 320, date: '2024-11-01' },
            { id: '5', type: 'receipt', receiptNumber: 'RCP-0014', amount: 320, date: '2024-12-01' },
            { id: '6', type: 'receipt', receiptNumber: 'RCP-0017', amount: 320, date: '2025-01-01' },
        ],
    },
    {
        id: '3',
        customerId: 'CUS-0003',
        name: 'Mohammed Al-Lawati',
        email: 'mohammed.lawati@email.com',
        phone: '+968 9345 6789',
        idNumber: 'OM-34567890',
        address: 'Al Ghubra, Muscat',
        nationality: 'Omani',
        createdAt: '2024-08-05',
        propertiesBought: 2,
        propertiesRented: 1,
        currentRentals: 1,
        totalPayments: 157350,
        receipts: [
            { id: '1', type: 'receipt', receiptNumber: 'RCP-0003', amount: 65000, date: '2024-08-10' },
            { id: '2', type: 'receipt', receiptNumber: 'RCP-0006', amount: 92000, date: '2024-09-15' },
            { id: '3', type: 'receipt', receiptNumber: 'RCP-0012', amount: 350, date: '2024-11-01' },
        ],
    },
];

export default function CustomersPage() {
    const { t, language } = useLanguage();
    const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        idNumber: '',
        idDocumentFront: '',
        idDocumentBack: '',
        address: '',
        nationality: 'Omani',
    });
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeForm, setShakeForm] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const idDocumentFrontRef = useRef<HTMLInputElement>(null);
    const idDocumentBackRef = useRef<HTMLInputElement>(null);

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

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
    };

    // Handle ID document upload (front or back)
    const handleIdDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back', isEdit = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (isEdit && editingCustomer) {
                if (side === 'front') {
                    setEditingCustomer({ ...editingCustomer, idDocumentFront: reader.result as string });
                } else {
                    setEditingCustomer({ ...editingCustomer, idDocumentBack: reader.result as string });
                }
            } else {
                if (side === 'front') {
                    setFormData(prev => ({ ...prev, idDocumentFront: reader.result as string }));
                } else {
                    setFormData(prev => ({ ...prev, idDocumentBack: reader.result as string }));
                }
            }
        };
        reader.readAsDataURL(file);
    };


    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            idNumber: '',
            idDocumentFront: '',
            idDocumentBack: '',
            address: '',
            nationality: 'Omani',
        });
        setFormErrors({});
    };

    const handleCreateCustomer = async () => {
        const errors: Record<string, boolean> = {};
        if (!formData.name.trim()) errors.name = true;
        if (!formData.idNumber.trim()) errors.idNumber = true;
        if (!formData.phone.trim()) errors.phone = true;

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const newCustomer: Customer = {
            id: `${Date.now()}`,
            customerId: `CUS-${String(customers.length + 1).padStart(4, '0')}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            idNumber: formData.idNumber,
            idDocumentFront: formData.idDocumentFront || undefined,
            idDocumentBack: formData.idDocumentBack || undefined,
            address: formData.address,
            nationality: formData.nationality,
            createdAt: new Date().toISOString().split('T')[0],
            propertiesBought: 0,
            propertiesRented: 0,
            currentRentals: 0,
            totalPayments: 0,
            receipts: [],
        };

        setCustomers([...customers, newCustomer]);
        resetForm();
        setIsSubmitting(false);
        setIsCreateOpen(false);
        showToast('success', 'Customer added successfully!');
    };

    const openEditCustomer = (customer: Customer) => {
        setEditingCustomer({ ...customer });
        setFormErrors({});
        setIsEditOpen(true);
    };

    const handleEditCustomer = async () => {
        if (!editingCustomer) return;

        const errors: Record<string, boolean> = {};
        if (!editingCustomer.name.trim()) errors.name = true;
        if (!editingCustomer.idNumber.trim()) errors.idNumber = true;
        if (!editingCustomer.phone.trim()) errors.phone = true;

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        setCustomers(customers.map(c =>
            c.id === editingCustomer.id ? editingCustomer : c
        ));

        setIsSubmitting(false);
        setIsEditOpen(false);
        setEditingCustomer(null);
        showToast('success', 'Customer updated successfully!');
    };

    const openDeleteCustomer = (customer: Customer) => {
        setDeletingCustomer(customer);
        setIsDeleteOpen(true);
    };

    const handleDeleteCustomer = async () => {
        if (!deletingCustomer) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        setCustomers(customers.filter(c => c.id !== deletingCustomer.id));

        setIsSubmitting(false);
        setIsDeleteOpen(false);
        setDeletingCustomer(null);
        if (selectedCustomer?.id === deletingCustomer.id) {
            setSelectedCustomer(null);
        }
        showToast('success', 'Customer deleted and properties freed!');
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t.customers.title}</h1>
                        <p className="text-sm text-muted-foreground">{t.customers.subtitle}</p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                    >
                        <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t.customers.addCustomer}
                    </Button>
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

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">Total Customers</p>
                        <p className="text-2xl font-bold">{customers.length}</p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">Active Renters</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {customers.filter(c => c.currentRentals > 0).length}
                        </p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">Property Buyers</p>
                        <p className="text-2xl font-bold text-green-600">
                            {customers.filter(c => c.propertiesBought > 0).length}
                        </p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold text-[#cea26e]">
                            OMR {formatCurrency(customers.reduce((sum, c) => sum + c.totalPayments, 0))}
                        </p>
                    </Card>
                </div>

                {/* Customers Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCustomers.map((customer) => (
                        <Card
                            key={customer.id}
                            className="p-4 shadow-sm border-0 cursor-pointer hover:shadow-lg transition-all group"
                            onClick={() => setSelectedCustomer(customer)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-[#cea26e]/10 flex items-center justify-center flex-shrink-0">
                                    <User className="h-6 w-6 text-[#cea26e]" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-[9px] h-4 border-[#cea26e]/30 text-[#cea26e]">
                                            {customer.customerId}
                                        </Badge>
                                    </div>
                                    <h3 className="text-base font-semibold truncate">{customer.name}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <CreditCard className="h-3 w-3" />
                                        {customer.idNumber}
                                    </p>
                                </div>
                            </div>

                            {/* Activity Summary */}
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-green-600">{customer.propertiesBought}</p>
                                    <p className="text-[10px] text-muted-foreground">Bought</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-blue-600">{customer.currentRentals}</p>
                                    <p className="text-[10px] text-muted-foreground">Renting</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-[#cea26e]">
                                        {formatCurrency(customer.totalPayments)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">Paid (OMR)</p>
                                </div>
                            </div>

                            {/* Quick Actions - Always Visible */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }}
                                >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => { e.stopPropagation(); openEditCustomer(customer); }}
                                >
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive hover:text-white"
                                    onClick={(e) => { e.stopPropagation(); openDeleteCustomer(customer); }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredCustomers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
                        <p className="text-sm text-muted-foreground mb-4">Add your first customer to get started</p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Customer
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Customer Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsCreateOpen(open);
            }}>
                <DialogContent className={`max-w-lg max-h-[90vh] overflow-y-auto ${shakeForm ? 'animate-shake' : ''}`}>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">Add New Customer</h2>
                        <p className="text-sm text-muted-foreground">Enter customer details</p>
                    </div>

                    <div className="space-y-4">
                        {/* ID Documents Upload (Optional - Front & Back) */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                ID Documents <span className="text-muted-foreground font-normal">(Optional - Front & Back)</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={idDocumentFrontRef}
                                onChange={(e) => handleIdDocumentUpload(e, 'front')}
                                className="hidden"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                ref={idDocumentBackRef}
                                onChange={(e) => handleIdDocumentUpload(e, 'back')}
                                className="hidden"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                {/* Front ID */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Front</p>
                                    {formData.idDocumentFront ? (
                                        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-muted">
                                            <Image src={formData.idDocumentFront} alt="ID Front" fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, idDocumentFront: '' })}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => idDocumentFrontRef.current?.click()}
                                            className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 transition-colors"
                                        >
                                            <Upload className="h-5 w-5" />
                                            <span className="text-[10px]">Upload Front</span>
                                        </button>
                                    )}
                                </div>
                                {/* Back ID */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Back</p>
                                    {formData.idDocumentBack ? (
                                        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-muted">
                                            <Image src={formData.idDocumentBack} alt="ID Back" fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, idDocumentBack: '' })}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => idDocumentBackRef.current?.click()}
                                            className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 transition-colors"
                                        >
                                            <Upload className="h-5 w-5" />
                                            <span className="text-[10px]">Upload Back</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (formErrors.name) setFormErrors({ ...formErrors, name: false });
                                    }}
                                    placeholder="e.g., Ahmed Al-Balushi"
                                    className={formErrors.name ? 'border-destructive' : ''}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">ID Number *</label>
                                <Input
                                    value={formData.idNumber}
                                    onChange={(e) => {
                                        setFormData({ ...formData, idNumber: e.target.value });
                                        if (formErrors.idNumber) setFormErrors({ ...formErrors, idNumber: false });
                                    }}
                                    placeholder="e.g., OM-12345678"
                                    className={formErrors.idNumber ? 'border-destructive' : ''}
                                />
                                {formErrors.idNumber && (
                                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        ID number is required
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Phone *</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => {
                                        setFormData({ ...formData, phone: e.target.value });
                                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: false });
                                    }}
                                    placeholder="e.g., +968 9123 4567"
                                    className={formErrors.phone ? 'border-destructive' : ''}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="e.g., ahmed@email.com"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Address</label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="e.g., Al Khuwair, Muscat"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Nationality</label>
                            <select
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                value={formData.nationality}
                                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                            >
                                <option value="Omani">Omani</option>
                                <option value="Indian">Indian</option>
                                <option value="Pakistani">Pakistani</option>
                                <option value="Bangladeshi">Bangladeshi</option>
                                <option value="Filipino">Filipino</option>
                                <option value="Egyptian">Egyptian</option>
                                <option value="Other">Other</option>
                            </select>
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
                            className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                            onClick={handleCreateCustomer}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add Customer'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Customer Dialog */}
            <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0" showCloseButton={false}>
                    {selectedCustomer && (
                        <>
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-[#cea26e] to-[#b8915f] p-6">
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                        <User className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="text-white">
                                        <Badge className="bg-white/20 text-white mb-1">{selectedCustomer.customerId}</Badge>
                                        <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
                                        <p className="text-sm text-white/80">Customer since {formatDate(selectedCustomer.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">ID Number</p>
                                            <p className="text-sm font-medium">{selectedCustomer.idNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <p className="text-sm font-medium">{selectedCustomer.phone}</p>
                                        </div>
                                    </div>
                                    {selectedCustomer.email && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Email</p>
                                                <p className="text-sm font-medium">{selectedCustomer.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedCustomer.address && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Address</p>
                                                <p className="text-sm font-medium">{selectedCustomer.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-3 gap-3">
                                    <Card className="p-4 border-0 shadow-sm text-center">
                                        <Home className="h-5 w-5 mx-auto text-green-600 mb-2" />
                                        <p className="text-2xl font-bold text-green-600">{selectedCustomer.propertiesBought}</p>
                                        <p className="text-xs text-muted-foreground">Properties Bought</p>
                                    </Card>
                                    <Card className="p-4 border-0 shadow-sm text-center">
                                        <Key className="h-5 w-5 mx-auto text-blue-600 mb-2" />
                                        <p className="text-2xl font-bold text-blue-600">{selectedCustomer.currentRentals}</p>
                                        <p className="text-xs text-muted-foreground">Current Rentals</p>
                                    </Card>
                                    <Card className="p-4 border-0 shadow-sm text-center">
                                        <DollarSign className="h-5 w-5 mx-auto text-[#cea26e] mb-2" />
                                        <p className="text-2xl font-bold text-[#cea26e]">{formatCurrency(selectedCustomer.totalPayments)}</p>
                                        <p className="text-xs text-muted-foreground">Total Paid (OMR)</p>
                                    </Card>
                                </div>

                                {/* ID Documents (Front & Back) */}
                                {(selectedCustomer.idDocumentFront || selectedCustomer.idDocumentBack) && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            ID Documents
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedCustomer.idDocumentFront && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1.5">Front</p>
                                                    <div className="relative h-28 w-full rounded-lg overflow-hidden bg-muted">
                                                        <Image src={selectedCustomer.idDocumentFront} alt="ID Front" fill className="object-contain" />
                                                    </div>
                                                </div>
                                            )}
                                            {selectedCustomer.idDocumentBack && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1.5">Back</p>
                                                    <div className="relative h-28 w-full rounded-lg overflow-hidden bg-muted">
                                                        <Image src={selectedCustomer.idDocumentBack} alt="ID Back" fill className="object-contain" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Receipts Log */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Payment Receipts ({selectedCustomer.receipts.length})
                                    </h4>
                                    <div className="space-y-2 max-h-52 overflow-y-auto">
                                        {selectedCustomer.receipts.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
                                        ) : (
                                            selectedCustomer.receipts.map((receipt) => (
                                                <div key={receipt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-full bg-[#cea26e]/10">
                                                            <DollarSign className="h-4 w-4 text-[#cea26e]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{receipt.receiptNumber}</p>
                                                            <p className="text-xs text-muted-foreground">{formatDate(receipt.date)}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-[#cea26e]/10 text-[#cea26e] border-0">
                                                        OMR {formatCurrency(receipt.amount)}
                                                    </Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-border">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedCustomer(null);
                                            openEditCustomer(selectedCustomer);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-destructive hover:bg-destructive hover:text-white"
                                        onClick={() => {
                                            setSelectedCustomer(null);
                                            openDeleteCustomer(selectedCustomer);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Customer Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                if (!open) {
                    setEditingCustomer(null);
                    setFormErrors({});
                }
                setIsEditOpen(open);
            }}>
                <DialogContent className={`max-w-lg max-h-[90vh] overflow-y-auto ${shakeForm ? 'animate-shake' : ''}`}>
                    {editingCustomer && (
                        <>
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Edit Customer</h2>
                                <p className="text-sm text-muted-foreground">Update customer details</p>
                            </div>

                            <div className="space-y-4">
                                {/* ID Documents (Front & Back) */}
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">
                                        ID Documents <span className="text-muted-foreground font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleIdDocumentUpload(e, 'front', true)}
                                        className="hidden"
                                        id="edit-id-front"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleIdDocumentUpload(e, 'back', true)}
                                        className="hidden"
                                        id="edit-id-back"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Front ID */}
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1.5">Front</p>
                                            {editingCustomer.idDocumentFront ? (
                                                <div className="relative w-full h-20 rounded-lg overflow-hidden bg-muted">
                                                    <Image src={editingCustomer.idDocumentFront} alt="ID Front" fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingCustomer({ ...editingCustomer, idDocumentFront: undefined })}
                                                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor="edit-id-front"
                                                    className="w-full h-16 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    <span className="text-[10px]">Upload Front</span>
                                                </label>
                                            )}
                                        </div>
                                        {/* Back ID */}
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1.5">Back</p>
                                            {editingCustomer.idDocumentBack ? (
                                                <div className="relative w-full h-20 rounded-lg overflow-hidden bg-muted">
                                                    <Image src={editingCustomer.idDocumentBack} alt="ID Back" fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingCustomer({ ...editingCustomer, idDocumentBack: undefined })}
                                                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor="edit-id-back"
                                                    className="w-full h-16 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    <span className="text-[10px]">Upload Back</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                                        <Input
                                            value={editingCustomer.name}
                                            onChange={(e) => {
                                                setEditingCustomer({ ...editingCustomer, name: e.target.value });
                                                if (formErrors.name) setFormErrors({ ...formErrors, name: false });
                                            }}
                                            className={formErrors.name ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">ID Number *</label>
                                        <Input
                                            value={editingCustomer.idNumber}
                                            onChange={(e) => {
                                                setEditingCustomer({ ...editingCustomer, idNumber: e.target.value });
                                                if (formErrors.idNumber) setFormErrors({ ...formErrors, idNumber: false });
                                            }}
                                            className={formErrors.idNumber ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Phone *</label>
                                        <Input
                                            value={editingCustomer.phone}
                                            onChange={(e) => {
                                                setEditingCustomer({ ...editingCustomer, phone: e.target.value });
                                                if (formErrors.phone) setFormErrors({ ...formErrors, phone: false });
                                            }}
                                            className={formErrors.phone ? 'border-destructive' : ''}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                                    <Input
                                        type="email"
                                        value={editingCustomer.email}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Address</label>
                                    <Input
                                        value={editingCustomer.address}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Nationality</label>
                                    <select
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                        value={editingCustomer.nationality}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, nationality: e.target.value })}
                                    >
                                        <option value="Omani">Omani</option>
                                        <option value="Indian">Indian</option>
                                        <option value="Pakistani">Pakistani</option>
                                        <option value="Bangladeshi">Bangladeshi</option>
                                        <option value="Filipino">Filipino</option>
                                        <option value="Egyptian">Egyptian</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                    onClick={() => setIsEditOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                                    onClick={handleEditCustomer}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={(open) => {
                if (!open) setDeletingCustomer(null);
                setIsDeleteOpen(open);
            }}>
                <DialogContent className="max-w-md">
                    {deletingCustomer && (
                        <>
                            <div className="text-center mb-4">
                                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-6 w-6 text-destructive" />
                                </div>
                                <h2 className="text-lg font-semibold">Delete Customer</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Are you sure you want to delete <span className="font-medium">{deletingCustomer.name}</span>?
                                </p>
                            </div>

                            {/* Impact Warning */}
                            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-3">
                                <p className="text-sm font-medium text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    This action will:
                                </p>
                                <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                                    {deletingCustomer.currentRentals > 0 && (
                                        <li className="flex items-center gap-2">
                                            <Key className="h-4 w-4 text-blue-600" />
                                            Free {deletingCustomer.currentRentals} rented propert{deletingCustomer.currentRentals > 1 ? 'ies' : 'y'}
                                        </li>
                                    )}
                                    {deletingCustomer.propertiesBought > 0 && (
                                        <li className="flex items-center gap-2">
                                            <Home className="h-4 w-4 text-green-600" />
                                            Unlink {deletingCustomer.propertiesBought} purchased propert{deletingCustomer.propertiesBought > 1 ? 'ies' : 'y'}
                                        </li>
                                    )}
                                    {deletingCustomer.totalPayments > 0 && (
                                        <li className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-[#cea26e]" />
                                            Delete OMR {formatCurrency(deletingCustomer.totalPayments)} in transaction records
                                        </li>
                                    )}
                                    <li className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-purple-600" />
                                        Delete all {deletingCustomer.receipts.length} payment receipts
                                    </li>
                                </ul>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                    onClick={() => setIsDeleteOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-destructive hover:bg-destructive/90"
                                    onClick={handleDeleteCustomer}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Customer'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    <span className="text-sm font-medium">{toast.message}</span>
                    <button
                        onClick={() => setToast({ ...toast, show: false })}
                        className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}
