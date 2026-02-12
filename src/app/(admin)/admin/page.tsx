'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@clerk/nextjs';
import {
    Users,
    Wrench,
    Euro,
    Calendar,
    TrendingUp,
    AlertCircle,
    Loader2,
    MapPin,
    Package,
    Tag,
    ChevronRight,
    Activity,
    User,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

            {/* Main Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden group border-none shadow-2xl shadow-primary/10 bg-gradient-to-br from-primary to-primary/80 text-white rounded-[2rem]">
                    <Euro className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/70 italic">Chiffre d'Affaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic leading-none mb-1">
                            {Number(stats?.revenue || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                        </div>
                        <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest italic">Interventions payées</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2rem]">
                    <Calendar className="absolute -right-4 -bottom-4 h-32 w-32 text-white opacity-5 group-hover:scale-110 transition-transform" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Missions Totale</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic leading-none mb-1 text-white">
                            {stats?.totalInterventions || 0}
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Réservations cumulées</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2rem]">
                    <Users className="absolute -right-4 -bottom-4 h-32 w-32 text-white opacity-5 group-hover:scale-110 transition-transform" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Communauté</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic leading-none mb-1 text-white">
                            {stats?.totalClients || 0}
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">{stats?.totalTechnicians || 0} Expert(s) en ligne</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2rem]">
                    <Package className="absolute -right-4 -bottom-4 h-32 w-32 text-white opacity-5 group-hover:scale-110 transition-transform" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Offre Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic leading-none mb-1 text-white">
                            {stats?.totalForfaits || 0}
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Forfaits actifs · {stats?.totalZones || 0} Zones</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Status Breakdown */}
                <Card className="border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white/5 border-b border-white/10 p-8">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white">Répartition Opérationnelle</CardTitle>
                            <Badge variant="outline" className="font-black italic uppercase text-[10px] border-white/20 text-neutral-400">Par Statut</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {stats?.byStatus?.length > 0 ? (
                            <div className="space-y-6">
                                {stats.byStatus.map((s: any) => {
                                    const config = STATUS_LABELS[s.status] || { label: s.status, color: 'bg-neutral-100 text-neutral-600 border-neutral-200', dot: 'bg-neutral-400' };
                                    const pct = stats.totalInterventions > 0
                                        ? Math.round((s.count / stats.totalInterventions) * 100)
                                        : 0;
                                    return (
                                        <div key={s.status} className="space-y-2 group/status">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2 w-2 rounded-full ${config.dot}`} />
                                                    <span className="text-sm font-black italic uppercase tracking-tighter text-white">{config.label}</span>
                                                </div>
                                                <span className="text-sm font-black italic text-neutral-400 group-hover/status:text-primary transition-colors">{s.count} <span className="text-[10px] uppercase not-italic opacity-60">missions</span></span>
                                            </div>
                                            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000 ease-out group-hover/status:bg-primary/80`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-300">
                                <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
                                <p className="font-black italic uppercase italic tracking-widest">Aucune donnée</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Zone Breakdown */}
                <Card className="border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white/5 border-b border-white/10 p-8">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white">Secteurs Géographiques</CardTitle>
                            <MapPin className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {stats?.byZone?.length > 0 ? (
                            <div className="grid gap-4">
                                {stats.byZone.map((z: any) => (
                                    <div key={z.zoneId} className="group rounded-2xl bg-white/5 p-4 border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                                <MapPin className="h-5 w-5 text-neutral-400 group-hover:text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-black italic uppercase text-sm text-white">{z.zoneName}</h4>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Zone de couverture active</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-none font-black italic uppercase px-3 py-1 text-[10px]">
                                            {z.count}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-300">
                                <MapPin className="h-12 w-12 mb-2 opacity-20" />
                                <p className="font-black italic uppercase italic tracking-widest">Zone vierge</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Interventions Table */}
            <Card className="border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10 p-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-white">Opérations Récentes</CardTitle>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 italic">Dernières 48 heures d'activité</p>
                    </div>
                    <Button variant="outline" className="border-2 border-white/10 text-white font-black italic uppercase text-xs rounded-xl hover:bg-white/10 group/all">
                        Voir tout <ChevronRight className="ml-2 h-4 w-4 group-hover/all:translate-x-1 transition-transform" />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {stats?.recentInterventions?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr className="text-left text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">
                                        <th className="px-8 py-5">Date & Heure</th>
                                        <th className="px-8 py-5">Client</th>
                                        <th className="px-8 py-5">Prestation</th>
                                        <th className="px-8 py-5">Expert</th>
                                        <th className="px-8 py-5 text-right">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentInterventions.map((i: any) => {
                                        const statusConfig = STATUS_LABELS[i.status] || { label: i.status, color: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
                                        return (
                                            <tr key={i.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-5 font-bold text-white group-hover:text-primary transition-colors">
                                                    {format(new Date(i.scheduledAt), 'dd/MM/yy', { locale: fr })}
                                                    <span className="ml-2 text-[10px] font-black italic text-neutral-500">{format(new Date(i.scheduledAt), 'HH:mm')}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-neutral-400" />
                                                        </div>
                                                        <span className="font-bold text-neutral-300">{i.client?.name || 'Inconnu'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 font-black italic uppercase text-xs tracking-tight text-white">{i.forfait?.name || '—'}</td>
                                                <td className="px-8 py-5">
                                                    {i.technician ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            <span className="font-semibold text-neutral-400">{i.technician.name}</span>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-50 border-neutral-200">En attente</Badge>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Badge className={`${statusConfig.color} font-black italic uppercase text-[9px] tracking-tight border px-2 py-0.5`}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-200">
                            <Activity className="h-16 w-16 mb-4 opacity-10" />
                            <p className="font-black italic uppercase tracking-widest">Le tarmac est désert</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
