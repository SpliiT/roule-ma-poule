'use client';

import { useBikes } from '@/hooks/use-bikes';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BikeForm } from '@/components/bikes/bike-form';
import { BikeFormValues } from '@/lib/validations/auth';

export default function AddBikePage() {
    const router = useRouter();
    const { createBike, isCreating } = useBikes();

    async function onSubmit(values: BikeFormValues) {
        try {
            await createBike(values);
            router.push('/bikes');
        } catch (error) {
            console.error(error);
        }
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
                        <h1 className="text-3xl font-bold tracking-tight">Ajouter un vélo</h1>
                        <p className="text-muted-foreground">Recherchez votre vélo pour remplir automatiquement les détails.</p>
                    </div>
                </div>
            </div>

            <BikeForm
                onSubmit={onSubmit}
                isLoading={isCreating}
                title="Détails du vélo"
                description="Remplissez les informations de votre vélo."
            />
        </div>
    );
}
