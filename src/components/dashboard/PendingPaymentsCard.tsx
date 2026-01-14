'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Payment {
    id: string;
    tenantName: string;
    propertyName: string;
    amount: number;
    dueDate: string;
    isOverdue: boolean;
}

interface PendingPaymentsCardProps {
    payments?: Payment[];
}

const defaultPayments: Payment[] = [
    {
        id: '1',
        tenantName: 'Ahmed Al-Balushi',
        propertyName: 'Villa 12, Al Khuwair',
        amount: 650,
        dueDate: '2026-01-05',
        isOverdue: true,
    },
    {
        id: '2',
        tenantName: 'Fatima Al-Harthi',
        propertyName: 'Apt 304, Al Ghubra',
        amount: 320,
        dueDate: '2026-01-10',
        isOverdue: true,
    },
    {
        id: '3',
        tenantName: 'Mohammed Al-Rashdi',
        propertyName: 'Villa 8, Al Hail',
        amount: 800,
        dueDate: '2026-01-15',
        isOverdue: false,
    },
    {
        id: '4',
        tenantName: 'Sara Al-Lawati',
        propertyName: 'Apt 102, Bausher',
        amount: 280,
        dueDate: '2026-01-18',
        isOverdue: false,
    },
    {
        id: '5',
        tenantName: 'Khalid Al-Habsi',
        propertyName: 'Apt 205, Qurum',
        amount: 400,
        dueDate: '2026-01-20',
        isOverdue: false,
    },
];

export function PendingPaymentsCard({ payments = defaultPayments }: PendingPaymentsCardProps) {
    const { t, language, isRTL } = useLanguage();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-OM' : 'en-OM', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-GB', {
            day: 'numeric',
            month: 'short',
        });
    };

    const currencyLabel = language === 'ar' ? 'ر.ع' : 'OMR';

    return (
        <Card className="p-5 shadow-sm border-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-base font-semibold text-foreground">
                    {t.dashboard.pendingPayments}
                </h3>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    {payments.length}
                </Badge>
            </div>

            {/* Payment List */}
            <div className="space-y-3">
                {payments.slice(0, 5).map((payment) => (
                    <div
                        key={payment.id}
                        className={`flex items-center justify-between rounded-xl p-3 bg-muted/30 ${payment.isOverdue ? `${isRTL ? 'border-r-2' : 'border-l-2'} border-destructive` : ''
                            }`}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {payment.tenantName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {payment.propertyName}
                            </p>
                        </div>

                        <div className={`flex items-center gap-3 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                            <div className={isRTL ? 'text-left' : 'text-right'}>
                                <p className="text-sm font-semibold text-foreground">
                                    {formatCurrency(payment.amount)} {currencyLabel}
                                </p>
                                {payment.isOverdue ? (
                                    <Badge variant="destructive" className="text-[10px] h-5">
                                        {t.rentals.overdue}
                                    </Badge>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        {language === 'ar' ? 'مستحق' : 'Due'} {formatDate(payment.dueDate)}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[#cea26e] hover:text-[#b8915f] hover:bg-[#cea26e]/10"
                            >
                                {language === 'ar' ? 'تذكير' : 'Remind'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Link */}
            <div className="mt-4 text-center">
                <Link
                    href="/accounts"
                    className="text-sm font-medium text-[#cea26e] hover:text-[#b8915f] transition-colors"
                >
                    {language === 'ar' ? 'عرض جميع المدفوعات' : 'View All Payments'}
                </Link>
            </div>
        </Card>
    );
}
