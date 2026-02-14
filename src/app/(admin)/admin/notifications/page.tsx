'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    Loader2,
    ImagePlus,
    Trash2
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
    const [iconUrl, setIconUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
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
            
            setTitle('');
            setBody('');
            setUrl('');
            setIsScheduled(false);
            setScheduledAt('');
            setIconUrl('');
            setImageUrl('');
        },
        onError: (error: any) => {
            console.error('Notification error detail:', error.response?.data);
            const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Erreur lors de l\'envoi';
            toast.error(errorMsg);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            title,
            body,
            url,
            icon: iconUrl || null,
            image: imageUrl || null,
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

    if (!isMounted) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                    Centre de <span className="text-primary text-5xl">Notifications</span>
                </h1>
                <p className="text-muted-foreground font-medium text-sm">Créez et prévisualisez vos notifications push en temps réel.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Form Section */}
                <div className="lg:col-span-5">
                    <Card className="border-2 border-primary/5 shadow-xl bg-card">
                        <CardHeader className="bg-primary/5 border-b py-4">
                            <CardTitle className="text-lg font-black italic uppercase flex items-center gap-2">
                                <Send className="h-4 w-4 text-primary" />
                                Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                                suppressHydrationWarning
                            >
                                <div className="space-y-2">
                                    <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Cible</Label>
                                    <Select value={targetType} onValueChange={(val: any) => setTargetType(val)}>
                                        <SelectTrigger className="font-bold border-2">
                                            <SelectValue placeholder="Choisir la cible" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL" className="font-bold">Tous</SelectItem>
                                            <SelectItem value="ROLE" className="font-bold">Par rôle</SelectItem>
                                            <SelectItem value="SINGLE" className="font-bold">Utilisateur unique</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {targetType === 'ROLE' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Rôle</Label>
                                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                                            <SelectTrigger className="font-bold border-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CLIENT" className="font-bold">Clients</SelectItem>
                                                <SelectItem value="TECHNICIEN" className="font-bold">Techniciens</SelectItem>
                                                <SelectItem value="ADMIN" className="font-bold">Admins</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {targetType === 'SINGLE' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Utilisateur</Label>
                                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                            <SelectTrigger className="font-bold border-2">
                                                <SelectValue placeholder="Sélectionner..." />
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
                                        placeholder="Titre de la notification"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="font-bold border-2"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Message</Label>
                                    <Textarea
                                        placeholder="Contenu du message..."
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        className="font-medium border-2 min-h-[80px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Lien (Optionnel)</Label>
                                    <Input
                                        placeholder="/dashboard"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="font-medium border-2 font-mono text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Icône</Label>
                                        <div className="flex flex-col gap-2">
                                            {iconUrl ? (
                                                <div className="relative group w-12 h-12 rounded-lg border-2 border-primary/20 overflow-hidden bg-muted">
                                                    <img src={iconUrl} alt="Icon" className="w-full h-full object-contain" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setIconUrl('')}
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <CloudinaryUpload
                                                    onUpload={(urls) => setIconUrl(urls[0])}
                                                    buttonText="Icône"
                                                    size="sm"
                                                    className="font-bold italic uppercase"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground italic">Hero Image</Label>
                                        <div className="flex flex-col gap-2">
                                            {imageUrl ? (
                                                <div className="relative group w-full h-9 rounded-lg border-2 border-primary/20 overflow-hidden bg-muted">
                                                    <img src={imageUrl} alt="Hero" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setImageUrl('')}
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <CloudinaryUpload
                                                    onUpload={(urls) => setImageUrl(urls[0])}
                                                    buttonText="Image"
                                                    size="sm"
                                                    className="font-bold italic uppercase"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-muted/30 rounded-xl border border-primary/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-primary" />
                                            <Label className="font-black italic uppercase text-[10px]">Programmer</Label>
                                        </div>
                                        <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
                                    </div>
                                    {isScheduled && (
                                        <Input
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            className="font-bold border-2 h-8 text-xs"
                                            required
                                        />
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full font-black italic uppercase tracking-widest h-11"
                                    disabled={sendMutation.isPending}
                                >
                                    {sendMutation.isPending ? "Envoi..." : "Lancer"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-8">
                        <Label className="font-black italic uppercase text-xs tracking-widest text-primary mb-4 block">Aperçu Mobile</Label>
                        <div className="relative w-full max-w-[320px] mx-auto aspect-[9/18] bg-[#0c0c0c] rounded-[3rem] border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden ring-4 ring-primary/10">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-20" />

                            {/* Content */}
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-60"
                                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80)' }}
                            />

                            <div className="absolute inset-0 bg-black/40 flex flex-col p-6 pt-20">
                                <div className="text-white/40 text-xs font-medium mb-1 drop-shadow-md">Aujourd'hui</div>

                                {/* Notification Card */}
                                <div className="w-full bg-[#1c1c1e]/90 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-primary/20 rounded-md flex items-center justify-center p-1 border border-primary/20 overflow-hidden">
                                                {iconUrl ? (
                                                    <img src={iconUrl} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <img src="/images/logo.png" alt="" className="w-full h-full object-contain" />
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-tight">ROULE MA POULE</span>
                                        </div>
                                        <span className="text-[9px] text-white/30">maintenant</span>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-[13px] font-bold text-white leading-tight drop-shadow-sm">{title || "Titre de la notification"}</h4>
                                        <p className="text-[12px] text-white/80 leading-snug line-clamp-3">{body || "Détails du message..."}</p>
                                    </div>

                                    {imageUrl && (
                                        <div className="mt-3 rounded-xl overflow-hidden aspect-video border border-white/5">
                                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Home Indicator */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full" />
                        </div>
                        <p className="text-center text-[10px] text-muted-foreground mt-4 italic font-medium px-8">
                            *Le rendu exact dépend du système d'exploitation de l'utilisateur.
                        </p>
                    </div>
                </div>

                {/* Status Column (Optional small stats or similar) */}
                <div className="lg:col-span-3">
                    <Card className="border-2 border-primary/5 bg-card">
                        <CardHeader className="py-4 border-b">
                            <CardTitle className="text-sm font-black italic uppercase">Statuts Rapides</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-xs font-bold uppercase italic">Envoyées</span>
                                </div>
                                <span className="text-lg font-black text-green-500">{notifications.filter((n: any) => n.status === 'SENT').length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    <span className="text-xs font-bold uppercase italic">En attente</span>
                                </div>
                                <span className="text-lg font-black text-amber-500">{notifications.filter((n: any) => n.status === 'PENDING').length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* History Section - Full Width Below */}
            <Card className="border-2 border-primary/5 shadow-xl bg-card overflow-hidden">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4 px-6">
                    <div>
                        <CardTitle className="text-lg font-black italic uppercase flex items-center gap-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            Historique des Campagnes
                        </CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if ('serviceWorker' in navigator) {
                                    navigator.serviceWorker.getRegistrations().then(registrations => {
                                        for (const registration of registrations) {
                                            registration.unregister();
                                        }
                                        toast.success('Service Worker supprimé. Rafraîchissez la page.');
                                    });
                                }
                            }}
                            className="font-bold italic uppercase text-[10px] text-destructive border-destructive/20 hover:bg-destructive/5"
                        >
                            Reset SW
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-notifications-history'] })} className="font-bold italic uppercase text-[10px]">
                            <Clock className="h-3 w-3 mr-2" /> Actualiser
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {!isMounted || isLoadingHistory ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <Bell className="h-10 w-10 text-muted-foreground opacity-10 mb-2" />
                            <p className="font-black italic uppercase text-[10px] text-muted-foreground opacity-50 tracking-widest">Aucun historique</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notif: any) => (
                                <div key={notif.id} className="p-4 hover:bg-primary/5 transition-all flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center border ${notif.status === 'SENT' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                            notif.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                'bg-destructive/10 border-destructive/20 text-destructive'
                                            }`}>
                                            {notif.status === 'SENT' ? <CheckCircle2 className="h-4 w-4" /> :
                                                notif.status === 'PENDING' ? <Clock className="h-4 w-4" /> :
                                                    <XCircle className="h-4 w-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-sm truncate">{notif.title}</h4>
                                                <Badge variant="outline" className="text-[8px] font-black italic uppercase h-4 px-1 border-primary/20 text-primary">
                                                    {notif.user ? `${notif.user.name || 'User'} (${notif.user.role})` : notif.role ? `Rôle: ${notif.role}` : 'Broadcast'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{notif.body}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            {format(new Date(notif.scheduledAt), 'dd/MM HH:mm', { locale: fr })}
                                        </span>
                                        <Badge className={`font-black italic uppercase text-[8px] px-1 h-4 ${notif.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' :
                                            notif.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-destructive/10 text-destructive'
                                            }`}>
                                            {notif.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
