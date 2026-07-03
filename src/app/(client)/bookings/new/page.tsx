'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AddressStep } from '@/components/bookings/address-step';
import { BikeStep } from '@/components/bookings/bike-step';
import { ServiceStep } from '@/components/bookings/service-step';
import { ScheduleStep } from '@/components/bookings/schedule-step';
import { ProductsStep } from '@/components/bookings/products-step';
import { SummaryStep } from '@/components/bookings/summary-step';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
type BookingStep = 'address' | 'bike' | 'service' | 'schedule' | 'products' | 'summary';
const STEPS: BookingStep[] = ['address', 'bike', 'service', 'schedule', 'products', 'summary'];
const STEP_LABELS: Record<BookingStep, string> = {
    address: 'Localisation',
    bike: 'Votre Vélo',
    service: 'Le Forfait',
    schedule: 'Date & Heure',
    products: 'Produits',
    summary: 'Confirmation',
};
interface SelectedProduct {
    productId: string;
    quantity: number;
    name: string;
    price: number;
}
export default function NewBookingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<BookingStep>('address');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [bookingData, setBookingData] = useState({
        address: null as any,
        bikeId: null as any,
        serviceId: null as any,
        serviceName: null as string | null,
        servicePrice: null as number | null,
        serviceDuration: null as number | null,
        date: null as any,
        slot: null as any,
        products: [] as SelectedProduct[],
    });

    useEffect(() => {
        const savedData = sessionStorage.getItem('roulemapoule_bookingData');
        const savedStep = sessionStorage.getItem('roulemapoule_bookingStep');
        
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.date) {
                    parsed.date = new Date(parsed.date);
                }
                setBookingData(parsed);
            } catch (e) {
                console.error("Failed to parse saved booking data", e);
            }
        }
        if (savedStep && STEPS.includes(savedStep as BookingStep)) {
            setCurrentStep(savedStep as BookingStep);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            sessionStorage.setItem('roulemapoule_bookingData', JSON.stringify(bookingData));
            sessionStorage.setItem('roulemapoule_bookingStep', currentStep);
        }
    }, [bookingData, currentStep, isLoaded]);

    const stepIndex = STEPS.indexOf(currentStep);
    const progress = ((stepIndex + 1) / STEPS.length) * 100;
    const nextStep = () => {
        const nextIdx = stepIndex + 1;
        if (nextIdx < STEPS.length) setCurrentStep(STEPS[nextIdx]);
    };
    const prevStep = () => {
        const prevIdx = stepIndex - 1;
        if (prevIdx >= 0) setCurrentStep(STEPS[prevIdx]);
    };
    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const scheduledDateTime = new Date(bookingData.date!);
            if (bookingData.slot) {
                const [hours, minutes] = bookingData.slot.split(':');
                scheduledDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            }

            const payload = {
                ...bookingData.address,
                bikeId: bookingData.bikeId,
                forfaitId: bookingData.serviceId,
                scheduledAt: scheduledDateTime,
                products: bookingData.products.map(p => ({
                    productId: p.productId,
                    quantity: p.quantity,
                })),
            };
            await axios.post('/api/bookings', payload);
            toast.success('Votre réservation a été confirmée !');
            sessionStorage.removeItem('roulemapoule_bookingData');
            sessionStorage.removeItem('roulemapoule_bookingStep');
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la validation de la réservation.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const forfaitPrice = bookingData.servicePrice || 0;
    const productsTotal = bookingData.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const totalPrice = forfaitPrice + productsTotal;

    if (!isLoaded) return null; // Prevent hydration mismatch

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Réserver une intervention</h1>
                <p className="text-muted-foreground">Suivez les étapes pour planifier votre réparation.</p>
            </div>
            <div className="mb-8 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Étape {stepIndex + 1} sur {STEPS.length}</span>
                    <span className="text-primary font-bold">{STEP_LABELS[currentStep]}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 min-w-0">
                    <Card className="min-h-[450px]">
                        <CardContent className="pt-6">
                            {currentStep === 'address' && (
                                <AddressStep
                                    onNext={(address) => {
                                        setBookingData(prev => ({ ...prev, address }));
                                        nextStep();
                                    }}
                                />
                            )}
                            {currentStep === 'bike' && (
                                <BikeStep
                                    selectedBikeId={bookingData.bikeId}
                                    onNext={(bikeId: string) => {
                                        setBookingData(prev => ({ ...prev, bikeId }));
                                        nextStep();
                                    }}
                                    onBack={prevStep}
                                />
                            )}
                            {currentStep === 'service' && (
                                <ServiceStep
                                    selectedServiceId={bookingData.serviceId}
                                    onNext={(serviceId: string, serviceName?: string, servicePrice?: number, serviceDuration?: number) => {
                                        setBookingData(prev => ({
                                            ...prev,
                                            serviceId,
                                            serviceName: serviceName || null,
                                            servicePrice: servicePrice || null,
                                            serviceDuration: serviceDuration || null,
                                        }));
                                        nextStep();
                                    }}
                                    onBack={prevStep}
                                />
                            )}
                            {currentStep === 'schedule' && (
                                <ScheduleStep
                                    onNext={(date: Date, slot: string) => {
                                        setBookingData(prev => ({ ...prev, date, slot }));
                                        nextStep();
                                    }}
                                    onBack={prevStep}
                                    duration={bookingData.serviceDuration || 60}
                                />
                            )}
                            {currentStep === 'products' && (
                                <ProductsStep
                                    selectedProducts={bookingData.products}
                                    onNext={(products) => {
                                        setBookingData(prev => ({ ...prev, products }));
                                        nextStep();
                                    }}
                                    onBack={prevStep}
                                />
                            )}
                            {currentStep === 'summary' && (
                                <SummaryStep
                                    data={bookingData}
                                    totalPrice={totalPrice}
                                    onBack={prevStep}
                                    onConfirm={handleConfirm}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="hidden lg:block">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="mb-4 font-semibold uppercase tracking-wider text-xs text-muted-foreground">Votre Réservation</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground text-xs">Lieu</span>
                                    <span className="font-medium">
                                        {bookingData.address ? `${bookingData.address.street}, ${bookingData.address.city}` : 'À définir'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground text-xs">Vélo</span>
                                    <span className="font-medium">{bookingData.bikeId ? 'Sélectionné' : 'À définir'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground text-xs">Service</span>
                                    <span className="font-medium">
                                        {bookingData.serviceName || (bookingData.serviceId ? 'Sélectionné' : 'À définir')}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground text-xs">Date</span>
                                    <span className="font-medium">
                                        {bookingData.date ? format(bookingData.date, 'P', { locale: fr }) : 'À définir'}
                                        {bookingData.slot && ` (${bookingData.slot})`}
                                    </span>
                                </div>
                                {bookingData.products.length > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted-foreground text-xs">Produits</span>
                                        <span className="font-medium">{bookingData.products.length} produit(s)</span>
                                    </div>
                                )}
                                {totalPrice > 0 && (
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">Total</span>
                                            <span className="font-bold text-primary">{totalPrice.toFixed(2)}€</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}