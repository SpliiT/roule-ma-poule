'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Star, Loader2, ChevronRight, History } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

export default function TechnicianHistoryPage() {
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions-history'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data;
        },
    });

    const historyInterventions = interventions.filter((i: any) =>
        i.status === 'COMPLETED' || i.status === 'CANCELLED'
    );

    return (
        <div className="space-y-10 pb-12">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-neutral-800 text-neutral-400 border-none font-black italic uppercase text-[10px] tracking-widest px-3 py-1">
                                Archives
                            </Badge>
                            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-600 italic">
                                Journal de Bord
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                Vos <span className="text-neutral-500">Succès</span>
                            </h1>
                            <p className="text-neutral-400 font-medium text-lg max-w-lg">
                                Retrouvez le détail de vos victoires mécaniques et les retours de la communauté.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Total</p>
                            <span className="text-3xl font-black italic text-white leading-none">{historyInterventions.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 bg-neutral-900/50 rounded-[2.5rem] border-2 border-dashed border-white/10">
                    <Loader2 className="text-primary h-12 w-12 animate-spin" />
                    <p className="font-black italic uppercase text-neutral-400 tracking-widest animate-pulse">Ouverture des dossiers...</p>
                </div>
            ) : historyInterventions.length === 0 ? (
                <Card className="border-dashed border-2 bg-neutral-900/20 rounded-[2.5rem]">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                        <ClipboardCheck className="mb-6 h-16 w-16 text-neutral-800" />
                        <h3 className="text-2xl font-black italic uppercase text-neutral-500">Historique Vierge</h3>
                        <p className="font-medium max-w-sm mt-2">Commencez vos premières interventions pour remplir votre palmarès !</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {historyInterventions.map((i: any) => (
                        <Card key={i.id} className="group overflow-hidden border-none shadow-lg bg-neutral-900/30 hover:bg-neutral-900/60 transition-all text-white rounded-[2rem]">
                            <CardContent className="p-6 flex justify-between items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <History className="h-6 w-6 text-neutral-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-neutral-600 tracking-widest italic">
                                            {format(new Date(i.scheduledAt), 'd MMMM yyyy', { locale: fr })}
                                        </p>
                                        <h3 className="font-black text-xl uppercase italic tracking-tight group-hover:text-primary transition-colors leading-none">{i.forfait.name}</h3>
                                        <div className="flex items-center gap-3">
                                            <p className="text-xs font-black text-primary italic uppercase tracking-tighter">
                                                {i.client.name || (i.client.email?.split('@')[0]) || 'Client'}
                                            </p>
                                            {i.rating > 0 && (
                                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                                    <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                                                    <span className="text-[10px] font-black italic text-yellow-500">{i.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex items-center gap-4">
                                    <Badge variant={i.status === 'COMPLETED' ? 'success' : 'destructive'} className="font-black italic uppercase text-[9px] tracking-widest px-3 py-1 border-none bg-white/5 text-neutral-400">
                                        {i.status}
                                    </Badge>
                                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white/5 border border-white/5" asChild>
                                        <a href={`/technician/interventions/${i.id}`}>
                                            <ChevronRight className="h-5 w-5 text-neutral-600" />
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
