'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Building2, MapPin, Users, Home, Loader2,
    AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Wrench,
    Clock, TrendingUp, Plus, FileText
} from 'lucide-react';

interface UnitWithStatus {
    id: string;
    title: string;
    unitNumber?: string;
    floor?: string;
    area?: string;
    price: number;
    computedStatus: 'rented' | 'vacant' | 'maintenance';
    activeRental?: {
        id: string;
        monthlyRent: number;
        startDate: string;
        endDate: string;
        customer?: { id: string; name: string; phone?: string };
    };
}

interface ProjectDetail {
    id: string;
    name: string;
    description?: string;
    location?: string;
    address?: string;
    city?: string;
    districtName?: string;
    owner?: { id: string; name: string; phone?: string };
    totalUnits: number;
    progress: number;
    status: string;
    startDate?: string;
    endDate?: string;
    properties: UnitWithStatus[];
    stats: {
        total: number;
        rentedCount: number;
        vacantCount: number;
        maintenanceCount: number;
        occupancy: number;
    };
}

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { language } = useLanguage();
    const isAr = language === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`/api/projects/${id}`)
            .then(r => r.json())
            .then(d => { if (d.data) setProject(d.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    const formatDate = (d?: string | null) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', {
            style: 'decimal', minimumFractionDigits: 0
        }).format(n);

    const getStatusBadge = (status: string) => {
        if (status === 'rented') return (
            <Badge className="bg-green-500/10 text-green-600 border-0 flex items-center gap-1 w-fit">
                <CheckCircle className="h-3 w-3" />
                {isAr ? 'مباعة' : 'Sold'}
            </Badge>
        );
        if (status === 'maintenance') return (
            <Badge className="bg-orange-500/10 text-orange-600 border-0 flex items-center gap-1 w-fit">
                <Wrench className="h-3 w-3" />
                {isAr ? 'تحت الصيانة' : 'Maintenance'}
            </Badge>
        );
        return (
            <Badge className="bg-green-500/10 text-green-600 border-0 flex items-center gap-1 w-fit">
                <Home className="h-3 w-3" />
                {isAr ? 'شاغرة' : 'Vacant'}
            </Badge>
        );
    };

    const filteredUnits = (project?.properties || []).filter(u =>
        statusFilter === 'all' || u.computedStatus === statusFilter
    );

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#cea26e]" />
                </div>
            </DashboardLayout>
        );
    }

    if (!project) {
        return (
            <DashboardLayout>
                <div className="text-center py-12" dir={dir}>
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                        {isAr ? 'المشروع غير موجود' : 'Project Not Found'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                        {isAr
                            ? 'تأكد من الرابط أو ابحث عن المشروع من الصفحة الرئيسية'
                            : 'The project may have been deleted or the link is invalid.'}
                    </p>
                    <Link href="/projects">
                        <Button variant="outline" className="mt-2">
                            {isAr ? (
                                <><ArrowRight className="h-4 w-4 ml-2" />العودة للمشاريع</>
                            ) : (
                                <><ArrowLeft className="h-4 w-4 mr-2" />Back to Projects</>
                            )}
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const { stats } = project;

    return (
        <DashboardLayout>
            <div className="space-y-6" dir={dir}>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/projects" className="hover:text-foreground transition-colors">
                        {isAr ? 'المشاريع' : 'Projects'}
                    </Link>
                    {isAr
                        ? <ArrowRight className="h-3 w-3 rotate-180" />
                        : <ArrowRight className="h-3 w-3" />
                    }
                    <span className="text-foreground font-medium">{project.name}</span>
                </div>

                {/* Project Header Card */}
                <Card className="p-6 shadow-sm border-0">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#cea26e]/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-7 w-7 text-[#cea26e]" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                {project.owner && (
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />{project.owner.name}
                                    </span>
                                )}
                                {(project.city || project.districtName || project.location) && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {[project.districtName, project.city, project.location].filter(Boolean).join('، ')}
                                    </span>
                                )}
                                {project.address && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />{project.address}
                                    </span>
                                )}
                                {(project.startDate || project.endDate) && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {formatDate(project.startDate)} — {formatDate(project.endDate)}
                                    </span>
                                )}
                            </div>
                            {project.description && (
                                <p className="text-sm text-muted-foreground mt-2 bg-muted/30 rounded-lg px-3 py-2">
                                    {project.description}
                                </p>
                            )}

                            <div className="mt-4 flex items-center gap-2 flex-wrap">
                                <Link href={`/projects/${project.id}/documents`}>
                                    <Button variant="outline" className="border-[#cea26e]/30 text-[#cea26e] hover:bg-[#cea26e]/10">
                                        <FileText className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                                        {isAr ? 'مستندات المشروع' : 'Project Documents'}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {/* Completion badge */}
                        <Badge className="bg-[#cea26e]/10 text-[#cea26e] border-0 text-sm font-semibold px-3 py-1.5 self-start">
                            <TrendingUp className="h-4 w-4 ml-1" />
                            {project.progress}% {isAr ? 'مكتمل' : 'Complete'}
                        </Badge>
                    </div>
                </Card>

                {/* Occupancy Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 shadow-sm border-0">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                            <Building2 className="h-4 w-4 text-gray-600" />
                        </div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">
                            {isAr ? 'إجمالي الوحدات' : 'Total Units'}
                        </p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">{stats.rentedCount}</p>
                        <p className="text-xs text-muted-foreground">
                            {isAr ? 'مباعة' : 'Sold'}
                        </p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                            <Home className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">{stats.vacantCount}</p>
                        <p className="text-xs text-muted-foreground">
                            {isAr ? 'شاغرة' : 'Vacant'}
                        </p>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="w-8 h-8 rounded-lg bg-[#cea26e]/10 flex items-center justify-center mb-2">
                            <TrendingUp className="h-4 w-4 text-[#cea26e]" />
                        </div>
                        <p className="text-2xl font-bold text-[#cea26e]">{stats.occupancy}%</p>
                        <p className="text-xs text-muted-foreground">
                            {isAr ? 'نسبة الإشغال' : 'Occupancy'}
                        </p>
                    </Card>
                </div>

                {/* Occupancy progress bar */}
                <Card className="p-4 shadow-sm border-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                            {isAr ? 'نسبة الإشغال' : 'Occupancy Rate'}
                        </span>
                        <span className="text-sm font-bold text-[#cea26e]">{stats.occupancy}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#cea26e] to-[#e8b87d] rounded-full transition-all duration-500"
                            style={{ width: `${stats.occupancy}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{stats.rentedCount} {isAr ? 'مباعة' : 'Sold'}</span>
                        {stats.maintenanceCount > 0 && (
                            <span className="text-orange-500">
                                {stats.maintenanceCount} {isAr ? 'صيانة' : 'Maintenance'}
                            </span>
                        )}
                        <span>{stats.vacantCount} {isAr ? 'شاغرة' : 'Vacant'}</span>
                    </div>
                </Card>

                {/* Units Table */}
                <div>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h2 className="text-lg font-semibold">
                            {isAr ? 'الوحدات' : 'Units'}
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Status filter buttons */}
                            {(['all', 'rented', 'vacant', 'maintenance'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s
                                        ? 'bg-[#cea26e] text-white'
                                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {s === 'all'
                                        ? `${isAr ? 'الكل' : 'All'} (${project.properties.length})`
                                        : s === 'rented'
                                            ? `${isAr ? 'مباعة' : 'Sold'} (${stats.rentedCount})`
                                            : s === 'vacant'
                                                ? `${isAr ? 'شاغرة' : 'Vacant'} (${stats.vacantCount})`
                                                : `${isAr ? 'صيانة' : 'Maint.'} (${stats.maintenanceCount})`}
                                </button>
                            ))}
                            {/* Add Unit shortcut */}
                            <Link
                                href="/properties"
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#cea26e]/10 text-[#cea26e] hover:bg-[#cea26e]/20 transition-colors border border-[#cea26e]/30"
                            >
                                <Plus className="h-3 w-3" />
                                {isAr ? 'إضافة وحدة' : 'Add Unit'}
                            </Link>
                        </div>
                    </div>

                    {filteredUnits.length === 0 ? (
                        <Card className="p-8 text-center shadow-sm border-0">
                            <Home className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                {isAr
                                    ? 'لا توجد وحدات مضافة لهذا المشروع بعد'
                                    : 'No units added to this project yet'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isAr ? 'أضف وحدات من ' : 'Add units from '}
                                <Link href="/properties" className="text-[#cea26e] underline">
                                    {isAr ? 'صفحة العقارات' : 'the Properties page'}
                                </Link>
                                {isAr ? ' واربطها بهذا المشروع' : ' and link them to this project'}
                            </p>
                        </Card>
                    ) : (
                        <Card className="shadow-sm border-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40 border-b border-border">
                                        <tr>
                                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                {isAr ? 'رقم الوحدة' : 'Unit No.'}
                                            </th>
                                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                {isAr ? 'الطابق' : 'Floor'}
                                            </th>
                                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                {isAr ? 'المساحة' : 'Area'}
                                            </th>
                                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                {isAr ? 'قيمة الإيجار' : 'Rent Value'}
                                            </th>
                                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                {isAr ? 'الحالة' : 'Status'}
                                            </th>
                                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                {isAr ? 'اسم المستأجر' : 'Tenant'}
                                            </th>
                                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                {isAr ? 'بداية العقد' : 'Start Date'}
                                            </th>
                                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                                                {isAr ? 'نهاية العقد' : 'End Date'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUnits.map((unit, idx) => (
                                            <tr
                                                key={unit.id}
                                                className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {unit.unitNumber || unit.title}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {unit.floor
                                                        ? `${isAr ? 'الطابق' : 'Floor'} ${unit.floor}`
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {unit.area ? `${unit.area} m²` : '-'}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-[#cea26e]">
                                                    {unit.activeRental
                                                        ? `${formatCurrency(unit.activeRental.monthlyRent)} ${isAr ? 'ريال/شهر' : 'SAR/mo'}`
                                                        : unit.price > 0
                                                            ? `${formatCurrency(unit.price)} ${isAr ? 'ريال' : 'SAR'}`
                                                            : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(unit.computedStatus)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {unit.activeRental?.customer?.name || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                                    {formatDate(unit.activeRental?.startDate)}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                                    {formatDate(unit.activeRental?.endDate)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
