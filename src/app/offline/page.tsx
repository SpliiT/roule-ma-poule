'use client';

import { Button } from '@/components/ui/button';
import { WifiOff, RotateCcw, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="flex flex-col items-center max-w-md w-full text-center space-y-8">
                {/* Image / Mascot */}
                <div className="relative w-48 h-48 animate-bounce-slow">
                    <Image
                        src="/images/mascotte.png"
                        alt="Mascotte Roule Ma Poule"
                        fill
                        className="object-contain grayscale opacity-60"
                        priority
                    />
                    <div className="absolute -bottom-2 -right-2 bg-destructive rounded-full p-3 border-4 border-background shadow-lg items-center justify-center flex">
                        <WifiOff className="w-6 h-6 text-destructive-foreground" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                        Oups ! <span className="text-primary">Hors Ligne</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                        On dirait que votre vélo est prêt, mais que votre connexion a déraillé.
                        Vérifiez votre réseau pour continuer.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col w-full gap-3 pt-4">
                    <Button
                        size="xl"
                        variant="default"
                        className="w-full font-black italic uppercase tracking-widest text-lg py-8 shadow-[0_8px_0_0_rgba(0,0,0,0.15)] active:translate-y-1 active:shadow-none transition-all"
                        onClick={() => router.refresh()}
                    >
                        <RotateCcw className="mr-2 h-6 w-6" />
                        Réessayer
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full font-bold uppercase italic border-2"
                        asChild
                    >
                        <Link href="/">
                            <Home className="mr-2 h-5 w-5" />
                            Retour à l'accueil
                        </Link>
                    </Button>
                </div>

                {/* Subtle hint */}
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black italic">
                    Roule Ma Poule — Lyon & Alentours
                </p>
            </div>
        </div>
    );
}
