'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
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
    Building2,
    Home,
    MapPin,
    Bed,
    Ruler,
    MoreVertical,
    AlertCircle,
    CheckCircle,
    ImagePlus,
    X,
    Loader2,
    ChevronDown,
    Store,
    Landmark,
    Mountain,
    Pencil,
    Trash2,
    User,
    Phone,
    Calendar,
} from 'lucide-react';
import Image from 'next/image';

// Types
interface ActiveTenant {
    id: string;
    name: string;
    phone?: string;
    rentalId: string;
    monthlyRent: number;
    startDate: string;
    endDate: string;
}

interface Property {
    id: string;
    propertyId: string;
    name: string;
    type: 'villa' | 'apartment' | 'shop' | 'office' | 'land';
    status: 'available' | 'rented' | 'sold';
    price: number;
    rentalPrice?: number;
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    balconies?: number;
    floor?: number;
    maintenance?: number;
    electricityMeter?: string;
    location: string;
    projectId: string;
    projectName: string;
    ownerId?: string;
    ownerName?: string;
    images: string[];
    activeTenant?: ActiveTenant;
}

interface Project {
    id: string;
    projectId: string;
    name: string;
    totalUnits: number;
    usedUnits: number;
}

// Areas data
const allAreas = [
    'Al Khuwair', 'Al Ghubra North', 'Al Ghubra South', 'Qurum', 'Medinat Qaboos',
    'Shatti Al Qurum', 'Ruwi', 'Al Wadi Kabir', 'Muttrah', 'Darsait',
    'Al Hail North', 'Al Hail South', 'Mawaleh North', 'Mawaleh South',
    'Al Maabilah North', 'Al Maabilah South', 'Bausher', 'Azaiba', 'Al Seeb',
    'Al Khoud', 'Al Ansab', 'Ghala', 'Wattayah', 'Al Amerat', 'Muscat Old Town',
    'Al Bustan', 'Qantab', 'Yiti', 'Al Mouj', 'The Wave'
];

const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'villa', label: 'Villa' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'shop', label: 'Shop' },
    { value: 'office', label: 'Office' },
    { value: 'land', label: 'Land' },
];

