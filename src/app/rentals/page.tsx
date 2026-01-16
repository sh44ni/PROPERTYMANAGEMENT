'use client';

import { useState, useMemo, useEffect } from 'react';
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
    Key,
    Home,
    User,
    Calendar,
    DollarSign,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    X,
    Loader2,
    Pencil,
    Trash2,
    Eye,
    Mail,
    Clock,
    ChevronDown,
} from 'lucide-react';
import Image from 'next/image';

// Types
interface Rental {
    id: string;
    rentalId: string;
    propertyId: string;
    customerId: string;
    monthlyRent: number;
    depositAmount: number;
    leaseStart: string;
    leaseEnd: string;
    dueDay: number;
    paymentStatus: 'paid' | 'unpaid' | 'overdue';
    paidUntil: string;
    notes: string;
    createdAt: string;
}

interface Property {
    id: string;
    name: string;
    type: string;
    area: string;
    status: 'available' | 'rented' | 'sold';
    monthlyRent?: number;
    image?: string;
}

interface Customer {
    id: string;
    customerId: string;
    name: string;
    email: string;
    phone: string;
    idNumber: string;
}

export default function RentalsPage() {
    const { t, language } = useLanguage();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingRental, setEditingRental] = useState<Rental | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingRental, setDeletingRental] = useState<Rental | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        propertyId: '',
        customerId: '',
        monthlyRent: '',
        depositAmount: '',
        leaseStart: '',
        leaseEnd: '',
        dueDay: '1',
        notes: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeForm, setShakeForm] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({ show: false, type: 'success', message: '' });

    // Property/Customer selector states
    const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const [propertySearch, setPropertySearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');

    // Sending reminder state
    const [sendingReminder, setSendingReminder] = useState<string | null>(null);

    // Fetch all data from APIs
    const fetchData = async () => {
        try {
            setLoading(true);
            const [rentalsRes, propsRes, custsRes] = await Promise.all([
                fetch('/api/rentals'),
                fetch('/api/properties'),
                fetch('/api/customers'),
            ]);
            const rentalsData = await rentalsRes.json();
            const propsData = await propsRes.json();
            const custsData = await custsRes.json();

            if (rentalsData.data) {
                const transformedRentals: Rental[] = rentalsData.data.map((r: any) => ({
                    id: r.id,
                    rentalId: 'RNT-' + r.id.substring(0, 4).toUpperCase(),
                    propertyId: r.propertyId,
                    customerId: r.customerId,
                    monthlyRent: r.monthlyRent,
                    depositAmount: r.depositAmount || 0,
                    leaseStart: r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '',
                    leaseEnd: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '',
                    dueDay: r.dueDay || 1,
                    paymentStatus: r.paymentStatus || 'unpaid',
                    paidUntil: r.paidUntil ? new Date(r.paidUntil).toISOString().split('T')[0] : '',
                    notes: r.notes || '',
                    createdAt: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '',
                }));
                setRentals(transformedRentals);
            }

            if (propsData.data) {
                const transformedProps: Property[] = propsData.data.map((p: any) => ({
                    id: p.id,
                    name: p.title || p.name,
                    type: p.type || 'Apartment',
                    area: p.location || '',
                    status: p.status || 'available',
                    monthlyRent: p.price || undefined,
                }));
                setProperties(transformedProps);
            }

            if (custsData.data) {
                const transformedCusts: Customer[] = custsData.data.map((c: any) => ({
                    id: c.id,
                    customerId: 'CUS-' + c.id.substring(0, 4).toUpperCase(),
                    name: c.name,
                    email: c.email || '',
                    phone: c.phone,
                    idNumber: c.idNumber1 || '',
                }));
                setCustomers(transformedCusts);
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

    const showToast = (type: 'success' | 'error' | 'info', message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
    };

    const getProperty = (id: string) => properties.find(p => p.id === id);
    const getCustomer = (id: string) => customers.find(c => c.id === id);

    // Available properties (not already rented, unless editing same rental)
    const availableProperties = useMemo(() => {
        const rentedPropertyIds = rentals
            .filter(r => !editingRental || r.id !== editingRental.id)
            .map(r => r.propertyId);
        return properties.filter(p =>
            p.status !== 'sold' &&
            !rentedPropertyIds.includes(p.id)
        );
    }, [properties, rentals, editingRental]);

    // Overdue count
    const overdueCount = rentals.filter(r => r.paymentStatus === 'overdue').length;

    // Stats
    const totalRentals = rentals.length;
    const activeRentals = rentals.filter(r => new Date(r.leaseEnd) >= new Date()).length;
    const monthlyRevenue = rentals.reduce((sum, r) => sum + r.monthlyRent, 0);

    const resetForm = () => {
        setFormData({
            propertyId: '',
            customerId: '',
            monthlyRent: '',
            depositAmount: '',
            leaseStart: '',
            leaseEnd: '',
            dueDay: '1',
            notes: '',
        });
        setFormErrors({});
        setPropertySearch('');
        setCustomerSearch('');
    };

    const handleCreateRental = async () => {
        const errors: Record<string, boolean> = {};
        if (!formData.propertyId) errors.propertyId = true;
        if (!formData.customerId) errors.customerId = true;
        if (!formData.monthlyRent || parseFloat(formData.monthlyRent) <= 0) errors.monthlyRent = true;
        if (!formData.leaseStart) errors.leaseStart = true;
        if (!formData.leaseEnd) errors.leaseEnd = true;

        // Validate lease dates
        if (formData.leaseStart && formData.leaseEnd) {
            const start = new Date(formData.leaseStart);
            const end = new Date(formData.leaseEnd);
            if (end <= start) {
                errors.leaseEnd = true;
                showToast('error', 'Lease end date must be after start date');
            }
        }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            if (!errors.leaseEnd || Object.keys(errors).length > 1) {
                showToast('error', 'Please select both property and customer');
            }
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/rentals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: formData.propertyId,
                    customerId: formData.customerId,
                    monthlyRent: parseFloat(formData.monthlyRent),
                    depositAmount: parseFloat(formData.depositAmount) || 0,
                    startDate: formData.leaseStart,
                    endDate: formData.leaseEnd,
                    dueDay: parseInt(formData.dueDay),
                    notes: formData.notes,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create rental');
            }

            resetForm();
            setIsCreateOpen(false);
            showToast('success', 'Rental created successfully!');
            fetchData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to create rental');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditRental = (rental: Rental) => {
        setEditingRental({ ...rental });
        setFormData({
            propertyId: rental.propertyId,
            customerId: rental.customerId,
            monthlyRent: rental.monthlyRent.toString(),
            depositAmount: rental.depositAmount.toString(),
            leaseStart: rental.leaseStart,
            leaseEnd: rental.leaseEnd,
            dueDay: rental.dueDay.toString(),
            notes: rental.notes,
        });
        setFormErrors({});
        setIsEditOpen(true);
    };

    const handleEditRental = async () => {
        if (!editingRental) return;

        const errors: Record<string, boolean> = {};
        if (!formData.propertyId) errors.propertyId = true;
        if (!formData.customerId) errors.customerId = true;
        if (!formData.monthlyRent || parseFloat(formData.monthlyRent) <= 0) errors.monthlyRent = true;
        if (!formData.leaseStart) errors.leaseStart = true;
        if (!formData.leaseEnd) errors.leaseEnd = true;

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/rentals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingRental.id,
                    propertyId: formData.propertyId,
                    customerId: formData.customerId,
                    monthlyRent: parseFloat(formData.monthlyRent),
                    depositAmount: parseFloat(formData.depositAmount) || 0,
                    startDate: formData.leaseStart,
                    endDate: formData.leaseEnd,
                    dueDay: parseInt(formData.dueDay),
                    notes: formData.notes,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update rental');
            }

            resetForm();
            setIsEditOpen(false);
            setEditingRental(null);
            showToast('success', 'Rental updated successfully!');
            fetchData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to update rental');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteRental = (rental: Rental) => {
        setDeletingRental(rental);
        setIsDeleteOpen(true);
    };

    const handleDeleteRental = async () => {
        if (!deletingRental) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/rentals?id=${deletingRental.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete rental');
            }

            setIsDeleteOpen(false);
            setDeletingRental(null);
            if (selectedRental?.id === deletingRental.id) {
                setSelectedRental(null);
            }
            showToast('success', 'Rental deleted successfully!');
            fetchData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to delete rental');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendReminder = async (rental: Rental) => {
        const customer = getCustomer(rental.customerId);
        const property = getProperty(rental.propertyId);

        if (!customer?.email) {
            showToast('error', 'Customer has no email address');
            return;
        }

        setSendingReminder(rental.id);
        showToast('info', `Sending reminder to ${customer.email}...`);

        try {
            const response = await fetch('/api/send-payment-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rentalId: rental.id,
                    tenantEmail: customer.email,
                    tenantName: customer.name,
                    propertyName: property?.name || 'Property',
                    monthlyRent: rental.monthlyRent,
                    paidUntil: rental.paidUntil,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                showToast('success', `Reminder sent to ${customer.email}`);
            } else {
                showToast('error', result.error || 'Failed to send reminder');
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            showToast('error', 'Failed to send reminder');
        } finally {
            setSendingReminder(null);
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500/10 text-green-600 border-0">{t.rentals.paid}</Badge>;
            case 'unpaid':
                return <Badge className="bg-yellow-500/10 text-yellow-600 border-0">{t.rentals.unpaid}</Badge>;
            case 'overdue':
                return <Badge className="bg-red-500/10 text-red-600 border-0">{t.rentals.overdue}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredRentals = rentals.filter(rental => {
        const property = getProperty(rental.propertyId);
        const customer = getCustomer(rental.customerId);
        const searchLower = searchQuery.toLowerCase();
        return (
            property?.name.toLowerCase().includes(searchLower) ||
            customer?.name.toLowerCase().includes(searchLower) ||
            rental.rentalId.toLowerCase().includes(searchLower)
        );
    });

    // Filtered lists for dropdowns
    const filteredProperties = availableProperties.filter(p =>
        p.name.toLowerCase().includes(propertySearch.toLowerCase()) ||
        p.type.toLowerCase().includes(propertySearch.toLowerCase()) ||
        p.area.toLowerCase().includes(propertySearch.toLowerCase())
    );

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.customerId.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );

    // Property/Customer selector component
    const PropertySelector = ({ isEdit = false }: { isEdit?: boolean }) => {
        const selectedProperty = getProperty(formData.propertyId);
        return (
            <div className="relative">
                <label className="text-sm font-medium mb-1.5 block">Property *</label>
                <button
                    type="button"
                    onClick={() => {
                        setPropertyDropdownOpen(!propertyDropdownOpen);
                        setCustomerDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-left text-sm h-10 ${formErrors.propertyId ? 'border-destructive bg-destructive/5' : 'border-border bg-background'
                        }`}
                >
                    {selectedProperty ? (
                        <span className="truncate">{selectedProperty.name}</span>
                    ) : (
                        <span className="text-muted-foreground">Select property...</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {formErrors.propertyId && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Property is required
                    </p>
                )}
                {propertyDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
                        <div className="p-2 border-b border-border">
                            <Input
                                placeholder="Search properties..."
                                value={propertySearch}
                                onChange={(e) => setPropertySearch(e.target.value)}
                                className="h-8"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filteredProperties.length === 0 ? (
                                <p className="p-3 text-sm text-muted-foreground text-center">No available properties</p>
                            ) : (
                                filteredProperties.map(property => (
                                    <button
                                        key={property.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, propertyId: property.id, monthlyRent: property.monthlyRent?.toString() || formData.monthlyRent });
                                            setPropertyDropdownOpen(false);
                                            setPropertySearch('');
                                            if (formErrors.propertyId) setFormErrors({ ...formErrors, propertyId: false });
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left ${formData.propertyId === property.id ? 'bg-[#cea26e]/10' : ''
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[#cea26e]/10 flex items-center justify-center">
                                            <Home className="h-4 w-4 text-[#cea26e]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{property.name}</p>
                                            <p className="text-xs text-muted-foreground">{property.type} • {property.area}</p>
                                        </div>
                                        {property.monthlyRent && (
                                            <Badge variant="outline" className="text-[10px]">
                                                OMR {formatCurrency(property.monthlyRent)}/mo
                                            </Badge>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const CustomerSelector = () => {
        const selectedCustomer = getCustomer(formData.customerId);
        return (
            <div className="relative">
                <label className="text-sm font-medium mb-1.5 block">Customer *</label>
                <button
                    type="button"
                    onClick={() => {
                        setCustomerDropdownOpen(!customerDropdownOpen);
                        setPropertyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-left text-sm h-10 ${formErrors.customerId ? 'border-destructive bg-destructive/5' : 'border-border bg-background'
                        }`}
                >
                    {selectedCustomer ? (
                        <span className="truncate">{selectedCustomer.name}</span>
                    ) : (
                        <span className="text-muted-foreground">Select customer...</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {formErrors.customerId && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Customer is required
                    </p>
                )}
                {customerDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
                        <div className="p-2 border-b border-border">
                            <Input
                                placeholder="Search customers..."
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                className="h-8"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filteredCustomers.length === 0 ? (
                                <p className="p-3 text-sm text-muted-foreground text-center">No customers found</p>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <button
                                        key={customer.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, customerId: customer.id });
                                            setCustomerDropdownOpen(false);
                                            setCustomerSearch('');
                                            if (formErrors.customerId) setFormErrors({ ...formErrors, customerId: false });
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left ${formData.customerId === customer.id ? 'bg-[#cea26e]/10' : ''
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#cea26e]/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-[#cea26e]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{customer.name}</p>
                                            <p className="text-xs text-muted-foreground">{customer.customerId} • {customer.phone}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t.rentals.title}</h1>
                        <p className="text-sm text-muted-foreground">{t.rentals.subtitle}</p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                    >
                        <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t.rentals.addRental}
                    </Button>
                </div>

                {/* Overdue Alert */}
                {overdueCount > 0 && (
                    <Card className="p-4 border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-red-700 dark:text-red-400">{t.rentals.overduePayments}</p>
                                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                                    {overdueCount} {overdueCount > 1 ? t.rentals.overdueMessagePlural : t.rentals.overdueMessage}
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

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
                        <p className="text-xs text-muted-foreground">{t.stats.totalRentals}</p>
                        <p className="text-2xl font-bold">{totalRentals}</p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">{t.common.active}</p>
                        <p className="text-2xl font-bold text-green-600">{activeRentals}</p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">{t.rentals.overdue}</p>
                        <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">{t.stats.monthlyRevenue}</p>
                        <p className="text-2xl font-bold text-[#cea26e]">OMR {formatCurrency(monthlyRevenue)}</p>
                    </Card>
                </div>

                {/* Rentals Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredRentals.map((rental) => {
                        const property = getProperty(rental.propertyId);
                        const customer = getCustomer(rental.customerId);
                        const isOverdue = rental.paymentStatus === 'overdue';

                        return (
                            <Card
                                key={rental.id}
                                className={`p-4 shadow-sm border-0 cursor-pointer hover:shadow-lg transition-all ${isOverdue ? 'ring-2 ring-red-200 dark:ring-red-900/50' : ''
                                    }`}
                                onClick={() => setSelectedRental(rental)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <Badge variant="outline" className="text-[9px] h-4 border-[#cea26e]/30 text-[#cea26e]">
                                        {rental.rentalId}
                                    </Badge>
                                    {getPaymentStatusBadge(rental.paymentStatus)}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Home className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium truncate">{property?.name || 'Unknown Property'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground truncate">{customer?.name || 'Unknown Customer'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-center py-3 border-t border-b border-border mb-4">
                                    <div>
                                        <p className="text-lg font-semibold text-[#cea26e]">OMR {formatCurrency(rental.monthlyRent)}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.rentals.monthlyRent}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{formatDate(rental.paidUntil)}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.rentals.paidUntil}</p>
                                    </div>
                                </div>

                                {/* Quick Actions - Always Visible */}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={(e) => { e.stopPropagation(); setSelectedRental(rental); }}
                                    >
                                        <Eye className="h-3 w-3 mr-1" />
                                        {t.common.view}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => { e.stopPropagation(); openEditRental(rental); }}
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                    {(rental.paymentStatus === 'unpaid' || rental.paymentStatus === 'overdue') && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-600 hover:bg-blue-50"
                                            disabled={sendingReminder === rental.id}
                                            onClick={(e) => { e.stopPropagation(); handleSendReminder(rental); }}
                                            title="Send Payment Reminder"
                                        >
                                            {sendingReminder === rental.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Mail className="h-3 w-3" />
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive hover:bg-destructive hover:text-white"
                                        onClick={(e) => { e.stopPropagation(); openDeleteRental(rental); }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredRentals.length === 0 && (
                    <div className="text-center py-12">
                        <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t.rentals.noRentals}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t.rentals.addFirst}</p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t.rentals.addRental}
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Rental Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsCreateOpen(open);
                setPropertyDropdownOpen(false);
                setCustomerDropdownOpen(false);
            }}>
                <DialogContent className={`max-w-lg max-h-[90vh] overflow-y-auto ${shakeForm ? 'animate-shake' : ''}`}>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">{t.rentals.addNew}</h2>
                        <p className="text-sm text-muted-foreground">{t.rentals.subtitle}</p>
                    </div>

                    <div className="space-y-4">
                        {/* Property Selector */}
                        <PropertySelector />

                        {/* Customer Selector */}
                        <CustomerSelector />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Monthly Rent (OMR) *</label>
                                <Input
                                    type="number"
                                    value={formData.monthlyRent}
                                    onChange={(e) => {
                                        setFormData({ ...formData, monthlyRent: e.target.value });
                                        if (formErrors.monthlyRent) setFormErrors({ ...formErrors, monthlyRent: false });
                                    }}
                                    placeholder="e.g., 350"
                                    className={formErrors.monthlyRent ? 'border-destructive' : ''}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Deposit (OMR)</label>
                                <Input
                                    type="number"
                                    value={formData.depositAmount}
                                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                                    placeholder="e.g., 700"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Lease Start *</label>
                                <Input
                                    type="date"
                                    value={formData.leaseStart}
                                    onChange={(e) => {
                                        setFormData({ ...formData, leaseStart: e.target.value });
                                        if (formErrors.leaseStart) setFormErrors({ ...formErrors, leaseStart: false });
                                    }}
                                    className={formErrors.leaseStart ? 'border-destructive' : ''}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Lease End *</label>
                                <Input
                                    type="date"
                                    value={formData.leaseEnd}
                                    onChange={(e) => {
                                        setFormData({ ...formData, leaseEnd: e.target.value });
                                        if (formErrors.leaseEnd) setFormErrors({ ...formErrors, leaseEnd: false });
                                    }}
                                    className={formErrors.leaseEnd ? 'border-destructive' : ''}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Due Day (of month)</label>
                            <select
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                value={formData.dueDay}
                                onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                            >
                                {Array.from({ length: 28 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Notes</label>
                            <Input
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Optional notes..."
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
                            className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                            onClick={handleCreateRental}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Rental'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Rental Dialog */}
            <Dialog open={!!selectedRental} onOpenChange={() => setSelectedRental(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0" showCloseButton={false}>
                    {selectedRental && (() => {
                        const property = getProperty(selectedRental.propertyId);
                        const customer = getCustomer(selectedRental.customerId);
                        return (
                            <>
                                {/* Header */}
                                <div className="relative bg-gradient-to-br from-[#cea26e] to-[#b8915f] p-6">
                                    <button
                                        onClick={() => setSelectedRental(null)}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Key className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="text-white">
                                            <Badge className="bg-white/20 text-white mb-1">{selectedRental.rentalId}</Badge>
                                            <h2 className="text-lg font-bold">{property?.name}</h2>
                                            <p className="text-sm text-white/80">{customer?.name}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Status & Amount */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card className="p-4 border-0 shadow-sm text-center">
                                            <DollarSign className="h-5 w-5 mx-auto text-[#cea26e] mb-2" />
                                            <p className="text-xl font-bold text-[#cea26e]">OMR {formatCurrency(selectedRental.monthlyRent)}</p>
                                            <p className="text-xs text-muted-foreground">Monthly Rent</p>
                                        </Card>
                                        <Card className="p-4 border-0 shadow-sm text-center">
                                            <Clock className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-lg font-bold">{formatDate(selectedRental.paidUntil)}</p>
                                            <p className="text-xs text-muted-foreground">Paid Until</p>
                                            {selectedRental.paymentStatus === 'overdue' && (
                                                <Badge className="mt-1 bg-red-500/10 text-red-600 border-0 text-[10px]">Overdue</Badge>
                                            )}
                                        </Card>
                                    </div>

                                    {/* Lease Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Lease Start</p>
                                                <p className="text-sm font-medium">{formatDate(selectedRental.leaseStart)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Lease End</p>
                                                <p className="text-sm font-medium">{formatDate(selectedRental.leaseEnd)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    {customer && (
                                        <div className="p-4 rounded-lg bg-muted/30">
                                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Tenant
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Name</p>
                                                    <p className="font-medium">{customer.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Phone</p>
                                                    <p className="font-medium">{customer.phone}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-muted-foreground">Email</p>
                                                    <p className="font-medium">{customer.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-border">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setSelectedRental(null);
                                                openEditRental(selectedRental);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        {selectedRental.paymentStatus === 'overdue' && (
                                            <Button
                                                variant="outline"
                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                disabled={sendingReminder === selectedRental.id}
                                                onClick={() => handleSendReminder(selectedRental)}
                                            >
                                                {sendingReminder === selectedRental.id ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Mail className="h-4 w-4 mr-2" />
                                                )}
                                                Send Reminder
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="text-destructive hover:bg-destructive hover:text-white"
                                            onClick={() => {
                                                setSelectedRental(null);
                                                openDeleteRental(selectedRental);
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

            {/* Edit Rental Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                if (!open) {
                    setEditingRental(null);
                    setFormErrors({});
                }
                setIsEditOpen(open);
                setPropertyDropdownOpen(false);
                setCustomerDropdownOpen(false);
            }}>
                <DialogContent className={`max-w-lg max-h-[90vh] overflow-y-auto ${shakeForm ? 'animate-shake' : ''}`}>
                    {editingRental && (
                        <>
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Edit Rental</h2>
                                <p className="text-sm text-muted-foreground">Update rental details</p>
                            </div>

                            <div className="space-y-4">
                                <PropertySelector isEdit />
                                <CustomerSelector />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Monthly Rent (OMR) *</label>
                                        <Input
                                            type="number"
                                            value={formData.monthlyRent}
                                            onChange={(e) => {
                                                setFormData({ ...formData, monthlyRent: e.target.value });
                                                if (formErrors.monthlyRent) setFormErrors({ ...formErrors, monthlyRent: false });
                                            }}
                                            className={formErrors.monthlyRent ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Deposit (OMR)</label>
                                        <Input
                                            type="number"
                                            value={formData.depositAmount}
                                            onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Lease Start *</label>
                                        <Input
                                            type="date"
                                            value={formData.leaseStart}
                                            onChange={(e) => {
                                                setFormData({ ...formData, leaseStart: e.target.value });
                                                if (formErrors.leaseStart) setFormErrors({ ...formErrors, leaseStart: false });
                                            }}
                                            className={formErrors.leaseStart ? 'border-destructive' : ''}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Lease End *</label>
                                        <Input
                                            type="date"
                                            value={formData.leaseEnd}
                                            onChange={(e) => {
                                                setFormData({ ...formData, leaseEnd: e.target.value });
                                                if (formErrors.leaseEnd) setFormErrors({ ...formErrors, leaseEnd: false });
                                            }}
                                            className={formErrors.leaseEnd ? 'border-destructive' : ''}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Due Day</label>
                                    <select
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                        value={formData.dueDay}
                                        onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                                    >
                                        {Array.from({ length: 28 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Notes</label>
                                    <Input
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        setIsEditOpen(false);
                                        setEditingRental(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                                    onClick={handleEditRental}
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
                if (!open) setDeletingRental(null);
                setIsDeleteOpen(open);
            }}>
                <DialogContent className="max-w-md">
                    {deletingRental && (() => {
                        const property = getProperty(deletingRental.propertyId);
                        const customer = getCustomer(deletingRental.customerId);
                        return (
                            <>
                                <div className="text-center mb-4">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                        <AlertTriangle className="h-6 w-6 text-destructive" />
                                    </div>
                                    <h2 className="text-lg font-semibold">Delete Rental</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Are you sure you want to delete this rental for <span className="font-medium">{property?.name}</span>?
                                    </p>
                                </div>

                                {/* Impact Warning */}
                                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-2">
                                    <p className="text-sm font-medium text-destructive flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        This action will:
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                        <li className="flex items-center gap-2">
                                            <Home className="h-4 w-4 text-green-600" />
                                            Free property: {property?.name}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-blue-600" />
                                            Remove tenant: {customer?.name}
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        disabled={isSubmitting}
                                        onClick={() => {
                                            setIsDeleteOpen(false);
                                            setDeletingRental(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                                        onClick={handleDeleteRental}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete Rental'
                                        )}
                                    </Button>
                                </div>
                            </>
                        );
                    })()}
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
                        {toast.type === 'info' && <Mail className="h-5 w-5" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
