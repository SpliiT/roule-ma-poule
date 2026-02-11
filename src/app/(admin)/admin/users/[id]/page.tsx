'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Phone,
    MapPin,
    Bike,
    Calendar,
    Euro,
    CheckCircle2,
    Clock,
    XCircle,
    Navigation,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
    CONFIRMED: { label: 'Confirmée', color: 'bg-blue-500/10 text-blue-600', icon: CheckCircle2 },
    IN_PROGRESS: { label: 'En cours', color: 'bg-orange-500/10 text-orange-600', icon: Navigation },
    COMPLETED: { label: 'Terminée', color: 'bg-green-500/10 text-green-600', icon: CheckCircle2 },
    CANCELLED: { label: 'Annulée', color: 'bg-red-500/10 text-red-600', icon: XCircle },
};

export default function AdminUserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: user, isLoading } = useQuery<any>({
        queryKey: ['admin-user-detail', id],
        queryFn: async () => {
            const { data } = await axios.get(`/api/admin/users/${id}`);
            return data.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Utilisateur non trouvé.</p>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    Retour
                </Button>
            </div>
        );
    }

    const totalSpent = (user.clientInterventions || [])
        .filter((i: any) => i.isPaid)
        .reduce((sum: number, i: any) => sum + Number(i.totalPrice || 0), 0);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {user.name || 'Sans nom'}
                    </h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline" className="text-sm">
                    {user.role}
                </Badge>
                <Badge className={user.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}>
                    {user.isActive ? 'Actif' : 'Inactif'}
                </Badge>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{user.clientInterventions?.length || 0}</p>
                                <p className="text-xs text-muted-foreground">Interventions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Euro className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalSpent.toFixed(2)}€</p>
                                <p className="text-xs text-muted-foreground">Dépensé</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Bike className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{user.bikes?.length || 0}</p>
                                <p className="text-xs text-muted-foreground">Vélo(s)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Infos personnelles */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <User className="h-4 w-4" /> Informations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                            <Calendar className="h-4 w-4" />
                            <span>Inscrit le {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Adresses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Adresses ({user.addresses?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.addresses?.length > 0 ? (
                            <div className="space-y-2">
                                {user.addresses.map((a: any) => (
                                    <div key={a.id} className="text-sm border rounded-lg p-3">
                                        <p className="font-medium">{a.label || 'Adresse'}</p>
                                        <p className="text-muted-foreground text-xs">{a.street}, {a.zipCode} {a.city}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Aucune adresse</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Vélos */}
            {user.bikes?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Bike className="h-4 w-4" /> Vélos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {user.bikes.map((b: any) => (
                                <div key={b.id} className="border rounded-lg p-4">
                                    <p className="font-bold">{b.brand} {b.model}</p>
                                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                        <p>Type : {b.type}</p>
                                        {b.serialNumber && <p>N° série : {b.serialNumber}</p>}
                                        {b.year && <p>Année : {b.year}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Historique interventions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Historique des interventions</CardTitle>
                </CardHeader>
                <CardContent>
                    {user.clientInterventions?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Forfait</th>
                                        <th className="p-3">Technicien</th>
                                        <th className="p-3">Zone</th>
                                        <th className="p-3">Prix</th>
                                        <th className="p-3">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.clientInterventions.map((i: any) => {
                                        const config = STATUS_CONFIG[i.status] || { label: i.status, color: '' };
                                        return (
                                            <tr key={i.id} className="border-b hover:bg-muted/30">
                                                <td className="p-3 font-medium">
                                                    {format(new Date(i.scheduledAt), 'dd/MM/yy HH:mm', { locale: fr })}
                                                </td>
                                                <td className="p-3">{i.forfait?.name || '—'}</td>
                                                <td className="p-3">
                                                    {i.technician
                                                        ? i.technician.name
                                                        : <span className="text-muted-foreground italic">—</span>}
                                                </td>
                                                <td className="p-3">{i.zone?.name || '—'}</td>
                                                <td className="p-3 font-bold">{Number(i.totalPrice || 0).toFixed(2)}€</td>
                                                <td className="p-3">
                                                    <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Aucune intervention</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
