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
    CalendarDays,
    MapPin,
    ClipboardList,
    Navigation,
    Menu,
    Settings,
    Bell,
    User as UserIcon,
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
const navItems = [
    { label: 'Tableau de bord', href: '/technician', icon: LayoutDashboard },
    { label: 'Aujourd\'hui', href: '/technician/interventions/today', icon: ClipboardList },
    { label: 'À venir', href: '/technician/interventions/upcoming', icon: CalendarDays },
    { label: 'Historique', href: '/technician/interventions/history', icon: ClipboardList },
    { label: 'Carte & Navigation', href: '/technician/map', icon: Navigation },
];
interface TechnicianSidebarProps {
    user: User;
}
export function TechnicianSidebar({ user }: TechnicianSidebarProps) {
    const pathname = usePathname();
    return (
        <>
            { }
            <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-card">
                { }
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
                        <div className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-black text-accent uppercase w-fit tracking-wider">
                            Technicien
                        </div>
                    </div>
                </div>
                { }
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/technician'
                                ? pathname === '/technician'
                                : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                                    isActive
                                        ? 'bg-primary/10 text-primary font-black italic uppercase tracking-tight'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground font-bold italic uppercase tracking-widest text-[10px]'
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                { }
                <div className="border-t border-border p-4">
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs font-medium text-success">En ligne</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <UserButton />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user.name || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Technicien
                            </p>
                        </div>
                        <NotificationBell />
                    </div>
                </div>
            </aside>
            { }
            { }
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/80 backdrop-blur-lg pb-safe">
                <div className="flex items-center justify-between py-3 px-6">
                    <Link
                        href="/technician"
                        className={cn(
                            'flex flex-col items-center p-2 transition-all',
                            pathname === '/technician' ? 'text-primary scale-110' : 'text-muted-foreground'
                        )}
                    >
                        <LayoutDashboard className="h-6 w-6" />
                    </Link>

                    <Link
                        href="/technician/interventions/today"
                        className={cn(
                            'flex flex-col items-center p-2 transition-all',
                            pathname === '/technician/interventions/today' ? 'text-primary scale-110' : 'text-muted-foreground'
                        )}
                    >
                        <ClipboardList className="h-6 w-6" />
                    </Link>

                    <Link
                        href="/notifications"
                        className={cn(
                            'flex flex-col items-center p-2 transition-all relative',
                            pathname === '/notifications' ? 'text-primary scale-110' : 'text-muted-foreground'
                        )}
                    >
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                    </Link>

                    <Link
                        href="/profile"
                        className={cn(
                            'flex flex-col items-center p-2 transition-all',
                            pathname === '/profile' ? 'text-primary scale-110' : 'text-muted-foreground'
                        )}
                    >
                        <UserIcon className="h-6 w-6" />
                    </Link>

                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="flex flex-col items-center p-2 text-muted-foreground">
                                <Menu className="h-6 w-6" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[70vh] rounded-t-[2rem] border-t-2 border-primary/20">
                            <SheetHeader className="text-left mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                                    </div>
                                    <div>
                                        <SheetTitle className="text-xl font-black uppercase italic italic tracking-tight">Roule Ma Poule</SheetTitle>
                                        <SheetDescription className="text-xs font-bold text-primary uppercase">Espace Technicien</SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>
                            <div className="grid grid-cols-2 gap-3 pb-8">
                                {navItems.map((item) => {
                                    const isActive =
                                        item.href === '/technician'
                                            ? pathname === '/technician'
                                            : pathname.startsWith(item.href);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-black italic uppercase tracking-tight transition-all',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                    : 'bg-muted/50 text-foreground hover:bg-accent opacity-60'
                                            )}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="mt-auto border-t border-border pt-6 pb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <UserButton />
                                    <div className="min-w-0">
                                        <p className="text-sm font-black truncate">{user.name || user.email}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-success">En ligne</span>
                                        </div>
                                    </div>
                                </div>
                                <Link href="/technician/settings">
                                    <Settings className="h-6 w-6 text-muted-foreground" />
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </>
    );
}
