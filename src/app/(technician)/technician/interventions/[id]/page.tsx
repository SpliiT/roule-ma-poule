'use client';
import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft, Clock, MapPin, User, Bike, Settings, Package, Camera,
    Play, CheckCircle2, Euro, Loader2, UploadCloud, MessageSquare,
    Zap, XCircle, Timer, Phone, PartyPopper, Wrench
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    PENDING: { label: 'En attente', icon: <Timer className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: 'Confirmée', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    IN_PROGRESS: { label: 'En cours', icon: <Wrench className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
    COMPLETED: { label: 'Terminée', icon: <PartyPopper className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Annulée', icon: <XCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
};
export default function TechnicianInterventionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const { data: intervention, isLoading } = useQuery<any>({
        queryKey: ['tech-intervention', id],
        queryFn: async () => {
            const { data } = await axios.get(`/api/technician/interventions/${id}`);
            return data.data;
        },
        onSuccess: (data: any) => {
            if (data?.technicianNotes) setNotes(data.technicianNotes);
        },
    } as any);
    const updateIntervention = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await axios.patch(`/api/technician/interventions/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tech-intervention', id] });
            toast.success('Intervention mise à jour');
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });
    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    if (!intervention) {
        return (
            <div className="space-y-4">
                <p className="text-muted-foreground">Intervention introuvable</p>
                <Link href="/technician/interventions/today"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" /> Retour</Button></Link>
            </div>
        );
    }
    const statusInfo = STATUS_CONFIG[intervention.status] || STATUS_CONFIG.PENDING;
    const isActive = ['CONFIRMED', 'IN_PROGRESS'].includes(intervention.status);
    const isCompleted = intervention.status === 'COMPLETED';
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/technician/interventions/today">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{intervention.forfait?.name || 'Intervention'}</h1>
                        <p className="text-muted-foreground text-sm">
                            {format(new Date(intervention.scheduledAt), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                    </div>
                </div>
                <Badge className={`text-sm px-3 py-1 flex items-center gap-1.5 ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.label}
                </Badge>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4 text-primary" /> Client</CardTitle></CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            <p><strong>{intervention.client?.name}</strong></p>
                            {intervention.client?.email && <p className="text-muted-foreground">{intervention.client.email}</p>}
                            {intervention.client?.phone && <p className="text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" /> {intervention.client.phone}</p>}
                        </CardContent>
                    </Card>
                    {}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4 text-primary" /> Localisation</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            <p>{intervention.address}, {intervention.postalCode} {intervention.city}</p>
                            <Link href={`/technician/gps/${id}`}>
                                <Button variant="outline" size="sm" className="mt-3 gap-2"><MapPin className="h-3.5 w-3.5" />Naviguer</Button>
                            </Link>
                        </CardContent>
                    </Card>
                    {}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Bike className="h-4 w-4 text-primary" /> Vélo</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            <p><strong>{intervention.bike?.brand} {intervention.bike?.model}</strong></p>
                            {intervention.bike?.type && <Badge variant="outline" className="mt-1">{intervention.bike.type}</Badge>}
                            {intervention.clientNotes && <p className="mt-2 text-muted-foreground italic">« {intervention.clientNotes} »</p>}
                        </CardContent>
                    </Card>
                    {}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="h-4 w-4 text-primary" /> Notes</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ajouter des notes sur l'intervention..."
                                rows={4}
                                disabled={isCompleted}
                            />
                            <Button
                                size="sm"
                                disabled={isCompleted || updateIntervention.isPending}
                                onClick={() => updateIntervention.mutate({ technicianNotes: notes })}
                            >
                                {updateIntervention.isPending && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                                Enregistrer les notes
                            </Button>
                        </CardContent>
                    </Card>
                    {}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Camera className="h-4 w-4 text-primary" /> Photos</CardTitle></CardHeader>
                        <CardContent>
                            {intervention.photos?.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {intervention.photos.map((url: string, i: number) => (
                                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                                            <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Aucune photo ajoutée</p>
                            )}
                            {!isCompleted && (
                                <div className="mt-3">
                                    <CloudinaryUpload
                                        multiple
                                        folder={`interventions/${id}`}
                                        onUpload={(urls) => updateIntervention.mutate({ photos: urls })}
                                        buttonText="Ajouter des photos"
                                        className="w-full sm:w-auto"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {}
                    {intervention.statusHistory?.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4 text-primary" /> Historique</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {intervention.statusHistory.map((h: any) => (
                                        <div key={h.id} className="flex items-start gap-3 text-sm">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                                            <div>
                                                <p className="font-medium">{STATUS_CONFIG[h.status]?.label || h.status}</p>
                                                {h.notes && <p className="text-muted-foreground text-xs">{h.notes}</p>}
                                                <p className="text-[10px] text-muted-foreground">
                                                    {format(new Date(h.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                {}
                <div className="space-y-6">
                    {}
                    {isActive && (
                        <Card className="border-primary/20">
                            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary fill-primary/20" /> Actions rapides</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {intervention.status === 'CONFIRMED' && (
                                    <Button
                                        className="w-full gap-2"
                                        onClick={() => updateIntervention.mutate({ status: 'IN_PROGRESS' })}
                                        disabled={updateIntervention.isPending}
                                    >
                                        <Play className="h-4 w-4" /> Démarrer l'intervention
                                    </Button>
                                )}
                                {intervention.status === 'IN_PROGRESS' && (
                                    <Button
                                        className="w-full gap-2"
                                        variant="default"
                                        onClick={() => updateIntervention.mutate({ status: 'COMPLETED' })}
                                        disabled={updateIntervention.isPending}
                                    >
                                        <CheckCircle2 className="h-4 w-4" /> Clôturer l'intervention
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                    {}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4 text-primary" /> Produits</CardTitle></CardHeader>
                        <CardContent>
                            {intervention.products?.length > 0 ? (
                                <div className="space-y-2">
                                    {intervention.products.map((p: any) => (
                                        <div key={p.id} className="flex justify-between text-sm">
                                            <span>{p.product?.name || 'Produit'} × {p.quantity}</span>
                                            <span className="font-medium">{(Number(p.priceAtTime) * p.quantity).toFixed(2)}€</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Aucun produit ajouté</p>
                            )}
                        </CardContent>
                    </Card>
                    {}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Euro className="h-4 w-4 text-primary" /> Paiement</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total</span>
                                <span className="text-xl font-bold text-primary">{Number(intervention.totalPrice).toFixed(2)}€</span>
                            </div>
                            <Separator />
                            {intervention.isPaid ? (
                                <Badge className="bg-green-100 text-green-800 w-full justify-center py-2 gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> Payé {intervention.paymentMethod && `(${intervention.paymentMethod})`}
                                </Badge>
                            ) : isActive ? (
                                <div className="space-y-3">
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger><SelectValue placeholder="Moyen de paiement" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CB">Carte bancaire</SelectItem>
                                            <SelectItem value="ESPECES">Espèces</SelectItem>
                                            <SelectItem value="CHEQUE">Chèque</SelectItem>
                                            <SelectItem value="VIREMENT">Virement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        disabled={!paymentMethod || updateIntervention.isPending}
                                        onClick={() => updateIntervention.mutate({ isPaid: true, paymentMethod })}
                                    >
                                        Enregistrer le paiement
                                    </Button>
                                </div>
                            ) : (
                                <Badge variant="outline" className="w-full justify-center py-2">Non payé</Badge>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}