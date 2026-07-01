'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@clerk/nextjs';
import { Loader2, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { StatCards } from '@/components/admin/dashboard/StatCards';
import { StatusBreakdown } from '@/components/admin/dashboard/StatusBreakdown';
import { ZoneBreakdown } from '@/components/admin/dashboard/ZoneBreakdown';
import { RecentInterventions } from '@/components/admin/dashboard/RecentInterventions';

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
    PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    IN_PROGRESS: { label: 'En cours', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
    COMPLETED: { label: 'Terminée', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    CANCELLED: { label: 'Annulée', color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
};

export default function AdminDashboardPage() {
    const { user: clerkUser } = useUser();
    const { data: stats, isLoading } = useQuery<any>({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/stats');
            return data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
                <Loader2 className="text-primary h-12 w-12 animate-spin" />
                <p className="font-black italic uppercase text-neutral-400 tracking-widest animate-pulse">Initialisation du poste de commande...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-900 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/30 blur-[100px]" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-secondary-foreground font-black italic uppercase text-[10px] tracking-widest px-3 py-1 border-none">
                                Administrateur
                            </Badge>
                            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 italic">
                                {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                Dashboard <span className="text-neutral-500">Global</span>
                            </h1>
                            <p className="text-neutral-400 font-medium text-lg max-w-lg">
                                Bienvenue, <span className="text-white font-bold">{clerkUser?.firstName || 'Admin'}</span>. Voici l'état de la flotte et des opérations aujourd'hui.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col items-center text-center">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mb-3" />
                            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Système</p>
                            <span className="font-black italic uppercase text-lg leading-none">Opérationnel</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col items-center text-center">
                            <Activity className="h-4 w-4 text-primary mb-2" />
                            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Activité</p>
                            <span className="font-black italic uppercase text-lg leading-none">Haute</span>
                        </div>
                    </div>
                </div>
            </div>

            <StatCards stats={stats} />

            <div className="grid gap-8 lg:grid-cols-2">
                <StatusBreakdown stats={stats} statusLabels={STATUS_LABELS} />
                <ZoneBreakdown stats={stats} />
            </div>

            <RecentInterventions stats={stats} statusLabels={STATUS_LABELS} />
        </div>
    );
}
