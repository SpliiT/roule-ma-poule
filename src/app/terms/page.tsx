'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Button variant="ghost" size="icon" asChild className="mr-4">
                        <Link href="/">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <span className="font-black uppercase italic tracking-tight">Roule Ma Poule</span>
                </div>
            </header>

            <div className="container mx-auto max-w-3xl px-4 py-12">
                <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-8">
                    Conditions Générales <span className="text-primary">d'Utilisation</span>
                </h1>

                <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden">
                    <CardContent className="p-8 prose prose-invert max-w-none text-foreground">
                        <p className="font-bold text-muted-foreground mb-6">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
                        
                        <h2 className="text-xl font-black uppercase italic mt-8 mb-4">1. Présentation du service</h2>
                        <p className="mb-4">
                            Roule Ma Poule est un service de réparation et d'entretien de vélos à domicile intervenant dans la métropole de Lyon. 
                            L'application permet aux utilisateurs de réserver des créneaux d'intervention directement en ligne.
                        </p>

                        <h2 className="text-xl font-black uppercase italic mt-8 mb-4">2. Réservation et annulation</h2>
                        <p className="mb-4">
                            Toute réservation effectuée sur l'application est ferme. Vous pouvez annuler votre réservation gratuitement jusqu'à 24h avant 
                            l'intervention. En deçà, des frais d'annulation pourront être appliqués.
                        </p>

                        <h2 className="text-xl font-black uppercase italic mt-8 mb-4">3. Tarifs et paiement</h2>
                        <p className="mb-4">
                            Les tarifs sont indiqués de manière transparente lors de la réservation. Le paiement s'effectue directement sur place, 
                            une fois la réparation validée avec le technicien.
                        </p>

                        <h2 className="text-xl font-black uppercase italic mt-8 mb-4">4. Responsabilités</h2>
                        <p className="mb-4">
                            Nos techniciens s'engagent à fournir un service professionnel de qualité certifiée. En cas de litige suite à une réparation, 
                            nous vous invitons à contacter notre service client dans les plus brefs délais.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
