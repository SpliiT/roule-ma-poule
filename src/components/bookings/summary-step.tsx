'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, ArrowLeft, Loader2, Bike, Settings, Calendar, MapPin, Package, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
interface SelectedProduct {
    productId: string;
    quantity: number;
    name: string;
    price: number;
}
interface SummaryStepProps {
    data: {
        address: any;
        bikeId: string;
        serviceId: string;
        serviceName?: string | null;
        servicePrice?: number | null;
        date: Date;
        slot: string;
        products?: SelectedProduct[];
    };
    totalPrice?: number;
    onBack: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}
export function SummaryStep({ data, totalPrice, onBack, onConfirm, isSubmitting }: SummaryStepProps) {
    const products = data.products || [];
    const forfaitPrice = data.servicePrice || 0;
    const productsTotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const displayTotal = totalPrice ?? (forfaitPrice + productsTotal);
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
                <CheckCircle2 className="text-success h-5 w-5" />
                <h2 className="text-xl font-semibold">Récapitulatif de votre commande</h2>
            </div>
            <div className="grid gap-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-full p-2">
                            <MapPin className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Lieu d'intervention</p>
                            <p className="text-muted-foreground text-sm">
                                {data.address.street}, {data.address.postalCode} {data.address.city}
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-full p-2">
                            <Settings className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Prestation</p>
                            <p className="text-muted-foreground text-sm">
                                {data.serviceName || `Forfait sélectionné`}
                                {forfaitPrice > 0 && (
                                    <span className="ml-2 font-semibold text-primary">
                                        {forfaitPrice.toFixed(2)}€
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-full p-2">
                            <Calendar className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Date et heure</p>
                            <p className="text-muted-foreground text-sm">
                                {data.date ? format(data.date, 'EEEE d MMMM yyyy', { locale: fr }) : '-'}
                                <br />
                                {data.slot}
                            </p>
                        </div>
                    </div>
                    {products.length > 0 && (
                        <>
                            <Separator />
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 rounded-full p-2">
                                    <Package className="text-primary h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium mb-2">Produits additionnels</p>
                                    <div className="space-y-1">
                                        {products.map((p) => (
                                            <div key={p.productId} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {p.name} × {p.quantity}
                                                </span>
                                                <span className="font-medium">
                                                    {(p.price * p.quantity).toFixed(2)}€
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                { }
                <Card className="bg-muted/50 border-0">
                    <CardContent className="p-4">
                        {displayTotal > 0 && (
                            <div className="flex justify-between items-center mb-4 text-lg">
                                <span className="font-semibold flex items-center gap-2">
                                    <Euro className="h-5 w-5 text-primary" />
                                    Total à payer
                                </span>
                                <span className="font-bold text-primary text-xl">
                                    {displayTotal.toFixed(2)}€
                                </span>
                            </div>
                        )}
                        <p className="text-muted-foreground mb-4 text-xs">
                            En cliquant sur "Confirmer", vous acceptez qu'un technicien Roule Ma Poule se déplace à votre domicile. Le paiement s'effectuera directement sur place par carte bancaire.
                        </p>
                        <Button
                            className="w-full gap-2"
                            size="lg"
                            onClick={onConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmer la réservation'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack} disabled={isSubmitting} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Précédent
                </Button>
            </div>
        </div>
    );
}
