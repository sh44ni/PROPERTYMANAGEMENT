'use client';

import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface RentCollectionCardProps {
    totalRent: number;
    collected: number;
    pending: number;
    month: string;
    overdueCount: number;
}

export function RentCollectionCard({
    totalRent = 38000,
    collected = 26600,
    pending = 11400,
    month = 'January 2026',
    overdueCount = 3,
}: RentCollectionCardProps) {
    const { t, language } = useLanguage();
    const collectionPercentage = (collected / totalRent) * 100;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-OM' : 'en-OM', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Month translation mapping
    const monthAr: Record<string, string> = {
        'January': 'يناير',
        'February': 'فبراير',
        'March': 'مارس',
        'April': 'أبريل',
        'May': 'مايو',
        'June': 'يونيو',
        'July': 'يوليو',
        'August': 'أغسطس',
        'September': 'سبتمبر',
        'October': 'أكتوبر',
        'November': 'نوفمبر',
        'December': 'ديسمبر',
    };

    const getMonthDisplay = () => {
        if (language === 'ar') {
            const [monthName, year] = month.split(' ');
            return `${monthAr[monthName] || monthName} ${year}`;
        }
        return month;
    };

    return (
        <Card className="p-5 shadow-sm border-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'إجمالي الإيجار' : 'Total Rent'}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{getMonthDisplay()}</p>
                </div>
            </div>

            {/* Big Number */}
            <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">
                    {language === 'ar' ? formatCurrency(totalRent) : formatCurrency(totalRent)} {language === 'ar' ? 'ر.ع' : 'OMR'}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <Progress
                    value={collectionPercentage}
                    className="h-2 bg-muted"
                />
            </div>

            {/* Collected vs Pending */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                        {language === 'ar' ? 'المحصل' : 'Collected'}
                    </p>
                    <p className="text-lg font-semibold text-[#cea26e]">
                        {formatCurrency(collected)} {language === 'ar' ? 'ر.ع' : 'OMR'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                        {t.rentals.pending}
                    </p>
                    <p className="text-lg font-semibold text-muted-foreground">
                        {formatCurrency(pending)} {language === 'ar' ? 'ر.ع' : 'OMR'}
                    </p>
                </div>
            </div>

            {/* Footer Alert */}
            {overdueCount > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-[#cea26e]/10 p-3 gap-2">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-[#cea26e] flex-shrink-0" />
                        <span className="text-sm text-foreground">
                            {language === 'ar'
                                ? `${overdueCount} مستأجرين لديهم فواتير مستحقة`
                                : `${overdueCount} tenants with invoices due`
                            }
                        </span>
                    </div>
                    <Button
                        size="sm"
                        className="h-8 bg-[#cea26e] hover:bg-[#b8915f] text-white flex-shrink-0"
                    >
                        {t.rentals.sendReminder}
                    </Button>
                </div>
            )}
        </Card>
    );
}
