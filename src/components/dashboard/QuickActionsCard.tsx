'use client';

import { Receipt, XCircle, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function QuickActionsCard() {
    const { t, language } = useLanguage();

    return (
        <Card className="p-5 shadow-sm border-0">
            <h3 className="text-base font-semibold text-foreground mb-4">
                {t.dashboard.quickActions}
            </h3>

            <div className="flex flex-col gap-2">
                <Button
                    className="h-11 justify-start gap-3 bg-[#cea26e] hover:bg-[#b8915f] text-white font-medium"
                >
                    <Receipt className="h-5 w-5" />
                    {language === 'ar' ? 'إصدار إيصال' : 'Issue Receipt'}
                </Button>

                <Button
                    variant="outline"
                    className="h-11 justify-start gap-3 border-border font-medium"
                >
                    <XCircle className="h-5 w-5" />
                    {language === 'ar' ? 'إلغاء إيصال' : 'Cancel Receipt'}
                </Button>

                <Button
                    variant="outline"
                    className="h-11 justify-start gap-3 border-border font-medium"
                >
                    <Building2 className="h-5 w-5" />
                    {language === 'ar' ? 'عرض العقارات' : 'View Properties'}
                </Button>
            </div>
        </Card>
    );
}
