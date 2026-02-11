'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Calendar, Plus, Clock, Trash2, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAY_COLORS = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-orange-100 text-orange-800',
];
interface Planning {
    id: string;
    zoneId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
    zone: { id: string; name: string; color: string };
}
interface Zone {
    id: string;
    name: string;
    color: string;
}
export default function AdminPlanningPage() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');
    const { data: plannings = [], isLoading } = useQuery({
        queryKey: ['admin-plannings'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/planning');
            return data.data as Planning[];
        },
    });
    const { data: zones = [] } = useQuery({
        queryKey: ['admin-zones-list'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/zones');
            return data.data as Zone[];
        },
    });
    const createPlanning = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await axios.post('/api/admin/planning', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plannings'] });
            toast.success('Créneau ajouté');
            closeDialog();
        },
        onError: () => toast.error('Erreur lors de la création'),
    });
    const deletePlanning = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/api/admin/planning/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plannings'] });
            toast.success('Créneau supprimé');
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });
    function closeDialog() {
        setDialogOpen(false);
        setSelectedZone('');
        setSelectedDay('');
        setStartTime('09:00');
        setEndTime('18:00');
    }
    function handleSubmit() {
        if (!selectedZone || selectedDay === '' || !startTime || !endTime) return;
        createPlanning.mutate({
            zoneId: selectedZone,
            dayOfWeek: parseInt(selectedDay),
            startTime,
            endTime,
        });
    }
    const groupedByZone = plannings.reduce((acc: Record<string, Planning[]>, p: Planning) => {
        const key = p.zone?.name || 'Sans zone';
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
    }, {});
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Planning</h1>
                    <p className="text-muted-foreground">Définissez les créneaux d'intervention par zone et par jour.</p>
                </div>
                <Button className="gap-2" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Ajouter un créneau
                </Button>
            </div>
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {Array(4).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse"><div className="h-32 bg-muted rounded-lg" /></Card>
                    ))}
                </div>
            ) : Object.keys(groupedByZone).length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                        <Calendar className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Aucun créneau défini</p>
                        <p className="text-sm mt-1">Commencez par ajouter des créneaux d'intervention à vos zones.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {Object.entries(groupedByZone).map(([zoneName, slots]) => (
                        <Card key={zoneName}>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    {zoneName}
                                    <Badge variant="outline" className="ml-auto">
                                        {slots.length} créneau{slots.length > 1 ? 'x' : ''}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {slots
                                        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                                        .map((slot) => (
                                            <div key={slot.id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={`text-xs ${DAY_COLORS[slot.dayOfWeek]}`}>
                                                        {DAYS[slot.dayOfWeek].substring(0, 3)}
                                                    </Badge>
                                                    <div className="flex items-center gap-1.5 text-sm font-medium">
                                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {slot.startTime} – {slot.endTime}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => deletePlanning.mutate(slot.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter un créneau</DialogTitle>
                        <DialogDescription>
                            Définissez un créneau d'intervention pour une zone donnée.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Zone</Label>
                            <Select value={selectedZone} onValueChange={setSelectedZone}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une zone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {zones.map((z: Zone) => (
                                        <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Jour de la semaine</Label>
                            <Select value={selectedDay} onValueChange={setSelectedDay}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un jour" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map((day, i) => (
                                        <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Heure de début</Label>
                                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Heure de fin</Label>
                                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={closeDialog}>Annuler</Button>
                        <Button onClick={handleSubmit} disabled={createPlanning.isPending || !selectedZone || selectedDay === ''}>
                            {createPlanning.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}