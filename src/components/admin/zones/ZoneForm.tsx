import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Trash2, Pencil, Users, Eye } from 'lucide-react';

interface Props {
    mode: 'create' | 'edit';
    zoneName: string;
    setZoneName: (val: string) => void;
    zoneColor: string;
    setZoneColor: (val: string) => void;
    zoneDescription: string;
    setZoneDescription: (val: string) => void;
    selectedTechIds: string[];
    toggleTech: (id: string) => void;
    technicians: any[];
    showOtherZones?: boolean;
    setShowOtherZones?: (val: boolean) => void;
    handleSave: () => void;
    isSaving: boolean;
    handleDelete?: () => void;
}

export function ZoneForm({ 
    mode, 
    zoneName, setZoneName, 
    zoneColor, setZoneColor, 
    zoneDescription, setZoneDescription, 
    selectedTechIds, toggleTech, 
    technicians, 
    showOtherZones, setShowOtherZones, 
    handleSave, isSaving, 
    handleDelete
}: Props) {
    return (
        <Card className={`border-primary/30 mt-1 bg-card/80 backdrop-blur-sm ${mode === 'edit' ? 'ml-4' : ''}`}>
            <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Pencil className="h-3.5 w-3.5 text-primary" />
                    {mode === 'create' ? 'Nouvelle zone' : 'Modifier la zone'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Nom</Label>
                    <Input
                        value={zoneName}
                        onChange={(e) => setZoneName(e.target.value)}
                        placeholder="Ex: Lyon Nord"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Couleur</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            className="w-10 h-9 p-0.5 cursor-pointer"
                            value={zoneColor}
                            onChange={(e) => setZoneColor(e.target.value)}
                        />
                        <Input
                            value={zoneColor}
                            readOnly
                            className="flex-1 font-mono text-xs"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Description</Label>
                    <Input
                        placeholder="Optionnel"
                        value={zoneDescription}
                        onChange={(e) => setZoneDescription(e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold flex items-center gap-1">
                        <Users className="h-3 w-3" /> Techniciens
                    </Label>
                    {technicians.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Aucun</p>
                    ) : (
                        <div className="space-y-1 max-h-36 overflow-y-auto rounded-md border p-2 bg-background/50">
                            {technicians.map((tech: any) => (
                                <label key={tech.id} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-primary/10 cursor-pointer transition-colors text-xs">
                                    <input
                                        type="checkbox"
                                        className="accent-primary"
                                        checked={selectedTechIds.includes(tech.id)}
                                        onChange={() => toggleTech(tech.id)}
                                    />
                                    <span className="truncate">{tech.name || tech.email}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {mode === 'edit' && setShowOtherZones && (
                    <div className="flex items-center space-x-2 pt-1 pb-1 bg-background/50 p-2 rounded-md border border-primary/10">
                        <Switch 
                            id="show-others" 
                            checked={showOtherZones} 
                            onCheckedChange={setShowOtherZones} 
                            className="data-[state=unchecked]:bg-zinc-800 border border-primary/40 data-[state=checked]:border-primary"
                        />
                        <Label htmlFor="show-others" className="text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" /> Afficher les autres zones
                        </Label>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <Button className="flex-1 gap-2 h-8 text-xs" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                        Sauvegarder
                    </Button>
                    {mode === 'edit' && handleDelete && (
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={handleDelete}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
