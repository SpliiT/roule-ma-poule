import { Loader2, Users, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoneForm } from './ZoneForm';

interface Props {
    zones: any[];
    isLoading: boolean;
    mode: 'idle' | 'create' | 'edit';
    selectedZoneId: string | null;
    onStartEdit: (zone: any) => void;
    onResetForm: () => void;
    onDeleteRequest: (zone: any) => void;
    
    // Props passed down to ZoneForm
    formProps: any;
}

export function ZoneList({
    zones,
    isLoading,
    mode,
    selectedZoneId,
    onStartEdit,
    onResetForm,
    onDeleteRequest,
    formProps
}: Props) {
    return (
        <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground px-1">
                Zones existantes
            </h3>
            {isLoading && (
                <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin h-5 w-5 text-primary" />
                </div>
            )}
            {!isLoading && zones.length === 0 && (
                <p className="text-xs text-muted-foreground italic px-2">
                    Aucune zone créée.
                </p>
            )}
            {zones
                .filter((zone: any) => mode !== 'edit' || zone.id === selectedZoneId)
                .map((zone: any) => {
                    const isSelected = selectedZoneId === zone.id;
                    const techCount = zone.technicians?.length || 0;
                    return (
                        <div key={zone.id} className="flex flex-col gap-1">
                            <div
                                className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-border bg-card hover:border-primary/40'
                                }`}
                                onClick={() => {
                                    if (isSelected) {
                                        onResetForm();
                                    } else {
                                        onStartEdit(zone);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-1"
                                        style={{
                                            backgroundColor: zone.color,
                                            boxShadow: `0 0 0 2px ${zone.color}`,
                                        }}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">
                                            {zone.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {techCount > 0 && (
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                    <Users className="h-2.5 w-2.5" />
                                                    {techCount}
                                                </span>
                                            )}
                                            {zone.isActive ? (
                                                <Badge className="h-4 px-1.5 text-[9px] bg-green-500/10 text-green-600">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="h-4 px-1.5 text-[9px] bg-red-500/10 text-red-600">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartEdit(zone);
                                        }}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteRequest(zone);
                                        }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Inline Edit Form */}
                            {isSelected && mode === 'edit' && (
                                <ZoneForm {...formProps} mode="edit" handleDelete={() => onDeleteRequest(zone)} />
                            )}
                        </div>
                    );
                })}
        </div>
    );
}
