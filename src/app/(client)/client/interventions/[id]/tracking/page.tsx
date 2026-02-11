'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapView } from '@/components/maps/map-view';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Bike, Clock, MapPin, Phone } from 'lucide-react';

export default function ClientTrackingPage() {
    const { id } = useParams();
    const router = useRouter();
    const [lastLoc, setLastLoc] = useState<[number, number] | null>(null);

    const { data: tracking, isLoading, error } = useQuery({
        queryKey: ['intervention-tracking', id],
        queryFn: async () => {
            const { data } = await axios.get(`/api/interventions/tracking/${id}`);
            return data;
        },
        refetchInterval: 5000, // Poll every 5 seconds
    });

    useEffect(() => {
        if (tracking?.location?.lng && tracking?.location?.lat) {
            setLastLoc([tracking.location.lng, tracking.location.lat]);
        }
    }, [tracking]);

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center font-black italic uppercase text-primary animate-pulse">Recherche du technicien...</div>;
    }

    if (error || (tracking && !tracking.trackingActive)) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                    <Bike className="h-10 w-10 text-muted-foreground opacity-20" />
                </div>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">Pas de suivi actif</h1>
                <p className="text-muted-foreground">{tracking?.message || "Le technicien n'est pas encore en route ou l'intervention n'est pas confirmée."}</p>
                <Button onClick={() => router.back()} className="font-black italic uppercase">Retour</Button>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative">
            {/* Header */}
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
                <Button variant="secondary" size="icon" onClick={() => router.back()} className="rounded-full shadow-lg border-2 border-primary/20">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
            </div>

            {/* Map Tracking */}
            <div className="flex-1 relative">
                <MapView
                    center={lastLoc || [tracking.targetLocation.lng, tracking.targetLocation.lat]}
                    zoom={15}
                    pitch={45}
                    markers={[
                        ...(lastLoc ? [{ lng: lastLoc[0], lat: lastLoc[1], label: tracking.technicianName || "Technicien" }] : []),
                        { lng: tracking.targetLocation.lng, lat: tracking.targetLocation.lat, label: "Moi" }
                    ]}
                    className="h-full w-full"
                />

                {/* Info Card "Uber Eats" style */}
                <div className="absolute bottom-8 left-4 right-4 md:left-4 md:right-auto md:w-96 bg-background/95 backdrop-blur-md border-4 border-primary rounded-3xl shadow-2xl z-50 overflow-hidden transform animate-in slide-in-from-bottom-8">
                    <div className="bg-primary p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-background rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
                                <Bike className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-background font-black italic uppercase tracking-tighter text-xl">En chemin !</h2>
                                <p className="text-background/80 text-[10px] font-bold uppercase tracking-widest leading-none">Votre technicien arrive</p>
                            </div>
                        </div>
                        <Badge className="bg-background text-primary hover:bg-background/90 font-black italic uppercase">À VÉLO</Badge>
                    </div>

                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-muted border-2 border-primary/20 flex items-center justify-center font-black text-2xl text-primary">
                                    {(tracking.technicianName || 'T').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black italic uppercase text-lg leading-none">{tracking.technicianName || 'Technicien'}</p>
                                    <div className="flex items-center gap-1 text-yellow-500 mt-1">
                                        {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-xs">★</span>)}
                                        <span className="text-[10px] text-muted-foreground ml-1 font-bold">5.0</span>
                                    </div>
                                </div>
                            </div>
                            <Button size="icon" variant="outline" className="rounded-full h-12 w-12 border-2 border-primary/10 hover:border-primary/30">
                                <Phone className="h-5 w-5 text-primary" />
                            </Button>
                        </div>

                        <div className="space-y-4 border-t pt-6 border-primary/5">
                            <div className="flex items-start gap-4">
                                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Adresse d'intervention</p>
                                    <p className="font-bold text-sm tracking-tight leading-tight">{tracking.targetLocation.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Clock className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Dernière position</p>
                                    <p className="font-bold text-sm tracking-tight leading-tight">Mise à jour il y a 5s</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </div>
        </div>
    );
}
