'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapView } from '@/components/maps/map-view';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Navigation, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Page de carte pour les techniciens.
 * Affiche les interventions de la journée sous forme de marqueurs
 * avec un panneau latéral de navigation rapide.
 */
export default function TechnicianMapPage() {
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['technician-interventions-map'],
        queryFn: async () => {
            const { data } = await axios.get('/api/bookings/technician');
            return data.data;
        },
    });

    // Filtrer les interventions non terminées
    const activeInterventions = interventions.filter((i: any) =>
        i.status !== 'COMPLETED' && i.status !== 'CANCELLED'
    );

    // Préparation des marqueurs pour la carte
    const markers = activeInterventions.map((i: any) => ({
        lng: i.longitude,
        lat: i.latitude,
        label: `
            <div class="p-3 font-sans min-w-[180px]">
                <p class="font-bold text-primary border-b border-primary/10 pb-2 mb-2">${i.forfait.name}</p>
                <div class="space-y-1 mb-3">
                    <p class="text-xs"><strong>Client:</strong> ${i.client.name || 'Non renseigné'}</p>
                    <p class="text-xs"><strong>Heure:</strong> ${format(new Date(i.scheduledAt), 'HH:mm', { locale: fr })}</p>
                    <p class="text-[10px] text-muted-foreground flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        ${i.address}
                    </p>
                </div>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${i.latitude},${i.longitude}" 
                   target="_blank" 
                   class="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold transition-opacity hover:opacity-90">
                    Lancer le GPS
                </a>
            </div>
        `,
    }));

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tournée du Jour</h1>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Visualisez votre itinéraire et lancez la navigation vers vos rendez-vous.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                {/* Carte Principale */}
                <Card className="lg:col-span-3 overflow-hidden border-2 border-primary/10 shadow-2xl relative">
                    <CardContent className="p-0 h-full relative">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-sm z-10">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="text-sm font-bold text-primary animate-pulse">Chargement de la carte...</p>
                                </div>
                            </div>
                        )}
                        <MapView markers={markers} />
                    </CardContent>
                </Card>

                {/* Panneau Latéral de Navigation */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="font-bold flex items-center gap-2 text-primary">
                        <Clock className="h-5 w-5" />
                        Chronologie
                    </h2>

                    {activeInterventions.length === 0 ? (
                        <Card className="border-dashed bg-muted/30">
                            <CardContent className="p-8 text-center">
                                <p className="text-sm text-muted-foreground italic">Aucune intervention active pour le moment.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        activeInterventions.map((i: any) => (
                            <Card
                                key={i.id}
                                className="shrink-0 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-md border-l-4 border-l-primary"
                            >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="font-mono">
                                            {format(new Date(i.scheduledAt), 'HH:mm')}
                                        </Badge>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${i.latitude},${i.longitude}`}
                                            target="_blank"
                                            className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Navigation className="h-4 w-4" />
                                        </a>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-bold text-sm leading-tight text-foreground underline-offset-4 decoration-primary/30 group-hover:underline">
                                            {i.forfait.name}
                                        </h3>
                                        <p className="text-xs font-medium text-muted-foreground">{i.client.name || 'Client'}</p>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{i.address}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
