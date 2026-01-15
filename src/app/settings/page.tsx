'use client';

import { useState } from 'react';
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
    MapPin,
    Plus,
    Search,
    Pencil,
    Trash2,
    HardDrive,
    Shield,
    Key,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    X,
    Loader2,
    Building2,
    FolderOpen,
    FileText,
    Users,
    Database,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Types
interface Area {
    id: string;
    name: string;
    city: string;
}

interface City {
    id: string;
    name: string;
    areasCount: number;
}

// Initial Muscat areas data
const initialAreas: Area[] = [
    // Muscat Governorate - Major Areas
    { id: '1', name: 'Al Khuwair', city: 'Muscat' },
    { id: '2', name: 'Al Ghubra North', city: 'Muscat' },
    { id: '3', name: 'Al Ghubra South', city: 'Muscat' },
    { id: '4', name: 'Qurum', city: 'Muscat' },
    { id: '5', name: 'Medinat Qaboos', city: 'Muscat' },
    { id: '6', name: 'Shatti Al Qurum', city: 'Muscat' },
    { id: '7', name: 'Ruwi', city: 'Muscat' },
    { id: '8', name: 'Al Wadi Kabir', city: 'Muscat' },
    { id: '9', name: 'Muttrah', city: 'Muscat' },
    { id: '10', name: 'Darsait', city: 'Muscat' },
    { id: '11', name: 'Al Hail North', city: 'Muscat' },
    { id: '12', name: 'Al Hail South', city: 'Muscat' },
    { id: '13', name: 'Mawaleh North', city: 'Muscat' },
    { id: '14', name: 'Mawaleh South', city: 'Muscat' },
    { id: '15', name: 'Al Maabilah North', city: 'Muscat' },
    { id: '16', name: 'Al Maabilah South', city: 'Muscat' },
    { id: '17', name: 'Bausher', city: 'Muscat' },
    { id: '18', name: 'Azaiba', city: 'Muscat' },
    { id: '19', name: 'Al Seeb', city: 'Muscat' },
    { id: '20', name: 'Al Khoud', city: 'Muscat' },
    { id: '21', name: 'Al Ansab', city: 'Muscat' },
    { id: '22', name: 'Ghala', city: 'Muscat' },
    { id: '23', name: 'Wattayah', city: 'Muscat' },
    { id: '24', name: 'Al Amerat', city: 'Muscat' },
    { id: '25', name: 'Muscat Old Town', city: 'Muscat' },
    { id: '26', name: 'Al Bustan', city: 'Muscat' },
    { id: '27', name: 'Qantab', city: 'Muscat' },
    { id: '28', name: 'Yiti', city: 'Muscat' },
    { id: '29', name: 'Al Mouj', city: 'Muscat' },
    { id: '30', name: 'The Wave', city: 'Muscat' },
];

const initialCities: City[] = [
    { id: '1', name: 'Muscat', areasCount: 30 },
];

// Storage data (System vs User Data like existing Telal)
const storageInfo = {
    total: 50, // GB
    system: 12, // GB - fixed system storage
    userData: 6.5, // GB - user data (calculated from records)
};

const CONFIRM_PHRASE = 'DELETE ALL DATA';

