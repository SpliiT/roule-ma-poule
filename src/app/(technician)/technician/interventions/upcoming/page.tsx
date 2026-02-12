'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Loader2, ChevronRight, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

export default function TechnicianUpcomingPage() {
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions-upcoming'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data;
        },
    });

    const upcomingInterventions = interventions.filter((i: any) =>
        new Date(i.scheduledAt) > new Date() && i.status === 'CONFIRMED'
    );

    return (
        <div className="space-y-10 pb-12">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-primary-foreground font-black italic uppercase text-[10px] tracking-widest px-3 py-1 border-none">
                                Futur
                            </Badge>
                            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 italic">
                                Planning Prévisionnel
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                À <span className="text-primary">Venir</span>
                            </h1>
                            <p className="text-neutral-400 font-medium text-lg max-w-lg">
                                Anticipez vos trajets et préparez vos interventions. La route est à vous.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Missions</p>
                            <span className="text-3xl font-black italic text-white leading-none">{upcomingInterventions.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 bg-neutral-900/50 rounded-[2.5rem] border-2 border-dashed border-white/10">
                    <Loader2 className="text-primary h-12 w-12 animate-spin" />
                    <p className="font-black italic uppercase text-neutral-400 tracking-widest animate-pulse">Chargement du futur...</p>
                </div>
            ) : upcomingInterventions.length === 0 ? (
                <Card className="border-dashed border-2 bg-neutral-900/20 rounded-[2.5rem]">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                        <Calendar className="mb-6 h-16 w-16 text-neutral-800" />
                        <h3 className="text-2xl font-black italic uppercase text-neutral-500 tracking-tight">Horizon dégagé</h3>
                        <p className="text-neutral-600 font-medium max-w-sm mt-2">Aucune nouvelle mission confirmée n'est pour l'instant prévue.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {upcomingInterventions.map((i: any) => (
                        <Card key={i.id} className="group overflow-hidden border-none shadow-xl bg-neutral-900/50 backdrop-blur-sm text-white rounded-3xl hover:bg-neutral-900 transition-colors">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <span className="text-primary font-black italic uppercase text-[10px] tracking-widest mb-1">{format(new Date(i.scheduledAt), 'iii', { locale: fr })}</span>
                                        <span className="text-2xl font-black italic leading-none">{format(new Date(i.scheduledAt), 'd')}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="font-black italic uppercase text-[10px] tracking-tight border-white/10 text-neutral-400 px-3">
                                                {format(new Date(i.scheduledAt), 'HH:mm')}
                                            </Badge>
                                            <h3 className="font-black text-xl uppercase italic tracking-tight group-hover:text-primary transition-colors">{i.forfait.name}</h3>
                                        </div>
                                        <p className="text-sm text-neutral-500 font-bold flex items-center gap-1.5 italic">
                                            <MapPin className="h-3.5 w-3.5 text-primary/50" />
                                            {i.city} ({i.postalCode})
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-500/10 px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-emerald-500/20">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-black italic uppercase tracking-tighter text-emerald-500">Confirmé</span>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-12 w-12 rounded-xl border border-white/10 hover:bg-white/10" asChild>
                                        <a href={`/technician/interventions/${i.id}`}>
                                            <ChevronRight className="h-5 w-5 text-white" />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
