'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import { NotificationBell } from '@/components/ui/notification-bell';
import {
    LayoutDashboard,
    Users,
    MapPin,
    Package,
    Tag,
    Calendar,
    ClipboardList,
    Building2,
    Settings,
} from 'lucide-react';

const navItems = [
    { label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { label: 'Interventions', href: '/admin/interventions', icon: ClipboardList },
    { label: 'Utilisateurs', href: '/admin/users', icon: Users },
    { label: 'Zones Géo', href: '/admin/zones', icon: MapPin },
    { label: 'Modèles Planning', href: '/admin/planning', icon: Calendar },
    { label: 'Catalogue', href: '/admin/catalog', icon: Tag },
    { label: 'Entreprise', href: '/admin/company', icon: Building2 },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
    user: User;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-card">
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={30}
                        height={30}
                        className="object-contain"
                    />
                    <div>
                        <span className="font-black tracking-tight text-foreground uppercase italic text-sm">
                            Roule Ma Poule
                        </span>
                        <div className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black text-primary uppercase w-fit tracking-wider">
                            Admin
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="border-t border-border p-4">
                    <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user.name || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Administrateur
                            </p>
                        </div>
                        <NotificationBell />
                    </div>
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card">
                <div className="flex items-center justify-around py-2">
                    {navItems.slice(0, 4).map((item) => {
                        const isActive =
                            item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors',
                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.label.split(' ').pop()}</span>
                            </Link>
                        );
                    })}
                    <div className="flex flex-col items-center gap-1 px-3 py-1">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </nav>
        </>
    );
}
