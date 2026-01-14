'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { isRTL } = useLanguage();

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Header */}
            <MobileHeader />

            {/* Main Content Area */}
            <div className={`${isRTL ? 'lg:mr-[260px]' : 'lg:ml-[260px]'}`}>
                {/* Desktop Top Bar */}
                <TopBar />

                {/* Main Content */}
                <main className="p-4 pb-20 lg:p-6 lg:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <MobileBottomNav />
        </div>
    );
}
