'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar, CheckCircle2, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

export default function TechnicianTodayPage() {
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions-today'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data; // Note: In real app, API would filter by today
        },
    });

    const todayInterventions = interventions.filter((i: any) =>
        i.status !== 'COMPLETED' && i.status !== 'CANCELLED'
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Interventions d'aujourd'hui</h1>
                <p className="text-muted-foreground">Liste complète de vos rendez-vous pour la journée.</p>
            </div>

            {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : todayInterventions.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Calendar className="mb-2 h-8 w-8 opacity-20" />
                        <p>Aucune intervention prévue aujourd'hui.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {todayInterventions.map((i: any) => (
                        <Card key={i.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="bg-primary/5 flex flex-col items-center justify-center border-b p-4 md:w-32 md:border-b-0 md:border-r">
                                    <span className="text-xl font-bold">
                                        {format(new Date(i.scheduledAt), 'HH:mm')}
                                    </span>
                                </div>
                                <div className="flex-1 p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{i.forfait.name}</h3>
                                        <Badge>{i.status}</Badge>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {i.address}, {i.city}
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                            {i.client.name || 'Client'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1 flex-1 font-bold italic uppercase tracking-tighter"
                                            asChild
                                        >
                                            <a href={`/technician/gps/${i.id}`}>
                                                <Navigation className="h-3 w-3" /> Navigation
                                            </a>
                                        </Button>
                                        <Button size="sm" className="gap-1 flex-1 font-bold italic uppercase tracking-tighter" asChild>
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
