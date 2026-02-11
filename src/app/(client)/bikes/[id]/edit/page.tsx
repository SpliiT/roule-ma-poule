'use client';

import { useBikes } from '@/hooks/use-bikes';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BikeForm } from '@/components/bikes/bike-form';
import { BikeFormValues } from '@/lib/validations/auth';
import { useMemo, ReactNode } from 'react';

export default function EditBikePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { bikes, updateBike, isUpdating, isLoading } = useBikes();

    const bike = useMemo(() => bikes.find((b) => b.id === id), [bikes, id]);

    async function onSubmit(values: BikeFormValues) {
        try {
            await updateBike({ id, data: values });
            router.push('/bikes');
        } catch (error) {
            console.error(error);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!bike) {
        return (
            <div className="container mx-auto max-w-2xl py-16 text-center">
                <h1 className="text-2xl font-bold">Vélo non trouvé</h1>
                <p className="text-muted-foreground mt-2">Le vélo que vous essayez de modifier n'existe pas ou ne vous appartient pas.</p>
                <Button asChild className="mt-6" variant="outline">
                    <Link href="/bikes">Retour à la liste</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="mb-8">
                <Button variant="ghost" asChild className="mb-4 gap-2 px-0 hover:bg-transparent">
                    <Link href="/bikes">
                        <ArrowLeft className="h-4 w-4" />
                        Retour à la liste
                    </Link>
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Modifier le vélo</h1>
                        <p className="text-muted-foreground">Mettez à jour les informations de votre {bike.brand} {bike.model}.</p>
                    </div>
                </div>
            </div>

            <BikeForm
                initialValues={{
                    brand: bike.brand,
                    model: bike.model,
                    year: bike.year || new Date().getFullYear(),
                    type: bike.type as any,
                    isElectric: bike.isElectric,
                    photoUrl: bike.photoUrl || '',
                }}
                onSubmit={onSubmit}
                isLoading={isUpdating}
                title="Détails du vélo"
                description="Modifiez les informations ci-dessous."
            />
        </div>
    );
}
