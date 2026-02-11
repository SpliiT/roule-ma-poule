'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    MapPin,
    Wrench,
    CheckCircle2,
    Loader2,
    Navigation,
    Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
export default function TechnicianDashboardPage() {
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data;
        },
    });
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Espace Technicien</h1>
                <p className="text-muted-foreground">Consultez votre planning et gérez vos interventions du jour.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">À faire aujourd'hui</CardTitle>
                        <Clock className="text-primary h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {interventions.filter((i: any) => i.status === 'CONFIRMED' || i.status === 'PENDING').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Lieu</CardTitle>
                        <MapPin className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">Lyon & Environs</div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Planning des interventions</h2>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="text-primary h-6 w-6 animate-spin" />
                        </div>
                    ) : interventions.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Calendar className="mb-2 h-8 w-8 opacity-20" />
                                <p>Aucune intervention assignée pour le moment.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        interventions.map((i: any) => (
                            <Card key={i.id} className="overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    <div className="bg-muted flex flex-col items-center justify-center border-b p-6 md:w-48 md:border-b-0 md:border-r">
                                        <span className="text-primary text-sm font-bold uppercase">
                                            {format(new Date(i.scheduledAt), 'EEEE', { locale: fr })}
                                        </span>
                                        <span className="text-3xl font-bold">
                                            {format(new Date(i.scheduledAt), 'HH:mm')}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {format(new Date(i.scheduledAt), 'd MMMM', { locale: fr })}
                                        </span>
                                    </div>
                                    <div className="flex-1 p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold">{i.forfait.name}</h3>
                                                <p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {i.address}, {i.postalCode} {i.city}
                                                </p>
                                            </div>
                                            <Badge variant={i.status === 'COMPLETED' ? 'success' : 'outline'}>
                                                {i.status}
                                            </Badge>
                                        </div>
                                        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                                            <div className="rounded-lg border p-3">
                                                <p className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                                                    <CheckCircle2 className="h-3 w-3" /> Client
                                                </p>
                                                <p className="font-semibold">{i.client.name || 'Client Inconnu'}</p>
                                                <a href={`tel:${i.client.phone}`} className="text-primary hover:underline font-medium">
                                                    {i.client.phone || 'Pas de numéro'}
                                                </a>
                                            </div>
                                            <div className="rounded-lg border p-3">
                                                <p className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                                                    <Wrench className="h-3 w-3" /> Vélo
                                                </p>
                                                <p className="font-semibold">{i.bike.brand} {i.bike.model}</p>
                                                <p className="text-muted-foreground text-xs">{i.bike.isElectric ? 'Vitesse Électrique' : 'Musculaire'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button className="flex-1 gap-2">
                                                <Navigation className="h-4 w-4" />
                                                Itinéraire
                                            </Button>
                                            <Button variant="outline" className="flex-1 gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Terminer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}