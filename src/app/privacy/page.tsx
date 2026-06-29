'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
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
                    Politique de <span className="text-primary">Confidentialité</span>
                </h1>

                <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden">
                    <CardContent className="p-8 prose prose-invert max-w-none text-foreground">
                        <p className="font-bold text-muted-foreground mb-6">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
                        
                        <h2 className="text-xl font-black uppercase italic mt-8 mb-4">1. Données collectées</h2>
                        <p className="mb-4">
                            Nous collectons les données strictement nécessaires au bon fonctionnement de notre service : votre nom, adresse email, 
                            numéro de téléphone (pour contacter le technicien), et adresse d'intervention.
                        </p>

                        <h2 className="text-xl font-black uppercase italic mt-8 mb-4">2. Utilisation des données</h2>
                        <p className="mb-4">
                            Vos données sont utilisées exclusivement pour :
                        </p>
                        <ul className="list-disc pl-5 mb-4">
                            <li>La gestion de vos réservations et interventions</li>
                            <li>La communication avec nos techniciens</li>
                            <li>L'amélioration de la qualité de notre service client</li>
                        </ul>

                        <h2 className="text-xl font-black uppercase italic mt-8 mb-4">3. Protection de vos données</h2>
                        <p className="mb-4">
                            Nous ne revendons en aucun cas vos données personnelles à des tiers. Les informations de géolocalisation 
                            (notamment lors de l'arrivée du technicien) sont traitées en temps réel et ne sont pas conservées à des fins de pistage.
                        </p>

                        <h2 className="text-xl font-black uppercase italic mt-8 mb-4">4. Vos droits (RGPD)</h2>
                        <p className="mb-4">
                            Conformément à la réglementation européenne, vous disposez d'un droit d'accès, de rectification et de suppression 
                            de vos données personnelles. Vous pouvez exercer ce droit en nous contactant directement via notre page Contact.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
