'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
// ... rest of imports
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Bell,
    Send,
    Calendar,
    Users,
    User,
    ShieldCheck,
    History,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Search,
    Loader2
} from 'lucide-react';

export default function AdminNotificationsPage() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [targetType, setTargetType] = useState<'ALL' | 'ROLE' | 'SINGLE'>('ALL');
    const [selectedRole, setSelectedRole] = useState<string>('CLIENT');
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [url, setUrl] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');

    useEffect(() => {
        const userId = searchParams.get('userId');
        if (userId) {
            setTargetType('SINGLE');
            setSelectedUserId(userId);
        }
    }, [searchParams]);

    const { data: consumers = [] } = useQuery({
        queryKey: ['admin-users-minimal'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/users');
            return data.data;
        },
        enabled: targetType === 'SINGLE'
    });

    const { data: notifications = [], isLoading: isLoadingHistory } = useQuery({
        queryKey: ['admin-notifications-history'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/notifications');
            return data.data;
        }
    });

    const sendMutation = useMutation({
        mutationFn: async (payload: any) => {
            return axios.post('/api/admin/notifications', payload);
        },
        onSuccess: () => {
            toast.success('Notification envoyée ou programmée avec succès');
            queryClient.invalidateQueries({ queryKey: ['admin-notifications-history'] });
            // Reset form
            setTitle('');
            setBody('');
            setUrl('');
            setIsScheduled(false);
            setScheduledAt('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            title,
            body,
            url,
            scheduledAt: isScheduled ? scheduledAt : null,
        };

        if (targetType === 'SINGLE') {
            if (!selectedUserId) return toast.error('Veuillez sélectionner un utilisateur');
            payload.userId = selectedUserId;
        } else if (targetType === 'ROLE') {
            payload.role = selectedRole;
        }

        sendMutation.mutate(payload);
    };

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                    Centre de <span className="text-primary text-5xl">Notifications</span>
                </h1>
                <p className="text-muted-foreground font-medium">Communiquez directement avec vos utilisateurs via des notifications push.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <Card className="border-2 border-primary/5 shadow-xl bg-card h-full">
                        <CardHeader className="bg-primary/5 border-b">
                            <CardTitle className="text-xl font-black italic uppercase flex items-center gap-2">
                                <Send className="h-5 w-5 text-primary" />
                                Nouvelle Campagne
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                                suppressHydrationWarning
                            >
                                <div className="space-y-2">
                                    <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Cible</Label>
                                    <Select
                                        value={targetType}
                                        onValueChange={(val: any) => setTargetType(val)}
                                    >
                                        <SelectTrigger className="font-bold border-2 focus:ring-primary/20">
                                            <SelectValue placeholder="Choisir la cible" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL" className="font-bold">Tous les utilisateurs</SelectItem>
                                            <SelectItem value="ROLE" className="font-bold">Par rôle</SelectItem>
                                            <SelectItem value="SINGLE" className="font-bold">Utilisateur unique</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {targetType === 'ROLE' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Rôle cible</Label>
                                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                                            <SelectTrigger className="font-bold border-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CLIENT" className="font-bold">Clients</SelectItem>
                                                <SelectItem value="TECHNICIEN" className="font-bold">Techniciens</SelectItem>
                                                <SelectItem value="ADMIN" className="font-bold">Administrateurs</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {targetType === 'SINGLE' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Utilisateur</Label>
                                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                            <SelectTrigger className="font-bold border-2">
                                                <SelectValue placeholder="Sélectionner un utilisateur" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {consumers.map((u: any) => (
                                                    <SelectItem key={u.id} value={u.id} className="font-bold">
                                                        {u.name || u.email} ({u.role})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Titre</Label>
                                    <Input
                                        placeholder="Ex: Nouvelle mission disponible !"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="font-bold border-2"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Message</Label>
                                    <Textarea
                                        placeholder="Le contenu de votre notification..."
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        className="font-medium border-2 min-h-[100px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">URL de redirection (Optionnel)</Label>
                                    <Input
                                        placeholder="/admin/interventions"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="font-medium border-2 font-mono text-xs"
                                    />
                                </div>

                                <div className="p-4 bg-muted/30 rounded-2xl border border-primary/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <Label className="font-black italic uppercase text-xs tracking-tight">Programmer</Label>
                                        </div>
                                        <Switch
                                            checked={isScheduled}
                                            onCheckedChange={setIsScheduled}
                                        />
                                    </div>

                                    {isScheduled && (
                                        <Input
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            className="font-bold border-2 animate-in fade-in duration-300"
                                            required={isScheduled}
                                        />
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full font-black italic uppercase tracking-widest h-12 shadow-lg shadow-primary/20"
                                    disabled={sendMutation.isPending}
                                >
                                    {sendMutation.isPending ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Envoi...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Send className="h-4 w-4" />
                                            Lancer la notification
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2">
                    <Card className="border-2 border-primary/5 shadow-xl bg-card h-full">
                        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black italic uppercase flex items-center gap-2">
                                    <History className="h-5 w-5 text-muted-foreground" />
                                    Historique & Programmation
                                </CardTitle>
                                <CardDescription className="italic font-bold text-[10px] uppercase opacity-70 tracking-widest">Suivez vos envois et les tâches planifiées</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-notifications-history'] })}>
                                <Clock className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoadingHistory ? (
                                <div className="flex h-64 items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        <p className="text-sm font-bold text-primary animate-pulse italic uppercase">Chargement de l'historique...</p>
                                    </div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                                    <Bell className="h-16 w-16 text-muted-foreground opacity-10 mb-4" />
                                    <p className="font-black italic uppercase text-muted-foreground tracking-widest opacity-50">Aucune notification envoyée</p>
                                </div>
                            ) : (
                                <div className="divide-y overflow-hidden rounded-b-3xl">
                                    {notifications.map((notif: any) => (
                                        <div key={notif.id} className="p-4 hover:bg-primary/5 transition-all group flex items-start justify-between gap-4">
                                            <div className="flex gap-4 min-w-0">
                                                <div className={`mt-1 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center border-2 transition-transform group-hover:scale-105 ${notif.status === 'SENT' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                    notif.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                        'bg-destructive/10 border-destructive/20 text-destructive'
                                                    }`}>
                                                    {notif.status === 'SENT' ? <CheckCircle2 className="h-5 w-5" /> :
                                                        notif.status === 'PENDING' ? <Clock className="h-5 w-5" /> :
                                                            <XCircle className="h-5 w-5" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-black italic uppercase text-[13px] tracking-tight truncate">{notif.title}</h4>
                                                        <Badge variant="outline" className="text-[9px] font-black italic uppercase px-1.5 py-0 border-primary/20 bg-primary/5">
                                                            {notif.userId ? 'Direct' : notif.role ? notif.role : 'Broadcast'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-neutral-400 font-medium line-clamp-1 mb-2">{notif.body}</p>
                                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            {notif.status === 'PENDING' ? 'Programmé pour le' : 'Envoyé le'} {format(new Date(notif.scheduledAt), 'Pp', { locale: fr })}
                                                        </span>
                                                        {notif.url && (
                                                            <span className="flex items-center gap-1 text-primary">
                                                                <Search className="h-3 w-3" /> Lien: {notif.url}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end gap-2">
                                                <Badge className={`font-black italic uppercase text-[9px] tracking-widest ${notif.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    notif.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-destructive/10 text-destructive border-destructive/20'
                                                    }`}>
                                                    {notif.status}
                                                </Badge>
                                                {notif.status === 'PENDING' && (
                                                    <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase italic text-destructive hover:bg-destructive/10">
                                                        Annuler
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
