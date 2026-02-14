'use client';

import { useEffect, useState } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function PWAInstallGuide() {
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);

    useEffect(() => {
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

        
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;

        
        let hasSeenPrompt = false;
        try {
            hasSeenPrompt = sessionStorage.getItem('pwa-prompt-seen') === 'true';
        } catch (e) {
            console.warn('sessionStorage is not available');
        }

        if (isIOS && !isStandalone && !hasSeenPrompt) {
            setShowIOSPrompt(true);
        }
    }, []);

    const closePrompt = () => {
        setShowIOSPrompt(false);
        try {
            sessionStorage.setItem('pwa-prompt-seen', 'true');
        } catch (e) {
            console.warn('Could not set sessionStorage item');
        }
    };

    if (!showIOSPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-4 bg-background border-2 border-primary shadow-2xl relative overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={closePrompt}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="flex items-start gap-4 pr-6">
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <PlusSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black italic uppercase tracking-tighter leading-tight">
                            Installer l'app <span className="text-primary">Roule Ma Poule</span>
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                            Pour une meilleure expérience et recevoir les notifications :
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 bg-muted/50 p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3 text-sm font-semibold italic uppercase tracking-tight">
                        <span className="bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center rounded-full text-[10px] not-italic">1</span>
                        Appuyez sur <Share className="h-4 w-4 inline mx-1" /> "Partager"
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold italic uppercase tracking-tight">
                        <span className="bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center rounded-full text-[10px] not-italic">2</span>
                        Sélectionnez <PlusSquare className="h-4 w-4 inline mx-1" /> "Sur l'écran d'accueil"
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button
                        size="sm"
                        variant="default"
                        className="font-black italic uppercase tracking-widest text-xs"
                        onClick={closePrompt}
                    >
                        J'ai compris
                    </Button>
                </div>
            </Card>
        </div>
    );
}
