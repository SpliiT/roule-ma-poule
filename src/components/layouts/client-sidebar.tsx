'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { type User } from '@/types';
import {
    LayoutDashboard,
    Bike,
    CalendarPlus,
    ClipboardList,
    User as UserIcon,
    Menu,
    Settings,
    Bell,
    LogOut,
} from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationBell } from '@/components/notifications/notification-bell';
const navItems = [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Réserver', href: '/bookings/new', icon: CalendarPlus },
    { label: 'Mes vélos', href: '/bikes', icon: Bike },
    { label: 'Mon profil', href: '/profile', icon: UserIcon },
];
interface ClientSidebarProps {
    user: User;
}
export function ClientSidebar({ user }: ClientSidebarProps) {
    const pathname = usePathname();
    return (
        <>
            { }
            <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-card">
                { }
                <div className="flex h-16 items-center justify-between border-b border-border px-6">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/images/logo.png"
                            alt="Logo"
                            width={30}
                            height={30}
                            className="object-contain"
                        />
                        <span className="font-black tracking-tight text-foreground uppercase italic text-sm">
                            Roule Ma Poule
                        </span>
                    </div>
                    <NotificationBell />
                </div>
                { }
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
                    <div className="flex items-center gap-3">
                        <UserButton />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user.name || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
            { }
            { }
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/80 backdrop-blur-lg pb-safe">
                <div className="flex items-center justify-between py-3 px-6">
                    <Link
                        href="/dashboard"
                        className={cn(
                            'flex flex-col items-center p-2 transition-all',
                            pathname === '/dashboard' ? 'text-primary scale-110' : 'text-muted-foreground'
                        )}
                    >
                        <LayoutDashboard className="h-6 w-6" />
                    </Link>

                    <Link
                        href="/bookings/new"
                        className={cn(
                            'flex flex-col items-center p-2 transition-all',
                            pathname === '/bookings/new' ? 'text-primary scale-110' : 'text-muted-foreground'
                        )}
                    >
                        <CalendarPlus className="h-6 w-6" />
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
                        <SheetContent side="bottom" className="h-[60vh] rounded-t-[2rem] border-t-2 border-primary/20">
                            <SheetHeader className="text-left mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                                    </div>
                                    <div>
                                        <SheetTitle className="text-xl font-black uppercase italic italic tracking-tight">Roule Ma Poule</SheetTitle>
                                        <SheetDescription className="text-xs font-bold text-primary uppercase">Espace Client</SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>
                            <div className="grid grid-cols-2 gap-3 pb-8">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Client</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href="/profile">
                                        <Settings className="h-6 w-6 text-muted-foreground" />
                                    </Link>
                                    <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
                                        <button className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                                            <LogOut className="h-6 w-6" />
                                        </button>
                                    </SignOutButton>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </>
    );
}
