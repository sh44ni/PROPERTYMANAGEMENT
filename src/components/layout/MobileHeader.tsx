'use client';

import { useState } from 'react';
import { Menu, Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { MobileDrawer } from './MobileDrawer';

export function MobileHeader() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [selectedPreset, setSelectedPreset] = useState<string>('this_month');

    const presets = [
        { id: 'today', label: 'Today' },
        { id: 'last_7', label: 'Last 7 Days' },
        { id: 'this_month', label: 'This Month' },
        { id: 'last_30', label: 'Last 30 Days' },
        { id: 'this_quarter', label: 'This Quarter' },
        { id: 'this_year', label: 'This Year' },
        { id: 'custom', label: 'Custom Range' },
    ];

    const applyPreset = (presetId: string) => {
        if (presetId === 'custom') {
            setSelectedPreset(presetId);
            return;
        }

        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (presetId) {
            case 'today':
                start = today;
                end = today;
                break;
            case 'last_7':
                start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                end = today;
                break;
            case 'this_month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = today;
                break;
            case 'last_30':
                start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                end = today;
                break;
            case 'this_quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                start = new Date(today.getFullYear(), quarter * 3, 1);
                end = today;
                break;
            case 'this_year':
                start = new Date(today.getFullYear(), 0, 1);
                end = today;
                break;
            default:
                return;
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
        });
        setSelectedPreset(presetId);
        setIsDatePickerOpen(false);
    };

    const formatDisplayDate = () => {
        const preset = presets.find(p => p.id === selectedPreset);
        if (preset && selectedPreset !== 'custom') {
            return preset.label;
        }
        const start = new Date(dateRange.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const end = new Date(dateRange.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        return `${start} - ${end}`;
    };

    return (
        <>
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-card px-4 shadow-sm lg:hidden">
                {/* Menu Button */}
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Date Range Selector */}
                <button
                    onClick={() => setIsDatePickerOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                    <Calendar className="h-4 w-4 text-[#cea26e]" />
                    <span className="text-sm font-medium">{formatDisplayDate()}</span>
                </button>

                {/* Notification */}
                <button className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#cea26e]" />
                </button>
            </header>

            <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

            {/* Date Range Picker Sheet */}
            <Sheet open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader className="pb-4">
                        <SheetTitle>Select Date Range</SheetTitle>
                    </SheetHeader>

                    {/* Presets */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {presets.filter(p => p.id !== 'custom').map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => applyPreset(preset.id)}
                                className={`p-3 rounded-xl text-sm font-medium transition-colors ${selectedPreset === preset.id
                                        ? 'bg-[#cea26e] text-white'
                                        : 'bg-muted/50 text-foreground hover:bg-muted'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Range */}
                    <div className="border-t border-border pt-4">
                        <p className="text-sm font-medium mb-3">Custom Range</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => {
                                        setDateRange({ ...dateRange, start: e.target.value });
                                        setSelectedPreset('custom');
                                    }}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => {
                                        setDateRange({ ...dateRange, end: e.target.value });
                                        setSelectedPreset('custom');
                                    }}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full mt-4 bg-[#cea26e] hover:bg-[#b8915f] text-white"
                            onClick={() => setIsDatePickerOpen(false)}
                        >
                            Apply Range
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
