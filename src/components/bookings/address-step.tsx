'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressFormSchema, type AddressFormFormValues } from '../../lib/validations/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { GoogleAddressAutocomplete } from '@/components/maps/google-address-autocomplete';

interface AddressStepProps {
    onNext: (address: AddressFormFormValues) => void;
}

export function AddressStep({ onNext }: AddressStepProps) {
    const form = useForm<AddressFormFormValues>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            street: '',
            postalCode: '',
            city: 'Lyon',
            latitude: 45.764043,
            longitude: 4.835659,
            isDefault: true,
            label: '',
            addressComplement: '',
        },
    });

    const onSubmit = (values: AddressFormFormValues) => {
        onNext(values);
    };

    const handleAddressSelect = (address: {
        street: string;
        city: string;
        postalCode: string;
        latitude: number;
        longitude: number;
    }) => {
        form.setValue('street', address.street);
        form.setValue('city', address.city);
        form.setValue('postalCode', address.postalCode);
        form.setValue('latitude', address.latitude);
        form.setValue('longitude', address.longitude);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
                <MapPin className="text-primary h-5 w-5" />
                <h2 className="text-xl font-semibold">Où doit-on intervenir ?</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adresse (Rue et numéro)</FormLabel>
                                <FormControl>
                                    <GoogleAddressAutocomplete
                                        defaultValue={field.value}
                                        onAddressSelect={handleAddressSelect}
                                        className="pr-10"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code Postal</FormLabel>
                                    <FormControl>
                                        <Input placeholder="69XXX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ville</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Lyon, Villeurbanne..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="bg-muted/30 rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                            Note: Pour le moment, nous intervenons uniquement sur la métropole de Lyon.
                        </p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="gap-2">
                            Continuer
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
