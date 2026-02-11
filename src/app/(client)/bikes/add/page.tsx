'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bikeSchema, type BikeFormValues } from '@/lib/validations/auth';
import { useBikes } from '@/hooks/use-bikes';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BIKE_TYPES } from '@/types/bikes';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';

export default function AddBikePage() {
    const router = useRouter();
    const { createBike, isCreating } = useBikes();

    const form = useForm<BikeFormValues>({
        resolver: zodResolver(bikeSchema),
        defaultValues: {
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            type: 'CITY',
            isElectric: false,
            photoUrl: '',
        },
    });

    async function onSubmit(values: BikeFormValues) {
        try {
            await createBike(values);
            router.push('/bikes');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 gap-2 px-0 hover:bg-transparent">
                    <Link href="/bikes">
                        <ArrowLeft className="h-4 w-4" />
                        Retour à la liste
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Ajouter un vélo</h1>
                <p className="text-muted-foreground">Renseignez les détails de votre monture.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informations du vélo</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marque</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: Specialized, Decathlon..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="model"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Modèle</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: Rockrider, Sirrus..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type de vélo</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionnez un type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {BIKE_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Année (optionnel)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isElectric"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Vélo à assistance électrique (VAE)</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Cochez cette case s'il s'agit d'un vélo électrique.
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="photoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Photo du vélo</FormLabel>
                                        <FormControl>
                                            {field.value ? (
                                                <div className="relative aspect-video rounded-lg overflow-hidden border">
                                                    <img src={field.value} alt="Aperçu du vélo" className="h-full w-full object-cover" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-8 w-8"
                                                        onClick={() => field.onChange('')}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <CloudinaryUpload
                                                    onUpload={(urls) => field.onChange(urls[0])}
                                                    folder="bikes"
                                                    buttonText="Ajouter une photo"
                                                    className="w-full"
                                                />
                                            )}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-4">
                                <Button type="submit" className="w-full gap-2 sm:w-auto" disabled={isCreating}>
                                    {isCreating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Enregistrer le vélo
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
