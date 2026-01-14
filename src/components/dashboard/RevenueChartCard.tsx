'use client';

import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const chartData = [
    { month: 'Aug', monthAr: 'أغسطس', revenue: 32000, expenses: 2100 },
    { month: 'Sep', monthAr: 'سبتمبر', revenue: 34500, expenses: 2300 },
    { month: 'Oct', monthAr: 'أكتوبر', revenue: 36000, expenses: 2800 },
    { month: 'Nov', monthAr: 'نوفمبر', revenue: 35200, expenses: 2200 },
    { month: 'Dec', monthAr: 'ديسمبر', revenue: 37500, expenses: 2600 },
    { month: 'Jan', monthAr: 'يناير', revenue: 38000, expenses: 2400 },
];

export function RevenueChartCard() {
    const { language, t } = useLanguage();
    const [timeframe, setTimeframe] = useState('6m');

    const timeframes = [
        { label: language === 'ar' ? 'آخر 6 أشهر' : 'Last 6 Months', value: '6m' },
        { label: language === 'ar' ? 'السنة الماضية' : 'Last Year', value: '1y' },
        { label: t.statements.allTime, value: 'all' },
    ];

    const selectedTimeframe = timeframes.find((tf) => tf.value === timeframe);
    const currencyLabel = language === 'ar' ? 'ر.ع' : 'OMR';

    const formatYAxis = (value: number) => {
        return `${(value / 1000).toFixed(0)}K`;
    };

    // Transform data for current language
    const displayData = chartData.map(d => ({
        ...d,
        displayMonth: language === 'ar' ? d.monthAr : d.month,
    }));

    interface CustomTooltipProps {
        active?: boolean;
        payload?: Array<{
            value: number;
            dataKey: string;
            color: string;
        }>;
        label?: string;
    }

    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            const dataPoint = displayData.find(d => d.displayMonth === label);
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium text-foreground mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">
                                {entry.dataKey === 'revenue'
                                    ? (language === 'ar' ? 'الإيرادات' : 'Revenue')
                                    : (language === 'ar' ? 'المصروفات' : 'Expenses')
                                }:
                            </span>
                            <span className="font-medium text-foreground">
                                {(entry.value / 1000).toFixed(1)}K {currencyLabel}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="p-5 shadow-sm border-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-foreground">
                    {language === 'ar' ? 'الإيرادات مقابل المصروفات' : 'Revenue vs Expenses'}
                </h3>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                            {selectedTimeframe?.label}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {timeframes.map((tf) => (
                            <DropdownMenuItem
                                key={tf.value}
                                onClick={() => setTimeframe(tf.value)}
                                className="cursor-pointer"
                            >
                                {tf.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Chart */}
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={displayData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#cea26e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#cea26e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                            dataKey="displayMonth"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={formatYAxis}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value: string) => (
                                <span className="text-sm text-muted-foreground ml-1">
                                    {value === 'revenue'
                                        ? (language === 'ar' ? 'الإيرادات' : 'Revenue')
                                        : (language === 'ar' ? 'المصروفات' : 'Expenses')
                                    }
                                </span>
                            )}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#cea26e"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#6b7280"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorExpenses)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
