import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Euro, Calendar, Users, Package, TrendingUp } from 'lucide-react';

interface Props {
    stats: any;
}

export function StatCards({ stats }: Props) {
    return (
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
    );
}
