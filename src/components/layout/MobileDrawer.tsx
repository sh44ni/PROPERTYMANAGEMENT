'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Sheet,
    SheetContent,
    SheetHeader,
} from '@/components/ui/sheet';
import {
    LayoutDashboard,
    Building2,
    Key,
    Landmark,
    FileText,
    ScrollText,
    Users,
    FolderKanban,
    FolderOpen,
    Settings,
    Languages,
    LogOut,
} from 'lucide-react';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
    const pathname = usePathname();
    const { language, setLanguage, t, isRTL } = useLanguage();

    const navItems = [
        { icon: LayoutDashboard, label: t.nav.dashboard, href: '/' },
        { icon: Building2, label: t.nav.properties, href: '/properties' },
        { icon: Key, label: t.nav.rentals, href: '/rentals' },
        { icon: Landmark, label: t.nav.accounts, href: '/accounts' },
        { icon: FileText, label: t.nav.statements, href: '/statements' },
        { icon: ScrollText, label: t.nav.contracts, href: '/contracts' },
        { icon: Users, label: t.nav.customers, href: '/customers' },
        { icon: FolderKanban, label: t.nav.projects, href: '/projects' },
        { icon: FolderOpen, label: t.nav.documents, href: '/documents' },
        { icon: Settings, label: t.nav.settings, href: '/settings' },
    ];

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    const handleLogout = () => {
        signOut({ callbackUrl: '/login' });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side={isRTL ? 'right' : 'left'} className="w-[280px] bg-[#1a1a1a] p-0 border-none">
                <SheetHeader className="px-6 pt-6 pb-4">
                    <Image
                        src="/logofordarkbg.svg"
                        alt="Telal Al-Bidaya"
                        width={140}
                        height={42}
                        className="h-10 w-auto"
                    />
                </SheetHeader>

                <nav className="flex-1 px-3">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-150 ${isActive
                                            ? `${isRTL ? 'border-r-2' : 'border-l-2'} border-[#cea26e] bg-[#cea26e]/10 text-[#cea26e]`
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="border-t border-white/10 p-4 mt-auto">
                    <button
                        onClick={toggleLanguage}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <Languages className="h-5 w-5" />
                        <span>{language === 'en' ? 'العربية' : 'English'}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>{t.nav.signOut}</span>
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
