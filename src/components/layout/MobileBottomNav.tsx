'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    Key,
    Landmark,
    MoreHorizontal,
    FileText,
    ScrollText,
    Users,
    FolderKanban,
    FolderOpen,
    Settings,
    Globe,
    LogOut,
    User,
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const primaryNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Building2, label: 'Properties', href: '/properties' },
    { icon: Landmark, label: 'Accounts', href: '/accounts' },
    { icon: Key, label: 'Rentals', href: '/rentals' },
];

const moreNavItems = [
    { icon: FileText, label: 'Statements', href: '/statements' },
    { icon: ScrollText, label: 'Contracts', href: '/contracts' },
    { icon: Users, label: 'Customers', href: '/customers' },
    { icon: FolderKanban, label: 'Projects', href: '/projects' },
    { icon: FolderOpen, label: 'Documents', href: '/documents' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function MobileBottomNav() {
    const pathname = usePathname();
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const isMoreActive = moreNavItems.some((item) => pathname === item.href);

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card lg:hidden">
                <div className="flex h-16 items-center justify-around px-2">
                    {primaryNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-colors ${isActive ? 'text-[#cea26e]' : 'text-muted-foreground'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* More Button */}
                    <button
                        onClick={() => setIsMoreOpen(true)}
                        className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-colors ${isMoreActive ? 'text-[#cea26e]' : 'text-muted-foreground'
                            }`}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="text-[10px] font-medium">More</span>
                    </button>
                </div>
            </nav>

            {/* More Bottom Sheet */}
            <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
                <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader className="pb-4">
                        <SheetTitle>More Options</SheetTitle>
                    </SheetHeader>

                    {/* User Profile Section */}
                    <div className="flex items-center gap-3 p-3 mb-4 bg-muted/30 rounded-xl">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#cea26e] text-white">
                                AA
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                Admin User
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                admin@telal.om
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pb-4">
                        {moreNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMoreOpen(false)}
                                    className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-colors ${isActive
                                        ? 'bg-[#cea26e]/10 text-[#cea26e]'
                                        : 'bg-muted/50 text-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Icon className="h-6 w-6" />
                                    <span className="text-xs font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Extra actions */}
                    <div className="border-t border-border pt-4 space-y-2">
                        <button className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium hover:bg-muted transition-colors">
                            <User className="h-5 w-5" />
                            <span>Profile Settings</span>
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium hover:bg-muted transition-colors">
                            <Globe className="h-5 w-5" />
                            <span>Language: English</span>
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                            <LogOut className="h-5 w-5" />
                            <span>Log out</span>
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
