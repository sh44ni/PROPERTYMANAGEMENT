'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText,
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Loader2,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';

// Types
interface Transaction {
    id: string;
    transactionNo: string;
    category: 'income' | 'expense';
    type: string;
    amount: number;
    paidBy: string;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque';
    date: string;
    description?: string;
}

// Mock transactions data (same as accounts page)
const mockTransactions: Transaction[] = [
    {
        id: 'txn1',
        transactionNo: 'TXN-2024-001',
        category: 'income',
        type: 'rent_payment',
        amount: 450,
        paidBy: 'Fatima Al-Harthi',
        paymentMethod: 'bank_transfer',
        date: '2024-01-10',
        description: 'January rent payment',
    },
    {
        id: 'txn2',
        transactionNo: 'TXN-2024-002',
        category: 'expense',
        type: 'maintenance',
        amount: 120,
        paidBy: 'Al Waha Maintenance',
        paymentMethod: 'cash',
        date: '2024-01-08',
        description: 'AC repair for Villa 47',
    },
    {
        id: 'txn3',
        transactionNo: 'TXN-2024-003',
        category: 'income',
        type: 'deposit',
        amount: 900,
        paidBy: 'Mohammed Al-Lawati',
        paymentMethod: 'cheque',
        date: '2024-01-03',
        description: 'Security deposit for new rental',
    },
    {
        id: 'txn4',
        transactionNo: 'TXN-2024-004',
        category: 'income',
        type: 'rent_payment',
        amount: 550,
        paidBy: 'Ahmed Al-Balushi',
        paymentMethod: 'bank_transfer',
        date: '2024-01-15',
        description: 'January rent - Apartment 12',
    },
    {
        id: 'txn5',
        transactionNo: 'TXN-2024-005',
        category: 'expense',
        type: 'utilities',
        amount: 85,
        paidBy: 'Muscat Electricity',
        paymentMethod: 'bank_transfer',
        date: '2024-01-12',
        description: 'Common area electricity',
    },
    {
        id: 'txn6',
        transactionNo: 'TXN-2024-006',
        category: 'expense',
        type: 'repairs',
        amount: 200,
        paidBy: 'Al Khaleej Plumbing',
        paymentMethod: 'cash',
        date: '2024-01-18',
        description: 'Water leak repair',
    },
    {
        id: 'txn7',
        transactionNo: 'TXN-2024-007',
        category: 'income',
        type: 'other_income',
        amount: 150,
        paidBy: 'Yousuf Al-Said',
        paymentMethod: 'cash',
        date: '2024-01-20',
        description: 'Parking fee',
    },
];

const presetRanges = [
    {
        label: 'This Month', getValue: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
        }
    },
    {
        label: 'Last Month', getValue: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
        }
    },
    {
        label: 'This Quarter', getValue: () => {
            const now = new Date();
            const quarter = Math.floor(now.getMonth() / 3);
            const start = new Date(now.getFullYear(), quarter * 3, 1);
            const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
            return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
        }
    },
    {
        label: 'This Year', getValue: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 1);
            const end = new Date(now.getFullYear(), 11, 31);
            return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
        }
    },
    {
        label: 'All Time', getValue: () => {
            return { start: '2020-01-01', end: new Date().toISOString().split('T')[0] };
        }
    },
];

