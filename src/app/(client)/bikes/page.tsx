'use client';
import { useBikes } from '@/hooks/use-bikes';
import { Button } from '@/components/ui/button';
import { BikeCard } from '@/components/bikes/bike-card';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
export default function BikesPage() {
    const { bikes, isLoading, deleteBike } = useBikes();
    return (
        <div className="container mx-auto max-w-5xl py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mes Vélos</h1>
                    <p className="text-muted-foreground">
                        Gérez votre garage pour faciliter vos prochaines réservations.
                    </p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/bikes/add">
                        <Plus className="h-4 w-4" />
                        Ajouter un vélo
                    </Link>
                </Button>
            </div>
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
            ) : bikes.length === 0 ? (
                <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                    <div className="bg-background mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-sm">
                        <Plus className="text-muted-foreground h-8 w-8" />
                    </div>
                    <h2 className="mb-2 text-xl font-semibold">Aucun vélo enregistré</h2>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        Vous n'avez pas encore ajouté de vélo à votre profil. Ajoutez-en un maintenant pour pouvoir réserver une intervention.
                    </p>
                    <Button asChild>
                        <Link href="/bikes/add">Ajouter mon premier vélo</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {bikes.map((bike) => (
                        <BikeCard
                            key={bike.id}
                            bike={bike}
                            onDelete={deleteBike}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}