export default function PropertiesPage() {
    const { t, language } = useLanguage();
    const [properties, setProperties] = useState<Property[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Filter states
    const [filterType, setFilterType] = useState<string>('all');
    const [filterArea, setFilterArea] = useState<string>('all');
    const [isAreaSelectorOpen, setIsAreaSelectorOpen] = useState(false);
    const [areaSearchQuery, setAreaSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'villa',
        price: '',
        rentalPrice: '',
        area: '',
        bedrooms: '',
        bathrooms: '',
        balconies: '',
        floor: '',
        maintenance: '',
        electricityMeter: '',
        location: '',
        projectId: '',
        ownerId: '',
        images: [] as string[],
    });
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeForm, setShakeForm] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });

    // Project selector state
    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [owners, setOwners] = useState<any[]>([]);

    const imageInputRef = useRef<HTMLInputElement>(null);

    // Toast helper
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
    };

    // Fetch properties and projects from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const [propsRes, projsRes] = await Promise.all([
                fetch('/api/properties'),
                fetch('/api/projects'),
            ]);
            const propsData = await propsRes.json();
            const projsData = await projsRes.json();

            if (propsData.data) {
                const transformedProps: Property[] = propsData.data.map((p: any) => {
                    const activeRental = p.rentals?.[0];
                    return {
                        id: p.id,
                        propertyId: 'PRP-' + p.id.substring(0, 4).toUpperCase(),
                        name: p.title,
                        type: p.type || 'apartment',
                        status: p.status || 'available',
                        price: p.price || 0,
                        rentalPrice: activeRental?.monthlyRent || p.price || undefined,
                        area: parseFloat(p.area) || 0,
                        bedrooms: p.bedrooms || undefined,
                        bathrooms: p.bathrooms || undefined,
                        balconies: p.balconies || undefined,
                        floor: p.floor || undefined,
                        maintenance: p.maintenance || undefined,
                        electricityMeter: p.electricityMeter || undefined,
                        location: p.location || '',
                        projectId: p.projectId || '',
                        projectName: p.project?.name || '',
                        ownerId: p.ownerId || '',
                        ownerName: p.owner?.name || '',
                        images: p.images || [],
                        activeTenant: activeRental?.customer ? {
                            id: activeRental.customer.id,
                            name: activeRental.customer.name,
                            phone: activeRental.customer.phone,
                            rentalId: activeRental.id,
                            monthlyRent: activeRental.monthlyRent,
                            startDate: activeRental.startDate,
                            endDate: activeRental.endDate,
                        } : undefined,
                    };
                });
                setProperties(transformedProps);
            }

            if (projsData.data) {
                const transformedProjs: Project[] = projsData.data.map((p: any) => ({
                    id: p.id,
                    projectId: 'PRJ-' + p.id.substring(0, 4).toUpperCase(),
                    name: p.name,
                    totalUnits: p.totalUnits || 0,
                    usedUnits: p.propertiesCount || 0,
                }));
                setProjects(transformedProjs);
            }

            const ownersRes = await fetch('/api/owners');
            const ownersData = await ownersRes.json();
            if (ownersData.data) {
                setOwners(ownersData.data);
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

    // Close the ⋮ menu on any outside click
    useEffect(() => {
        if (!openMenuId) return;
        const handler = () => setOpenMenuId(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [openMenuId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-OM', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'villa': return Home;
            case 'apartment': return Building2;
            case 'shop': return Store;
            case 'office': return Landmark;
            case 'land': return Mountain;
            default: return Home;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { className: string; label: string }> = {
            available: { className: 'bg-green-500 text-white', label: 'Available' },
            rented: { className: 'bg-blue-500 text-white', label: 'Rented' },
        };
        const config = variants[status] || variants.available;
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const getProjectAvailability = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return { available: 0, total: 0, isFull: true, project: null };
        const available = project.totalUnits - project.usedUnits;
        return {
            available,
            total: project.totalUnits,
            isFull: available <= 0,
            project
        };
    };

    // Filtered projects for searchable selector
    const filteredProjects = useMemo(() => {
        return projects.filter(p =>
            p.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
            p.projectId.toLowerCase().includes(projectSearchQuery.toLowerCase())
        );
    }, [projects, projectSearchQuery]);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const remainingSlots = 10 - formData.images.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result as string]
                }));
                // Clear image error if we now have at least one
                if (formErrors.images) {
                    setFormErrors(prev => ({ ...prev, images: false }));
                }
            };
            reader.readAsDataURL(file);
        });

        // Reset input so same file can be selected again
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleCreateProperty = async () => {
        const errors: Record<string, boolean> = {};

        // Validation
        if (!formData.name.trim()) errors.name = true;
        if (!formData.price || parseFloat(formData.price) <= 0) errors.price = true;
        if (!formData.area || parseFloat(formData.area) <= 0) errors.area = true;

        // Check if project has available slots (only enforce when totalUnits is explicitly set > 0)
        if (formData.projectId) {
            const availability = getProjectAvailability(formData.projectId);
            if (availability.total > 0 && availability.isFull) {
                errors.projectId = true;
                setFormErrors(errors);
                setShakeForm(true);
                setTimeout(() => setShakeForm(false), 500);
                showToast('error', 'This project has no available units!');
                return;
            }
        }

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.name,
                    type: formData.type,
                    status: 'available',
                    price: formData.price,
                    area: formData.area,
                    bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
                    bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
                    balconies: formData.balconies ? parseInt(formData.balconies) : null,
                    floor: formData.floor || null,
                    maintenance: formData.maintenance || null,
                    electricityMeter: formData.electricityMeter || null,
                    location: formData.location,
                    projectId: formData.projectId || null,
                    ownerId: formData.ownerId || null,
                    images: formData.images,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create property');
            }

            resetForm();
            setIsCreateOpen(false);
            showToast('success', 'Property added successfully!');
            fetchData(); // Refresh list
        } catch (error: any) {
            showToast('error', error.message || 'Failed to create property');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open edit form pre-filled with existing property data
    const openEditForm = (property: Property) => {
        setEditingProperty(property);
        setFormData({
            name: property.name,
            type: property.type,
            price: String(property.price),
            rentalPrice: property.rentalPrice ? String(property.rentalPrice) : '',
            area: String(property.area),
            bedrooms: property.bedrooms ? String(property.bedrooms) : '',
            bathrooms: property.bathrooms ? String(property.bathrooms) : '',
            balconies: property.balconies ? String(property.balconies) : '',
            floor: property.floor ? String(property.floor) : '',
            maintenance: property.maintenance ? String(property.maintenance) : '',
            electricityMeter: property.electricityMeter || '',
            location: property.location,
            projectId: property.projectId || '',
            ownerId: property.ownerId || '',
            images: property.images || [],
        });
        setFormErrors({});
        setOpenMenuId(null);
        setIsCreateOpen(true);
    };

    // Handle editing an existing property via PUT /api/properties
    const handleEditProperty = async () => {
        if (!editingProperty) return;
        const errors: Record<string, boolean> = {};
        if (!formData.name.trim()) errors.name = true;
        if (!formData.price || parseFloat(formData.price) <= 0) errors.price = true;
        if (!formData.area || parseFloat(formData.area) <= 0) errors.area = true;
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/properties', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingProperty.id,
                    title: formData.name,
                    type: formData.type,
                    price: formData.price,
                    area: formData.area,
                    bedrooms: formData.bedrooms || null,
                    bathrooms: formData.bathrooms || null,
                    balconies: formData.balconies || null,
                    floor: formData.floor || null,
                    maintenance: formData.maintenance || null,
                    electricityMeter: formData.electricityMeter || null,
                    location: formData.location,
                    projectId: formData.projectId || null,
                    ownerId: formData.ownerId || null,
                    images: formData.images,
                }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update property');
            }
            setIsCreateOpen(false);
            setEditingProperty(null);
            resetForm();
            showToast('success', 'Property updated successfully!');
            fetchData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to update property');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete property
    const handleDeleteProperty = async (propertyId: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return;
        try {
            const response = await fetch(`/api/properties?id=${propertyId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            showToast('success', 'Property deleted successfully!');
            fetchData();
        } catch {
            showToast('error', 'Failed to delete property');
        }
        setOpenMenuId(null);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'villa',
            price: '',
            rentalPrice: '',
            area: '',
            bedrooms: '',
            bathrooms: '',
            balconies: '',
            floor: '',
            maintenance: '',
            electricityMeter: '',
            location: '',
            projectId: '',
            ownerId: '',
            images: [],
        });
        setFormErrors({});
        setProjectSearchQuery('');
    };

    const selectProject = (projectId: string) => {
        setFormData({ ...formData, projectId });
        setIsProjectSelectorOpen(false);
        setProjectSearchQuery('');
        if (formErrors.projectId) setFormErrors({ ...formErrors, projectId: false });
    };

    // Filtered areas for searchable dropdown
    const filteredAreas = useMemo(() => {
        return allAreas.filter(area =>
            area.toLowerCase().includes(areaSearchQuery.toLowerCase())
        );
    }, [areaSearchQuery]);

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.propertyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'all' || property.type === filterType;

        // Match area - location contains the area name
        const matchesArea = filterArea === 'all' || property.location.toLowerCase().includes(filterArea.toLowerCase());

        return matchesSearch && matchesType && matchesArea;
    });

    const selectedProjectData = formData.projectId ? getProjectAvailability(formData.projectId) : null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t.properties.title}</h1>
                        <p className="text-sm text-muted-foreground">{t.properties.subtitle}</p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                    >
                        <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t.properties.addProperty}
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={`${t.common.search}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rtl:pl-4 rtl:pr-10 bg-card border-border"
                        />
                    </div>

                    {/* Filter Row */}
                    <div className="flex flex-wrap gap-3">
                        {/* Type Filter */}
                        <select
                            className="rounded-lg border border-border bg-card px-3 py-2 text-sm h-10 min-w-[140px]"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            {propertyTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>

                        {/* Searchable Area Selector */}
                        <div className="relative min-w-[200px]">
                            <button
                                type="button"
                                onClick={() => setIsAreaSelectorOpen(!isAreaSelectorOpen)}
                                className="w-full flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm h-10 hover:bg-muted/50 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {filterArea === 'all' ? t.common.allAreas : filterArea}
                                </span>
                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isAreaSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Panel */}
                            {isAreaSelectorOpen && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-[280px]">
                                    {/* Search Input */}
                                    <div className="p-3 border-b border-border">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder={t.common.searchAreas}
                                                value={areaSearchQuery}
                                                onChange={(e) => setAreaSearchQuery(e.target.value)}
                                                className="pl-10"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* Areas List */}
                                    <div className="max-h-64 overflow-y-auto">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterArea('all');
                                                setIsAreaSelectorOpen(false);
                                                setAreaSearchQuery('');
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 ${filterArea === 'all' ? 'bg-[#cea26e]/10' : ''}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                {t.common.allAreas}
                                            </span>
                                            {filterArea === 'all' && <CheckCircle className="h-4 w-4 text-[#cea26e]" />}
                                        </button>
                                        {filteredAreas.map((area) => (
                                            <button
                                                key={area}
                                                type="button"
                                                onClick={() => {
                                                    setFilterArea(area);
                                                    setIsAreaSelectorOpen(false);
                                                    setAreaSearchQuery('');
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 ${filterArea === area ? 'bg-[#cea26e]/10' : ''}`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    {area}
                                                </span>
                                                {filterArea === area && <CheckCircle className="h-4 w-4 text-[#cea26e]" />}
                                            </button>
                                        ))}
                                        {filteredAreas.length === 0 && (
                                            <div className="p-4 text-center text-muted-foreground text-sm">
                                                {t.common.noAreasFound}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Active filters count */}
                        {(filterType !== 'all' || filterArea !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFilterType('all');
                                    setFilterArea('all');
                                }}
                                className="h-10 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4 mr-1" />
                                {t.common.clearFilters}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">{t.stats.totalProperties}</p>
                        <p className="text-2xl font-bold">{properties.length}</p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">{t.properties.available}</p>
                        <p className="text-2xl font-bold text-green-600">{properties.filter(p => p.status === 'available').length}</p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <p className="text-xs text-muted-foreground">{t.properties.rented}</p>
                        <p className="text-2xl font-bold text-blue-600">{properties.filter(p => p.status === 'rented').length}</p>
                    </Card>
                    {/* Sold stat removed — Properties module is for rentals only */}
                </div>

                {/* Properties Grid - Updated with Photos */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProperties.map((property) => {
                        const Icon = getTypeIcon(property.type);

                        return (
                            <Card
                                key={property.id}
                                className="overflow-hidden shadow-sm border-0 cursor-pointer hover:shadow-lg transition-all group"
                                onClick={() => setSelectedProperty(property)}
                            >
                                {/* Property Image */}
                                <div className="relative h-48 w-full bg-muted overflow-hidden">
                                    {property.images[0] ? (
                                        <Image
                                            src={property.images[0]}
                                            alt={property.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#cea26e]/20 to-[#cea26e]/10">
                                            <Icon className="h-12 w-12 text-[#cea26e]/50" />
                                        </div>
                                    )}
                                    {/* Status Badge Overlay */}
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(property.status)}
                                    </div>
                                    {/* Image Count */}
                                    {property.images.length > 1 && (
                                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <ImagePlus className="h-3 w-3" />
                                            {property.images.length}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-[9px] h-4 border-[#cea26e]/30 text-[#cea26e]">
                                                    {property.propertyId}
                                                </Badge>
                                                <Badge variant="secondary" className="text-[9px] h-4 capitalize">
                                                    {property.type}
                                                </Badge>
                                            </div>
                                            <h3 className="text-base font-semibold">{property.name}</h3>
                                        </div>
                                        {/* ⋮ Menu */}
                                        <div className="relative">
                                            <button
                                                className="p-1 rounded hover:bg-muted"
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === property.id ? null : property.id); }}
                                            >
                                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            {openMenuId === property.id && (
                                                <div className="absolute right-0 top-7 z-50 w-36 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                                                    <button
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); openEditForm(property); }}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5 text-[#cea26e]" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteProperty(property.id); }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                                        <MapPin className="h-3 w-3" />
                                        <span>{property.location}</span>
                                    </div>

                                    {/* Details Row */}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                        {property.bedrooms && (
                                            <div className="flex items-center gap-1">
                                                <Bed className="h-3 w-3" />
                                                <span>{property.bedrooms} BR</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Ruler className="h-3 w-3" />
                                            <span>{property.area}m²</span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div>
                                            <p className="text-lg font-bold">OMR {formatCurrency(property.price)}</p>
                                        </div>
                                        {property.rentalPrice && (
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Rent</p>
                                                <p className="text-sm font-semibold text-[#cea26e]">OMR {formatCurrency(property.rentalPrice)}/mo</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Badge */}
                                    {property.projectName && (
                                        <div className="mt-3">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {property.projectName}
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Active Tenant Panel */}
                                    {property.activeTenant ? (
                                        <div className="mt-3 rounded-lg bg-blue-500/8 border border-blue-500/20 p-2.5">
                                            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1.5">Active Tenant</p>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <User className="h-3 w-3 text-blue-500 shrink-0" />
                                                <span className="text-xs font-medium truncate">{property.activeTenant.name}</span>
                                            </div>
                                            {property.activeTenant.phone && (
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span className="text-xs text-muted-foreground">{property.activeTenant.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(property.activeTenant.startDate).toLocaleDateString('en-GB')} → {new Date(property.activeTenant.endDate).toLocaleDateString('en-GB')}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-blue-500/20">
                                                <span className="text-[10px] text-muted-foreground">Monthly Rent</span>
                                                <span className="text-xs font-bold text-blue-600">OMR {property.activeTenant.monthlyRent.toFixed(3)}</span>
                                            </div>
                                        </div>
                                    ) : property.status === 'available' ? (
                                        <div className="mt-3 rounded-lg bg-muted/40 border border-dashed border-border p-2 text-center">
                                            <p className="text-[10px] text-muted-foreground">No active tenant</p>
                                        </div>
                                    ) : null}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredProperties.length === 0 && (
                    <div className="text-center py-12">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t.properties.noProperties}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t.properties.addFirst}</p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t.properties.addProperty}
                        </Button>
                    </div>
                )}
            </div>

            {/* Create / Edit Property Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                if (!open) {
                    resetForm();
                    setShakeForm(false);
                    setEditingProperty(null);
                }
                setIsCreateOpen(open);
            }}>
                <DialogContent className={`max-w-lg max-h-[90vh] overflow-y-auto ${shakeForm ? 'animate-shake' : ''}`}>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">
                            {editingProperty ? 'Edit Property' : t.properties.addNew}
                        </h2>
                        <p className="text-sm text-muted-foreground">{t.properties.subtitle}</p>
                    </div>

                    <div className="space-y-5">
                        {/* Project Selection - Searchable and Mobile Friendly */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Parent Project * <span className="text-muted-foreground font-normal">(Required)</span>
                            </label>

                            {/* Custom Searchable Dropdown */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
                                    className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${formErrors.projectId ? 'border-destructive bg-destructive/5' : 'border-border bg-card hover:bg-muted/50'
                                        }`}
                                >
                                    {selectedProjectData?.project ? (
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{selectedProjectData.project.name}</p>
                                            <p className={`text-xs ${selectedProjectData.isFull ? 'text-destructive' : 'text-green-600'}`}>
                                                {selectedProjectData.available} / {selectedProjectData.total} units available
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Select a project...</span>
                                    )}
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isProjectSelectorOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Panel */}
                                {isProjectSelectorOpen && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                                        {/* Search Input */}
                                        <div className="p-3 border-b border-border">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search projects..."
                                                    value={projectSearchQuery}
                                                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                                                    className="pl-10"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {/* Project List */}
                                        <div className="max-h-64 overflow-y-auto">
                                            {filteredProjects.length === 0 ? (
                                                <div className="p-4 text-center text-muted-foreground text-sm">
                                                    No projects found
                                                </div>
                                            ) : (
                                                filteredProjects.map((project) => {
                                                    const availability = getProjectAvailability(project.id);
                                                    return (
                                                        <button
                                                            key={project.id}
                                                            type="button"
                                                            onClick={() => selectProject(project.id)}
                                                            disabled={availability.isFull}
                                                            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${availability.isFull
                                                                ? 'opacity-50 cursor-not-allowed bg-muted/30'
                                                                : 'hover:bg-muted/50 cursor-pointer'
                                                                } ${formData.projectId === project.id ? 'bg-[#cea26e]/10' : ''}`}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-medium truncate">{project.name}</p>
                                                                    {formData.projectId === project.id && (
                                                                        <CheckCircle className="h-4 w-4 text-[#cea26e]" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">{project.projectId}</p>
                                                            </div>
                                                            <div className="text-right ml-3">
                                                                {availability.isFull ? (
                                                                    <Badge variant="destructive" className="text-[10px]">Full</Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600">
                                                                        {availability.available} slots
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {formErrors.projectId && !formData.projectId && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Please select a project
                                </p>
                            )}
                        </div>

                        {/* Property Images - Mobile Friendly */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Property Images * <span className="text-muted-foreground font-normal">(1 required, max 10)</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={imageInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            {/* Image Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                        <Image src={img} alt={`Property ${index + 1}`} fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        {index === 0 && (
                                            <span className="absolute bottom-1 left-1 bg-[#cea26e] text-white text-[9px] px-1.5 py-0.5 rounded">
                                                Main
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {/* Add Image Button */}
                                {formData.images.length < 10 && (
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 transition-colors ${formErrors.images ? 'border-destructive bg-destructive/5' : 'border-border'
                                            }`}
                                    >
                                        <ImagePlus className="h-6 w-6" />
                                        <span className="text-[10px]">Add Photo</span>
                                    </button>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground mt-2">
                                {formData.images.length}/10 images • First image will be the cover
                            </p>
                            {formErrors.images && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    At least one image is required
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Property Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (formErrors.name) setFormErrors({ ...formErrors, name: false });
                                    }}
                                    placeholder="e.g., Villa A1"
                                    className={formErrors.name ? 'border-destructive' : ''}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Type</label>
                                <select
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="villa">Villa</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="shop">Shop</option>
                                    <option value="office">Office</option>
                                    <option value="land">Land</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Rental Price / Month (OMR) *</label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => {
                                        setFormData({ ...formData, price: e.target.value });
                                        if (formErrors.price) setFormErrors({ ...formErrors, price: false });
                                    }}
                                    placeholder="e.g., 85000"
                                    className={formErrors.price ? 'border-destructive' : ''}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Rental Price (OMR/mo)</label>
                                <Input
                                    type="number"
                                    value={formData.rentalPrice}
                                    onChange={(e) => setFormData({ ...formData, rentalPrice: e.target.value })}
                                    placeholder="e.g., 650"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Area (m²) *</label>
                            <Input
                                type="number"
                                value={formData.area}
                                onChange={(e) => {
                                    setFormData({ ...formData, area: e.target.value });
                                    if (formErrors.area) setFormErrors({ ...formErrors, area: false });
                                }}
                                placeholder="e.g., 280"
                                className={formErrors.area ? 'border-destructive' : ''}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Bedrooms</label>
                                <Input
                                    type="number"
                                    value={formData.bedrooms}
                                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                                    placeholder="e.g., 4"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Bathrooms</label>
                                <Input
                                    type="number"
                                    value={formData.bathrooms}
                                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                                    placeholder="e.g., 3"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Number of Balconies</label>
                                <Input
                                    type="number"
                                    value={formData.balconies}
                                    onChange={(e) => setFormData({ ...formData, balconies: e.target.value })}
                                    placeholder="e.g., 2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Floor</label>
                                <Input
                                    type="number"
                                    value={formData.floor}
                                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                    placeholder="e.g., 5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Maintenance (صيانة)</label>
                                <Input
                                    type="number"
                                    value={formData.maintenance}
                                    onChange={(e) => setFormData({ ...formData, maintenance: e.target.value })}
                                    placeholder="e.g., 50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Electricity Meter Number</label>
                                <Input
                                    value={formData.electricityMeter}
                                    onChange={(e) => setFormData({ ...formData, electricityMeter: e.target.value })}
                                    placeholder="e.g., 123456789"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Location *</label>
                            <Input
                                value={formData.location}
                                onChange={(e) => {
                                    setFormData({ ...formData, location: e.target.value });
                                    if (formErrors.location) setFormErrors({ ...formErrors, location: false });
                                }}
                                placeholder="e.g., Al Khuwair, Muscat"
                                className={formErrors.location ? 'border-destructive' : ''}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Owner (المالك)</label>
                            <select
                                value={formData.ownerId}
                                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select Owner</option>
                                {owners.map(owner => (
                                    <option key={owner.id} value={owner.id}>{owner.name}</option>
                                ))}
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
                            onClick={editingProperty ? handleEditProperty : handleCreateProperty}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {editingProperty ? 'Saving...' : 'Adding...'}
                                </>
                            ) : (
                                editingProperty ? 'Save Changes' : 'Add Property'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Property Details Dialog */}
            <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0" showCloseButton={false}>
                    {selectedProperty && (
                        <>
                            {/* Image Gallery */}
                            <div className="relative h-64 w-full bg-muted">
                                {selectedProperty.images[0] ? (
                                    <Image
                                        src={selectedProperty.images[0]}
                                        alt={selectedProperty.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#cea26e]/20 to-[#cea26e]/10">
                                        <Building2 className="h-16 w-16 text-[#cea26e]/50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <button
                                    onClick={() => setSelectedProperty(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-[10px] h-5 bg-white/90 text-[#cea26e] border-0">
                                            {selectedProperty.propertyId}
                                        </Badge>
                                        {getStatusBadge(selectedProperty.status)}
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{selectedProperty.name}</h2>
                                    <div className="flex items-center gap-1 text-sm text-white/80 mt-1">
                                        <MapPin className="h-4 w-4" />
                                        {selectedProperty.location}
                                    </div>
                                </div>
                                {/* Image Count */}
                                {selectedProperty.images.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <ImagePlus className="h-3 w-3" />
                                        {selectedProperty.images.length} photos
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Project */}
                                <Card className="p-4 border-0 shadow-sm bg-[#cea26e]/5">
                                    <p className="text-xs text-muted-foreground mb-1">Project</p>
                                    <p className="text-sm font-medium">{selectedProperty.projectName || '—'}</p>
                                </Card>

                                {/* Owner */}
                                {selectedProperty.ownerName && (
                                    <Card className="p-4 border-0 shadow-sm bg-blue-500/5">
                                        <p className="text-xs text-muted-foreground mb-1">Owner</p>
                                        <p className="text-sm font-medium">{selectedProperty.ownerName}</p>
                                    </Card>
                                )}

                                {/* Pricing */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="p-4 border-0 shadow-sm">
                                        <p className="text-xs text-muted-foreground mb-1">Rental Price / Month</p>
                                        <p className="text-lg font-semibold text-[#cea26e]">OMR {formatCurrency(selectedProperty.rentalPrice || selectedProperty.price)}/mo</p>
                                    </Card>
                                </div>

                                {/* Details */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Property Details</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                            <Ruler className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Area</p>
                                                <p className="text-sm font-medium">{selectedProperty.area}m²</p>
                                            </div>
                                        </div>
                                        {selectedProperty.bedrooms && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                <Bed className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                                                    <p className="text-sm font-medium">{selectedProperty.bedrooms}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedProperty.bathrooms && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                <div className="h-4 w-4 bg-muted-foreground/20 rounded-sm"></div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                                                    <p className="text-sm font-medium">{selectedProperty.bathrooms}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedProperty.balconies && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                <div className="h-4 w-4 bg-muted-foreground/20 rounded-sm"></div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Balconies</p>
                                                    <p className="text-sm font-medium">{selectedProperty.balconies}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedProperty.floor && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                <div className="h-4 w-4 bg-muted-foreground/20 rounded-sm"></div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Floor</p>
                                                    <p className="text-sm font-medium">{selectedProperty.floor}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedProperty.maintenance && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                <div className="h-4 w-4 bg-muted-foreground/20 rounded-sm"></div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Maintenance</p>
                                                    <p className="text-sm font-medium">OMR {formatCurrency(selectedProperty.maintenance)}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedProperty.electricityMeter && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                <div className="h-4 w-4 bg-muted-foreground/20 rounded-sm"></div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Electricity Meter</p>
                                                    <p className="text-sm font-medium">{selectedProperty.electricityMeter}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Image Thumbnails */}
                                {selectedProperty.images.length > 1 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-3">All Photos</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedProperty.images.map((img, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                                    <Image src={img} alt={`${selectedProperty.name} ${index + 1}`} fill className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
