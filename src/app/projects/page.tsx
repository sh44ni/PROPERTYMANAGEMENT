'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import {
    Plus,
    Search,
    FolderKanban,
    Building2,
    Calendar,
    TrendingUp,
    MoreVertical,
    Check,
    ImagePlus,
    X,
    Eye,
    Home,
    Key,
    DollarSign,
    Clock,
    MessageSquare,
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle,
    Pencil,
    Trash2,
} from 'lucide-react';

// Types
interface ProgressLog {
    id: string;
    date: string;
    progress: number;
    comment: string;
    images: string[];
}

interface Project {
    id: string;
    projectId: string;
    name: string;
    description: string;
    budget: number;
    spent: number;
    completion: number;
    status: 'in_progress' | 'completed' | 'on_hold';
    startDate: string;
    endDate: string;
    totalUnits: number;
    occupiedUnits: number;
    soldUnits: number;
    availableUnits: number;
    image: string | null;
    progressLogs: ProgressLog[];
    revenue: {
        deposits: number;
        sales: number;
        rents: number;
        maintenance: number;
    };
}

// Sample project image (base64 placeholder - would be uploaded in production)
const sampleProjectImage = '/villa_modern.png';

// Mock Data
const mockProjects: Project[] = [
    {
        id: '1',
        projectId: 'PRJ-0001',
        name: 'Al Khuwair Residences',
        description: 'Premium residential compound with 20 villas and amenities',
        budget: 2500000,
        spent: 1875000,
        completion: 75,
        status: 'in_progress',
        startDate: '2025-03-01',
        endDate: '2026-06-30',
        totalUnits: 20,
        occupiedUnits: 5,
        soldUnits: 8,
        availableUnits: 7,
        image: sampleProjectImage,
        progressLogs: [
            { id: '1', date: '2025-03-15', progress: 10, comment: 'Foundation work started', images: [] },
            { id: '2', date: '2025-05-20', progress: 30, comment: 'Structure framing completed for Block A', images: [] },
            { id: '3', date: '2025-08-10', progress: 55, comment: 'Electrical and plumbing rough-in done', images: [] },
            { id: '4', date: '2025-11-25', progress: 75, comment: 'Interior finishing in progress, landscaping started', images: [] },
        ],
        revenue: { deposits: 450000, sales: 736000, rents: 32500, maintenance: 15000 },
    },
    {
        id: '2',
        projectId: 'PRJ-0002',
        name: 'Qurum Heights Tower',
        description: 'Luxury apartment building with 50 units',
        budget: 4000000,
        spent: 3200000,
        completion: 80,
        status: 'in_progress',
        startDate: '2025-01-15',
        endDate: '2026-03-31',
        totalUnits: 50,
        occupiedUnits: 12,
        soldUnits: 20,
        availableUnits: 18,
        image: '/apartment_luxury.png',
        progressLogs: [
            { id: '1', date: '2025-01-20', progress: 5, comment: 'Site preparation and permits obtained', images: [] },
            { id: '2', date: '2025-04-15', progress: 25, comment: 'Foundation and basement complete', images: [] },
            { id: '3', date: '2025-07-30', progress: 50, comment: 'Core structure complete to 15th floor', images: [] },
            { id: '4', date: '2025-10-20', progress: 70, comment: 'All floors topped out, facade work started', images: [] },
            { id: '5', date: '2026-01-05', progress: 80, comment: 'MEP installation 90% complete', images: [] },
        ],
        revenue: { deposits: 800000, sales: 1600000, rents: 48000, maintenance: 22000 },
    },
    {
        id: '3',
        projectId: 'PRJ-0003',
        name: 'Al Ghubra Commercial',
        description: 'Mixed-use development with retail and office spaces',
        budget: 1800000,
        spent: 1800000,
        completion: 100,
        status: 'completed',
        startDate: '2024-06-01',
        endDate: '2025-12-15',
        totalUnits: 15,
        occupiedUnits: 12,
        soldUnits: 3,
        availableUnits: 0,
        image: null,
        progressLogs: [
            { id: '1', date: '2024-06-15', progress: 10, comment: 'Groundbreaking ceremony', images: [] },
            { id: '2', date: '2024-09-01', progress: 40, comment: 'Structure complete', images: [] },
            { id: '3', date: '2025-03-15', progress: 75, comment: 'Interior fit-out in progress', images: [] },
            { id: '4', date: '2025-12-15', progress: 100, comment: 'Project completed and handed over', images: [] },
        ],
        revenue: { deposits: 195000, sales: 195000, rents: 96000, maintenance: 8500 },
    },
];

