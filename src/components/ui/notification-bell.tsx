'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { Bell, Check, CheckCheck, CheckCircle2, HardHat, RefreshCw, Timer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}
export function NotificationBell() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const { data } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await axios.get('/api/notifications');
            return data;
        },
        refetchInterval: 30000, 
    });
    const markRead = useMutation({
        mutationFn: async (payload: { notificationId?: string; markAllRead?: boolean }) => {
            await axios.patch('/api/notifications', payload);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });
    const notifications: Notification[] = data?.data || [];
    const unreadCount: number = data?.unreadCount || 0;
    const typeIcons: Record<string, React.ReactNode> = {
        BOOKING_CONFIRMED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        INTERVENTION_ASSIGNED: <HardHat className="h-4 w-4 text-blue-500" />,
        STATUS_CHANGED: <RefreshCw className="h-4 w-4 text-orange-500" />,
        REMINDER: <Timer className="h-4 w-4 text-yellow-500" />,
    };
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => markRead.mutate({ markAllRead: true })}
                        >
                            <CheckCheck className="h-3 w-3" />
                            Tout lire
                        </Button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                            Aucune notification
                        </div>
                    ) : (
                        notifications.slice(0, 20).map((n) => (
                            <div
                                key={n.id}
                                className={`flex gap-3 px-4 py-3 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50 ${!n.isRead ? 'bg-primary/5' : ''}`}
                                onClick={() => {
                                    if (!n.isRead) markRead.mutate({ notificationId: n.id });
                                }}
                            >
                                <span className="shrink-0 mt-0.5">{typeIcons[n.type] || <Bell className="h-4 w-4 text-muted-foreground" />}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm truncate ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                                    </p>
                                </div>
                                {!n.isRead && (
                                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}