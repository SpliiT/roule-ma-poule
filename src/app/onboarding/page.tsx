'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, Bike } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
export default function OnboardingPage() {
    const { user: clerkUser, isLoaded } = useUser();
    const router = useRouter();
    const [isSyncing, setIsSyncing] = useState(false);
    useEffect(() => {
        async function syncUser() {
            if (!isLoaded || !clerkUser || isSyncing) return;
            setIsSyncing(true);
            try {
                await axios.post('/api/users/sync');
                toast.success('Profil synchronisé !');
                router.push('/dashboard');
            } catch (error) {
                console.error('Erreur de synchronisation:', error);
                toast.error('Erreur lors de la création de votre profil');
            } finally {
                setIsSyncing(false);
            }
        }
        syncUser();
    }, [isLoaded, clerkUser, router]);
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="mb-8">
                <div className="bg-primary/10 p-6 rounded-3xl">
                    <Bike className="h-16 w-16 text-primary" />
                </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold italic uppercase tracking-tight">Préparation de votre espace...</h1>
            <p className="text-muted-foreground mb-8">
                Nous créons votre profil dans notre base de données. Cela ne prendra que quelques secondes.
            </p>
            <Loader2 className="text-primary h-12 w-12 animate-spin" />
        </div>
    );
}
