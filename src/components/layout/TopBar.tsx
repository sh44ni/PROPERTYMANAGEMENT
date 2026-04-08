'use client';

import { Search, Bell, Languages, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function TopBar() {
    const { language, setLanguage, t } = useLanguage();
    const [mode, setMode] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/setup/status')
            .then((r) => r.json())
            .then((j) => setMode(j?.data?.mode || null))
            .catch(() => setMode(null));
    }, []);

    return (
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-card px-6 lg:flex">
            {/* Search */}
            <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input
                    type="search"
                    placeholder={`${t.common.search}...`}
                    className="h-10 pl-10 rtl:pl-4 rtl:pr-10 bg-background border-border"
                />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Demo badge + Activate CTA */}
                {mode === 'demo' && (
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#cea26e]/10 text-[#cea26e] border border-[#cea26e]/30 px-3 py-1 text-xs font-semibold">
                            <Sparkles className="h-3.5 w-3.5" />
                            {language === 'ar' ? 'وضع التجربة' : 'Test Mode'}
                        </span>
                        <Link
                            href="/setup/activate"
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold bg-[#cea26e] text-white hover:bg-[#b8915f] transition-colors"
                        >
                            {language === 'ar' ? 'فعّل الآن' : 'Activate now'}
                        </Link>
                    </div>
                )}

                {/* Notification Bell */}
                <button className="relative rounded-lg p-2 hover:bg-muted transition-colors touch-target">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#cea26e]" />
                </button>

                {/* Language Toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors touch-target border border-border">
                            <Languages className="h-4 w-4" />
                            <span>{language === 'en' ? 'EN' : 'AR'}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                            className={`cursor-pointer ${language === 'en' ? 'bg-[#cea26e]/10 text-[#cea26e]' : ''}`}
                            onClick={() => setLanguage('en')}
                        >
                            🇬🇧 English
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`cursor-pointer ${language === 'ar' ? 'bg-[#cea26e]/10 text-[#cea26e]' : ''}`}
                            onClick={() => setLanguage('ar')}
                        >
                            🇴🇲 العربية
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
