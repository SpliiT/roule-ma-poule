'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressFormSchema, type AddressFormFormValues } from '../../lib/validations/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { GoogleAddressAutocomplete } from '@/components/maps/google-address-autocomplete';
import axios from 'axios';
import * as turf from '@turf/turf';
import { parseGeometry } from '@/lib/mapUtils';

interface AddressStepProps {
    onNext: (address: AddressFormFormValues) => void;
}

export function AddressStep({ onNext }: AddressStepProps) {
    const [zones, setZones] = useState<any[]>([]);
    const [bounds, setBounds] = useState<{ north: number; south: number; east: number; west: number } | undefined>();

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

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const { data } = await axios.get('/api/zones/public');
                const activeZones = data.data || [];
                setZones(activeZones);

                if (activeZones.length > 0) {
                    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
                    let hasBounds = false;
                    
                    activeZones.forEach((zone: any) => {
                        const geo = parseGeometry(zone.geometry);
                        if (geo) {
                            try {
                                const bbox = turf.bbox(geo);
                                if (bbox[0] < minLng) minLng = bbox[0];
                                if (bbox[1] < minLat) minLat = bbox[1];
                                if (bbox[2] > maxLng) maxLng = bbox[2];
                                if (bbox[3] > maxLat) maxLat = bbox[3];
                                hasBounds = true;
                            } catch (e) {
                                console.error('Error computing bounding box for zone', e);
                            }
                        }
                    });

                    if (hasBounds) {
                        setBounds({
                            north: maxLat,
                            south: minLat,
                            east: maxLng,
                            west: minLng
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching zones:', err);
            }
        };
        fetchZones();
    }, []);

    const onSubmit = (values: AddressFormFormValues) => {
        // If there is an error on street (like not covered), don't submit
        if (form.getFieldState('street').invalid) return;
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
        form.clearErrors('street');

        if (zones.length > 0) {
            const pt = turf.point([address.longitude, address.latitude]);
            let isInside = false;

            for (const zone of zones) {
                const geo = parseGeometry(zone.geometry);
                if (!geo) continue;
                
                try {
                    if (geo.type === 'FeatureCollection') {
                        for (const feature of geo.features) {
                            if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                                if (turf.booleanPointInPolygon(pt, feature.geometry)) {
                                    isInside = true;
                                    break;
                                }
                            }
                        }
                    } else if (geo.type === 'Feature') {
                        if (geo.geometry.type === 'Polygon' || geo.geometry.type === 'MultiPolygon') {
                            if (turf.booleanPointInPolygon(pt, geo.geometry)) {
                                isInside = true;
                            }
                        }
                    } else if (geo.type === 'Polygon' || geo.type === 'MultiPolygon') {
                        if (turf.booleanPointInPolygon(pt, geo)) {
                            isInside = true;
                        }
                    }
                } catch (e) {
                    console.error('Error checking point in polygon', e);
                }
                
                if (isInside) break;
            }

            if (!isInside) {
                form.setError('street', { type: 'manual', message: 'Zone non couverte par nos services.' });
            }
        }
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
                                        bounds={bounds}
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
                            Note: Pour le moment, nous intervenons uniquement sur les zones affichées comme couvertes.
                        </p>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="gap-2" disabled={!!form.formState.errors.street}>
                            Continuer
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}