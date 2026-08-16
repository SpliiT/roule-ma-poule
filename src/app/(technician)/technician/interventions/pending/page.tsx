'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, Phone, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TechnicianPendingPage() {
    const queryClient = useQueryClient();

    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions-pending'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data;
        },
    });

    const pendingInterventions = interventions.filter((i: any) => i.status === 'PENDING');

    const validateMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.patch(`/api/technician/interventions/${id}`, {
                status: 'CONFIRMED',
            });
        },
        onSuccess: () => {
            toast.success('Rendez-vous validé ! Le client a été notifié.');
            queryClient.invalidateQueries({ queryKey: ['technician-interventions-pending'] });
            queryClient.invalidateQueries({ queryKey: ['technician-interventions-today'] });
            queryClient.invalidateQueries({ queryKey: ['technician-interventions-upcoming'] });
        },
        onError: () => {
            toast.error('Erreur lors de la validation du rendez-vous.');
        },
    });

    return (
        <div className="space-y-10 pb-12">
            {/* Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-amber-500/20 blur-[100px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-amber-500 text-black font-black italic uppercase text-[10px] tracking-widest px-3 py-1 border-none">
                                Demandes Entrantes
                            </Badge>
                            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 italic">
                                Action Requise
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                À <span className="text-amber-400">Valider</span>
                            </h1>
                            <p className="text-neutral-400 font-medium text-lg max-w-lg">
                                Validez les rendez-vous en attente pour notifier les clients et planifier vos interventions.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">En attente</p>
                            <span className="text-3xl font-black italic text-amber-400 leading-none">{pendingInterventions.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 bg-neutral-900/50 rounded-[2.5rem] border-2 border-dashed border-white/10">
                    <Loader2 className="text-amber-400 h-12 w-12 animate-spin" />
                    <p className="font-black italic uppercase text-neutral-400 tracking-widest animate-pulse">Chargement des demandes...</p>
                </div>
            ) : pendingInterventions.length === 0 ? (
                <Card className="border-dashed border-2 bg-neutral-900/20 rounded-[2.5rem]">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                        <Clock className="mb-6 h-16 w-16 text-neutral-800" />
                        <h3 className="text-2xl font-black italic uppercase text-neutral-500 tracking-tight">Aucun rendez-vous à valider</h3>
                        <p className="text-neutral-600 font-medium max-w-sm mt-2">Toutes les réservations sont validées et planifiées !</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-8 mt-8">
                    {pendingInterventions.map((i: any) => (
                        <Card key={i.id} className="group overflow-hidden border-2 border-amber-500/20 shadow-2xl bg-neutral-900/80 backdrop-blur-sm text-white rounded-[2.5rem]">
                            <div className="flex flex-col lg:flex-row">
                                {/* Timeline Column */}
                                <div className="bg-amber-500/5 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 border-b lg:border-b-0 lg:border-r border-white/10 p-8 lg:w-48">
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl font-black italic tracking-tighter leading-none mb-1 text-white">
                                            {format(new Date(i.scheduledAt), 'HH:mm')}
                                        </span>
                                        <Badge className="bg-amber-500/20 text-amber-400 border-none font-black italic uppercase text-[9px] tracking-tight mt-1">
                                            À confirmer
                                        </Badge>
                                    </div>
                                    <div className="h-px w-12 bg-white/10 hidden lg:block my-4" />
                                    <div className="flex flex-col items-end lg:items-center text-right lg:text-center">
                                        <span className="text-amber-400 font-black italic uppercase text-sm">
                                            {format(new Date(i.scheduledAt), 'd MMM yyyy', { locale: fr })}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 p-8 md:p-10">
                                    <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-amber-500/20 text-amber-400 border-none font-black italic uppercase text-[10px] tracking-widest px-3">
                                                    EN ATTENTE
                                                </Badge>
                                                <span className="text-neutral-500 font-black italic text-xs uppercase tracking-widest">ID: {i.id.slice(-6)}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">{i.forfait.name}</h3>
                                                <div className="text-neutral-400 flex items-center gap-2 text-sm font-semibold italic">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 shrink-0">
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
                                                    <a href={`tel:${i.client.phone}`} className="text-amber-400 hover:text-amber-300 transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-2 justify-end mt-1">
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
                                            onClick={() => validateMutation.mutate(i.id)}
                                            disabled={validateMutation.isPending}
                                            className="flex-1 gap-3 font-black italic uppercase tracking-tight h-16 text-lg rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {validateMutation.isPending ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-6 w-6" />
                                                    Valider le RDV & Notifier le Client
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="sm:w-56 gap-3 font-black italic uppercase tracking-tight h-16 text-base border-2 border-white/10 rounded-2xl bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all"
                                            asChild
                                        >
                                            <a href={`/technician/interventions/${i.id}`}>Détails</a>
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
