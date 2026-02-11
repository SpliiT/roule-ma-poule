'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCheck, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
interface AssignTechnicianDialogProps {
    intervention: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
export function AssignTechnicianDialog({
    intervention,
    open,
    onOpenChange,
}: AssignTechnicianDialogProps) {
    const queryClient = useQueryClient();
    const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
    const { data: technicians = [], isLoading: loadingTechs } = useQuery({
        queryKey: ['admin-technicians'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/technicians');
            return data.data;
        },
        enabled: open,
    });
    const assignMutation = useMutation({
        mutationFn: async (techId: string) => {
            return axios.patch(`/api/admin/interventions/${intervention.id}`, {
                technicianId: techId,
                status: 'CONFIRMED',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-interventions-list'] });
            toast.success('Technicien assigné avec succès');
            onOpenChange(false);
        },
        onError: () => {
            toast.error("Erreur lors de l'assignation");
        },
    });
    const handleConfirm = () => {
        if (!selectedTechId) {
            toast.error('Veuillez sélectionner un technicien');
            return;
        }
        assignMutation.mutate(selectedTechId);
    };
    if (!intervention) return null;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 italic font-black uppercase tracking-tighter text-2xl">
                        <UserCheck className="h-6 w-6 text-primary" />
                        Assigner un Technicien
                    </DialogTitle>
                    <DialogDescription>
                        Sélectionnez un technicien pour l'intervention de <strong>{intervention.client.name}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {}
                    <div className="bg-muted/50 p-4 rounded-lg border border-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                                {format(new Date(intervention.scheduledAt), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">{intervention.address}, {intervention.city}</span>
                        </div>
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                            {intervention.forfait.name}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold uppercase italic tracking-wider text-muted-foreground">Techniciens disponibles</h4>
                        {loadingTechs ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : technicians.length === 0 ? (
                            <p className="text-sm text-center py-4 text-muted-foreground italic">Aucun technicien trouvé.</p>
                        ) : (
                            <div className="max-height-[300px] overflow-y-auto space-y-2 pr-2">
                                {technicians.map((tech: any) => (
                                    <div
                                        key={tech.id}
                                        onClick={() => setSelectedTechId(tech.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedTechId === tech.id
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-transparent bg-muted/30 hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                                {tech.name?.charAt(0) || 'T'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{tech.name}</p>
                                                <p className="text-xs text-muted-foreground">{tech.email}</p>
                                            </div>
                                        </div>
                                        {selectedTechId === tech.id && (
                                            <Badge className="bg-primary text-primary-foreground font-black italic uppercase text-[10px]">
                                                Sélectionné
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedTechId || assignMutation.isPending}
                        className="font-black italic uppercase tracking-tighter"
                    >
                        {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmer l'assignation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}