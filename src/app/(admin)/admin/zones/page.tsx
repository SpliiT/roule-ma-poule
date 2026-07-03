'use client';
import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, X, Map, Globe } from 'lucide-react';
import { toast } from 'sonner';

import { useZones, useSaveZone, useDeleteZone } from '@/hooks/useZones';
import { useTechnicians } from '@/hooks/useTechnicians';
import { ZoneMap } from '@/components/admin/zones/ZoneMap';
import { ZoneList } from '@/components/admin/zones/ZoneList';
import { ZoneDeleteModal } from '@/components/admin/zones/ZoneDeleteModal';
import { ZoneForm } from '@/components/admin/zones/ZoneForm';
import { parseGeometry } from '@/lib/mapUtils';

export default function AdminZonesPage() {
    // Queries
    const { data: zones = [], isLoading: isZonesLoading } = useZones();
    const { data: technicians = [] } = useTechnicians();

    // State
    const [mode, setMode] = useState<'idle' | 'create' | 'edit'>('idle');
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [zoneToDelete, setZoneToDelete] = useState<any>(null);
    const [mapStyle, setMapStyle] = useState<'plan' | 'satellite'>('plan');
    const [showOtherZones, setShowOtherZones] = useState(false);
    
    // Form State
    const [zoneName, setZoneName] = useState('');
    const [zoneColor, setZoneColor] = useState('#3B82F6');
    const [zoneDescription, setZoneDescription] = useState('');
    const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
    const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
    
    // Map Controller
    const mapControllerRef = useRef<any>(null);

    // Mutations
    const resetForm = useCallback(() => {
        setMode('idle');
        setSelectedZoneId(null);
        setZoneName('');
        setZoneColor('#3B82F6');
        setZoneDescription('');
        setSelectedTechIds([]);
        setDrawnGeometry(null);
        mapControllerRef.current?.deleteAll();
    }, []);

    const saveMutation = useSaveZone(mode, resetForm);
    const deleteMutation = useDeleteZone(() => setZoneToDelete(null));

    // Actions
    const startCreate = useCallback(() => {
        resetForm();
        setMode('create');
        setShowOtherZones(false);
        mapControllerRef.current?.changeMode('draw_polygon');
    }, [resetForm]);

    const startEdit = useCallback((zone: any) => {
        setMode('edit');
        setSelectedZoneId(zone.id);
        setShowOtherZones(false);
        setZoneName(zone.name);
        setZoneColor(zone.color || '#3B82F6');
        setZoneDescription(zone.description || '');
        setSelectedTechIds(
            (zone.technicians || []).map((tz: any) => tz.technician?.id || tz.technicianId)
        );
        mapControllerRef.current?.deleteAll();
        
        const geo = parseGeometry(zone.geometry);
        if (geo) {
            const ids = mapControllerRef.current?.addGeometry(geo);
            if (ids?.length) {
                setDrawnGeometry(geo.geometry || geo);
                setTimeout(() => {
                    mapControllerRef.current?.changeMode('direct_select', { featureId: ids[0] });
                }, 50);
            }
            // Fit bounds
            import('maplibre-gl').then(maplibregl => {
                const bounds = new maplibregl.default.LngLatBounds();
                const coords = (geo.geometry || geo).coordinates?.[0] || (geo.coordinates?.[0]);
                if (coords) {
                    coords.forEach((c: number[]) => bounds.extend(c as [number, number]));
                    mapControllerRef.current?.fitBounds(bounds, { padding: 80, pitch: 60, bearing: -30 });
                }
            });
        }
    }, []);

    const handleSave = () => {
        if (!zoneName.trim()) {
            toast.error('Veuillez donner un nom à la zone');
            return;
        }
        let geometry = drawnGeometry;
        const allFeatures = mapControllerRef.current?.getAllFeatures();
        if (allFeatures?.features?.length > 0) {
            geometry = allFeatures.features[0].geometry;
        }
        if (!geometry) {
            toast.error('Veuillez dessiner la zone sur la carte');
            return;
        }
        saveMutation.mutate({
            ...(mode === 'edit' && { id: selectedZoneId }),
            name: zoneName.trim(),
            color: zoneColor,
            description: zoneDescription.trim() || null,
            geometry: JSON.stringify(geometry),
            technicianIds: selectedTechIds,
        });
    };

    const toggleTech = (techId: string) => {
        setSelectedTechIds((prev) =>
            prev.includes(techId)
                ? prev.filter((id) => id !== techId)
                : [...prev, techId]
        );
    };

    const formProps = {
        zoneName, setZoneName,
        zoneColor, setZoneColor,
        zoneDescription, setZoneDescription,
        selectedTechIds, toggleTech,
        technicians,
        showOtherZones, setShowOtherZones,
        handleSave, isSaving: saveMutation.isPending
    };

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-6rem)]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Zones Géographiques</h1>
                    <p className="text-muted-foreground text-sm">
                        Dessinez et gérez les périmètres d'intervention.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary gap-1">
                        <Layers className="h-3 w-3" /> {zones.length} zone(s)
                    </Badge>
                    {mode === 'idle' ? (
                        <Button className="gap-2" onClick={startCreate}>
                            <Plus className="h-4 w-4" /> Nouvelle zone
                        </Button>
                    ) : (
                        <Button variant="ghost" className="gap-2" onClick={resetForm}>
                            <X className="h-4 w-4" /> Annuler
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
                {/* Panel Gauche (Carte) */}
                <Card className="lg:col-span-3 overflow-hidden border-2 border-primary/10 relative">
                    <CardContent className="p-0 h-full">
                        <ZoneMap
                            zones={zones}
                            mode={mode}
                            mapStyle={mapStyle}
                            selectedZoneId={selectedZoneId}
                            showOtherZones={showOtherZones}
                            drawnGeometry={drawnGeometry}
                            activeColor={zoneColor}
                            onGeometryUpdate={setDrawnGeometry}
                            onZoneClick={(zone) => {
                                if (selectedZoneId === zone.id) resetForm();
                                else startEdit(zone);
                            }}
                            mapControllerRef={mapControllerRef}
                        />
                    </CardContent>
                </Card>

                {/* Panel Droit (Liste & Forms) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-1">
                    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-2 flex gap-2">
                            <Button
                                variant={mapStyle === 'plan' ? 'default' : 'outline'}
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => setMapStyle('plan')}
                            >
                                <Map className="h-4 w-4" /> Plan
                            </Button>
                            <Button
                                variant={mapStyle === 'satellite' ? 'default' : 'outline'}
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => setMapStyle('satellite')}
                            >
                                <Globe className="h-4 w-4" /> Satellite
                            </Button>
                        </CardContent>
                    </Card>

                    {mode === 'create' && (
                        <ZoneForm {...formProps} mode="create" />
                    )}

                    <ZoneList
                        zones={zones}
                        isLoading={isZonesLoading}
                        mode={mode}
                        selectedZoneId={selectedZoneId}
                        onStartEdit={startEdit}
                        onResetForm={resetForm}
                        onDeleteRequest={setZoneToDelete}
                        formProps={formProps}
                    />
                </div>
            </div>

            <ZoneDeleteModal
                zoneToDelete={zoneToDelete}
                onClose={() => setZoneToDelete(null)}
                onConfirm={(id) => deleteMutation.mutate(id)}
            />
        </div>
    );
}
