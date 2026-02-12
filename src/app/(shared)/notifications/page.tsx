'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, Check, Loader2, ChevronLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await axios.get('/api/notifications');
            return data;
        },
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
        <div className="flex flex-col min-h-screen bg-background pb-24 md:pb-8">
            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 backdrop-blur px-4 py-4 md:px-8">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-black italic uppercase tracking-tight">Notifications</h1>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-black italic uppercase text-[10px] tracking-widest border-2"
                        onClick={() => markReadMutation.mutate(undefined)}
                        disabled={markReadMutation.isPending}
                    >
                        Tout lire
                    </Button>
                )}
            </header>

            {notificationPermission !== null && notificationPermission !== 'granted' && (
                <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
                    <div className="container mx-auto max-w-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black italic uppercase tracking-tight">Activer les alertes mobiles</h4>
                                <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                                    {notificationPermission === 'denied'
                                        ? "Les notifications sont bloquées dans votre navigateur."
                                        : "Recevez une notification WhatsApp-style même quand l'app est fermée."}
                                </p>
                            </div>
                        </div>
                        {notificationPermission === 'default' && (
                            <Button
                                size="sm"
                                className="font-black italic uppercase text-[10px] tracking-widest h-8"
                                onClick={async () => {
                                    if (typeof window !== 'undefined' && 'Notification' in window) {
                                        const permission = await Notification.requestPermission();
                                        setNotificationPermission(permission);
                                        if (permission === 'granted') {
                                            window.dispatchEvent(new CustomEvent('trigger-push-setup'));
                                        }
                                    }
                                }}
                            >
                                Autoriser
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <main className="container mx-auto max-w-2xl px-4 py-6">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                            <Bell className="h-10 w-10 text-muted-foreground opacity-20" />
                        </div>
                        <h2 className="text-xl font-black italic uppercase tracking-tight mb-2">Rien de neuf</h2>
                        <p className="text-muted-foreground font-medium">Vous n'avez aucune notification pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notif: any) => (
                            <Card
                                key={notif.id}
                                className={cn(
                                    "overflow-hidden border-2 transition-all cursor-pointer",
                                    notif.isRead ? "border-border bg-card/50 opacity-80" : "border-primary/20 bg-primary/5 shadow-md"
                                )}
                                onClick={() => {
                                    if (!notif.isRead) markReadMutation.mutate(notif.id);
                                }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                {!notif.isRead && (
                                                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                                                )}
                                                <h3 className={cn(
                                                    "font-black uppercase italic tracking-tight",
                                                    notif.isRead ? "text-muted-foreground" : "text-primary"
                                                )}>
                                                    {notif.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pt-1">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markReadMutation.mutate(notif.id);
                                                }}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