export default function ProjectsPage() {
    const { t, language } = useLanguage();
    const [projects, setProjects] = useState<Project[]>(mockProjects);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isProgressUpdateOpen, setIsProgressUpdateOpen] = useState(false);
    const [progressUpdateValue, setProgressUpdateValue] = useState(0);
    const [progressComment, setProgressComment] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const progressImageRef = useRef<HTMLInputElement>(null);
    const [progressImages, setProgressImages] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        budget: '',
        startDate: '',
        endDate: '',
        status: 'in_progress',
        totalUnits: '',
        image: null as string | null,
    });

    // Form validation and UI states
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeForm, setShakeForm] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const [progressFormError, setProgressFormError] = useState(false);

    // Edit and Delete states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const editFileInputRef = useRef<HTMLInputElement>(null);

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

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
            in_progress: { variant: 'default', label: t.projects.inProgress },
            completed: { variant: 'secondary', label: t.projects.completed },
            on_hold: { variant: 'outline', label: t.projects.onHold },
        };
        const config = variants[status] || variants.in_progress;
        return <Badge variant={config.variant} className={status === 'in_progress' ? 'bg-[#cea26e] hover:bg-[#b8915f]' : ''}>{config.label}</Badge>;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProgressImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProgressImages(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleCreateProject = async () => {
        // Validate form
        const errors: Record<string, boolean> = {};
        if (!formData.name.trim()) errors.name = true;
        if (!formData.budget || parseFloat(formData.budget) <= 0) errors.budget = true;
        if (!formData.startDate) errors.startDate = true;
        if (!formData.endDate) errors.endDate = true;
        if (!formData.totalUnits || parseInt(formData.totalUnits) <= 0) errors.totalUnits = true;

        // Date validation
        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            errors.endDate = true;
        }

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        // Show loading state
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const newProject: Project = {
            id: `${Date.now()}`,
            projectId: `PRJ-${String(projects.length + 1).padStart(4, '0')}`,
            name: formData.name,
            description: formData.description,
            budget: parseFloat(formData.budget),
            spent: 0,
            completion: 0,
            status: formData.status as Project['status'],
            startDate: formData.startDate,
            endDate: formData.endDate,
            totalUnits: parseInt(formData.totalUnits),
            occupiedUnits: 0,
            soldUnits: 0,
            availableUnits: parseInt(formData.totalUnits),
            image: formData.image,
            progressLogs: [],
            revenue: { deposits: 0, sales: 0, rents: 0, maintenance: 0 },
        };

        setProjects([...projects, newProject]);
        setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'in_progress', totalUnits: '', image: null });
        setFormErrors({});
        setIsSubmitting(false);
        setIsCreateOpen(false);

        // Show success toast
        setToast({ show: true, type: 'success', message: t.messages.created });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const handleProgressUpdate = async () => {
        if (!selectedProject) return;

        if (!progressComment.trim()) {
            setProgressFormError(true);
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));

        const newLog: ProgressLog = {
            id: `${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            progress: progressUpdateValue,
            comment: progressComment,
            images: progressImages,
        };

        const updatedProject = {
            ...selectedProject,
            completion: progressUpdateValue,
            status: progressUpdateValue >= 100 ? 'completed' as const : selectedProject.status,
            progressLogs: [...selectedProject.progressLogs, newLog],
        };

        setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject);
        setIsSubmitting(false);
        setIsProgressUpdateOpen(false);
        setProgressComment('');
        setProgressImages([]);
        setProgressFormError(false);

        // Show success toast
        setToast({ show: true, type: 'success', message: progressUpdateValue >= 100 ? t.projects.markedCompleted : t.projects.progressUpdated });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const openProgressUpdate = () => {
        if (selectedProject) {
            setProgressUpdateValue(selectedProject.completion);
        }
        setIsProgressUpdateOpen(true);
    };

    // Edit Project handlers
    const openEditProject = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description,
            budget: project.budget.toString(),
            startDate: project.startDate,
            endDate: project.endDate,
            status: project.status,
            totalUnits: project.totalUnits.toString(),
            image: project.image,
        });
        setFormErrors({});
        setIsEditOpen(true);
        setSelectedProject(null); // Close detail popup
    };

    const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditProject = async () => {
        if (!editingProject) return;

        // Validate form
        const errors: Record<string, boolean> = {};
        if (!formData.name.trim()) errors.name = true;
        if (!formData.budget || parseFloat(formData.budget) <= 0) errors.budget = true;
        if (!formData.startDate) errors.startDate = true;
        if (!formData.endDate) errors.endDate = true;
        if (!formData.totalUnits || parseInt(formData.totalUnits) <= 0) errors.totalUnits = true;

        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            errors.endDate = true;
        }

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        const updatedProject: Project = {
            ...editingProject,
            name: formData.name,
            description: formData.description,
            budget: parseFloat(formData.budget),
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: formData.status as Project['status'],
            totalUnits: parseInt(formData.totalUnits),
            availableUnits: parseInt(formData.totalUnits) - editingProject.occupiedUnits - editingProject.soldUnits,
            image: formData.image,
        };

        setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
        setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'in_progress', totalUnits: '', image: null });
        setFormErrors({});
        setIsSubmitting(false);
        setIsEditOpen(false);
        setEditingProject(null);

        setToast({ show: true, type: 'success', message: t.projects.projectUpdated });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    // Delete Project handlers
    const openDeleteProject = (project: Project) => {
        setDeletingProject(project);
        setDeleteConfirmText('');
        setIsDeleteOpen(true);
        setSelectedProject(null); // Close detail popup
    };

    const handleDeleteProject = async () => {
        if (!deletingProject || deleteConfirmText !== 'DELETE') return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        setProjects(projects.filter(p => p.id !== deletingProject.id));
        setIsSubmitting(false);
        setIsDeleteOpen(false);
        setDeletingProject(null);
        setDeleteConfirmText('');

        setToast({ show: true, type: 'success', message: t.projects.projectDeleted });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUnits = projects.reduce((acc, p) => acc + p.totalUnits, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t.projects.title}</h1>
                        <p className="text-sm text-muted-foreground">{t.projects.subtitle}</p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                    >
                        <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t.projects.addProject}
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

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#cea26e]/10">
                                <FolderKanban className="h-5 w-5 text-[#cea26e]" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t.projects.totalProjects}</p>
                                <p className="text-lg font-semibold">{projects.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t.projects.inProgress}</p>
                                <p className="text-lg font-semibold">{projects.filter(p => p.status === 'in_progress').length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                                <Check className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t.projects.completed}</p>
                                <p className="text-lg font-semibold">{projects.filter(p => p.status === 'completed').length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                                <Building2 className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t.projects.totalUnits}</p>
                                <p className="text-lg font-semibold">{totalUnits}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Projects List */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {filteredProjects.map((project) => (
                        <Card
                            key={project.id}
                            className="overflow-hidden shadow-sm border-0"
                        >
                            {/* Project Image */}
                            {project.image && (
                                <div className="relative h-32 w-full bg-muted">
                                    <Image
                                        src={project.image}
                                        alt={project.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] h-5 bg-white/90 text-[#cea26e] border-0">
                                            {project.projectId}
                                        </Badge>
                                        {getStatusBadge(project.status)}
                                    </div>
                                </div>
                            )}

                            <div className="p-5">
                                {/* Header (when no image) */}
                                {!project.image && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-[10px] h-5 border-[#cea26e]/30 text-[#cea26e]">
                                            {project.projectId}
                                        </Badge>
                                        {getStatusBadge(project.status)}
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                                    </div>
                                    <button className="p-1 rounded hover:bg-muted">
                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">{t.projects.completionProgress}</span>
                                        <span className="font-medium">{project.completion}%</span>
                                    </div>
                                    <Progress value={project.completion} className="h-2" />
                                </div>

                                {/* Units Summary */}
                                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                                    <div className="p-2 rounded-lg bg-muted/50">
                                        <p className="text-lg font-semibold">{project.totalUnits}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.common.all}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <p className="text-lg font-semibold text-blue-600">{project.occupiedUnits}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.projects.occupied}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <p className="text-lg font-semibold text-green-600">{project.soldUnits}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.projects.sold}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-[#cea26e]/10">
                                        <p className="text-lg font-semibold text-[#cea26e]">{project.availableUnits}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.projects.available}</p>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                                </div>

                                {/* Show Project Button */}
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {t.projects.showProject}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t.projects.noProjects}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t.projects.getStarted}</p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t.projects.newProject}
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Project Dialog - Centered Modal */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                if (!open) {
                    setFormErrors({});
                    setShakeForm(false);
                }
                setIsCreateOpen(open);
            }}>
                <DialogContent className={`max-w-lg max-h-[90vh] overflow-y-auto transition-transform ${shakeForm ? 'animate-shake' : ''}`}>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">{t.projects.createNew}</h2>
                        <p className="text-sm text-muted-foreground">{t.projects.fillDetails}</p>
                    </div>

                    <div className="space-y-4">
                        {/* Image Upload */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.projectImage}</label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            {formData.image ? (
                                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-muted">
                                    <Image
                                        src={formData.image}
                                        alt="Project preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => setFormData({ ...formData, image: null })}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors"
                                >
                                    <ImagePlus className="h-8 w-8" />
                                    <span className="text-sm">{t.projects.clickUpload}</span>
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.projectName} *</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (formErrors.name) setFormErrors({ ...formErrors, name: false });
                                }}
                                placeholder="e.g., Al Khuwair Residences"
                                className={formErrors.name ? 'border-destructive bg-destructive/5' : ''}
                            />
                            {formErrors.name && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {t.projects.nameRequired}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.description}</label>
                            <textarea
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={t.projects.briefDescription}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.projects.budgetOMR} *</label>
                                <Input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => {
                                        setFormData({ ...formData, budget: e.target.value });
                                        if (formErrors.budget) setFormErrors({ ...formErrors, budget: false });
                                    }}
                                    placeholder="e.g., 2500000"
                                    className={formErrors.budget ? 'border-destructive bg-destructive/5' : ''}
                                />
                                {formErrors.budget && (
                                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {t.projects.budgetRequired}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.projects.totalUnits} *</label>
                                <Input
                                    type="number"
                                    value={formData.totalUnits}
                                    onChange={(e) => {
                                        setFormData({ ...formData, totalUnits: e.target.value });
                                        if (formErrors.totalUnits) setFormErrors({ ...formErrors, totalUnits: false });
                                    }}
                                    placeholder="e.g., 20"
                                    className={formErrors.totalUnits ? 'border-destructive bg-destructive/5' : ''}
                                />
                                {formErrors.totalUnits && (
                                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {t.properties.required}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.projects.startDate} *</label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, startDate: e.target.value });
                                        if (formErrors.startDate) setFormErrors({ ...formErrors, startDate: false });
                                    }}
                                    className={formErrors.startDate ? 'border-destructive bg-destructive/5' : ''}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.projects.endDate} *</label>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, endDate: e.target.value });
                                        if (formErrors.endDate) setFormErrors({ ...formErrors, endDate: false });
                                    }}
                                    className={formErrors.endDate ? 'border-destructive bg-destructive/5' : ''}
                                />
                                {formErrors.endDate && formData.startDate && formData.endDate && (
                                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {t.projects.endDateAfterStart}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.status}</label>
                            <select
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="in_progress">{t.projects.inProgress}</option>
                                <option value="on_hold">{t.projects.onHold}</option>
                                <option value="completed">{t.projects.completed}</option>
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
                                setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'in_progress', totalUnits: '', image: null });
                                setFormErrors({});
                            }}
                        >
                            {t.common.cancel}
                        </Button>
                        <Button
                            className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                            onClick={handleCreateProject}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                                    {t.rentals.creating}
                                </>
                            ) : (
                                t.projects.addProject
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Project Details Popup - Centered Modal */}
            <Dialog open={!!selectedProject && !isProgressUpdateOpen} onOpenChange={() => setSelectedProject(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0" showCloseButton={false}>
                    {selectedProject && (
                        <>
                            {/* Hero Image */}
                            <div className="relative h-48 w-full bg-gradient-to-br from-[#cea26e] to-[#b8915f] rounded-t-lg overflow-hidden">
                                {selectedProject.image ? (
                                    <Image
                                        src={selectedProject.image}
                                        alt={selectedProject.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FolderKanban className="h-16 w-16 text-white/50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-[10px] h-5 bg-white/90 text-[#cea26e] border-0">
                                            {selectedProject.projectId}
                                        </Badge>
                                        {getStatusBadge(selectedProject.status)}
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
                                    <p className="text-sm text-white/80">{selectedProject.description}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Completion Progress */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-medium">{t.projects.completionProgress}</span>
                                        <span className="text-[#cea26e] font-bold text-lg">{selectedProject.completion}%</span>
                                    </div>
                                    <Progress value={selectedProject.completion} className="h-3" />
                                </div>

                                {/* Units Stats */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3">{t.projects.unitsOverview}</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        <Card className="p-3 border-0 shadow-sm text-center">
                                            <Building2 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                            <p className="text-xl font-bold">{selectedProject.totalUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">{t.common.all}</p>
                                        </Card>
                                        <Card className="p-3 border-0 shadow-sm text-center bg-blue-500/5">
                                            <Key className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                            <p className="text-xl font-bold text-blue-600">{selectedProject.occupiedUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">{t.projects.occupied}</p>
                                        </Card>
                                        <Card className="p-3 border-0 shadow-sm text-center bg-green-500/5">
                                            <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                                            <p className="text-xl font-bold text-green-600">{selectedProject.soldUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">{t.projects.sold}</p>
                                        </Card>
                                        <Card className="p-3 border-0 shadow-sm text-center bg-[#cea26e]/5">
                                            <Home className="h-5 w-5 mx-auto mb-1 text-[#cea26e]" />
                                            <p className="text-xl font-bold text-[#cea26e]">{selectedProject.availableUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">{t.projects.available}</p>
                                        </Card>
                                    </div>
                                </div>

                                {/* Revenue Stats */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3">{t.projects.revenueExpenses}</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Card className="p-4 border-0 shadow-sm">
                                            <p className="text-xs text-muted-foreground mb-1">{t.projects.deposits}</p>
                                            <p className="text-lg font-semibold text-green-600">OMR {formatCurrency(selectedProject.revenue.deposits)}</p>
                                        </Card>
                                        <Card className="p-4 border-0 shadow-sm">
                                            <p className="text-xs text-muted-foreground mb-1">{t.projects.salesRevenue}</p>
                                            <p className="text-lg font-semibold text-green-600">OMR {formatCurrency(selectedProject.revenue.sales)}</p>
                                        </Card>
                                        <Card className="p-4 border-0 shadow-sm">
                                            <p className="text-xs text-muted-foreground mb-1">{t.projects.rentalIncome}</p>
                                            <p className="text-lg font-semibold text-blue-600">OMR {formatCurrency(selectedProject.revenue.rents)}</p>
                                        </Card>
                                        <Card className="p-4 border-0 shadow-sm">
                                            <p className="text-xs text-muted-foreground mb-1">{t.projects.maintenance}</p>
                                            <p className="text-lg font-semibold text-red-500">OMR {formatCurrency(selectedProject.revenue.maintenance)}</p>
                                        </Card>
                                    </div>
                                </div>

                                {/* Progress Log */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium">{t.projects.progressLog}</h4>
                                        {selectedProject.status !== 'completed' && (
                                            <Button
                                                size="sm"
                                                className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                                                onClick={openProgressUpdate}
                                            >
                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                {t.projects.updateProgress}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                        {selectedProject.progressLogs.slice().reverse().map((log, index) => (
                                            <div
                                                key={log.id}
                                                className={`relative pl-6 pb-4 ${index !== selectedProject.progressLogs.length - 1 ? 'border-l-2 border-border' : ''}`}
                                            >
                                                <div className="absolute left-[-5px] top-0 w-3 h-3 rounded-full bg-[#cea26e] border-2 border-white" />
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-muted-foreground">{formatDate(log.date)}</span>
                                                    <Badge variant="outline" className="text-[10px] h-4">{log.progress}%</Badge>
                                                </div>
                                                <p className="text-sm text-foreground">{log.comment}</p>
                                                {log.images.length > 0 && (
                                                    <div className="flex gap-2 mt-2">
                                                        {log.images.map((img, i) => (
                                                            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                                <Image src={img} alt="" fill className="object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="flex items-center gap-3 text-sm border-t border-border pt-4">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{t.projects.timeline}:</span>
                                    <span>{formatDate(selectedProject.startDate)} - {formatDate(selectedProject.endDate)}</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => openEditProject(selectedProject)}
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        {t.projects.editProject}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                                        onClick={() => openDeleteProject(selectedProject)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t.common.delete}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Progress Update Dialog - Centered Modal */}
            <Dialog open={isProgressUpdateOpen} onOpenChange={setIsProgressUpdateOpen}>
                <DialogContent className="max-w-md">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">{t.projects.updateProgress}</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Progress Slider */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium">{t.projects.completionProgress}</label>
                                <span className="text-2xl font-bold text-[#cea26e]">{progressUpdateValue}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progressUpdateValue}
                                onChange={(e) => setProgressUpdateValue(parseInt(e.target.value))}
                                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #cea26e ${progressUpdateValue}%, #e5e7eb ${progressUpdateValue}%)`,
                                }}
                            />
                            {progressUpdateValue >= 100 && (
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    {t.projects.projectCompleted}
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.updateDetails} *</label>
                            <textarea
                                className={`w-full rounded-md border px-3 py-2 text-sm min-h-[100px] resize-none transition-colors ${progressFormError ? 'border-destructive bg-destructive/5' : 'border-border bg-background'}`}
                                value={progressComment}
                                onChange={(e) => {
                                    setProgressComment(e.target.value);
                                    if (progressFormError) setProgressFormError(false);
                                }}
                                placeholder={t.projects.whatCompleted}
                            />
                            {progressFormError && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {t.projects.describeCompleted}
                                </p>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.progressPhotos}</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={progressImageRef}
                                onChange={handleProgressImageUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => progressImageRef.current?.click()}
                                className="w-full h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors"
                            >
                                <ImagePlus className="h-5 w-5" />
                                <span className="text-sm">{t.projects.addPhotos}</span>
                            </button>

                            {progressImages.length > 0 && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {progressImages.map((img, i) => (
                                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                                            <Image src={img} alt="" fill className="object-cover" />
                                            <button
                                                onClick={() => setProgressImages(prev => prev.filter((_, idx) => idx !== i))}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
                                setIsProgressUpdateOpen(false);
                                setProgressComment('');
                                setProgressImages([]);
                                setProgressFormError(false);
                            }}
                        >
                            {t.common.cancel}
                        </Button>
                        <Button
                            className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                            onClick={handleProgressUpdate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t.rentals.saving}
                                </>
                            ) : (
                                t.projects.saveUpdate
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Project Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                if (!open) {
                    setFormErrors({});
                    setShakeForm(false);
                }
                setIsEditOpen(open);
            }}>
                <DialogContent className={`max-w-lg max-h-[90vh] overflow-y-auto ${shakeForm ? 'animate-shake' : ''}`}>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">{t.projects.editProject}</h2>
                        <p className="text-sm text-muted-foreground">{t.projects.updateProjectDetails}</p>
                    </div>

                    <div className="space-y-4">
                        {/* Image Upload */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.projectImage}</label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={editFileInputRef}
                                onChange={handleEditImageUpload}
                                className="hidden"
                            />
                            {formData.image ? (
                                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-muted">
                                    <Image
                                        src={formData.image}
                                        alt="Project preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => setFormData({ ...formData, image: null })}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => editFileInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors"
                                >
                                    <ImagePlus className="h-8 w-8" />
                                    <span className="text-sm">{t.projects.clickUpload}</span>
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.projectName} *</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (formErrors.name) setFormErrors({ ...formErrors, name: false });
                                }}
                                placeholder="e.g., Al Khuwair Residences"
                                className={formErrors.name ? 'border-destructive bg-destructive/5' : ''}
                            />
                            {formErrors.name && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {t.projects.nameRequired}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.description}</label>
                            <textarea
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={t.projects.briefDescription}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.projects.budgetOMR} *</label>
                                <Input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => {
                                        setFormData({ ...formData, budget: e.target.value });
                                        if (formErrors.budget) setFormErrors({ ...formErrors, budget: false });
                                    }}
                                    placeholder="e.g., 2500000"
                                    className={formErrors.budget ? 'border-destructive bg-destructive/5' : ''}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.projects.totalUnits} *</label>
                                <Input
                                    type="number"
                                    value={formData.totalUnits}
                                    onChange={(e) => {
                                        setFormData({ ...formData, totalUnits: e.target.value });
                                        if (formErrors.totalUnits) setFormErrors({ ...formErrors, totalUnits: false });
                                    }}
                                    placeholder="e.g., 20"
                                    className={formErrors.totalUnits ? 'border-destructive bg-destructive/5' : ''}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.projects.startDate} *</label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, startDate: e.target.value });
                                        if (formErrors.startDate) setFormErrors({ ...formErrors, startDate: false });
                                    }}
                                    className={formErrors.startDate ? 'border-destructive bg-destructive/5' : ''}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">{t.projects.endDate} *</label>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, endDate: e.target.value });
                                        if (formErrors.endDate) setFormErrors({ ...formErrors, endDate: false });
                                    }}
                                    className={formErrors.endDate ? 'border-destructive bg-destructive/5' : ''}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">{t.projects.status}</label>
                            <select
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="in_progress">{t.projects.inProgress}</option>
                                <option value="on_hold">{t.projects.onHold}</option>
                                <option value="completed">{t.projects.completed}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="outline"
                            className="flex-1"
                            disabled={isSubmitting}
                            onClick={() => {
                                setIsEditOpen(false);
                                setEditingProject(null);
                                setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'in_progress', totalUnits: '', image: null });
                                setFormErrors({});
                            }}
                        >
                            {t.common.cancel}
                        </Button>
                        <Button
                            className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                            onClick={handleEditProject}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t.rentals.saving}
                                </>
                            ) : (
                                t.rentals.saveChanges
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md">
                    <div className="text-center mb-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <Trash2 className="h-6 w-6 text-destructive" />
                        </div>
                        <h2 className="text-lg font-semibold">{t.projects.deleteProject}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t.projects.deleteProjectConfirm} <span className="font-medium text-foreground">{deletingProject?.name}</span>?
                        </p>
                        <p className="text-xs text-destructive mt-2">
                            {t.projects.deleteWarning}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                {t.projects.typeDelete}
                            </label>
                            <Input
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                                placeholder="Type DELETE to confirm"
                                className={deleteConfirmText && deleteConfirmText !== 'DELETE' ? 'border-destructive' : ''}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                disabled={isSubmitting}
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                    setDeletingProject(null);
                                    setDeleteConfirmText('');
                                }}
                            >
                                {t.common.cancel}
                            </Button>
                            <Button
                                className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                                onClick={handleDeleteProject}
                                disabled={isSubmitting || deleteConfirmText !== 'DELETE'}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t.rentals.deleting}
                                    </>
                                ) : (
                                    t.projects.deleteProject
                                )}
                            </Button>
                        </div>
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
