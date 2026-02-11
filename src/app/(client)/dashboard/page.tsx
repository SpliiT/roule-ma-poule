'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Bike as BikeIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    Loader2,
    Wrench
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
const statusLabels: Record<string, { label: string, color: string, icon: any }> = {
    PENDING: { label: 'En attente', color: 'bg-warning/20 text-warning border-warning/30', icon: Clock },
    CONFIRMED: { label: 'Confirmé', color: 'bg-info/20 text-info border-info/30', icon: Calendar },
    IN_PROGRESS: { label: 'En cours', color: 'bg-primary/20 text-primary border-primary/30', icon: Wrench },
    COMPLETED: { label: 'Terminé', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle2 },
    CANCELLED: { label: 'Annulé', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: AlertCircle },
};
export default function ClientDashboardPage() {
    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['my-bookings'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/my');
            return data.data;
        },
    });
    const { data: stats } = useQuery({
        queryKey: ['client-stats'],
        queryFn: async () => {
            const { data } = await axios.get('/api/users/stats');
            return data.data;
        },
    });
    return (
        <div className="space-y-8 py-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                    <p className="text-muted-foreground">Bienvenue sur votre espace Roule Ma Poule.</p>
                </div>
                <Button asChild className="gap-2 shadow-lg shadow-primary/20">
                    <Link href="/bookings/new">
                        <Plus className="h-4 w-4" />
                        Nouvelle réservation
                    </Link>
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Réservations</CardTitle>
                        <Calendar className="text-primary h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
                        <p className="text-muted-foreground text-xs">+1 depuis le mois dernier</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Mes Vélos</CardTitle>
                        <BikeIcon className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalBikes || 0}</div>
                        <p className="text-muted-foreground text-xs">Garage à vélos</p>
                    </CardContent>
                </Card>
                {}
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Interventions à venir</h2>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex h-32 items-center justify-center">
                                <Loader2 className="text-primary h-6 w-6 animate-spin" />
                            </div>
                        ) : bookings.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                    <Calendar className="text-muted-foreground mb-2 h-8 w-8 opacity-20" />
                                    <p className="text-muted-foreground text-sm">Aucune intervention prévue.</p>
                                    <Button variant="link" asChild>
                                        <Link href="/bookings/new">Réservez maintenant</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            bookings.map((booking: any) => {
                                const status = statusLabels[booking.status] || statusLabels.PENDING;
                                const StatusIcon = status.icon;
                                return (
                                    <Card key={booking.id} className="overflow-hidden transition-all hover:shadow-md">
                                        <div className="flex items-center gap-4 p-4">
                                            <div className="bg-muted flex h-16 w-16 flex-col items-center justify-center rounded-lg border">
                                                <span className="text-xs font-bold uppercase text-primary">
                                                    {format(new Date(booking.scheduledAt), 'MMM', { locale: fr })}
                                                </span>
                                                <span className="text-xl font-bold">
                                                    {format(new Date(booking.scheduledAt), 'd')}
                                                </span>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">{booking.forfait.name}</h4>
                                                    <Badge variant="outline" className={`${status.color} gap-1 border-0 px-2 py-0.5`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground text-sm line-clamp-1">
                                                    {booking.address}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(booking.scheduledAt), 'HH:mm')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BikeIcon className="h-3 w-3" />
                                                        {booking.bike.brand} {booking.bike.model}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Mon Garage</h2>
                    {}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium">Gérez vos vélos enregistrés</p>
                                <Button size="sm" variant="ghost" asChild>
                                    <Link href="/bikes">Tout voir</Link>
                                </Button>
                            </div>
                            <Button className="w-full gap-2" variant="outline" asChild>
                                <Link href="/bikes/add">
                                    <Plus className="h-4 w-4" />
                                    Ajouter un vélo
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}