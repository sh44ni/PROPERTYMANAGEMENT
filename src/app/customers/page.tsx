'use client';

import { useState, useRef, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { CustomerCardSkeleton, StatCardSkeleton } from '@/components/ui/skeleton';
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
    type: 'receipt';
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
    idNumber: string;
    idDocumentFront?: string;
    idDocumentBack?: string;
    address: string;
    nationality: string;
    customNationality?: string;
    createdAt: string;
    propertiesBought: number;
    propertiesRented: number;
    currentRentals: number;
    totalPayments: number;
    receipts: CustomerActivity[];
}

export default function CustomersPage() {
    const { t, language } = useLanguage();
    const [customers, setCustomers] = useState<Customer[] | null>(null); // null = loading
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
        customNationality: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeForm, setShakeForm] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const idDocumentFrontRef = useRef<HTMLInputElement>(null);
    const idDocumentBackRef = useRef<HTMLInputElement>(null);

    // Fetch customers from API
    const fetchCustomers = async () => {
        try {
            setCustomers(null); // show skeletons
            const response = await fetch('/api/customers');
            const result = await response.json();
            if (result.data) {
                // Transform API data to match component interface
                const transformedCustomers: Customer[] = result.data.map((c: any) => ({
                    id: c.id,
                    customerId: 'CUS-' + c.id.substring(0, 4).toUpperCase(),
                    name: c.name,
                    email: c.email || '',
                    phone: c.phone,
                    idNumber: c.idNumber1 || '',
                    idDocumentFront: c.idImage1 || undefined,
                    idDocumentBack: c.idImage2 || undefined,
                    address: c.address || '',
                    nationality: c.nationality || 'Omani',
                    createdAt: c.createdAt,
                    propertiesBought: 0, // From API stats
                    propertiesRented: c._count?.rentals || 0,
                    currentRentals: c.currentRentals || 0,
                    totalPayments: c.totalPayments || 0,
                    receipts: [], // Could be populated from transactions
                }));
                setCustomers(transformedCustomers);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            showToast('error', 'Failed to load customers');
            setCustomers([]);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

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
            customNationality: '',
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
        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email || null,
                    phone: formData.phone,
                    nationality: formData.nationality === 'Other' && formData.customNationality ? formData.customNationality : formData.nationality,
                    address: formData.address || null,
                    idType1: 'national_id',
                    idNumber1: formData.idNumber,
                    idImage1: formData.idDocumentFront || null,
                    idImage2: formData.idDocumentBack || null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create customer');
            }

            resetForm();
            setIsCreateOpen(false);
            showToast('success', 'Customer added successfully!');
            fetchCustomers(); // Refresh list
        } catch (error: any) {
            showToast('error', error.message || 'Failed to create customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditCustomer = (customer: Customer) => {
        const predefinedNationalities = ['Omani', 'Indian', 'Pakistani', 'Bangladeshi', 'Filipino', 'Egyptian'];
        const isPredefined = predefinedNationalities.includes(customer.nationality);
        setEditingCustomer({ 
            ...customer,
            nationality: isPredefined ? customer.nationality : 'Other',
            customNationality: isPredefined ? '' : customer.nationality
        });
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
        try {
            const response = await fetch('/api/customers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingCustomer.id,
                    name: editingCustomer.name,
                    email: editingCustomer.email || null,
                    phone: editingCustomer.phone,
                    nationality: editingCustomer.nationality === 'Other' && editingCustomer.customNationality ? editingCustomer.customNationality : editingCustomer.nationality,
                    address: editingCustomer.address || null,
                    idNumber1: editingCustomer.idNumber,
                    idImage1: editingCustomer.idDocumentFront || null,
                    idImage2: editingCustomer.idDocumentBack || null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update customer');
            }

            setIsEditOpen(false);
            setEditingCustomer(null);
            showToast('success', 'Customer updated successfully!');
            fetchCustomers(); // Refresh list
        } catch (error: any) {
            showToast('error', error.message || 'Failed to update customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteCustomer = (customer: Customer) => {
        setDeletingCustomer(customer);
        setIsDeleteOpen(true);
    };

    const handleDeleteCustomer = async () => {
        if (!deletingCustomer) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/customers?id=${deletingCustomer.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete customer');
            }

            setIsDeleteOpen(false);
            setDeletingCustomer(null);
            if (selectedCustomer?.id === deletingCustomer.id) {
                setSelectedCustomer(null);
            }
            showToast('success', 'Customer deleted successfully!');
            fetchCustomers(); // Refresh list
        } catch (error: any) {
            showToast('error', error.message || 'Failed to delete customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const debouncedSearch = useDebounce(searchQuery, 250);

    const filteredCustomers = (customers ?? []).filter(customer =>
        customer.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        customer.customerId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        customer.idNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        customer.phone.includes(debouncedSearch)
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
                    {customers === null ? (
                        Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                    ) : (
                        <>
                            <Card className="p-4 shadow-sm border-0">
                                <p className="text-xs text-muted-foreground">{t.stats.totalCustomers}</p>
                                <p className="text-2xl font-bold">{customers.length}</p>
                            </Card>
                            <Card className="p-4 shadow-sm border-0">
                                <p className="text-xs text-muted-foreground">{t.stats.activeRenters}</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {customers.filter(c => c.currentRentals > 0).length}
                                </p>
                            </Card>
                            <Card className="p-4 shadow-sm border-0">
                                <p className="text-xs text-muted-foreground">{t.stats.propertyBuyers}</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {customers.filter(c => c.propertiesBought > 0).length}
                                </p>
                            </Card>
                            <Card className="p-4 shadow-sm border-0">
                                <p className="text-xs text-muted-foreground">{t.stats.totalRevenue}</p>
                                <p className="text-2xl font-bold text-[#cea26e]">
                                    OMR {formatCurrency(customers.reduce((sum, c) => sum + c.totalPayments, 0))}
                                </p>
                            </Card>
                        </>
                    )}
                </div>

                {/* Customers Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {customers === null
                        ? Array.from({ length: 6 }).map((_, i) => <CustomerCardSkeleton key={i} />)
                        : filteredCustomers.map((customer) => (
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
                                    <p className="text-[10px] text-muted-foreground">{t.customers.bought}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-blue-600">{customer.currentRentals}</p>
                                    <p className="text-[10px] text-muted-foreground">{t.customers.renting}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-[#cea26e]">
                                        {formatCurrency(customer.totalPayments)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{t.customers.paid} (OMR)</p>
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
                                    {t.common.view}
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

                {/* Empty State — only when loaded and nothing matches */}
                {customers !== null && filteredCustomers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t.customers.noCustomers}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t.customers.addFirst}</p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t.customers.addCustomer}
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
                        <h2 className="text-lg font-semibold">{t.customers.addNew}</h2>
                        <p className="text-sm text-muted-foreground">{t.customers.subtitle}</p>
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
                                <label className="text-sm font-medium mb-1.5 block">Civil ID / National ID (الرقم المدني / الهوية) *</label>
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
                                <label className="text-sm font-medium mb-1.5 block">Phone Number (رقم الهاتف) *</label>
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
                            <label className="text-sm font-medium mb-1.5 block">Address (العنوان)</label>
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
                            {formData.nationality === 'Other' && (
                                <Input
                                    className="mt-2"
                                    placeholder="Enter custom nationality"
                                    value={formData.customNationality}
                                    onChange={(e) => setFormData({ ...formData, customNationality: e.target.value })}
                                />
                            )}
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    {editingCustomer.nationality === 'Other' && (
                                        <Input
                                            className="mt-2"
                                            placeholder="Enter custom nationality"
                                            value={editingCustomer.customNationality || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, customNationality: e.target.value })}
                                        />
                                    )}
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
