'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@clerk/nextjs';
import {
    Calendar,
    Bike as BikeIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    Loader2,
    Wrench,
    Star,
    ChevronRight,
    MapPin,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RatingModal } from '@/components/interventions/rating-modal';

const statusLabels: Record<string, { label: string, color: string, dot: string, icon: any }> = {
    PENDING: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: Clock },
    CONFIRMED: { label: 'Confirmé', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: Calendar },
    IN_PROGRESS: { label: 'En cours', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', icon: Wrench },
    COMPLETED: { label: 'Terminé', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
    CANCELLED: { label: 'Annulé', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', icon: AlertCircle },
};

export default function ClientDashboardPage() {
    const { user: clerkUser } = useUser();
    const [selectedInterventionId, setSelectedInterventionId] = useState<string | null>(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['my-bookings'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/my');
            return data.data;
        },
    });

    const { data: stats } = useQuery({
        queryKey: ['client-stats'],
        queryFn: async () => {
            const { data } = await axios.get('/api/users/stats');
            return data.data;
        },
    });

    return (
        <div className="space-y-10 pb-12">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-secondary-foreground font-black italic uppercase text-[10px] tracking-widest px-3 py-1 border-none">
                                Espace Client
                            </Badge>
                            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 italic">
                                {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                Salut, <span className="text-primary">{clerkUser?.firstName || 'Ami'}</span> !
                            </h1>
                            <p className="text-neutral-400 font-medium text-lg max-w-lg">
                                Prêt pour une nouvelle aventure à vélo ? Nous sommes là pour prendre soin de ta monture.
                            </p>
                        </div>
                    </div>

                    <Button asChild className="h-16 px-8 rounded-2xl bg-white text-neutral-950 hover:bg-neutral-100 shadow-xl shadow-white/5 font-black italic uppercase tracking-tight gap-3 group">
                        <Link href="/bookings/new">
                            <Plus className="h-5 w-5 text-primary group-hover:rotate-90 transition-transform duration-300" />
                            Réserver une mission
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden group border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2rem]">
                    <Clock className="absolute top-0 right-0 p-4 opacity-5 h-32 w-32 text-white group-hover:scale-110 transition-transform" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary italic">Mes Missions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic leading-none mb-1 text-white">
                            {stats?.totalBookings || 0}
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Interventions cumulées</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2rem]">
                    <BikeIcon className="absolute top-0 right-0 p-4 opacity-5 h-32 w-32 text-white group-hover:scale-110 transition-transform" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Mon Garage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic leading-none mb-1 text-white">
                            {stats?.totalBikes || 0}
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Vélos enregistrés</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-10 lg:grid-cols-12">
                {/* Upcoming Interventions */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between border-b-4 border-primary pb-2">
                        <h2 className="text-2xl font-black italic uppercase tracking-tight">Prochaines Missions</h2>
                        <Badge variant="outline" className="font-bold border-2">
                            {bookings.length} TOTAL
                        </Badge>
                    </div>

                    <div className="grid gap-6">
                        {isLoading ? (
                            <div className="flex h-64 flex-col items-center justify-center gap-4 bg-neutral-900/50 rounded-[2.5rem] border-2 border-dashed border-white/10">
                                <Loader2 className="text-primary h-10 w-10 animate-spin" />
                                <p className="font-black italic uppercase text-neutral-400 tracking-widest">Recherche de vos rdv...</p>
                            </div>
                        ) : bookings.length === 0 ? (
                            <Card className="border-dashed border-2 border-white/10 bg-neutral-900/50 rounded-[2.5rem]">
                                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                    <Calendar className="mb-4 h-12 w-12 text-neutral-700" />
                                    <h3 className="text-xl font-black italic uppercase text-neutral-500 italic">Aucun RDV à l'horizon</h3>
                                    <Button variant="link" asChild className="mt-2 text-primary font-black uppercase tracking-widest italic">
                                        <Link href="/bookings/new">Planifier un check-up →</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            bookings.map((booking: any) => {
                                const status = statusLabels[booking.status] || statusLabels.PENDING;
                                const StatusIcon = status.icon;
                                return (
                                    <Card key={booking.id} className="group overflow-hidden border border-white/10 hover:border-primary/30 transition-all rounded-[2.5rem] shadow-xl bg-neutral-900/50 backdrop-blur-sm">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Date Banner */}
                                            <div className="bg-white/5 flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 border-b md:border-b-0 md:border-r border-white/10 p-6 md:w-40 group-hover:bg-primary/5 transition-colors">
                                                <span className="text-primary text-[10px] font-black uppercase tracking-widest italic font-black">
                                                    {format(new Date(booking.scheduledAt), 'MMM', { locale: fr })}
                                                </span>
                                                <span className="text-4xl font-black italic tracking-tighter leading-none text-white">
                                                    {format(new Date(booking.scheduledAt), 'd')}
                                                </span>
                                                <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                                                    {format(new Date(booking.scheduledAt), 'HH:mm')}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 p-8">
                                                <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={`${status.color} border font-black italic uppercase text-[10px] tracking-tight px-3`}>
                                                                {status.label}
                                                            </Badge>
                                                            <span className="text-neutral-300">/</span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1">
                                                                <BikeIcon className="h-3 w-3" />
                                                                {booking.bike.brand}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-2xl font-black italic uppercase tracking-tight text-white leading-tight">
                                                            {booking.forfait.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-neutral-500 text-sm font-semibold">
                                                            <MapPin className="h-4 w-4 text-primary" />
                                                            <p className="line-clamp-1">{booking.address}</p>
                                                        </div>
                                                    </div>

                                                    {booking.status === 'COMPLETED' ? (
                                                        booking.rating ? (
                                                            <div className="bg-emerald-50 text-emerald-600 rounded-2xl px-4 py-2 flex items-center gap-2 border border-emerald-100">
                                                                <Star className="h-4 w-4 fill-current" />
                                                                <span className="font-black italic uppercase text-xs">{booking.rating}/5</span>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                className="h-10 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 gap-2 font-black italic uppercase text-[10px] tracking-widest px-4"
                                                                onClick={() => {
                                                                    setSelectedInterventionId(booking.id);
                                                                    setIsRatingModalOpen(true);
                                                                }}
                                                            >
                                                                <Star className="h-3 w-3 fill-primary text-primary" />
                                                                Noter l'expert
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest italic mb-1">Status</p>
                                                            <p className="font-black text-xs italic uppercase text-white">En préparation</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                                                            <Wrench className="h-5 w-5 text-neutral-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase text-neutral-500 tracking-widest italic">Machine</p>
                                                            <p className="text-xs font-black italic uppercase text-neutral-300">{booking.bike.model}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="group/link font-black italic uppercase text-[10px] tracking-widest text-primary hover:text-primary hover:bg-primary/5 px-4 rounded-xl">
                                                        Détails <ArrowRight className="ml-2 h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b-4 border-neutral-900 pb-2">
                            <h2 className="text-xl font-black italic uppercase tracking-tight">Mon Matos</h2>
                        </div>

                        <Card className="rounded-[2rem] border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm overflow-hidden group">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest italic">Garage</p>
                                        <p className="text-sm font-bold text-neutral-300 tracking-tight">Gère tes vélos enregistrés</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <BikeIcon className="h-6 w-6" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button className="w-full h-14 gap-3 bg-neutral-950 text-white hover:bg-neutral-800 rounded-2xl font-black italic uppercase tracking-tight text-sm shadow-xl shadow-neutral-950/10" asChild>
                                        <Link href="/bikes/add">
                                            <Plus className="h-5 w-5 text-primary" />
                                            Enregistrer un vélo
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full h-14 border-2 border-white/10 rounded-2xl font-black italic uppercase tracking-tight text-xs text-white hover:bg-white/5" asChild>
                                        <Link href="/bikes">Voir tout le garage</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Tip */}
                        <div className="rounded-[3xl] bg-primary/5 p-8 border border-primary/20 space-y-4">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-primary shrink-0" />
                                <div className="space-y-1">
                                    <h5 className="font-black italic uppercase text-sm text-white">Astuce de Poule</h5>
                                    <p className="text-xs font-semibold text-neutral-400 leading-relaxed">
                                        Pense à gonfler tes pneus tous les mois ! Un pneu bien gonflé dure plus longtemps et te simplifie la vie.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedInterventionId && (
                <RatingModal
                    interventionId={selectedInterventionId}
                    isOpen={isRatingModalOpen}
                    onClose={() => setIsRatingModalOpen(false)}
                />
            )}
        </div>
    );
}

