'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

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

export function PendingPaymentsCard({ payments = [] }: PendingPaymentsCardProps) {
    const { t, language, isRTL } = useLanguage();
    const [sendingReminder, setSendingReminder] = useState<string | null>(null);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string } | null>(null);

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

    const handleSendReminder = async (rentalId: string) => {
        setSendingReminder(rentalId);
        try {
            const response = await fetch('/api/send-payment-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rentalId }),
            });

            const result = await response.json();

            if (response.ok) {
                setToast({ show: true, type: 'success', message: 'Reminder sent!' });
            } else {
                setToast({ show: true, type: 'error', message: result.error || 'Failed to send' });
            }
        } catch (error) {
            setToast({ show: true, type: 'error', message: 'Network error' });
        } finally {
            setSendingReminder(null);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const currencyLabel = language === 'ar' ? 'ر.ع' : 'OMR';

    return (
        <Card className="p-5 shadow-sm border-0 relative">
            {/* Toast */}
            {toast && (
                <div className={`absolute top-2 right-2 left-2 z-10 px-3 py-2 rounded-lg text-sm text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}

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
            {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    {language === 'ar' ? 'لا توجد دفعات معلقة' : 'No pending payments'}
                </div>
            ) : (
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
                                    onClick={() => handleSendReminder(payment.id)}
                                    disabled={sendingReminder === payment.id}
                                >
                                    {sendingReminder === payment.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        language === 'ar' ? 'تذكير' : 'Remind'
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View All Link */}
            <div className="mt-4 text-center">
                <Link
                    href="/rentals"
                    className="text-sm font-medium text-[#cea26e] hover:text-[#b8915f] transition-colors"
                >
                    {language === 'ar' ? 'عرض جميع الإيجارات' : 'View All Rentals'}
                </Link>
            </div>
        </Card>
    );
}

