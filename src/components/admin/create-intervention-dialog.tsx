'use client';
import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CalendarIcon, MapPin, Wrench, User, Bike, Search, Clock, Zap, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleAddressAutocomplete } from '@/components/maps/google-address-autocomplete';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
export function CreateInterventionDialog({ open, onOpenChange }: Props) {
    const queryClient = useQueryClient();
    const [clientId, setClientId] = useState('');
    const [forfaitId, setForfaitId] = useState('');
    const [bikeId, setBikeId] = useState('');
    const [technicianId, setTechnicianId] = useState('');
    const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
    const [selectedHour, setSelectedHour] = useState('10');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [city, setCity] = useState('');
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [clientNotes, setClientNotes] = useState('');
    const { data: users = [], isLoading: isLoadingUsers } = useQuery<any[]>({
        queryKey: ['admin-users-all'],
        queryFn: async () => {
            try {
                const response = await axios.get('/api/admin/users');
                const usersList = response.data.data || [];
                console.log('Admin users list fetched:', usersList.length, 'users');
                return usersList;
            } catch (error) {
                console.error('Failed to fetch admin users:', error);
                return [];
            }
        },
        enabled: open,
    });
    const clients = users.filter((u: any) => u.role === 'CLIENT');
    const technicians = users.filter((u: any) => u.role === 'TECHNICIEN');
    const { data: forfaits = [] } = useQuery<any[]>({
        queryKey: ['forfaits'],
        queryFn: async () => {
            const { data } = await axios.get('/api/forfaits');
            return data.data || [];
        },
        enabled: open,
    });
    const { data: bikes = [] } = useQuery<any[]>({
        queryKey: ['client-bikes', clientId],
        queryFn: async () => {
            if (!clientId) return [];
            const { data } = await axios.get(`/api/admin/users/${clientId}`);
            return data.data?.bikes || [];
        },
        enabled: open && !!clientId,
    });
    useEffect(() => {
        setBikeId('');
    }, [clientId]);
    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            return axios.post('/api/admin/interventions', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-interventions-list'] });
            toast.success('Intervention créée avec succès');
            resetForm();
            onOpenChange(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Erreur lors de la création');
        },
    });
    const resetForm = () => {
        setClientId('');
        setForfaitId('');
        setBikeId('');
        setTechnicianId('');
        setScheduledAt(undefined);
        setSelectedHour('10');
        setSelectedMinute('00');
        setAddress('');
        setPostalCode('');
        setCity('');
        setLatitude(0);
        setLongitude(0);
        setClientNotes('');
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const missingFields = [];
        if (!clientId) missingFields.push('Client');
        if (!forfaitId) missingFields.push('Forfait');
        if (!bikeId) missingFields.push('Vélo');
        if (!scheduledAt) missingFields.push('Date/Heure');
        if (!address) missingFields.push('Adresse');
        const finalPostalCode = postalCode || '69000'; 
        const finalCity = city || 'Lyon';
        if (missingFields.length > 0) {
            toast.error(`Champs manquants : ${missingFields.join(', ')}`);
            return;
        }
        const payload = {
            clientId,
            forfaitId,
            bikeId,
            technicianId: technicianId || null,
            scheduledAt: scheduledAt ? format(new Date(scheduledAt.setHours(parseInt(selectedHour), parseInt(selectedMinute))), "yyyy-MM-dd'T'HH:mm:ss") : null,
            address,
            postalCode: finalPostalCode,
            city: finalCity,
            latitude,
            longitude,
            clientNotes: clientNotes || null,
        };
        console.log('Submitting intervention:', payload);
        createMutation.mutate(payload);
    };
    const handleAddressSelect = useCallback((details: any) => {
        console.log('Address selected details:', details);
        setAddress(details.street);
        setCity(details.city);
        setPostalCode(details.postalCode);
        setLatitude(details.latitude);
        setLongitude(details.longitude);
    }, []);
    const selectedForfait = forfaits.find((f: any) => f.id === forfaitId);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Wrench className="h-5 w-5 text-primary" />
                        Nouvelle Intervention
                    </DialogTitle>
                    <DialogDescription>
                        Créez une intervention manuellement pour un client.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    {}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                            <User className="h-3 w-3" /> Client *
                        </Label>
                        <select
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                        >
                            <option value="">Sélectionner un client</option>
                            {clients.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.name || c.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    {}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                            <Bike className="h-3 w-3" /> Vélo *
                        </Label>
                        <select
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                            value={bikeId}
                            onChange={(e) => setBikeId(e.target.value)}
                            required
                            disabled={!clientId}
                        >
                            <option value="">
                                {clientId
                                    ? bikes.length > 0
                                        ? 'Sélectionner un vélo'
                                        : 'Aucun vélo enregistré'
                                    : 'Choisissez d\'abord un client'}
                            </option>
                            {bikes.map((b: any) => (
                                <option key={b.id} value={b.id}>
                                    {b.brand} {b.model} {b.isElectric ? <Zap className="inline h-3 w-3 text-yellow-500 ml-1 fill-yellow-500" /> : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    {}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                            <Wrench className="h-3 w-3" /> Forfait *
                        </Label>
                        <select
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                            value={forfaitId}
                            onChange={(e) => setForfaitId(e.target.value)}
                            required
                        >
                            <option value="">Sélectionner un forfait</option>
                            {forfaits.map((f: any) => (
                                <option key={f.id} value={f.id}>
                                    {f.name} — {Number(f.price).toFixed(2)}€ ({f.duration} min)
                                </option>
                            ))}
                        </select>
                        {selectedForfait && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                <Banknote className="h-3 w-3 text-green-600" /> {Number(selectedForfait.price).toFixed(2)}€
                                <span className="text-muted-foreground/30">•</span>
                                <Clock className="h-3 w-3" /> {selectedForfait.duration} min
                            </p>
                        )}
                    </div>
                    {}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                            <User className="h-3 w-3" /> Technicien (optionnel)
                        </Label>
                        <select
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                            value={technicianId}
                            onChange={(e) => setTechnicianId(e.target.value)}
                        >
                            <option value="">Non assigné</option>
                            {technicians.map((t: any) => (
                                <option key={t.id} value={t.id}>
                                    {t.name || t.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    {}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" /> Date et heure *
                        </Label>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "flex-1 justify-start text-left font-normal",
                                            !scheduledAt && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {scheduledAt ? (
                                            format(scheduledAt, "PPP", { locale: fr })
                                        ) : (
                                            <span>Choisir une date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={scheduledAt}
                                        onSelect={setScheduledAt}
                                        initialFocus
                                        locale={fr}
                                    />
                                </PopoverContent>
                            </Popover>
                            <div className="flex items-center gap-1 border rounded-md px-2 bg-background">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Select value={selectedHour} onValueChange={setSelectedHour}>
                                    <SelectTrigger className="w-[70px] border-0 focus:ring-0 shadow-none">
                                        <SelectValue placeholder="H" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                                {i.toString().padStart(2, '0')}h
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="text-muted-foreground">:</span>
                                <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                                    <SelectTrigger className="w-[70px] border-0 focus:ring-0 shadow-none">
                                        <SelectValue placeholder="M" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['00', '15', '30', '45'].map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    {}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Adresse *
                        </Label>
                        <GoogleAddressAutocomplete
                            onAddressSelect={handleAddressSelect}
                            defaultValue={address}
                        />
                    </div>
                    {}
                    <div className="min-h-[40px]">
                        {(city || postalCode || address) ? (
                            <div className="px-3 py-2 bg-green-500/5 rounded border border-green-500/20 flex flex-col gap-1 text-[11px]">
                                <div className="flex items-center gap-2 text-green-600 font-bold">
                                    <MapPin className="h-3 w-3" />
                                    <span>Lieu détecté et prêt : {address}</span>
                                </div>
                                <div className="pl-5 text-muted-foreground italic">
                                    {postalCode} {city} — Lyon Zone Auto-restreinte
                                </div>
                            </div>
                        ) : (
                            <div className="px-3 py-2 bg-muted/20 rounded border border-dashed flex items-center gap-2 text-[10px] text-muted-foreground animate-pulse">
                                <Search className="h-3 w-3" />
                                <span>En attente de sélection d'une adresse...</span>
                            </div>
                        )}
                    </div>
                    {}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Notes</Label>
                        <textarea
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none min-h-[60px]"
                            placeholder="Notes sur le client ou l'intervention..."
                            value={clientNotes}
                            onChange={(e) => setClientNotes(e.target.value)}
                        />
                    </div>
                    {}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 gap-2"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                <Wrench className="h-4 w-4" />
                            )}
                            Créer l'intervention
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    );
}