'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  LogOut,
  BarChart2,
  Home,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, isRTL } = useLanguage();

  const navItems = [
    { icon: LayoutDashboard, label: t.nav.dashboard, href: '/' },
    { icon: Home, label: t.nav.properties, href: '/properties' },
    { icon: Key, label: t.nav.rentals, href: '/rentals' },
    { icon: Landmark, label: t.nav.accounts, href: '/accounts' },
    { icon: FileText, label: t.nav.statements, href: '/statements' },
    { icon: ScrollText, label: t.nav.contracts, href: '/contracts' },
    { icon: BarChart2, label: t.nav.reports, href: '/reports' },
    { icon: Users, label: t.nav.customers, href: '/customers' },
    { icon: Building2, label: t.nav.owners, href: '/owners' },
    { icon: FolderKanban, label: t.nav.projects, href: '/projects' },
    { icon: FolderOpen, label: t.nav.documents, href: '/documents' },
    { icon: Settings, label: t.nav.settings, href: '/settings' },
  ];

  // Get user initials
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <aside className={`fixed top-0 z-40 hidden h-screen w-[260px] flex-col bg-[#1a1a1a] lg:flex ${isRTL ? 'right-0' : 'left-0'}`}>
      {/* Logo */}
      <div className="flex h-20 items-center px-6">
        <Image
          src="/logofordarkbg.svg"
          alt="Telal Al-Bidaya"
          width={160}
          height={48}
          className="h-12 w-auto"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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

      {/* Profile Section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-[#cea26e] text-white">
              {getInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {session?.user?.name || 'User'}
            </p>
            <p className="truncate text-xs text-gray-400">
              {session?.user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            title={t.nav.signOut}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
