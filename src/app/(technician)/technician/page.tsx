'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@clerk/nextjs';
import {
    Calendar,
    Clock,
    MapPin,
    Wrench,
    CheckCircle2,
    Loader2,
    Navigation,
    Phone,
    User,
    ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TechnicianDashboardPage() {
    const { user: clerkUser } = useUser();
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data;
        },
    });

    const today = new Date();
    const todayInterventions = interventions.filter((i: any) => {
        if (i.status !== 'CONFIRMED' && i.status !== 'IN_PROGRESS') return false;
        const d = new Date(i.scheduledAt);
        return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
    });
    const pendingCount = interventions.filter((i: any) => i.status === 'PENDING').length;

    return (
        <div className="space-y-10 pb-12">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-3xl bg-neutral-950 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-none font-black italic uppercase text-[10px] tracking-widest px-2 py-0.5">
                                Mode Expert
                            </Badge>
                            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 italic">
                                {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                            Salut, <span className="text-primary">{clerkUser?.firstName || 'Chef'}</span> !
                        </h1>
                        <p className="text-neutral-400 font-medium text-lg max-w-md">
                            C'est une belle journée pour faire rouler des poules. Voici ton planning.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px]">
                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-bold italic uppercase text-sm">Prêt à rouler</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="relative overflow-hidden group border-none shadow-xl shadow-primary/5 bg-gradient-to-br from-primary to-primary/80">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                        <Clock className="h-20 w-20 text-white" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white/80 italic">À faire aujourd'hui</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black italic text-white flex items-baseline gap-2">
                            {pendingCount}
                            <span className="text-xs font-bold uppercase opacity-60 not-italic">
                                mission{pendingCount > 1 ? 's' : ''}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <MapPin className="h-20 w-20 text-white" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-400 italic">Secteur Actif</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black italic uppercase tracking-tight text-white">
                            Lyon & Environs
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Zone 69 — Auvergne Rhône-Alpes</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Wrench className="h-20 w-20 text-white" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-400 italic">Dispo Matos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black italic uppercase tracking-tight text-emerald-600">
                            Stock OK
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Dernière vérif : ce matin</p>
                    </CardContent>
                </Card>
            </div>

            {/* Implementation List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black italic uppercase tracking-tight border-b-4 border-primary pb-1">
                        Planning du Jour
                    </h2>
                    <Badge variant="outline" className="font-bold border-2 px-3 py-1">
                        {todayInterventions.length} AUJOURD'HUI
                    </Badge>
                </div>

                <div className="grid gap-6">
                    {isLoading ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-4 bg-neutral-900/50 rounded-3xl border-2 border-dashed border-white/10">
                            <Loader2 className="text-primary h-10 w-10 animate-spin" />
                            <p className="font-black italic uppercase text-neutral-400 tracking-widest">Calcul de l'itinéraire...</p>
                        </div>
                    ) : todayInterventions.length === 0 ? (
                        <Card className="bg-neutral-900/50 rounded-3xl border-2 border-dashed border-white/10">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <Calendar className="mb-4 h-12 w-12 text-neutral-500/50" />
                                <h3 className="text-xl font-black italic uppercase text-neutral-400">Piste libre pour aujourd'hui !</h3>
                                <p className="text-neutral-500 font-medium">Aucune intervention validée n'est prévue pour aujourd'hui.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        todayInterventions.map((i: any) => (
                            <Card key={i.id} className="group overflow-hidden border-none shadow-2xl bg-neutral-950 text-white rounded-[2.5rem]">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Timeline Column */}
                                    <div className="bg-white/5 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 border-b lg:border-b-0 lg:border-r border-white/10 p-6 lg:w-48 group-hover:bg-primary/5 transition-colors">
                                        <div className="flex flex-col items-center">
                                            <span className="text-primary text-[10px] font-black uppercase tracking-widest mb-1 italic">
                                                {format(new Date(i.scheduledAt), 'EEEE', { locale: fr })}
                                            </span>
                                            <span className="text-4xl font-black italic tracking-tighter leading-none mb-1 text-white">
                                                {format(new Date(i.scheduledAt), 'HH:mm')}
                                            </span>
                                            {format(new Date(i.scheduledAt), 'HH:mm') === '00:00' && (
                                                <Badge className="bg-amber-500/20 text-amber-600 border-none font-black italic uppercase text-[8px] tracking-tight mb-2">
                                                    Heure à confirmer
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="h-px w-12 bg-white/10 hidden lg:block my-4" />
                                        <div className="flex flex-col items-end lg:items-center text-right lg:text-center">
                                            <span className="text-white font-black italic uppercase text-sm italic">
                                                {format(new Date(i.scheduledAt), 'd MMM', { locale: fr })}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                                                {format(new Date(i.scheduledAt), 'yyyy')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 p-8">
                                        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={i.status === 'COMPLETED' ? 'success' : 'secondary'} className="font-black italic uppercase text-[10px] tracking-widest border-none px-3">
                                                        {i.status}
                                                    </Badge>
                                                    <span className="text-neutral-300">/</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">ID: {i.id.slice(-6)}</span>
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none mb-1 text-white">{i.forfait.name}</h3>
                                                <div className="text-neutral-400 flex items-center gap-2 text-sm font-semibold italic">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        <MapPin className="h-3 w-3" />
                                                    </div>
                                                    {i.address}, {i.postalCode} {i.city}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex -space-x-3 overflow-hidden">
                                                    <div className="inline-block h-10 w-10 p-2 rounded-full ring-4 ring-white bg-neutral-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-neutral-400" />
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black italic uppercase text-white">{i.client.name || (i.client.email?.split('@')[0]) || 'Client Inconnu'}</p>
                                                    {i.client.phone ? (
                                                        <a href={`tel:${i.client.phone}`} className="text-primary hover:underline font-black text-[10px] uppercase tracking-widest">
                                                            {i.client.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-[9px] text-neutral-400 font-bold uppercase italic">Pas de contact</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                            <div className="group/detail rounded-2xl bg-white/5 p-4 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all">
                                                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/detail:scale-110 transition-transform">
                                                    <Wrench className="h-6 w-6 text-neutral-400 group-hover/detail:text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic">Machine</p>
                                                    <p className="font-black italic uppercase text-sm text-white truncate max-w-[150px]">{i.bike.brand} {i.bike.model}</p>
                                                    <Badge variant="outline" className="mt-1 h-4 text-[8px] font-black uppercase tracking-tight border-white/20 bg-white/5 text-neutral-400">
                                                        {i.bike.isElectric ? 'Électrique' : 'Musculaire'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="group/detail rounded-2xl bg-white/5 p-4 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all">
                                                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/detail:scale-110 transition-transform">
                                                    <CheckCircle2 className="h-6 w-6 text-neutral-400 group-hover/detail:text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic">Intervention</p>
                                                    <p className="font-black italic uppercase text-sm text-white truncate max-w-[150px]">{i.forfait.name}</p>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase italic truncate max-w-[150px]">{i.forfait.price} € — {i.forfait.duration} min</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button className="flex-1 gap-3 font-black italic uppercase tracking-tight h-14 text-lg rounded-2xl shadow-lg shadow-primary/20 group/btn relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]">
                                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                                                <Navigation className="h-5 w-5" />
                                                Lancer le GPS
                                                <ChevronRight className="h-5 w-5 ml-auto opacity-50" />
                                            </Button>
                                            <Button variant="outline" className="sm:w-48 gap-3 font-black italic uppercase tracking-tight h-14 text-sm border-2 border-white/10 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all active:scale-[0.98]">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                Valider
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

