'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapView } from '@/components/maps/map-view';
import { getDrivingRoute } from '@/lib/routing-service';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Navigation, Flag, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function TechnicianGPSPage() {
    const { id } = useParams();
    const router = useRouter();
    const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [eta, setEta] = useState<string | null>(null);
    const [distance, setDistance] = useState<string | null>(null);
    const updateInterval = useRef<NodeJS.Timeout | null>(null);

    const { data: intervention, isLoading } = useQuery({
        queryKey: ['intervention-gps', id],
        queryFn: async () => {
            const { data } = await axios.get(`/api/bookings/technician`);
            const target = data.data.find((i: any) => i.id === id);
            return target;
        },
    });

    // 1. Démarrer la géolocalisation et le suivi
    useEffect(() => {
        if (!navigator.geolocation) {
            toast.error("Géolocalisation non supportée par votre navigateur");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const newPos: [number, number] = [pos.coords.longitude, pos.coords.latitude];
                setCurrentPos(newPos);

                // Mettre à jour la DB toutes les 10 secondes (throttling simple)
                if (!updateInterval.current) {
                    updateLocation(pos.coords.latitude, pos.coords.longitude);
                    updateInterval.current = setInterval(() => {
                        updateLocation(pos.coords.latitude, pos.coords.longitude);
                    }, 10000);
                }
            },
            (err) => toast.error("Erreur GPS: " + err.message),
            { enableHighAccuracy: true }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
            if (updateInterval.current) clearInterval(updateInterval.current);
        };
    }, []);

    // 2. Calculer l'itinéraire quand on a la position et la destination
    useEffect(() => {
        if (currentPos && intervention) {
            calculateRoute();
        }
    }, [currentPos, intervention]);

    const calculateRoute = async () => {
        try {
            const dest: [number, number] = [intervention.longitude, intervention.latitude];
            const data = await getDrivingRoute(currentPos!, dest);
            setRouteCoords(data.coordinates);

            // Format ETA and Distance
            const mins = Math.round(data.duration / 60);
            setEta(`${mins} min`);
            const kms = (data.distance / 1000).toFixed(1);
            setDistance(`${kms} km`);
        } catch (err) {
            console.error(err);
        }
    };

    const updateLocation = async (lat: number, lng: number) => {
        try {
            await axios.post('/api/technician/location', { latitude: lat, longitude: lng });
        } catch (err) {
            console.error('Failed to sync location', err);
        }
    };

    if (isLoading || !intervention) {
        return <div className="h-screen flex items-center justify-center font-black italic uppercase text-primary animate-pulse">Chargement navigation...</div>;
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative">
            {/* Header / Actions */}
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
                <Button variant="secondary" size="icon" onClick={() => router.back()} className="rounded-full shadow-lg border-2 border-primary/20">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
            </div>

            {/* Map 3D */}
            <div className="flex-1 relative">
                <MapView
                    center={currentPos || [intervention.longitude, intervention.latitude]}
                    zoom={17}
                    pitch={60}
                    bearing={0}
                    markers={[
                        ...(currentPos ? [{ lng: currentPos[0], lat: currentPos[1], label: "Ma position" }] : []),
                        { lng: intervention.longitude, lat: intervention.latitude, label: "Destination" }
                    ]}
                    route={routeCoords}
                    className="h-full w-full"
                />

                {/* Floating Navigation Info */}
                {eta && (
                    <div className="absolute bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background/95 backdrop-blur-md border-4 border-primary p-4 rounded-2xl shadow-2xl z-50 transform translate-y-0 group animate-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Arrivée prévue</span>
                                <span className="text-3xl font-black italic uppercase text-primary leading-none">{eta}</span>
                            </div>
                            <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-xl rotate-3 shadow-lg">
                                <Navigation className="h-6 w-6 text-background fill-current" />
                            </div>
                        </div>

                        <div className="space-y-2 border-t pt-3 border-primary/10">
                            <div className="flex items-center gap-3 text-sm font-bold">
                                <Flag className="h-4 w-4 text-primary" />
                                <span className="truncate italic uppercase tracking-tighter">{intervention.address}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{distance} • Via Route la plus rapide</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="h-20 bg-background border-t-4 border-primary flex items-center justify-around px-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                <Button variant="ghost" className="flex flex-col gap-1 h-auto font-black italic uppercase text-[10px] tracking-tighter">
                    <MapPin className="h-5 w-5" />
                    Aperçu
                </Button>
                <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center -translate-y-6 border-4 border-background shadow-xl">
                    <Navigation className="h-8 w-8 text-background fill-current" />
                </div>
                <Button variant="ghost" className="flex flex-col gap-1 h-auto font-black italic uppercase text-[10px] tracking-tighter">
                    <Flag className="h-5 w-5" />
                    Arriver
                </Button>
            </div>
        </div>
    );
}
