'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-600' },
    CONFIRMED: { label: 'Confirmée', color: 'bg-blue-500/10 text-blue-600' },
    IN_PROGRESS: { label: 'En cours', color: 'bg-orange-500/10 text-orange-600' },
    COMPLETED: { label: 'Terminée', color: 'bg-green-500/10 text-green-600' },
    CANCELLED: { label: 'Annulée', color: 'bg-red-500/10 text-red-600' },
};
export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useQuery<any>({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/stats');
            return data.data;
        },
    });
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
        );
    }
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Espace Administrateur</h1>
                <p className="text-muted-foreground">Vue d'ensemble de l'activité Roule Ma Poule.</p>
            </div>
            {}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
                        <Euro className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(stats?.revenue || 0).toFixed(2)}€</div>
                        <p className="text-xs text-muted-foreground">Interventions payées</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Interventions</CardTitle>
                        <Calendar className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalInterventions || 0}</div>
                        <p className="text-xs text-muted-foreground">Total des réservations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Clients</CardTitle>
                        <Users className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
                        <p className="text-xs text-muted-foreground">{stats?.totalTechnicians || 0} technicien(s)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Catalogue</CardTitle>
                        <Tag className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalForfaits || 0} forfaits</div>
                        <p className="text-xs text-muted-foreground">{stats?.totalProducts || 0} produits · {stats?.totalZones || 0} zones</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                {}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Répartition par statut</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.byStatus?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.byStatus.map((s: any) => {
                                    const config = STATUS_LABELS[s.status] || { label: s.status, color: 'bg-muted' };
                                    const pct = stats.totalInterventions > 0
                                        ? Math.round((s.count / stats.totalInterventions) * 100)
                                        : 0;
                                    return (
                                        <div key={s.status} className="flex items-center gap-3">
                                            <Badge className={`${config.color} min-w-[100px] justify-center text-xs`}>
                                                {config.label}
                                            </Badge>
                                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold min-w-[40px] text-right">{s.count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Aucune donnée</p>
                        )}
                    </CardContent>
                </Card>
                {}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" /> Par zone
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.byZone?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.byZone.map((z: any) => (
                                    <div key={z.zoneId} className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{z.zoneName}</span>
                                        <Badge variant="outline">{z.count} intervention(s)</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Aucune zone avec interventions</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            {}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Dernières interventions</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats?.recentInterventions?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Client</th>
                                        <th className="p-3">Forfait</th>
                                        <th className="p-3">Technicien</th>
                                        <th className="p-3">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentInterventions.map((i: any) => {
                                        const statusConfig = STATUS_LABELS[i.status] || { label: i.status, color: '' };
                                        return (
                                            <tr key={i.id} className="border-b hover:bg-muted/30">
                                                <td className="p-3 font-medium">
                                                    {format(new Date(i.scheduledAt), 'dd/MM/yy HH:mm', { locale: fr })}
                                                </td>
                                                <td className="p-3">
                                                    {i.client?.name || '—'}
                                                </td>
                                                <td className="p-3">{i.forfait?.name || '—'}</td>
                                                <td className="p-3">
                                                    {i.technician ? i.technician.name : (
                                                        <span className="text-muted-foreground italic">Non assigné</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <Badge className={`${statusConfig.color} text-xs`}>{statusConfig.label}</Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Aucune intervention récente</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}