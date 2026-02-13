'use client';
import { useState, useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function NotificationBell() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await axios.get('/api/notifications');
            return data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const markReadMutation = useMutation({
        mutationFn: async (notificationId?: string) => {
            await axios.patch('/api/notifications', {
                notificationId,
                markAllRead: !notificationId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const notifications = data?.data || [];
    const unreadCount = data?.unreadCount || 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-background border">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b p-4">
                    <h4 className="text-sm font-bold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                            onClick={() => markReadMutation.mutate(undefined)}
                        >
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>
                {mounted && typeof window !== 'undefined' && 'Notification' in window && (Notification.permission === 'default' || data?.isPushSubscribed === false) && (
                    <div className="p-3 border-b bg-primary/5">
                        <p className="text-[10px] text-muted-foreground mb-2 leading-tight">
                            {Notification.permission === 'granted'
                                ? "Synchronisez vos notifications pour rester informé."
                                : "Recevez des alertes en temps réel sur l'état de vos interventions."}
                        </p>
                        <Button
                            size="sm"
                            className="w-full text-[10px] h-7 font-bold uppercase italic"
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('trigger-push-setup'));
                            }}
                        >
                            {Notification.permission === 'granted' ? "Synchroniser" : "Activer les notifications"}
                        </Button>
                    </div>
                )}
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Bell className="mb-2 h-8 w-8 opacity-10" />
                            <p className="text-sm text-muted-foreground font-medium">Aucune notification</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notif: any) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "flex flex-col gap-1 border-b p-4 transition-colors hover:bg-muted/50 cursor-pointer",
                                        !notif.isRead && "bg-primary/5"
                                    )}
                                    onClick={() => {
                                        if (!notif.isRead) markReadMutation.mutate(notif.id);
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h5 className={cn("text-xs font-bold leading-tight", !notif.isRead && "text-primary")}>
                                            {notif.title}
                                        </h5>
                                        {!notif.isRead && (
                                            <div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notif.message}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight mt-1">
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="border-t p-2">
                    <Button variant="ghost" size="sm" className="w-full text-xs font-bold" asChild>
                        <Link href="/dashboard/notifications">Voir plus</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Helper to make it work since Link might not be imported from next/link in the snippet
import Link from 'next/link';
