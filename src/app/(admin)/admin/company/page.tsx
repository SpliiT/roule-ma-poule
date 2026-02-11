'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Building2,
    Upload,
    Save,
    Globe,
    MapPin,
    Phone,
    Mail,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
export default function AdminCompanyPage() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        siret: '',
        logo: '',
    });
    const { data: company, isLoading } = useQuery<any>({
        queryKey: ['admin-company'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/company');
            return data.data;
        },
    });
    useEffect(() => {
        if (company) {
            setForm({
                name: company.name || '',
                description: company.description || '',
                address: company.address || '',
                phone: company.phone || '',
                email: company.email || '',
                website: company.website || '',
                siret: company.siret || '',
                logo: company.logo || '',
            });
        }
    }, [company]);
    const saveMutation = useMutation({
        mutationFn: async (data: typeof form) => {
            const { data: result } = await axios.patch('/api/admin/company', data);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-company'] });
            toast.success('Informations entreprise sauvegardées');
        },
        onError: () => toast.error('Erreur lors de la sauvegarde'),
    });
    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };
    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profil Entreprise</h1>
                    <p className="text-muted-foreground">Configurez les informations légales et publiques de l'entreprise.</p>
                </div>
                <Button
                    className="gap-2"
                    onClick={() => saveMutation.mutate(form)}
                    disabled={saveMutation.isPending}
                >
                    {saveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm">Logo & Identité</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4 text-center">
                        <div className="h-32 w-32 rounded-full border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden">
                            {form.logo ? (
                                <img src={form.logo} alt="Logo" className="h-full w-full object-contain" />
                            ) : (
                                <Building2 className="h-12 w-12 text-muted-foreground" />
                            )}
                        </div>
                        <CloudinaryUpload
                            onUpload={(urls) => handleChange('logo', urls[0])}
                            folder="company"
                            buttonText="Modifier le logo"
                            className="w-full"
                        />
                        <p className="text-[10px] text-muted-foreground">Format JPG, PNG ou SVG. Max 2Mo.</p>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm">Informations Générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Nom de l'entreprise</Label>
                            <Input
                                id="companyName"
                                value={form.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="siret">SIRET</Label>
                            <Input
                                id="siret"
                                value={form.siret}
                                onChange={(e) => handleChange('siret', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description courte</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Spécialiste de la réparation de vélos à domicile..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Coordonnées de Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email de contact</Label>
                        <div className="relative">
                            <Input
                                id="contactEmail"
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="pl-10"
                            />
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <div className="relative">
                            <Input
                                id="phone"
                                value={form.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="pl-10"
                            />
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="website">Site web</Label>
                        <div className="relative">
                            <Input
                                id="website"
                                value={form.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                className="pl-10"
                            />
                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Siège Social</Label>
                        <div className="relative">
                            <Input
                                id="address"
                                value={form.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="pl-10"
                            />
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