export default function StatementsPage() {
    const { t, language } = useLanguage();
    const [transactions] = useState<Transaction[]>(mockTransactions);

    // Default to "All Time" range
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Filter transactions by date range
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return date >= start && date <= end;
        });
    }, [transactions, startDate, endDate]);

    // Calculate totals
    const totals = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.category === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = filteredTransactions
            .filter(t => t.category === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            income,
            expenses,
            net: income - expenses,
        };
    }, [filteredTransactions]);

    const formatCurrency = (amount: number) => amount.toFixed(3);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'rent_payment': 'Rent Payment',
            'deposit': 'Deposit',
            'other_income': 'Other Income',
            'maintenance': 'Maintenance',
            'utilities': 'Utilities',
            'insurance': 'Insurance',
            'taxes': 'Taxes',
            'management_fees': 'Management Fees',
            'repairs': 'Repairs',
            'other_expense': 'Other Expense',
        };
        return labels[type] || type;
    };

    const handlePresetClick = (preset: typeof presetRanges[0]) => {
        const { start, end } = preset.getValue();
        setStartDate(start);
        setEndDate(end);
    };

    const handleGeneratePdf = async () => {
        if (!startDate || !endDate) {
            showToast('Please select a date range', 'error');
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate-statement-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    transactions: filteredTransactions,
                    totalIncome: totals.income,
                    totalExpenses: totals.expenses,
                    netIncome: totals.net,
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `statement-${startDate}-to-${endDate}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                showToast('Statement downloaded successfully');
            } else {
                const error = await response.json();
                showToast(error.error || 'Failed to generate statement', 'error');
            }
        } catch {
            showToast('Failed to generate statement', 'error');
        }

        setIsGenerating(false);
    };

    const incomeTransactions = filteredTransactions.filter(t => t.category === 'income');
    const expenseTransactions = filteredTransactions.filter(t => t.category === 'expense');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Toast */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right ${toast.type === 'success' ? 'bg-green-600' : 'bg-destructive'
                        } text-white`}>
                        {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {toast.message}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t.statements.title}</h1>
                        <p className="text-sm text-muted-foreground">{t.statements.subtitle}</p>
                    </div>
                    <Button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating || filteredTransactions.length === 0}
                        className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        )}
                        {t.statements.downloadPdf}
                    </Button>
                </div>

                {/* Date Range Selection */}
                <Card className="p-4 shadow-sm border-0">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-[#cea26e]" />
                        <h2 className="font-semibold">Select Period</h2>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {presetRanges.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handlePresetClick(preset)}
                                className="px-3 py-1.5 text-sm rounded-lg border border-border hover:border-[#cea26e] hover:bg-[#cea26e]/10 transition-colors"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Income</p>
                                <p className="text-xl font-bold text-green-600">OMR {formatCurrency(totals.income)}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Expenses</p>
                                <p className="text-xl font-bold text-red-600">OMR {formatCurrency(totals.expenses)}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#cea26e]/10">
                                <DollarSign className="h-5 w-5 text-[#cea26e]" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Net Income</p>
                                <p className={`text-xl font-bold ${totals.net >= 0 ? 'text-[#cea26e]' : 'text-red-600'}`}>
                                    OMR {formatCurrency(totals.net)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Transactions Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Income */}
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="font-semibold">Income ({incomeTransactions.length})</h3>
                        </div>
                        {incomeTransactions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No income in this period</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {incomeTransactions.map(t => (
                                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                        <div>
                                            <p className="text-sm font-medium">{t.paidBy}</p>
                                            <p className="text-xs text-muted-foreground">{getTypeLabel(t.type)} • {formatDate(t.date)}</p>
                                        </div>
                                        <span className="text-green-600 font-semibold">+OMR {formatCurrency(t.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Expenses */}
                    <Card className="p-4 shadow-sm border-0">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center">
                                <TrendingDown className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="font-semibold">Expenses ({expenseTransactions.length})</h3>
                        </div>
                        {expenseTransactions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No expenses in this period</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {expenseTransactions.map(t => (
                                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                        <div>
                                            <p className="text-sm font-medium">{t.paidBy}</p>
                                            <p className="text-xs text-muted-foreground">{getTypeLabel(t.type)} • {formatDate(t.date)}</p>
                                        </div>
                                        <span className="text-red-600 font-semibold">-OMR {formatCurrency(t.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Info */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>Showing {filteredTransactions.length} transaction(s) from {formatDate(startDate)} to {formatDate(endDate)}</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
