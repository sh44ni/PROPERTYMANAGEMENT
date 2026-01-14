'use client';

import { Building2, PieChart, TrendingDown, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    iconBgColor: string;
    iconColor: string;
}

function StatCard({ icon, label, value, iconBgColor, iconColor }: StatCardProps) {
    return (
        <Card className="flex items-center gap-3 p-4 shadow-sm border-0 min-w-[160px]">
            <div
                className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                style={{ backgroundColor: iconBgColor }}
            >
                <div style={{ color: iconColor }}>{icon}</div>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold text-foreground">{value}</p>
            </div>
        </Card>
    );
}

interface StatsRowProps {
    totalProperties?: number;
    occupancy?: number;
    expenses?: number;
    cashFlow?: number;
}

export function StatsRow({
    totalProperties = 12,
    occupancy = 85,
    expenses = 2400,
    cashFlow = 35600,
}: StatsRowProps) {
    const { t, language } = useLanguage();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-OM' : 'en-OM', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const currencyLabel = language === 'ar' ? 'ر.ع' : 'OMR';

    const stats = [
        {
            icon: <Building2 className="h-5 w-5" />,
            label: t.nav.properties,
            value: language === 'ar' ? `${totalProperties} إجمالي` : `${totalProperties} Total`,
            iconBgColor: 'rgba(59, 130, 246, 0.1)',
            iconColor: '#3b82f6',
        },
        {
            icon: <PieChart className="h-5 w-5" />,
            label: language === 'ar' ? 'نسبة الإشغال' : 'Occupancy',
            value: `${occupancy}%`,
            iconBgColor: 'rgba(34, 197, 94, 0.1)',
            iconColor: '#22c55e',
        },
        {
            icon: <TrendingDown className="h-5 w-5" />,
            label: t.accounts.expenses,
            value: `${formatCurrency(expenses)} ${currencyLabel}`,
            iconBgColor: 'rgba(239, 68, 68, 0.1)',
            iconColor: '#ef4444',
        },
        {
            icon: <Wallet className="h-5 w-5" />,
            label: language === 'ar' ? 'التدفق النقدي' : 'Cash Flow',
            value: `${formatCurrency(cashFlow)} ${currencyLabel}`,
            iconBgColor: 'rgba(206, 162, 110, 0.1)',
            iconColor: '#cea26e',
        },
    ];

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:pb-0">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}
