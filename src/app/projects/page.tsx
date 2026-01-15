'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
    status: 'in_progress' | 'completed' | 'on_hold' | 'planning';
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

export default function ProjectsPage() {
    const { t } = useLanguage();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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
        status: 'planning',
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
        return new Intl.NumberFormat('en-OM', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
            in_progress: { variant: 'default', label: 'In Progress' },
            completed: { variant: 'secondary', label: 'Completed' },
            on_hold: { variant: 'outline', label: 'On Hold' },
            planning: { variant: 'outline', label: 'Planning' },
        };
        const config = variants[status] || variants.planning;
        return <Badge variant={config.variant} className={status === 'in_progress' ? 'bg-[#cea26e] hover:bg-[#b8915f]' : ''}>{config.label}</Badge>;
    };

    const fetchProjects = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/projects');
            const result = await response.json();

            if (response.ok) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedProjects = result.data.map((p: any) => ({
                    id: p.id,
                    projectId: `PRJ-${p.id.slice(-4).toUpperCase()}`,
                    name: p.name,
                    description: p.description || '',
                    budget: p.budget,
                    spent: p.spent,
                    completion: p.progress,
                    status: p.status,
                    startDate: p.startDate ? p.startDate.split('T')[0] : '',
                    endDate: p.endDate ? p.endDate.split('T')[0] : '',
                    totalUnits: p.totalUnits,
                    occupiedUnits: p.occupiedUnits || 0,
                    soldUnits: p.soldUnits || 0,
                    availableUnits: p.availableUnits || 0,
                    image: p.image,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    progressLogs: (p.updates || []).map((u: any) => ({
                        id: u.id,
                        date: u.updatedAt,
                        progress: u.progress,
                        comment: u.details,
                        images: [] // Schema doesn't support update images yet
                    })),
                    revenue: { deposits: 0, sales: 0, rents: 0, maintenance: 0 } // Placeholder
                }));
                setProjects(mappedProjects);
            } else {
                setToast({ show: true, type: 'error', message: 'Failed to fetch projects' });
            }
        } catch (error) {
            console.error(error);
            setToast({ show: true, type: 'error', message: 'Error fetching projects' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

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

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        // Show loading state
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    budget: formData.budget,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    status: formData.status,
                    totalUnits: formData.totalUnits,
                    image: formData.image,
                }),
            });

            if (response.ok) {
                await fetchProjects();
                setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'planning', totalUnits: '', image: null });
                setFormErrors({});
                setIsCreateOpen(false);
                setToast({ show: true, type: 'success', message: 'Project created successfully!' });
            } else {
                const result = await response.json();
                setToast({ show: true, type: 'error', message: result.error || 'Failed to create project' });
            }
        } catch (error) {
            console.error(error);
            setToast({ show: true, type: 'error', message: 'Error creating project' });
        } finally {
            setIsSubmitting(false);
        }

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

        try {
            const response = await fetch('/api/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedProject.id,
                    progress: progressUpdateValue,
                    updateDetails: progressComment,
                }),
            });

            if (response.ok) {
                await fetchProjects();
                // We need to re-select the project to see the new log, but fetchProjects updates state.
                // For simplicity, we just close the dialog and refresh list.
                // Or we could find the updated project in the new list.
                // To keep it simple, we just close everything.
                setIsProgressUpdateOpen(false);
                setProgressComment('');
                setProgressImages([]);
                setProgressFormError(false);
                setSelectedProject(null);
                setToast({ show: true, type: 'success', message: 'Progress updated successfully!' });
            } else {
                setToast({ show: true, type: 'error', message: 'Failed to update progress' });
            }
        } catch (error) {
            console.error(error);
            setToast({ show: true, type: 'error', message: 'Error updating progress' });
        } finally {
            setIsSubmitting(false);
        }

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

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingProject.id,
                    name: formData.name,
                    description: formData.description,
                    budget: formData.budget,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    status: formData.status,
                    totalUnits: formData.totalUnits,
                    image: formData.image,
                }),
            });

            if (response.ok) {
                await fetchProjects();
                setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'planning', totalUnits: '', image: null });
                setFormErrors({});
                setIsEditOpen(false);
                setEditingProject(null);
                setToast({ show: true, type: 'success', message: 'Project updated successfully!' });
            } else {
                setToast({ show: true, type: 'error', message: 'Failed to update project' });
            }
        } catch (error) {
            console.error(error);
            setToast({ show: true, type: 'error', message: 'Error updating project' });
        } finally {
            setIsSubmitting(false);
        }

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

        try {
            const response = await fetch(`/api/projects?id=${deletingProject.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchProjects();
                setIsDeleteOpen(false);
                setDeletingProject(null);
                setDeleteConfirmText('');
                setToast({ show: true, type: 'success', message: 'Project deleted successfully!' });
            } else {
                const result = await response.json();
                setToast({ show: true, type: 'error', message: result.error || 'Failed to delete project' });
            }
        } catch (error) {
            console.error(error);
            setToast({ show: true, type: 'error', message: 'Error deleting project' });
        } finally {
            setIsSubmitting(false);
        }

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
                                <p className="text-xs text-muted-foreground">{t.stats.totalProjects}</p>
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
                                <p className="text-xs text-muted-foreground">Total Units</p>
                                <p className="text-lg font-semibold">{totalUnits}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#cea26e]" />
                    </div>
                )}

                {/* Projects List */}
                {!isLoading && (
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
                                            <span className="text-muted-foreground">Completion</span>
                                            <span className="font-medium">{project.completion}%</span>
                                        </div>
                                        <Progress value={project.completion} className="h-2" />
                                    </div>

                                    {/* Units Summary */}
                                    <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                                        <div className="p-2 rounded-lg bg-muted/50">
                                            <p className="text-lg font-semibold">{project.totalUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">{t.common.total}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-blue-500/10">
                                            <p className="text-lg font-semibold text-blue-600">{project.occupiedUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">{t.stats.occupiedUnits}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-green-500/10">
                                            <p className="text-lg font-semibold text-green-600">{project.soldUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">{t.stats.soldUnits}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-[#cea26e]/10">
                                            <p className="text-lg font-semibold text-[#cea26e]">{project.availableUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">{t.stats.availableUnits}</p>
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
                                        {t.common.view}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t.common.noItems}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t.projects.subtitle}</p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t.projects.addProject}
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
                        <h2 className="text-lg font-semibold">{t.projects.addProject}</h2>
                        <p className="text-sm text-muted-foreground">{t.projects.subtitle}</p>
                    </div>

                    <div className="space-y-4">
                        {/* Image Upload */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Project Image</label>
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
                                    <span className="text-sm">Click to upload image</span>
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Project Name *</label>
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
                                    Project name is required
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Description</label>
                            <textarea
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the project"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Budget (OMR) *</label>
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
                                        Valid budget required
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Total Units *</label>
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
                                        Valid number required
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Start Date *</label>
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
                                <label className="text-sm font-medium mb-1.5 block">End Date *</label>
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
                                        End date must be after start
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Status</label>
                            <select
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
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
                                setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'planning', totalUnits: '', image: null });
                                setFormErrors({});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                            onClick={handleCreateProject}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Project'
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
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
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
                                        <span className="font-medium">Project Completion</span>
                                        <span className="text-[#cea26e] font-bold text-lg">{selectedProject.completion}%</span>
                                    </div>
                                    <Progress value={selectedProject.completion} className="h-3" />
                                </div>

                                {/* Units Stats */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Units Overview</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        <Card className="p-3 border-0 shadow-sm text-center">
                                            <Building2 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                            <p className="text-xl font-bold">{selectedProject.totalUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">Total</p>
                                        </Card>
                                        <Card className="p-3 border-0 shadow-sm text-center bg-blue-500/5">
                                            <Key className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                            <p className="text-xl font-bold text-blue-600">{selectedProject.occupiedUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">Occupied</p>
                                        </Card>
                                        <Card className="p-3 border-0 shadow-sm text-center bg-green-500/5">
                                            <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                                            <p className="text-xl font-bold text-green-600">{selectedProject.soldUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">Sold</p>
                                        </Card>
                                        <Card className="p-3 border-0 shadow-sm text-center bg-[#cea26e]/5">
                                            <Home className="h-5 w-5 mx-auto mb-1 text-[#cea26e]" />
                                            <p className="text-xl font-bold text-[#cea26e]">{selectedProject.availableUnits}</p>
                                            <p className="text-[10px] text-muted-foreground">Available</p>
                                        </Card>
                                    </div>
                                </div>

                                {/* Revenue Stats */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Revenue & Expenses</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Card className="p-4 border-0 shadow-sm">
                                            <p className="text-xs text-muted-foreground mb-1">Deposits</p>
                                            <p className="text-lg font-semibold text-green-600">OMR {formatCurrency(selectedProject.revenue.deposits)}</p>
                                        </Card>
                                        <Card className="p-4 border-0 shadow-sm">
                                            <p className="text-xs text-muted-foreground mb-1">Sales Revenue</p>
                                            <p className="text-lg font-semibold text-green-600">OMR {formatCurrency(selectedProject.revenue.sales)}</p>
                                        </Card>
                                        <Card className="p-4 border-0 shadow-sm">
                                            <p className="text-xs text-muted-foreground mb-1">Rental Income</p>
                                            <p className="text-lg font-semibold text-blue-600">OMR {formatCurrency(selectedProject.revenue.rents)}</p>
                                        </Card>
                                        <Card className="p-4 border-0 shadow-sm">
                                            <p className="text-xs text-muted-foreground mb-1">Maintenance</p>
                                            <p className="text-lg font-semibold text-red-500">OMR {formatCurrency(selectedProject.revenue.maintenance)}</p>
                                        </Card>
                                    </div>
                                </div>

                                {/* Progress Log */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium">Progress Log</h4>
                                        {selectedProject.status !== 'completed' && (
                                            <Button
                                                size="sm"
                                                className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                                                onClick={openProgressUpdate}
                                            >
                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                Update Progress
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                        {selectedProject.progressLogs.length === 0 && (
                                            <p className="text-sm text-muted-foreground italic">No updates yet.</p>
                                        )}
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
                                    <span className="text-muted-foreground">Timeline:</span>
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
                                        Edit Project
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                                        onClick={() => openDeleteProject(selectedProject)}
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
                        <h2 className="text-lg font-semibold">Edit Project</h2>
                        <p className="text-sm text-muted-foreground">Update project details</p>
                    </div>

                    <div className="space-y-4">
                        {/* Image Upload */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Project Image</label>
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
                                    <span className="text-sm">Click to upload image</span>
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Project Name *</label>
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
                                    Project name is required
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Description</label>
                            <textarea
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the project"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Budget (OMR) *</label>
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
                                <label className="text-sm font-medium mb-1.5 block">Total Units *</label>
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
                                <label className="text-sm font-medium mb-1.5 block">Start Date *</label>
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
                                <label className="text-sm font-medium mb-1.5 block">End Date *</label>
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
                            <label className="text-sm font-medium mb-1.5 block">Status</label>
                            <select
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
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
                                setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'planning', totalUnits: '', image: null });
                                setFormErrors({});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                            onClick={handleEditProject}
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
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md">
                    <div className="text-center mb-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <Trash2 className="h-6 w-6 text-destructive" />
                        </div>
                        <h2 className="text-lg font-semibold">Delete Project</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Are you sure you want to delete <span className="font-medium text-foreground">{deletingProject?.name}</span>?
                        </p>
                        <p className="text-xs text-destructive mt-2">
                            This action cannot be undone. All project data will be permanently removed.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-destructive">DELETE</span> to confirm
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
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                                onClick={handleDeleteProject}
                                disabled={isSubmitting || deleteConfirmText !== 'DELETE'}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Project'
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
