'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Navigation, User, Phone, Loader2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
export default function TechnicianTodayPage() {
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions-today'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data;
        },
    });

    const today = new Date();
    const todayInterventions = interventions.filter((i: any) => {
        if (i.status === 'COMPLETED' || i.status === 'CANCELLED') return false;
        const scheduledDate = new Date(i.scheduledAt);
        return (
            scheduledDate.getFullYear() === today.getFullYear() &&
            scheduledDate.getMonth() === today.getMonth() &&
            scheduledDate.getDate() === today.getDate()
        );
    });

    return (
        <div className="space-y-10 pb-12">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-primary-foreground font-black italic uppercase text-[10px] tracking-widest px-3 py-1 border-none">
                                Poste de Pilotage
                            </Badge>
                            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 italic">
                                {format(new Date(), "EEEE d MMMM", { locale: fr })}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                Missions <span className="text-primary">Aujourd'hui</span>
                            </h1>
                            <p className="text-neutral-400 font-medium text-lg max-w-lg">
                                Interventions prioritaires et maintenance en cours. Ne lâchez rien !
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Volume</p>
                            <span className="text-3xl font-black italic text-white leading-none">{todayInterventions.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 bg-neutral-900/50 rounded-[2.5rem] border-2 border-dashed border-white/10">
                    <Loader2 className="text-primary h-12 w-12 animate-spin" />
                    <p className="font-black italic uppercase text-neutral-400 tracking-widest animate-pulse">Synchronisation du planning...</p>
                </div>
            ) : todayInterventions.length === 0 ? (
                <Card className="border-dashed border-2 bg-neutral-900/20 rounded-[2.5rem]">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                        <Calendar className="mb-6 h-16 w-16 text-neutral-800" />
                        <h3 className="text-2xl font-black italic uppercase text-neutral-500 tracking-tight">Le tarmac est désert</h3>
                        <p className="text-neutral-600 font-medium max-w-sm mt-2">Profitez de ce moment pour checker votre matos ou faire une pause café.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-8 mt-8">
                    {todayInterventions.map((i: any) => (
                        <Card key={i.id} className="group overflow-hidden border-none shadow-2xl bg-neutral-900/80 backdrop-blur-sm text-white rounded-[2.5rem]">
                            <div className="flex flex-col lg:flex-row">
                                {/* Timeline Column */}
                                <div className="bg-white/5 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 border-b lg:border-b-0 lg:border-r border-white/10 p-8 lg:w-48 group-hover:bg-primary/5 transition-colors">
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-black italic tracking-tighter leading-none mb-1 text-white">
                                            {format(new Date(i.scheduledAt), 'HH:mm')}
                                        </span>
                                        {format(new Date(i.scheduledAt), 'HH:mm') === '00:00' && (
                                            <Badge className="bg-amber-500/20 text-amber-500 border-none font-black italic uppercase text-[8px] tracking-tight mt-1">
                                                Heure à confirmer
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="h-px w-12 bg-white/10 hidden lg:block my-4" />
                                    <div className="flex flex-col items-end lg:items-center text-right lg:text-center">
                                        <span className="text-primary font-black italic uppercase text-sm">
                                            {format(new Date(i.scheduledAt), 'd MMM', { locale: fr })}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 p-8 md:p-10">
                                    <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-primary/10 text-primary border-none font-black italic uppercase text-[10px] tracking-widest px-3">
                                                    {i.status}
                                                </Badge>
                                                <span className="text-neutral-700 font-black italic text-xs uppercase tracking-widest">ID: {i.id.slice(-6)}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">{i.forfait.name}</h3>
                                                <div className="text-neutral-400 flex items-center gap-2 text-sm font-semibold italic">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <span className="line-clamp-1">{i.address}, {i.city}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
                                                <User className="h-7 w-7 text-neutral-500" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black italic uppercase text-white truncate max-w-[200px]">
                                                    {i.client.name || (i.client.email?.split('@')[0]) || 'Client Inconnu'}
                                                </p>
                                                {i.client.phone ? (
                                                    <a href={`tel:${i.client.phone}`} className="text-primary hover:text-primary/80 transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-2 justify-end mt-1">
                                                        <Phone className="h-3 w-3" /> {i.client.phone}
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] text-neutral-600 font-bold uppercase italic tracking-widest">Pas de contact</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button
                                            className="flex-1 gap-3 font-black italic uppercase tracking-tight h-16 text-lg rounded-2xl shadow-xl shadow-primary/20 group/btn relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            asChild
                                        >
                                            <a href={`/technician/gps/${i.id}`}>
                                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                                <Navigation className="h-6 w-6" />
                                                Lancer la Route
                                                <ChevronRight className="h-6 w-6 ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="sm:w-56 gap-3 font-black italic uppercase tracking-tight h-16 text-base border-2 border-white/10 rounded-2xl bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                                            asChild
                                        >
                                            <a href={`/technician/interventions/${i.id}`}>Ouvrir le Dossier</a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
