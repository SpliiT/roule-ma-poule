'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TechnicianHistoryPage() {
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions-history'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data;
        },
    });

    const historyInterventions = interventions.filter((i: any) =>
        i.status === 'COMPLETED' || i.status === 'CANCELLED'
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
                <p className="text-muted-foreground">Consultez vos interventions passées et les retours clients.</p>
            </div>

            {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : historyInterventions.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <ClipboardCheck className="mb-2 h-8 w-8 opacity-20" />
                        <p>Vous n'avez pas encore d'interventions terminées.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {historyInterventions.map((i: any) => (
                        <Card key={i.id} className="opacity-80">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(i.scheduledAt), 'PPP', { locale: fr })}
                                    </p>
                                    <h3 className="font-bold">{i.forfait.name}</h3>
                                    <p className="text-xs">{i.client.name || 'Client'}</p>
                                </div>
                                <div className="text-right space-y-2">
                                    <Badge variant={i.status === 'COMPLETED' ? 'success' : 'destructive'}>
                                        {i.status}
                                    </Badge>
                                    <div className="flex gap-0.5 text-yellow-500">
                                        <Star className="h-3 w-3 fill-current" />
                                        <Star className="h-3 w-3 fill-current" />
                                        <Star className="h-3 w-3 fill-current" />
                                        <Star className="h-3 w-3 fill-current" />
                                        <Star className="h-3 w-3 fill-current" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
