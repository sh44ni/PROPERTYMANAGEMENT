'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    BarChart2, FileText, Home, Clock, Loader2,
    Printer, Building2, Users, TrendingUp, AlertTriangle,
    CheckCircle,
} from 'lucide-react';

type ReportTab = 'occupancy' | 'financial' | 'units' | 'expiring';

interface Project {
    id: string;
    name: string;
    city?: string;
    district?: string;
}

export default function ReportsPage() {
    const { language } = useLanguage();
    const isAr = language === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    const [activeTab, setActiveTab] = useState<ReportTab>('occupancy');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Filters
    const [buildingFilter, setBuildingFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [daysFilter, setDaysFilter] = useState('30');

    const fetchProjects = async () => {
        const res = await fetch('/api/projects');
        const d = await res.json();
        if (d.data) setProjects(d.data.map((p: any) => ({ id: p.id, name: p.name, city: p.city, district: p.districtName })));
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ type: activeTab });
            if (buildingFilter) params.set('projectId', buildingFilter);
            if (districtFilter) params.set('district', districtFilter);
            if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
            if (fromDate) params.set('from', fromDate);
            if (toDate) params.set('to', toDate);
            if (activeTab === 'expiring') params.set('days', daysFilter);

            const res = await fetch(`/api/reports?${params.toString()}`);
            const result = await res.json();
            setData(result.data);
        } catch {
            console.error('Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);
    useEffect(() => { fetchReport(); }, [activeTab, buildingFilter, districtFilter, statusFilter, fromDate, toDate, daysFilter]);

    const formatDate = (d: string | null | undefined) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(n);

    const tabConfig: Record<ReportTab, { label: string; icon: any }> = {
        occupancy: { label: isAr ? 'تقرير الإشغال' : 'Occupancy Report', icon: BarChart2 },
        financial: { label: isAr ? 'التقرير المالي' : 'Financial Report', icon: TrendingUp },
        units: { label: isAr ? 'قائمة الوحدات' : 'Units List', icon: Home },
        expiring: { label: isAr ? 'عقود تنتهي قريباً' : 'Expiring Contracts', icon: Clock },
    };

    const buildPrintHTML = () => {
        if (!data) return '<p>No data available.</p>';
        const gold = '#cea26e';
        const styles = `
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: ${dir}; padding: 24px; color: #1a1a1a; font-size: 13px; margin: 0; }
            h1 { color: ${gold}; margin: 0 0 4px; font-size: 20px; }
            h2 { color: ${gold}; margin: 20px 0 8px; font-size: 15px; }
            p { margin: 0; color: #555; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid ${gold}; padding-bottom: 16px; margin-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .stat { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 14px; text-align: center; }
            .stat-value { font-size: 26px; font-weight: bold; color: ${gold}; }
            .stat-label { font-size: 11px; color: #888; margin-top: 2px; }
            .stat-value.blue { color: #2563eb; }
            .stat-value.green { color: #16a34a; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
            th { background: #f3f3f3; padding: 9px 10px; text-align: ${isAr ? 'right' : 'left'}; font-weight: 600; border: 1px solid #ddd; color: #444; }
            td { padding: 7px 10px; border: 1px solid #e0e0e0; vertical-align: middle; }
            tr:nth-child(even) td { background: #fafafa; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
            .badge-rented { background: #dbeafe; color: #1d4ed8; }
            .badge-vacant { background: #dcfce7; color: #15803d; }
            .badge-maint { background: #ffedd5; color: #c2410c; }
            .bar-wrap { display: flex; align-items: center; gap: 8px; }
            .bar-bg { flex: 1; height: 6px; background: #e5e5e5; border-radius: 4px; overflow: hidden; }
            .bar-fill { height: 100%; background: ${gold}; border-radius: 4px; }
            .gold { color: ${gold}; font-weight: 600; }
            .section { margin-bottom: 28px; }
            @media print { body { padding: 12px; } }
        `;

        let body = '';

        if (activeTab === 'occupancy' && data.summary) {
            const s = data.summary;
            body += `
                <div class="stats">
                    <div class="stat"><div class="stat-value">${s.totalUnits}</div><div class="stat-label">${isAr ? 'إجمالي الوحدات' : 'Total Units'}</div></div>
                    <div class="stat"><div class="stat-value blue">${s.totalRented}</div><div class="stat-label">${isAr ? 'مؤجرة' : 'Rented'}</div></div>
                    <div class="stat"><div class="stat-value green">${s.totalVacant}</div><div class="stat-label">${isAr ? 'شاغرة' : 'Vacant'}</div></div>
                    <div class="stat"><div class="stat-value">${s.totalOccupancy}%</div><div class="stat-label">${isAr ? 'نسبة الإشغال' : 'Occupancy Rate'}</div></div>
                </div>
                <div class="section">
                    <h2>${isAr ? 'تفصيل حسب المشروع' : 'Breakdown by Project'}</h2>
                    <table>
                        <thead><tr>
                            <th>${isAr ? 'المشروع' : 'Project'}</th>
                            <th>${isAr ? 'المدينة' : 'City'}</th>
                            <th>${isAr ? 'الحي' : 'District'}</th>
                            <th>${isAr ? 'المالك' : 'Owner'}</th>
                            <th style="text-align:center">${isAr ? 'إجمالي' : 'Total'}</th>
                            <th style="text-align:center">${isAr ? 'مؤجرة' : 'Rented'}</th>
                            <th style="text-align:center">${isAr ? 'شاغرة' : 'Vacant'}</th>
                            <th style="min-width:120px">${isAr ? 'الإشغال' : 'Occupancy'}</th>
                        </tr></thead>
                        <tbody>
                            ${(data.buildings || []).map((b: any) => `
                                <tr>
                                    <td><strong>${b.name}</strong></td>
                                    <td>${b.city || '-'}</td>
                                    <td>${b.district || '-'}</td>
                                    <td>${b.ownerName || '-'}</td>
                                    <td style="text-align:center">${b.units}</td>
                                    <td style="text-align:center;color:#2563eb"><strong>${b.rented}</strong></td>
                                    <td style="text-align:center;color:#16a34a"><strong>${b.vacant}</strong></td>
                                    <td>
                                        <div class="bar-wrap">
                                            <div class="bar-bg"><div class="bar-fill" style="width:${b.occupancy}%"></div></div>
                                            <span class="gold">${b.occupancy}%</span>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        if (activeTab === 'financial' && data) {
            body += `
                <div class="stats">
                    <div class="stat"><div class="stat-value">${formatCurrency(data.totalMonthlyIncome || 0)} ${isAr ? 'ريال' : 'SAR'}</div><div class="stat-label">${isAr ? 'إجمالي الدخل الشهري' : 'Monthly Income'}</div></div>
                    <div class="stat"><div class="stat-value">${data.activeContracts || 0}</div><div class="stat-label">${isAr ? 'عقود نشطة' : 'Active Contracts'}</div></div>
                </div>
                <div class="section">
                    <h2>${isAr ? 'تفصيل حسب المشروع' : 'By Project'}</h2>
                    <table>
                        <thead><tr>
                            <th>${isAr ? 'المشروع' : 'Project'}</th>
                            <th>${isAr ? 'المالك' : 'Owner'}</th>
                            <th>${isAr ? 'عقود' : 'Contracts'}</th>
                            <th>${isAr ? 'الدخل الشهري' : 'Monthly Income'}</th>
                        </tr></thead>
                        <tbody>
                            ${(data.byBuilding || []).map((b: any) => `
                                <tr><td><strong>${b.name}</strong></td><td>${b.ownerName || '-'}</td><td>${b.count}</td><td class="gold">${formatCurrency(b.monthlyIncome)} ${isAr ? 'ريال' : 'SAR'}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="section">
                    <h2>${isAr ? 'تفصيل حسب المالك' : 'By Owner'}</h2>
                    <table>
                        <thead><tr>
                            <th>${isAr ? 'المالك' : 'Owner'}</th>
                            <th>${isAr ? 'عقود' : 'Contracts'}</th>
                            <th>${isAr ? 'الدخل الشهري' : 'Monthly Income'}</th>
                        </tr></thead>
                        <tbody>
                            ${(data.byOwner || []).map((o: any) => `
                                <tr><td><strong>${o.name}</strong></td><td>${o.count}</td><td class="gold">${formatCurrency(o.monthlyIncome)} ${isAr ? 'ريال' : 'SAR'}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        if (activeTab === 'units' && data) {
            body += `
                <div class="section">
                    <h2>${isAr ? 'قائمة الوحدات' : 'Units List'} (${(data.units || []).length})</h2>
                    <table>
                        <thead><tr>
                            <th>${isAr ? 'المشروع' : 'Project'}</th>
                            <th>${isAr ? 'رقم الوحدة' : 'Unit No.'}</th>
                            <th>${isAr ? 'الطابق' : 'Floor'}</th>
                            <th>${isAr ? 'المساحة' : 'Area'}</th>
                            <th>${isAr ? 'الحالة' : 'Status'}</th>
                            <th>${isAr ? 'المستأجر' : 'Tenant'}</th>
                            <th>${isAr ? 'قيمة الإيجار' : 'Rent'}</th>
                            <th>${isAr ? 'بداية العقد' : 'Start'}</th>
                            <th>${isAr ? 'نهاية العقد' : 'End'}</th>
                        </tr></thead>
                        <tbody>
                            ${(data.units || []).map((u: any) => `
                                <tr>
                                    <td>${u.projectName}</td>
                                    <td>${u.unitNumber}</td>
                                    <td>${u.floor !== '-' ? `${isAr ? 'الطابق' : 'Floor'} ${u.floor}` : '-'}</td>
                                    <td>${u.area !== '-' ? `${u.area} m²` : '-'}</td>
                                    <td>
                                        ${u.status === 'rented'
                                            ? `<span class="badge badge-rented">${isAr ? 'مؤجرة' : 'Rented'}</span>`
                                            : u.status === 'maintenance'
                                            ? `<span class="badge badge-maint">${isAr ? 'صيانة' : 'Maint.'}</span>`
                                            : `<span class="badge badge-vacant">${isAr ? 'شاغرة' : 'Vacant'}</span>`}
                                    </td>
                                    <td>${u.tenantName}</td>
                                    <td class="gold">${u.rentValue > 0 ? `${formatCurrency(u.rentValue)} ${isAr ? 'ريال' : 'SAR'}` : '-'}</td>
                                    <td>${formatDate(u.contractStart)}</td>
                                    <td>${formatDate(u.contractEnd)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        if (activeTab === 'expiring' && data) {
            body += `
                <div class="section">
                    <h2>${isAr ? `العقود المنتهية خلال ${data.days} يوم` : `Contracts Expiring in ${data.days} Days`} (${(data.contracts || []).length})</h2>
                    <table>
                        <thead><tr>
                            <th>${isAr ? 'المستأجر' : 'Tenant'}</th>
                            <th>${isAr ? 'المشروع' : 'Project'}</th>
                            <th>${isAr ? 'الوحدة' : 'Unit'}</th>
                            <th>${isAr ? 'تاريخ الانتهاء' : 'End Date'}</th>
                            <th>${isAr ? 'الأيام المتبقية' : 'Days Left'}</th>
                            <th>${isAr ? 'الإيجار الشهري' : 'Monthly Rent'}</th>
                        </tr></thead>
                        <tbody>
                            ${(data.contracts || []).map((c: any) => `
                                <tr style="${c.daysRemaining <= 7 ? 'background:#fff5f5' : c.daysRemaining <= 30 ? 'background:#fff8f0' : ''}">
                                    <td><strong>${c.tenantName}</strong></td>
                                    <td>${c.projectName}</td>
                                    <td>${c.unitNumber}</td>
                                    <td>${formatDate(c.contractEnd)}</td>
                                    <td><strong style="color:${c.daysRemaining <= 7 ? '#dc2626' : c.daysRemaining <= 30 ? '#ea580c' : '#ca8a04'}">${c.daysRemaining} ${isAr ? 'يوم' : 'days'}</strong></td>
                                    <td class="gold">${formatCurrency(c.monthlyRent)} ${isAr ? 'ريال' : 'SAR'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        return `
            <html dir="${dir}">
            <head>
                <meta charset="utf-8">
                <title>${tabConfig[activeTab].label}</title>
                <style>${styles}</style>
            </head>
            <body>
                <div class="header">
                    <h1>Telal Al-Bidaya — Property Management</h1>
                    <p>${tabConfig[activeTab].label} &nbsp;|&nbsp; ${isAr ? 'تاريخ الطباعة' : 'Printed'}: ${new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                ${body}
            </body>
            </html>
        `;
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=900,width=1200');
        if (!printWindow) return;
        printWindow.document.write(buildPrintHTML());
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
    };

    // Reusable th
    const Th = ({ children, center }: { children: React.ReactNode; center?: boolean }) => (
        <th className={`${center ? 'text-center' : 'text-right'} px-4 py-3 font-medium text-muted-foreground`}>{children}</th>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6" dir={dir}>

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{isAr ? 'التقارير' : 'Reports'}</h1>
                        <p className="text-sm text-muted-foreground">
                            {isAr ? 'تقارير تفصيلية من البيانات الحية' : 'Detailed reports from live data'}
                        </p>
                    </div>
                    <Button onClick={handlePrint} variant="outline" className="border-[#cea26e] text-[#cea26e] hover:bg-[#cea26e]/10 flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        {isAr ? 'طباعة التقرير' : 'Print Report'}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                    {(Object.entries(tabConfig) as [ReportTab, any][]).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === key
                                    ? 'bg-[#cea26e] text-white shadow-sm'
                                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-[#cea26e]/30'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>

                {/* Filters */}
                <Card className="p-4 shadow-sm border-0">
                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        {isAr ? 'الفلاتر' : 'Filters'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <select
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm h-10 min-w-[160px]"
                            value={buildingFilter}
                            onChange={e => setBuildingFilter(e.target.value)}
                        >
                            <option value="">{isAr ? 'كل المشاريع' : 'All Projects'}</option>
                            {projects.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>

                        {activeTab === 'occupancy' && (
                            <Input
                                placeholder={isAr ? 'الحي...' : 'District...'}
                                value={districtFilter}
                                onChange={e => setDistrictFilter(e.target.value)}
                                className="h-10 w-32"
                            />
                        )}

                        {activeTab === 'units' && (
                            <select
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm h-10"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <option value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
                                <option value="rented">{isAr ? 'مؤجرة' : 'Rented'}</option>
                                <option value="vacant">{isAr ? 'شاغرة' : 'Vacant'}</option>
                                <option value="maintenance">{isAr ? 'تحت الصيانة' : 'Maintenance'}</option>
                            </select>
                        )}

                        {(activeTab === 'financial' || activeTab === 'units') && (
                            <>
                                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-10 w-36" />
                                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="h-10 w-36" />
                            </>
                        )}

                        {activeTab === 'expiring' && (
                            <div className="flex gap-2">
                                {['30', '60', '90'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDaysFilter(d)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${daysFilter === d
                                            ? 'bg-[#cea26e] text-white'
                                            : 'bg-card border border-border text-muted-foreground'
                                            }`}
                                    >
                                        {d} {isAr ? 'يوم' : 'days'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Report Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#cea26e]" />
                    </div>
                ) : (
                    <div ref={printRef}>

                        {/* OCCUPANCY REPORT */}
                        {activeTab === 'occupancy' && data && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card className="p-4 shadow-sm border-0 text-center">
                                        <p className="text-2xl font-bold">{data.summary?.totalUnits || 0}</p>
                                        <p className="text-xs text-muted-foreground">{isAr ? 'إجمالي الوحدات' : 'Total Units'}</p>
                                    </Card>
                                    <Card className="p-4 shadow-sm border-0 text-center">
                                        <p className="text-2xl font-bold text-blue-600">{data.summary?.totalRented || 0}</p>
                                        <p className="text-xs text-muted-foreground">{isAr ? 'مؤجرة' : 'Rented'}</p>
                                    </Card>
                                    <Card className="p-4 shadow-sm border-0 text-center">
                                        <p className="text-2xl font-bold text-green-600">{data.summary?.totalVacant || 0}</p>
                                        <p className="text-xs text-muted-foreground">{isAr ? 'شاغرة' : 'Vacant'}</p>
                                    </Card>
                                    <Card className="p-4 shadow-sm border-0 text-center">
                                        <p className="text-2xl font-bold text-[#cea26e]">{data.summary?.totalOccupancy || 0}%</p>
                                        <p className="text-xs text-muted-foreground">{isAr ? 'نسبة الإشغال الكلية' : 'Overall Occupancy'}</p>
                                    </Card>
                                </div>

                                <Card className="shadow-sm border-0 overflow-hidden">
                                    <div className="p-4 border-b border-border">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-[#cea26e]" />
                                            {isAr ? 'تفصيل حسب المشروع' : 'Breakdown by Project'}
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/40">
                                                <tr>
                                                    <Th>{isAr ? 'المشروع' : 'Project'}</Th>
                                                    <Th>{isAr ? 'المدينة' : 'City'}</Th>
                                                    <Th>{isAr ? 'الحي' : 'District'}</Th>
                                                    <Th>{isAr ? 'المالك' : 'Owner'}</Th>
                                                    <Th center>{isAr ? 'إجمالي' : 'Total'}</Th>
                                                    <Th center>{isAr ? 'مؤجرة' : 'Rented'}</Th>
                                                    <Th center>{isAr ? 'شاغرة' : 'Vacant'}</Th>
                                                    <Th center>{isAr ? 'الإشغال' : 'Occupancy'}</Th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(data.buildings || []).length === 0 ? (
                                                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">{isAr ? 'لا توجد بيانات' : 'No data'}</td></tr>
                                                ) : (data.buildings || []).map((b: any) => (
                                                    <tr key={b.id} className="border-t border-border hover:bg-muted/20">
                                                        <td className="px-4 py-3 font-medium">{b.name}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{b.city || '-'}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{b.district || '-'}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{b.ownerName || '-'}</td>
                                                        <td className="px-4 py-3 text-center font-medium">{b.units}</td>
                                                        <td className="px-4 py-3 text-center text-blue-600 font-medium">{b.rented}</td>
                                                        <td className="px-4 py-3 text-center text-green-600 font-medium">{b.vacant}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                    <div className="h-full bg-[#cea26e] rounded-full" style={{ width: `${b.occupancy}%` }} />
                                                                </div>
                                                                <span className="text-xs font-medium text-[#cea26e] w-8">{b.occupancy}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* FINANCIAL REPORT */}
                        {activeTab === 'financial' && data && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="p-4 shadow-sm border-0">
                                        <p className="text-xs text-muted-foreground mb-1">{isAr ? 'إجمالي الدخل الشهري' : 'Total Monthly Income'}</p>
                                        <p className="text-2xl font-bold text-[#cea26e]">
                                            {formatCurrency(data.totalMonthlyIncome || 0)} {isAr ? 'ريال' : 'SAR'}
                                        </p>
                                    </Card>
                                    <Card className="p-4 shadow-sm border-0">
                                        <p className="text-xs text-muted-foreground mb-1">{isAr ? 'عقود إيجار نشطة' : 'Active Rental Contracts'}</p>
                                        <p className="text-2xl font-bold">{data.activeContracts || 0}</p>
                                    </Card>
                                </div>

                                <Card className="shadow-sm border-0 overflow-hidden">
                                    <div className="p-4 border-b border-border">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-[#cea26e]" />
                                            {isAr ? 'تفصيل حسب المشروع' : 'Breakdown by Project'}
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/40">
                                                <tr>
                                                    <Th>{isAr ? 'المشروع' : 'Project'}</Th>
                                                    <Th>{isAr ? 'المالك' : 'Owner'}</Th>
                                                    <Th>{isAr ? 'عدد العقود' : 'Contracts'}</Th>
                                                    <Th>{isAr ? 'الدخل الشهري' : 'Monthly Income'}</Th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(data.byBuilding || []).length === 0 ? (
                                                    <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">{isAr ? 'لا توجد بيانات' : 'No data'}</td></tr>
                                                ) : (data.byBuilding || []).map((b: any) => (
                                                    <tr key={b.id} className="border-t border-border hover:bg-muted/20">
                                                        <td className="px-4 py-3 font-medium">{b.name}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{b.ownerName || '-'}</td>
                                                        <td className="px-4 py-3">{b.count}</td>
                                                        <td className="px-4 py-3 font-semibold text-[#cea26e]">
                                                            {formatCurrency(b.monthlyIncome)} {isAr ? 'ريال' : 'SAR'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>

                                <Card className="shadow-sm border-0 overflow-hidden">
                                    <div className="p-4 border-b border-border">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Users className="h-4 w-4 text-[#cea26e]" />
                                            {isAr ? 'تفصيل حسب المالك' : 'Breakdown by Owner'}
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/40">
                                                <tr>
                                                    <Th>{isAr ? 'المالك' : 'Owner'}</Th>
                                                    <Th>{isAr ? 'عدد العقود' : 'Contracts'}</Th>
                                                    <Th>{isAr ? 'الدخل الشهري' : 'Monthly Income'}</Th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(data.byOwner || []).length === 0 ? (
                                                    <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">{isAr ? 'لا توجد بيانات' : 'No data'}</td></tr>
                                                ) : (data.byOwner || []).map((o: any) => (
                                                    <tr key={o.id} className="border-t border-border hover:bg-muted/20">
                                                        <td className="px-4 py-3 font-medium">{o.name}</td>
                                                        <td className="px-4 py-3">{o.count}</td>
                                                        <td className="px-4 py-3 font-semibold text-[#cea26e]">
                                                            {formatCurrency(o.monthlyIncome)} {isAr ? 'ريال' : 'SAR'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* UNITS REPORT */}
                        {activeTab === 'units' && data && (
                            <Card className="shadow-sm border-0 overflow-hidden">
                                <div className="p-4 border-b border-border flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Home className="h-4 w-4 text-[#cea26e]" />
                                        {isAr ? 'قائمة الوحدات' : 'Units List'}
                                    </h3>
                                    <Badge variant="outline">
                                        {(data.units || []).length} {isAr ? 'وحدة' : 'units'}
                                    </Badge>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/40">
                                            <tr>
                                                <Th>{isAr ? 'المشروع' : 'Project'}</Th>
                                                <Th>{isAr ? 'رقم الوحدة' : 'Unit No.'}</Th>
                                                <Th>{isAr ? 'الطابق' : 'Floor'}</Th>
                                                <Th>{isAr ? 'المساحة' : 'Area'}</Th>
                                                <Th>{isAr ? 'الحالة' : 'Status'}</Th>
                                                <Th>{isAr ? 'المستأجر' : 'Tenant'}</Th>
                                                <Th>{isAr ? 'قيمة الإيجار' : 'Rent Value'}</Th>
                                                <Th>{isAr ? 'بداية العقد' : 'Start Date'}</Th>
                                                <Th>{isAr ? 'نهاية العقد' : 'End Date'}</Th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(data.units || []).length === 0 ? (
                                                <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">{isAr ? 'لا توجد وحدات' : 'No units found'}</td></tr>
                                            ) : (data.units || []).map((u: any, i: number) => (
                                                <tr key={u.id} className={`border-t border-border hover:bg-muted/20 ${i % 2 === 0 ? '' : 'bg-muted/5'}`}>
                                                    <td className="px-4 py-3 font-medium">{u.projectName}</td>
                                                    <td className="px-4 py-3">{u.unitNumber}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {u.floor !== '-' ? `${isAr ? 'الطابق' : 'Floor'} ${u.floor}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {u.area !== '-' ? `${u.area} m²` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {u.status === 'rented' ? (
                                                            <Badge className="bg-blue-500/10 text-blue-600 border-0 text-xs">
                                                                {isAr ? 'مؤجرة' : 'Rented'}
                                                            </Badge>
                                                        ) : u.status === 'maintenance' ? (
                                                            <Badge className="bg-orange-500/10 text-orange-600 border-0 text-xs">
                                                                {isAr ? 'تحت الصيانة' : 'Maintenance'}
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-green-500/10 text-green-600 border-0 text-xs">
                                                                {isAr ? 'شاغرة' : 'Vacant'}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">{u.tenantName}</td>
                                                    <td className="px-4 py-3 font-medium text-[#cea26e]">
                                                        {u.rentValue > 0 ? `${formatCurrency(u.rentValue)} ${isAr ? 'ريال' : 'SAR'}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">{formatDate(u.contractStart)}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{formatDate(u.contractEnd)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {/* EXPIRING CONTRACTS REPORT */}
                        {activeTab === 'expiring' && data && (
                            <div className="space-y-4">
                                {(data.contracts || []).length > 0 && (
                                    <Card className="p-4 shadow-sm border-0 bg-orange-50/50 dark:bg-orange-950/20">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                                            <div>
                                                <p className="font-semibold text-orange-700 dark:text-orange-400">
                                                    {(data.contracts || []).length} {isAr ? `عقد ينتهي خلال ${data.days} يوم` : `contract(s) expiring within ${data.days} days`}
                                                </p>
                                                <p className="text-sm text-orange-600/70 dark:text-orange-400/70">
                                                    {isAr ? 'يرجى التواصل مع المستأجرين لتجديد العقود' : 'Please contact tenants to renew contracts'}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                <Card className="shadow-sm border-0 overflow-hidden">
                                    <div className="p-4 border-b border-border">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-[#cea26e]" />
                                            {isAr ? 'العقود التي تنتهي قريباً' : 'Contracts Expiring Soon'}
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/40">
                                                <tr>
                                                    <Th>{isAr ? 'اسم المستأجر' : 'Tenant'}</Th>
                                                    <Th>{isAr ? 'المشروع' : 'Project'}</Th>
                                                    <Th>{isAr ? 'رقم الوحدة' : 'Unit No.'}</Th>
                                                    <Th>{isAr ? 'تاريخ الانتهاء' : 'End Date'}</Th>
                                                    <Th>{isAr ? 'الأيام المتبقية' : 'Days Left'}</Th>
                                                    <Th>{isAr ? 'الإيجار الشهري' : 'Monthly Rent'}</Th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(data.contracts || []).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center py-8">
                                                            <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                                                            <p className="text-muted-foreground">
                                                                {isAr
                                                                    ? `لا توجد عقود تنتهي خلال ${data.days} يوم`
                                                                    : `No contracts expiring within ${data.days} days`}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ) : (data.contracts || []).map((c: any) => (
                                                    <tr key={c.id} className={`border-t border-border hover:bg-muted/20 ${c.daysRemaining <= 7 ? 'bg-red-50/30 dark:bg-red-950/10' : c.daysRemaining <= 30 ? 'bg-orange-50/30 dark:bg-orange-950/10' : ''}`}>
                                                        <td className="px-4 py-3 font-medium">{c.tenantName}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{c.projectName}</td>
                                                        <td className="px-4 py-3">{c.unitNumber}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{formatDate(c.contractEnd)}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge className={`border-0 text-xs font-bold ${c.daysRemaining <= 7
                                                                ? 'bg-red-500/10 text-red-600'
                                                                : c.daysRemaining <= 30
                                                                    ? 'bg-orange-500/10 text-orange-600'
                                                                    : 'bg-yellow-500/10 text-yellow-600'
                                                                }`}>
                                                                {c.daysRemaining} {isAr ? 'يوم' : 'days'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-[#cea26e]">
                                                            {formatCurrency(c.monthlyRent)} {isAr ? 'ريال' : 'SAR'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
