'use client';
import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft, Clock, MapPin, User, Bike, Settings, Package, Camera,
    Play, CheckCircle2, Euro, Loader2, UploadCloud, MessageSquare,
    Zap, XCircle, Timer, Phone, PartyPopper, Wrench, ChevronRight, Navigation
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    PENDING: { label: 'En attente', icon: <Timer className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: 'Confirmée', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    IN_PROGRESS: { label: 'En cours', icon: <Wrench className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
    COMPLETED: { label: 'Terminée', icon: <PartyPopper className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Annulée', icon: <XCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
};

export default function TechnicianInterventionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const { data: intervention, isLoading } = useQuery<any>({
        queryKey: ['tech-intervention', id],
        queryFn: async () => {
            const { data } = await axios.get(`/api/technician/interventions/${id}`);
            return data.data;
        },
        onSuccess: (data: any) => {
            if (data?.technicianNotes) setNotes(data.technicianNotes);
        },
    } as any);

    const updateIntervention = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await axios.patch(`/api/technician/interventions/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tech-intervention', id] });
            toast.success('Intervention mise à jour');
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!intervention) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-6">
                <XCircle className="h-20 w-20 text-neutral-800" />
                <h2 className="text-2xl font-black italic uppercase text-neutral-500">Mission introuvable</h2>
                <Link href="/technician/interventions/today">
                    <Button variant="ghost" className="rounded-2xl border border-white/10 px-8 py-6 font-black italic uppercase text-xs">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour au poste
                    </Button>
                </Link>
            </div>
        );
    }

    const statusInfo = STATUS_CONFIG[intervention.status] || STATUS_CONFIG.PENDING;
    const isActive = ['CONFIRMED', 'IN_PROGRESS'].includes(intervention.status);
    const isCompleted = intervention.status === 'COMPLETED';

    return (
        <div className="space-y-10 pb-12">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <Link href="/technician/interventions/today">
                            <Button variant="ghost" size="icon" className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all text-white">
                                <ArrowLeft className="h-8 w-8 text-primary" />
                            </Button>
                        </Link>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Badge className={`font-black italic uppercase text-[10px] tracking-widest px-3 py-1 border-none bg-primary/20 text-primary`}>
                                    {statusInfo.label}
                                </Badge>
                                <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 italic flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(intervention.scheduledAt), 'EEEE d MMMM', { locale: fr })}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                                {intervention.forfait?.name || 'Mission'} <span className="text-primary">#{id.slice(-4).toUpperCase()}</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Total HT</p>
                            <span className="text-3xl font-black italic text-white leading-none">{Number(intervention.totalPrice || 0).toFixed(2)}€</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Client Card */}
                        <Card className="border-none bg-neutral-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden group">
                            <CardHeader className="pb-4 border-b border-white/5">
                                <CardTitle className="flex items-center gap-3 text-base font-black italic uppercase tracking-tight text-neutral-400 group-hover:text-primary transition-colors">
                                    <User className="h-4 w-4" /> Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <p className="text-xl font-black italic uppercase text-white leading-none">{intervention.client?.name}</p>
                                    <p className="text-neutral-500 font-medium text-sm mt-1">{intervention.client?.email}</p>
                                </div>
                                {intervention.client?.phone && (
                                    <Button variant="outline" className="w-full rounded-2xl border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/20 text-neutral-400 hover:text-primary transition-all font-black italic uppercase text-xs" asChild>
                                        <a href={`tel:${intervention.client.phone}`}>
                                            <Phone className="h-4 w-4 mr-2" /> {intervention.client.phone}
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Localisation Card */}
                        <Card className="border-none bg-neutral-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden group">
                            <CardHeader className="pb-4 border-b border-white/5">
                                <CardTitle className="flex items-center gap-3 text-base font-black italic uppercase tracking-tight text-neutral-400 group-hover:text-primary transition-colors">
                                    <MapPin className="h-4 w-4" /> Localisation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <p className="text-lg font-black italic uppercase text-white leading-tight">{intervention.address}</p>
                                    <p className="text-neutral-500 font-bold italic uppercase text-xs mt-1">{intervention.postalCode} {intervention.city}</p>
                                </div>
                                <Button className="w-full rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/20 text-neutral-400 hover:text-blue-500 transition-all font-black italic uppercase text-xs" asChild>
                                    <Link href={`/technician/gps/${id}`}>
                                        <Navigation className="h-4 w-4 mr-2" /> GPS Navigation
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bike Details */}
                    <Card className="border-none bg-neutral-900/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-white/5">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-neutral-500 font-black italic uppercase text-[10px] tracking-widest">
                                        <Bike className="h-4 w-4" /> Véritable Monture
                                    </div>
                                    <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                                        {intervention.bike?.brand} <span className="text-primary">{intervention.bike?.model}</span>
                                    </h3>
                                    {intervention.bike?.type && (
                                        <Badge variant="outline" className="border-white/10 bg-white/5 text-neutral-500 font-black italic uppercase text-[10px] px-3">{intervention.bike.type}</Badge>
                                    )}
                                </div>
                                <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Bike className="h-10 w-10 text-neutral-700" />
                                </div>
                            </div>
                            {intervention.clientNotes && (
                                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-2xl">
                                    <p className="text-xs font-black italic uppercase text-primary/50 tracking-widest mb-2">Message du Client</p>
                                    <p className="text-white font-medium italic text-lg leading-relaxed">
                                        "{intervention.clientNotes}"
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes Technique */}
                    <Card className="border-none bg-neutral-900/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tight text-white">
                                <MessageSquare className="h-5 w-5 text-primary" /> Notes d'Intervention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Détails techniques, réglages effectués, points de vigilance..."
                                className="min-h-[160px] bg-neutral-950/50 border-white/5 rounded-2xl text-white placeholder:text-neutral-700 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium text-lg p-6"
                                disabled={isCompleted}
                            />
                            {!isCompleted && (
                                <Button
                                    className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-black italic uppercase tracking-widest text-xs"
                                    disabled={updateIntervention.isPending}
                                    onClick={() => updateIntervention.mutate({ technicianNotes: notes })}
                                >
                                    {updateIntervention.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                                    Enregistrer le rapport
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Photos */}
                    <Card className="border-none bg-neutral-900/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tight text-white">
                                <Camera className="h-5 w-5 text-primary" /> Gallerie d'Excellence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            {intervention.photos?.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {intervention.photos.map((url: string, i: number) => (
                                        <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-white/5 group relative">
                                            <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <span className="text-[10px] font-black italic uppercase text-white">Zoom</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center rounded-2xl bg-neutral-950/30 border border-dashed border-white/5 mb-6">
                                    <Camera className="h-12 w-12 text-neutral-800 mx-auto mb-4" />
                                    <p className="text-neutral-600 font-black italic uppercase text-xs tracking-widest">Aucun cliché technique</p>
                                </div>
                            )}
                            {!isCompleted && (
                                <CloudinaryUpload
                                    multiple
                                    folder={`interventions/${id}`}
                                    onUpload={(urls) => updateIntervention.mutate({ photos: urls })}
                                    buttonText="Immortaliser l'Intervention"
                                    className="w-full"
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Historique */}
                    {intervention.statusHistory?.length > 0 && (
                        <Card className="border-none bg-neutral-900/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tight text-white">
                                    <Clock className="h-5 w-5 text-primary" /> Chronologie des Opérations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                                    {intervention.statusHistory.map((h: any) => (
                                        <div key={h.id} className="flex items-start gap-6 relative pl-6">
                                            <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-neutral-900 border-2 border-primary z-10" />
                                            <div className="space-y-1">
                                                <p className="text-white font-black italic uppercase text-sm tracking-tight">{STATUS_CONFIG[h.status]?.label || h.status}</p>
                                                {h.notes && <p className="text-neutral-500 text-sm font-medium leading-relaxed">{h.notes}</p>}
                                                <p className="text-[10px] text-neutral-700 font-bold uppercase tracking-widest italic">
                                                    {format(new Date(h.createdAt), 'dd MMMM · HH:mm', { locale: fr })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-8">
                    {isActive && (
                        <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2rem] overflow-hidden">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-black italic uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Zap className="h-4 w-4 fill-primary" /> Pilotage Direct
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {intervention.status === 'CONFIRMED' && (
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black italic uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                                        onClick={() => updateIntervention.mutate({ status: 'IN_PROGRESS' })}
                                        disabled={updateIntervention.isPending}
                                    >
                                        <Play className="h-4 w-4 mr-2" /> Start Engine
                                    </Button>
                                )}
                                {intervention.status === 'IN_PROGRESS' && (
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-white text-black hover:bg-neutral-200 font-black italic uppercase text-xs tracking-widest shadow-xl"
                                        onClick={() => updateIntervention.mutate({ status: 'COMPLETED' })}
                                        disabled={updateIntervention.isPending}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Finish Mission
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Produits Card */}
                    <Card className="border-none bg-neutral-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
                        <CardHeader className="pb-4 border-b border-white/5">
                            <CardTitle className="flex items-center gap-3 text-base font-black italic uppercase tracking-tight text-neutral-400">
                                <Package className="h-4 w-4" /> Consommables & Pièces
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {intervention.products?.length > 0 ? (
                                <div className="space-y-4">
                                    {intervention.products.map((p: any) => (
                                        <div key={p.id} className="flex justify-between items-center group">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black italic uppercase text-white group-hover:text-primary transition-colors">{p.product?.name || 'Composant'}</p>
                                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest italic">Quantité: {p.quantity}</p>
                                            </div>
                                            <span className="font-black italic text-primary">{(Number(p.priceAtTime) * p.quantity).toFixed(2)}€</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Package className="h-8 w-8 text-neutral-800 mx-auto mb-2" />
                                    <p className="text-[10px] font-black italic uppercase text-neutral-700 tracking-widest">Stock non sollicité</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Paiement Card */}
                    <Card className="border-none bg-neutral-950 rounded-[2.5rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                        <CardContent className="p-8 space-y-6 relative z-10">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black italic uppercase text-neutral-500 tracking-[0.2em]">Total Final</p>
                                    <p className="text-4xl font-black italic text-white tracking-tighter">
                                        {Number(intervention.totalPrice).toFixed(2)}<span className="text-primary text-2xl ml-1">€</span>
                                    </p>
                                </div>
                                <Euro className="h-10 w-10 text-neutral-800 mb-1" />
                            </div>

                            <div className="h-px bg-white/5 w-full" />

                            {intervention.isPaid ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    <p className="font-black italic uppercase text-[10px] text-emerald-500 tracking-widest">
                                        Règlement Validé {intervention.paymentMethod && `(${intervention.paymentMethod})`}
                                    </p>
                                </div>
                            ) : isActive ? (
                                <div className="space-y-4">
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-white font-black italic uppercase text-[10px] tracking-widest h-12">
                                            <SelectValue placeholder="Moyen de Paiement" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-white/10 text-white font-black italic uppercase text-[10px]">
                                            <SelectItem value="CB">Carte Bancaire</SelectItem>
                                            <SelectItem value="ESPECES">Espèces</SelectItem>
                                            <SelectItem value="CHEQUE">Chèque</SelectItem>
                                            <SelectItem value="VIREMENT">Virement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-black italic uppercase text-xs tracking-widest text-white"
                                        disabled={!paymentMethod || updateIntervention.isPending}
                                        onClick={() => updateIntervention.mutate({ isPaid: true, paymentMethod })}
                                    >
                                        Encaisser le Total
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-4 border border-dashed border-white/10 rounded-2xl">
                                    <p className="font-black italic uppercase text-[10px] text-neutral-600 tracking-widest">En attente de facturation</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
