'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
export default function TechnicianUpcomingPage() {
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions-upcoming'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data;
        },
    });
    const upcomingInterventions = interventions.filter((i: any) =>
        new Date(i.scheduledAt) > new Date() && i.status === 'CONFIRMED'
    );
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Interventions à venir</h1>
                <p className="text-muted-foreground">Préparez votre planning pour les prochains jours.</p>
            </div>
            {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : upcomingInterventions.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Calendar className="mb-2 h-8 w-8 opacity-20" />
                        <p>Aucune intervention à venir programmée.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {upcomingInterventions.map((i: any) => (
                        <Card key={i.id}>
                            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono">
                                            {format(new Date(i.scheduledAt), 'dd/MM HH:mm')}
                                        </Badge>
                                        <h3 className="font-bold">{i.forfait.name}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {i.city} ({i.postalCode})
                                    </p>
                                </div>
                                <div className="bg-muted/30 p-2 rounded-lg text-xs flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    Assigné il y a 2 jours
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}