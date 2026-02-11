'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, Loader2, Settings } from 'lucide-react';
import type { Forfait, Product } from '@prisma/client';
interface ServiceStepProps {
    selectedServiceId: string | null;
    onNext: (serviceId: string) => void;
    onBack: () => void;
}
export function ServiceStep({ selectedServiceId, onNext, onBack }: ServiceStepProps) {
    const { data: forfaits = [], isLoading } = useQuery<Forfait[]>({
        queryKey: ['forfaits'],
        queryFn: async () => {
            const { data } = await axios.get('/api/forfaits');
            return data.data;
        },
    });
    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
                <Settings className="text-primary h-5 w-5" />
                <h2 className="text-xl font-semibold">Choisissez votre forfait</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {forfaits.map((forfait) => (
                    <Card
                        key={forfait.id}
                        className={`cursor-pointer transition-all hover:border-primary/50 ${selectedServiceId === forfait.id ? 'border-primary ring-1 ring-primary' : ''
                            }`}
                        onClick={() => onNext(forfait.id)}
                    >
                        <CardContent className="p-5">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-bold">{forfait.name}</h3>
                                <span className="text-xl font-bold text-primary">{Number(forfait.price)}€</span>
                            </div>
                            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                                {forfait.description}
                            </p>
                            {selectedServiceId === forfait.id && (
                                <Badge className="bg-primary/20 text-primary hover:bg-primary/20 gap-1 border-0">
                                    <Check className="h-3 w-3" />
                                    Sélectionné
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Précédent
                </Button>
            </div>
        </div>
    );
}