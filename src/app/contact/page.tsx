import Link from 'next/link';
import { ChevronLeft, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export default async function ContactPage() {
    const company = await prisma.companyInfo.findFirst();

    const email = company?.email || "contact@roulemapoule.fr";
    const phone = company?.phone || "04 78 00 00 00";
    const address = company?.address || "69000 Lyon, France";
    const name = company?.name || "Le Cycle Lyonnais";

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
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
                        Nous <span className="text-primary">Contacter</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Une question sur une réparation ou besoin d'aide avec l'application ? Nous sommes là !
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden text-center hover:border-primary/30 transition-colors">
                        <CardContent className="p-8">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-black uppercase italic mb-2">Par Email</h3>
                            <p className="text-muted-foreground font-medium mb-4">
                                Nous répondons généralement en moins de 24h.
                            </p>
                            <a href={`mailto:${email}`} className="text-primary font-bold hover:underline">
                                {email}
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden text-center hover:border-primary/30 transition-colors">
                        <CardContent className="p-8">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Phone className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-black uppercase italic mb-2">Par Téléphone</h3>
                            <p className="text-muted-foreground font-medium mb-4">
                                Lundi au Vendredi<br />9h00 - 18h00
                            </p>
                            <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-primary font-bold hover:underline">
                                {phone}
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden text-center hover:border-primary/30 transition-colors">
                        <CardContent className="p-8">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-black uppercase italic mb-2">Siège Social</h3>
                            <p className="text-muted-foreground font-medium">
                                {name}<br />
                                {address.split('\n').map((line, i) => (
                                    <span key={i}>{line}<br /></span>
                                ))}
                                <span className="text-xs uppercase tracking-widest mt-2 block opacity-60">Ateliers mobiles sur toute la métropole</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
