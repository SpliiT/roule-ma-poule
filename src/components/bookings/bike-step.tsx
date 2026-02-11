'use client';
import { useBikes } from '@/hooks/use-bikes';
import { BikeCard } from '@/components/bikes/bike-card';
import { Button } from '@/components/ui/button';
import { Plus, Bike as BikeIcon, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
interface BikeStepProps {
    selectedBikeId: string | null;
    onNext: (bikeId: string) => void;
    onBack: () => void;
}
export function BikeStep({ selectedBikeId, onNext, onBack }: BikeStepProps) {
    const { bikes, isLoading } = useBikes();
    if (isLoading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Chargement de votre garage...</p>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                    <BikeIcon className="text-primary h-5 w-5" />
                    <h2 className="text-xl font-semibold">Quel vélo réparer ?</h2>
                </div>
                <Button variant="outline" size="sm" asChild className="gap-1">
                    <Link href="/bikes/add">
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter un vélo
                    </Link>
                </Button>
            </div>
            {bikes.length === 0 ? (
                <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                    <BikeIcon className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
                    <p className="text-muted-foreground mb-6 max-w-xs">
                        Vous n'avez pas encore de vélo enregistré.
                    </p>
                    <Button asChild>
                        <Link href="/bikes/add">Ajouter mon premier vélo</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {bikes.map((bike) => (
                        <BikeCard
                            key={bike.id}
                            bike={bike}
                            isSelectable
                            isSelected={selectedBikeId === bike.id}
                            onSelect={() => onNext(bike.id)}
                        />
                    ))}
                </div>
            )}
            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Précédent
                </Button>
            </div>
        </div>
    );
}