export default function SettingsPage() {
    const { t, language } = useLanguage();
    const [areas, setAreas] = useState<Area[]>(initialAreas);
    const [cities, setCities] = useState<City[]>(initialCities);
    const [activeSection, setActiveSection] = useState<'areas' | 'storage' | 'security'>('areas');

    // Area management state
    const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<Area | null>(null);
    const [areaFormData, setAreaFormData] = useState({ name: '', city: 'Muscat' });
    const [areaFormErrors, setAreaFormErrors] = useState<Record<string, boolean>>({});
    const [areasSearchQuery, setAreasSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeForm, setShakeForm] = useState(false);

    // City management state
    const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
    const [cityFormData, setCityFormData] = useState({ name: '' });

    // Delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingArea, setDeletingArea] = useState<Area | null>(null);

    // Toast
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });

    // Security state
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, boolean>>({});

    // Clean all data state
    const [showCleanConfirm, setShowCleanConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter areas
    const filteredAreas = areas.filter(area => {
        const matchesSearch = area.name.toLowerCase().includes(areasSearchQuery.toLowerCase());
        const matchesCity = selectedCity === 'all' || area.city === selectedCity;
        return matchesSearch && matchesCity;
    });

    // Group areas by city for display
    const groupedAreas = filteredAreas.reduce((acc, area) => {
        if (!acc[area.city]) acc[area.city] = [];
        acc[area.city].push(area);
        return acc;
    }, {} as Record<string, Area[]>);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
    };

    // Area handlers
    const openAddArea = () => {
        setEditingArea(null);
        setAreaFormData({ name: '', city: cities[0]?.name || 'Muscat' });
        setAreaFormErrors({});
        setIsAreaDialogOpen(true);
    };

    const openEditArea = (area: Area) => {
        setEditingArea(area);
        setAreaFormData({ name: area.name, city: area.city });
        setAreaFormErrors({});
        setIsAreaDialogOpen(true);
    };

    const handleSaveArea = async () => {
        const errors: Record<string, boolean> = {};
        if (!areaFormData.name.trim()) errors.name = true;
        if (!areaFormData.city.trim()) errors.city = true;

        // Check for duplicate
        const isDuplicate = areas.some(a =>
            a.name.toLowerCase() === areaFormData.name.toLowerCase() &&
            a.city === areaFormData.city &&
            a.id !== editingArea?.id
        );
        if (isDuplicate) {
            errors.name = true;
            showToast('error', 'This area already exists in the selected city');
            return;
        }

        setAreaFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (editingArea) {
            // Update existing
            setAreas(areas.map(a => a.id === editingArea.id
                ? { ...a, name: areaFormData.name, city: areaFormData.city }
                : a
            ));
            showToast('success', 'Area updated successfully');
        } else {
            // Add new
            const newArea: Area = {
                id: `${Date.now()}`,
                name: areaFormData.name,
                city: areaFormData.city,
            };
            setAreas([...areas, newArea]);

            // Update city count
            if (!cities.find(c => c.name === areaFormData.city)) {
                setCities([...cities, { id: `${Date.now()}`, name: areaFormData.city, areasCount: 1 }]);
            }
            showToast('success', 'Area added successfully');
        }

        setIsSubmitting(false);
        setIsAreaDialogOpen(false);
    };

    const openDeleteArea = (area: Area) => {
        setDeletingArea(area);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteArea = async () => {
        if (!deletingArea) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 400));
        setAreas(areas.filter(a => a.id !== deletingArea.id));
        setIsSubmitting(false);
        setIsDeleteDialogOpen(false);
        setDeletingArea(null);
        showToast('success', 'Area deleted successfully');
    };

    // City handler
    const handleAddCity = async () => {
        if (!cityFormData.name.trim()) return;

        if (cities.find(c => c.name.toLowerCase() === cityFormData.name.toLowerCase())) {
            showToast('error', 'This city already exists');
            return;
        }

        const newCity: City = {
            id: `${Date.now()}`,
            name: cityFormData.name,
            areasCount: 0,
        };
        setCities([...cities, newCity]);
        setCityFormData({ name: '' });
        setIsCityDialogOpen(false);
        showToast('success', 'City added successfully');
    };

    // Password handler
    const handleChangePassword = async () => {
        const errors: Record<string, boolean> = {};
        if (!passwordData.current) errors.current = true;
        if (!passwordData.new || passwordData.new.length < 6) errors.new = true;
        if (passwordData.new !== passwordData.confirm) errors.confirm = true;

        setPasswordErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsSubmitting(false);
        setPasswordData({ current: '', new: '', confirm: '' });
        showToast('success', 'Password changed successfully');
    };
    // Handle clean all data
    const handleCleanAllData = async () => {
        if (confirmText !== CONFIRM_PHRASE) {
            showToast('error', 'Please type the confirmation phrase exactly');
            return;
        }

        setIsDeleting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, this would call the API to delete all data
        showToast('success', 'All data has been deleted successfully');
        setShowCleanConfirm(false);
        setConfirmText('');
        setIsDeleting(false);
    };

    // Storage calculations
    const usedStorage = storageInfo.system + storageInfo.userData;
    const usedPercentage = (usedStorage / storageInfo.total) * 100;
    const systemPercentage = (storageInfo.system / storageInfo.total) * 100;
    const userDataPercentage = (storageInfo.userData / storageInfo.total) * 100;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t.settings.title}</h1>
                    <p className="text-sm text-muted-foreground">{t.settings.subtitle}</p>
                </div>

                {/* Settings Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                        variant={activeSection === 'areas' ? 'default' : 'outline'}
                        className={activeSection === 'areas' ? 'bg-[#cea26e] hover:bg-[#b8915f]' : ''}
                        onClick={() => setActiveSection('areas')}
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        {t.settings.areas}
                    </Button>
                    <Button
                        variant={activeSection === 'storage' ? 'default' : 'outline'}
                        className={activeSection === 'storage' ? 'bg-[#cea26e] hover:bg-[#b8915f]' : ''}
                        onClick={() => setActiveSection('storage')}
                    >
                        <HardDrive className="h-4 w-4 mr-2" />
                        {t.settings.storage}
                    </Button>
                    <Button
                        variant={activeSection === 'security' ? 'default' : 'outline'}
                        className={activeSection === 'security' ? 'bg-[#cea26e] hover:bg-[#b8915f]' : ''}
                        onClick={() => setActiveSection('security')}
                    >
                        <Shield className="h-4 w-4 mr-2" />
                        {t.settings.security}
                    </Button>
                </div>

                {/* Areas Directory Section */}
                {activeSection === 'areas' && (
                    <div className="space-y-4">
                        {/* Areas Header */}
                        <Card className="p-4 border-0 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-[#cea26e]" />
                                        {t.settings.areas}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">{t.settings.areasDescription}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsCityDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t.settings.addCity}
                                    </Button>
                                    <Button className="bg-[#cea26e] hover:bg-[#b8915f]" onClick={openAddArea}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t.settings.addArea}
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search areas..."
                                    value={areasSearchQuery}
                                    onChange={(e) => setAreasSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <select
                                className="rounded-md border border-border bg-card px-3 py-2 text-sm h-10 min-w-[160px]"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                <option value="all">All Cities ({areas.length})</option>
                                {cities.map((city) => {
                                    const count = areas.filter(a => a.city === city.name).length;
                                    return (
                                        <option key={city.id} value={city.name}>
                                            {city.name} ({count})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Areas List */}
                        <div className="space-y-4">
                            {Object.entries(groupedAreas).map(([cityName, cityAreas]) => (
                                <Card key={cityName} className="p-4 border-0 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-[#cea26e]" />
                                            {cityName}
                                            <Badge variant="secondary" className="text-xs ml-2">
                                                {cityAreas.length} areas
                                            </Badge>
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {cityAreas.map((area) => (
                                            <div
                                                key={area.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-sm truncate">{area.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditArea(area)}
                                                        className="p-1.5 rounded hover:bg-background"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteArea(area)}
                                                        className="p-1.5 rounded hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))}

                            {filteredAreas.length === 0 && (
                                <div className="text-center py-12">
                                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">{t.settings.noAreas}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{t.settings.noAreasDescription}</p>
                                    <Button className="bg-[#cea26e] hover:bg-[#b8915f]" onClick={openAddArea}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t.settings.addArea}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Storage Section */}
                {activeSection === 'storage' && (
                    <div className="space-y-4">
                        <Card className="p-6 border-0 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <HardDrive className="h-5 w-5 text-[#cea26e]" />
                                Storage & Data Management
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6">Manage storage space and clean data</p>

                            {/* Storage Usage Display */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Storage Used</span>
                                    <span className="text-sm text-muted-foreground">
                                        {usedStorage.toFixed(1)} GB / {storageInfo.total} GB
                                    </span>
                                </div>

                                {/* Stacked Progress Bar */}
                                <div className="h-4 bg-muted rounded-full w-full overflow-hidden">
                                    <div className="h-full flex">
                                        {/* System storage (grey) */}
                                        <div
                                            className="h-full bg-gray-400 transition-all duration-500"
                                            style={{ width: `${systemPercentage}%` }}
                                            title={`System: ${storageInfo.system} GB`}
                                        />
                                        {/* User data storage (primary color) */}
                                        <div
                                            className="h-full bg-[#cea26e] transition-all duration-500"
                                            style={{ width: `${userDataPercentage}%` }}
                                            title={`User Data: ${storageInfo.userData} GB`}
                                        />
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 mt-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm bg-gray-400" />
                                        <span className="text-xs text-muted-foreground">
                                            System: {storageInfo.system} GB
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm bg-[#cea26e]" />
                                        <span className="text-xs text-muted-foreground">
                                            User Data: {storageInfo.userData} GB
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm bg-muted border border-border" />
                                        <span className="text-xs text-muted-foreground">
                                            Available: {(storageInfo.total - usedStorage).toFixed(1)} GB
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Clean All Data Section */}
                        <Card className="p-6 border-0 shadow-sm border-l-4 border-l-destructive">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 rounded-lg bg-destructive/10">
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-destructive">{t.settings.cleanAllData}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t.settings.cleanAllDescription}
                                    </p>
                                </div>
                            </div>

                            {!showCleanConfirm ? (
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowCleanConfirm(true)}
                                    className="w-full sm:w-auto"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t.settings.cleanAllData}
                                </Button>
                            ) : (
                                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-4">
                                    <div className="flex items-center gap-2 text-destructive">
                                        <AlertCircle className="h-5 w-5" />
                                        <span className="font-medium">{t.settings.warningCannotUndo}</span>
                                    </div>

                                    <p className="text-sm">
                                        To confirm, type &quot;<span className="font-mono font-bold">{CONFIRM_PHRASE}</span>&quot; below:
                                    </p>

                                    <Input
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder={CONFIRM_PHRASE}
                                        className={confirmText === CONFIRM_PHRASE ? 'border-destructive' : ''}
                                    />

                                    <div className="flex gap-3">
                                        <Button
                                            variant="destructive"
                                            onClick={handleCleanAllData}
                                            disabled={confirmText !== CONFIRM_PHRASE || isDeleting}
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                'Confirm Delete'
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowCleanConfirm(false);
                                                setConfirmText('');
                                            }}
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* Security Section */}
                {activeSection === 'security' && (
                    <div className="space-y-4">
                        <Card className={`p-6 border-0 shadow-sm ${shakeForm ? 'animate-shake' : ''}`}>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Key className="h-5 w-5 text-[#cea26e]" />
                                Change Password
                            </h2>

                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                                    <Input
                                        type="password"
                                        value={passwordData.current}
                                        onChange={(e) => {
                                            setPasswordData({ ...passwordData, current: e.target.value });
                                            if (passwordErrors.current) setPasswordErrors({ ...passwordErrors, current: false });
                                        }}
                                        placeholder="Enter current password"
                                        className={passwordErrors.current ? 'border-destructive' : ''}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">New Password</label>
                                    <Input
                                        type="password"
                                        value={passwordData.new}
                                        onChange={(e) => {
                                            setPasswordData({ ...passwordData, new: e.target.value });
                                            if (passwordErrors.new) setPasswordErrors({ ...passwordErrors, new: false });
                                        }}
                                        placeholder="Enter new password (min 6 characters)"
                                        className={passwordErrors.new ? 'border-destructive' : ''}
                                    />
                                    {passwordErrors.new && (
                                        <p className="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Confirm New Password</label>
                                    <Input
                                        type="password"
                                        value={passwordData.confirm}
                                        onChange={(e) => {
                                            setPasswordData({ ...passwordData, confirm: e.target.value });
                                            if (passwordErrors.confirm) setPasswordErrors({ ...passwordErrors, confirm: false });
                                        }}
                                        placeholder="Confirm new password"
                                        className={passwordErrors.confirm ? 'border-destructive' : ''}
                                    />
                                    {passwordErrors.confirm && (
                                        <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                                    )}
                                </div>
                                <Button
                                    className="bg-[#cea26e] hover:bg-[#b8915f]"
                                    onClick={handleChangePassword}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        'Change Password'
                                    )}
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6 border-0 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-[#cea26e]" />
                                Account Security
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                    </div>
                                    <Badge variant="secondary">Coming Soon</Badge>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="font-medium">Login History</p>
                                        <p className="text-sm text-muted-foreground">View your recent login activity</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Add/Edit Area Dialog */}
            <Dialog open={isAreaDialogOpen} onOpenChange={setIsAreaDialogOpen}>
                <DialogContent className={`max-w-md ${shakeForm ? 'animate-shake' : ''}`}>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">{editingArea ? 'Edit Area' : 'Add New Area'}</h2>
                        <p className="text-sm text-muted-foreground">
                            {editingArea ? 'Update area details' : 'Add a new location to your directory'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">City *</label>
                            <select
                                className={`w-full rounded-md border px-3 py-2 text-sm h-10 ${areaFormErrors.city ? 'border-destructive' : 'border-border bg-background'
                                    }`}
                                value={areaFormData.city}
                                onChange={(e) => setAreaFormData({ ...areaFormData, city: e.target.value })}
                            >
                                {cities.map((city) => (
                                    <option key={city.id} value={city.name}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Area Name *</label>
                            <Input
                                value={areaFormData.name}
                                onChange={(e) => {
                                    setAreaFormData({ ...areaFormData, name: e.target.value });
                                    if (areaFormErrors.name) setAreaFormErrors({ ...areaFormErrors, name: false });
                                }}
                                placeholder="e.g., Al Khuwair"
                                className={areaFormErrors.name ? 'border-destructive' : ''}
                            />
                            {areaFormErrors.name && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Area name is required
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => setIsAreaDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-[#cea26e] hover:bg-[#b8915f]"
                            onClick={handleSaveArea}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : editingArea ? (
                                'Save Changes'
                            ) : (
                                'Add Area'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add City Dialog */}
            <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                <DialogContent className="max-w-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">Add New City</h2>
                        <p className="text-sm text-muted-foreground">Add a new city to organize areas</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">City Name *</label>
                        <Input
                            value={cityFormData.name}
                            onChange={(e) => setCityFormData({ name: e.target.value })}
                            placeholder="e.g., Salalah"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => setIsCityDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-[#cea26e] hover:bg-[#b8915f]"
                            onClick={handleAddCity}
                        >
                            Add City
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <div className="text-center mb-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <Trash2 className="h-6 w-6 text-destructive" />
                        </div>
                        <h2 className="text-lg font-semibold">Delete Area</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Are you sure you want to delete <span className="font-medium">{deletingArea?.name}</span>?
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-destructive hover:bg-destructive/90"
                            onClick={handleDeleteArea}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </div>
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
