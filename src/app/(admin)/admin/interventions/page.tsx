'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Filter,
    MoreHorizontal,
    MapPin,
    Calendar,
    User,
    ClipboardList,
    UserPlus,
    XCircle,
    CheckCircle2,
    Clock,
    Navigation,
    Download
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AssignTechnicianDialog } from '@/components/admin/assign-technician-dialog';
import { CreateInterventionDialog } from '@/components/admin/create-intervention-dialog';
import { toast } from 'sonner';
export default function AdminInterventionsPage() {
    const queryClient = useQueryClient();
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const { data: interventions = [], isLoading } = useQuery({
        queryKey: ['admin-interventions-list'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/interventions');
            return data.data;
        },
    });
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return axios.patch(`/api/admin/interventions/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-interventions-list'] });
            toast.success('Statut mis à jour');
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
            case 'CONFIRMED':
                return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Confirmée</Badge>;
            case 'IN_PROGRESS':
                return <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 animate-pulse"><Navigation className="h-3 w-3 mr-1" /> En cours</Badge>;
            case 'COMPLETED':
                return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Terminée</Badge>;
            case 'CANCELLED':
                return <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">Annulée</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };
    const handleExportCSV = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'ALL') params.set('status', statusFilter);
            const response = await fetch(`/api/admin/export?${params.toString()}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `interventions_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Export CSV téléchargé');
        } catch {
            toast.error('Erreur lors de l\'export');
        }
    };
    const filteredInterventions = interventions.filter((i: any) => {
        if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const clientName = (i.client?.name || '').toLowerCase();
            const city = (i.city || '').toLowerCase();
            const forfait = (i.forfait?.name || '').toLowerCase();
            if (!clientName.includes(q) && !city.includes(q) && !forfait.includes(q)) return false;
        }
        return true;
    });
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight italic font-black uppercase">Gestion des Interventions</h1>
                    <p className="text-muted-foreground">Suivez et gérez l'ensemble des interventions du réseau.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                        <Download className="h-4 w-4" />
                        Exporter CSV
                    </Button>
                    <Button className="gap-2 font-black italic uppercase tracking-tighter" onClick={() => setCreateDialogOpen(true)}>
                        <ClipboardList className="h-4 w-4" />
                        Nouvelle Intervention
                    </Button>
                </div>
            </div>
            <Card className="border-2 border-primary/5 shadow-xl">
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une intervention, un client..."
                                className="pl-10 bg-muted/30 border-primary/10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="border rounded-md px-3 py-2 text-sm bg-background"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="PENDING">En attente</option>
                            <option value="CONFIRMED">Confirmée</option>
                            <option value="IN_PROGRESS">En cours</option>
                            <option value="COMPLETED">Terminée</option>
                            <option value="CANCELLED">Annulée</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                <p className="text-sm font-bold text-primary animate-pulse italic uppercase">Chargement du planning...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr className="text-left font-bold uppercase text-[11px] tracking-widest text-muted-foreground">
                                        <th className="p-4">Date & Heure</th>
                                        <th className="p-4">Client</th>
                                        <th className="p-4">Service</th>
                                        <th className="p-4">Technicien</th>
                                        <th className="p-4">Ville</th>
                                        <th className="p-4">Statut</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInterventions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-muted-foreground italic">
                                                Aucune intervention trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInterventions.map((i: any) => (
                                            <tr key={i.id} className="border-b hover:bg-primary/5 transition-colors group">
                                                <td className="p-4">
                                                    <div className="font-bold text-foreground underline decoration-primary/30 decoration-2 underline-offset-4">{format(new Date(i.scheduledAt), 'dd/MM/yyyy')}</div>
                                                    <div className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {format(new Date(i.scheduledAt), 'HH:mm')}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs">
                                                            {(i.client.name || 'C').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{i.client.name || 'Client'}</div>
                                                            <div className="text-[10px] text-muted-foreground">{i.city}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-bold">
                                                        {i.forfait.name}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    {i.technician ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-500">
                                                                {i.technician.name?.charAt(0)}
                                                            </div>
                                                            <span className="font-medium text-xs">{i.technician.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-yellow-600 font-bold bg-yellow-500/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                                                            Non assigné
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-muted-foreground font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-primary" />
                                                        {i.city}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(i.status)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 group-hover:bg-primary/10 border border-transparent group-hover:border-primary/20">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56 border-2">
                                                            <DropdownMenuLabel className="font-black italic uppercase text-[10px] tracking-widest text-muted-foreground">Actions intervention</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="gap-2 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold"
                                                                onClick={() => {
                                                                    setSelectedIntervention(i);
                                                                    setAssignDialogOpen(true);
                                                                }}
                                                            >
                                                                <UserPlus className="h-4 w-4" />
                                                                Assigner un technicien
                                                            </DropdownMenuItem>
                                                            {i.status === 'PENDING' && (
                                                                <DropdownMenuItem
                                                                    className="gap-2 focus:bg-blue-500/10 focus:text-blue-500 cursor-pointer font-bold"
                                                                    onClick={() => updateStatusMutation.mutate({ id: i.id, status: 'CONFIRMED' })}
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                    Confirmer sans technicien
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-bold"
                                                                onClick={() => {
                                                                    if (confirm('Voulez-vous vraiment annuler cette intervention ?')) {
                                                                        updateStatusMutation.mutate({ id: i.id, status: 'CANCELLED' });
                                                                    }
                                                                }}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                                Annuler l'intervention
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
            {selectedIntervention && (
                <AssignTechnicianDialog
                    open={assignDialogOpen}
                    onOpenChange={setAssignDialogOpen}
                    intervention={selectedIntervention}
                />
            )}
            <CreateInterventionDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </div>
    );
}
