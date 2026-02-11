'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bikeSchema, type BikeFormValues } from '@/lib/validations/auth';
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
import { Loader2, Save, Trash2, Sparkles } from 'lucide-react';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { BikeSearch } from '@/components/bikes/bike-search';

interface BikeFormProps {
    initialValues?: BikeFormValues;
    onSubmit: (values: BikeFormValues) => Promise<void>;
    isLoading?: boolean;
    title: string;
    description: string;
}

export function BikeForm({
    initialValues,
    onSubmit,
    isLoading,
    title,
    description
}: BikeFormProps) {
    const form = useForm<BikeFormValues>({
        resolver: zodResolver(bikeSchema),
        defaultValues: initialValues || {
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            type: 'CITY',
            isElectric: false,
            photoUrl: '',
        },
    });

    const handleBikeSelect = (bike: any) => {
        form.reset({
            ...form.getValues(),
            brand: bike.brand,
            model: bike.model,
            year: bike.year || new Date().getFullYear(),
            type: bike.type,
            isElectric: bike.isElectric,
            photoUrl: bike.photoUrl || form.getValues().photoUrl,
        });
    };

    return (
        <div className="space-y-8">
            {/* Magic Search Section */}
            {!initialValues && (
                <Card className="border-2 border-primary/20 shadow-md overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <h2 className="font-semibold">Recherche Intelligente</h2>
                    </div>
                    <CardContent className="p-6">
                        <BikeSearch onSelect={handleBikeSelect} />
                        <p className="text-xs text-muted-foreground mt-3 italic text-center">
                            En sélectionnant un vélo, la marque, le modèle, l'année et le type seront remplis pour vous.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Main Form Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{description}</p>
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
                                                value={field.value}
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
                                            <FormLabel>Année</FormLabel>
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
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/30">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Vélo à assistance électrique (VAE)</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Coché automatiquement s'il est identifié comme électrique.
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
                                                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed p-1">
                                                    <img src={field.value} alt="Aperçu du vélo" className="h-full w-full object-cover rounded-md" />
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => field.onChange('')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {field.value.includes('bikeindex.org') && (
                                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                                                            Image via BikeIndex
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <CloudinaryUpload
                                                    onUpload={(urls) => field.onChange(urls[0])}
                                                    folder="bikes"
                                                    buttonText="Ajouter une photo personnalisée"
                                                    className="w-full"
                                                />
                                            )}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" size="lg" className="w-full gap-2 sm:w-auto font-bold shadow-lg" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Save className="h-5 w-5" />
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
