'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    Save,
    Trash2,
    MapPin,
    Layers,
    Pencil,
    Plus,
    X,
    Users,
    CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/confirm-modal';

const parseGeometry = (geometryStr: string) => {
    if (!geometryStr) return null;
    try {
        const parsed = JSON.parse(geometryStr);
        if (parsed.type === 'Polygon' || parsed.type === 'MultiPolygon') {
            return { type: 'Feature', geometry: parsed, properties: {} };
        }
        return parsed;
    } catch {
        return null;
    }
};
export default function AdminZonesPage() {
    const queryClient = useQueryClient();
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const drawRef = useRef<any>(null);
    const zonesLoadedRef = useRef(false);
    const [mode, setMode] = useState<'idle' | 'create' | 'edit'>('idle');
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [zoneToDelete, setZoneToDelete] = useState<any>(null);
    const [zoneName, setZoneName] = useState('');
    const [zoneColor, setZoneColor] = useState('#3B82F6');
    const [zoneDescription, setZoneDescription] = useState('');
    const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
    const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
    const { data: zones = [], isLoading } = useQuery<any[]>({
        queryKey: ['admin-zones'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/zones');
            return data.data;
        },
    });
    const { data: technicians = [] } = useQuery<any[]>({
        queryKey: ['admin-technicians'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/users');
            return (data.data || []).filter((u: any) => u.role === 'TECHNICIEN');
        },
    });
    const saveMutation = useMutation({
        mutationFn: async (payload: any) => {
            if (payload.id) {
                return axios.patch(`/api/admin/zones/${payload.id}`, payload);
            }
            return axios.post('/api/admin/zones', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-zones'] });
            toast.success(mode === 'edit' ? 'Zone mise à jour' : 'Zone créée');
            resetForm();
        },
        onError: () => toast.error('Erreur lors de la sauvegarde'),
    });
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => axios.delete(`/api/admin/zones/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-zones'] });
            toast.success('Zone supprimée');
            resetForm();
        },
        onError: () => toast.error('Erreur lors de la suppression'),
    });
    const resetForm = useCallback(() => {
        setMode('idle');
        setSelectedZoneId(null);
        setZoneName('');
        setZoneColor('#3B82F6');
        setZoneDescription('');
        setSelectedTechIds([]);
        setDrawnGeometry(null);
        drawRef.current?.deleteAll();
    }, []);
    const startCreate = useCallback(() => {
        resetForm();
        setMode('create');
        drawRef.current?.deleteAll();
        drawRef.current?.changeMode('draw_polygon');
    }, [resetForm]);
    const startEdit = useCallback((zone: any) => {
        setMode('edit');
        setSelectedZoneId(zone.id);
        setZoneName(zone.name);
        setZoneColor(zone.color || '#3B82F6');
        setZoneDescription(zone.description || '');
        setSelectedTechIds(
            (zone.technicians || []).map((tz: any) => tz.technician?.id || tz.technicianId)
        );
        drawRef.current?.deleteAll();
        const geo = parseGeometry(zone.geometry);
        if (geo) {
            const ids = drawRef.current?.add(geo);
            if (ids?.length) {
                setDrawnGeometry(geo.geometry || geo);
            }
        }
        if (geo) {
            const bounds = new maplibregl.LngLatBounds();
            const coords =
                (geo.geometry || geo).coordinates?.[0] ||
                (geo.coordinates?.[0]);
            if (coords) {
                coords.forEach((c: number[]) => bounds.extend(c as [number, number]));
                mapRef.current?.fitBounds(bounds, { padding: 80, pitch: 60, bearing: -30 });
            }
        }
    }, []);
    const handleSave = () => {
        if (!zoneName.trim()) {
            toast.error('Veuillez donner un nom à la zone');
            return;
        }
        const allFeatures = drawRef.current?.getAll();
        let geometry = drawnGeometry;
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
    const handleDelete = (zone: any) => {
        setZoneToDelete(zone);
    };
    const toggleTech = (techId: string) => {
        setSelectedTechIds((prev) =>
            prev.includes(techId)
                ? prev.filter((id) => id !== techId)
                : [...prev, techId]
        );
    };
    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;
        const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
        const styleUrl = maptilerKey
            ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${maptilerKey}`
            : 'https://tiles.openfreemap.org/styles/liberty';
        const LYON_BOUNDS: [[number, number], [number, number]] = [
            [4.48, 45.45],
            [5.15, 46.05],
        ];
        const LYON_CENTER: [number, number] = [4.8357, 45.7640];
        const m = new maplibregl.Map({
            container: mapContainer.current,
            style: styleUrl,
            center: LYON_CENTER,
            zoom: 12,
            pitch: 60,
            bearing: -30,
            maxBounds: LYON_BOUNDS,
            minZoom: 11,
        });
        m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
        const drawStyles = [
            {
                'id': 'gl-draw-polygon-fill-inactive',
                'type': 'fill',
                'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                'paint': {
                    'fill-color': '#3bb2d0',
                    'fill-outline-color': '#3bb2d0',
                    'fill-opacity': 0.1
                }
            },
            {
                'id': 'gl-draw-polygon-fill-active',
                'type': 'fill',
                'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
                'paint': {
                    'fill-color': '#fbb03b',
                    'fill-outline-color': '#fbb03b',
                    'fill-opacity': 0.1
                }
            },
            {
                'id': 'gl-draw-line-inactive',
                'type': 'line',
                'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
                'layout': { 'line-cap': 'round', 'line-join': 'round' },
                'paint': { 'line-color': '#3bb2d0', 'line-width': 2 }
            },
            {
                'id': 'gl-draw-line-active',
                'type': 'line',
                'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
                'layout': { 'line-cap': 'round', 'line-join': 'round' },
                'paint': { 'line-color': '#fbb03b', 'line-dasharray': [0.2, 2], 'line-width': 2 }
            },
            {
                'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
                'type': 'circle',
                'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                'paint': { 'circle-radius': 5, 'circle-color': '#fff' }
            },
            {
                'id': 'gl-draw-polygon-and-line-vertex-inactive',
                'type': 'circle',
                'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                'paint': { 'circle-radius': 3, 'circle-color': '#fbb03b' }
            },
            {
                'id': 'gl-draw-point-point-stroke-inactive',
                'type': 'circle',
                'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
                'paint': { 'circle-radius': 5, 'circle-color': '#fff' }
            },
            {
                'id': 'gl-draw-point-inactive',
                'type': 'circle',
                'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
                'paint': { 'circle-radius': 3, 'circle-color': '#3bb2d0' }
            },
            {
                'id': 'gl-draw-point-stroke-active',
                'type': 'circle',
                'filter': ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'vertex']],
                'paint': { 'circle-radius': 7, 'circle-color': '#fff' }
            },
            {
                'id': 'gl-draw-point-active',
                'type': 'circle',
                'filter': ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'vertex'], ['==', 'active', 'true']],
                'paint': { 'circle-radius': 5, 'circle-color': '#fbb03b' }
            },
            {
                'id': 'gl-draw-polygon-fill-static',
                'type': 'fill',
                'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
                'paint': { 'fill-color': '#404040', 'fill-outline-color': '#404040', 'fill-opacity': 0.1 }
            },
            {
                'id': 'gl-draw-line-static',
                'type': 'line',
                'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
                'layout': { 'line-cap': 'round', 'line-join': 'round' },
                'paint': { 'line-color': '#404040', 'line-width': 2 }
            },
            {
                'id': 'gl-draw-point-static',
                'type': 'circle',
                'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
                'paint': { 'circle-radius': 5, 'circle-color': '#404040' }
            }
        ];
        const d = new MapboxDraw({
            displayControlsDefault: false,
            controls: { polygon: false, trash: false },
            styles: drawStyles as any,
        });
        m.addControl(d as any, 'top-left');
        m.on('load', () => {
            const layers = m.getStyle().layers || [];
            const labelLayerId = layers.find(
                (l: any) => l.type === 'symbol' && l.layout?.['text-field']
            )?.id;
            try {
                if (!m.getSource('openmaptiles')) {
                } else {
                    m.addLayer(
                        {
                            id: '3d-buildings',
                            source: 'openmaptiles',
                            'source-layer': 'building',
                            filter: ['==', 'extrude', 'true'],
                            type: 'fill-extrusion',
                            minzoom: 12,
                            paint: {
                                'fill-extrusion-color': '#aaa',
                                'fill-extrusion-height': ['get', 'render_height'],
                                'fill-extrusion-base': ['get', 'render_min_height'],
                                'fill-extrusion-opacity': 0.6,
                            },
                        },
                        labelLayerId
                    );
                }
            } catch {
            }
        });
        m.on('draw.create', (e: any) => {
            setDrawnGeometry(e.features[0].geometry);
        });
        m.on('draw.update', (e: any) => {
            setDrawnGeometry(e.features[0].geometry);
        });
        mapRef.current = m;
        drawRef.current = d;
        return () => {
            m.remove();
            mapRef.current = null;
        };
    }, []);
    useEffect(() => {
        const m = mapRef.current;
        if (!m || !zones.length) return;
        const renderZones = () => {
            zones.forEach((zone: any) => {
                const id = `zone-${zone.id}`;
                if (m.getLayer(`${id}-fill`)) m.removeLayer(`${id}-fill`);
                if (m.getLayer(`${id}-outline`)) m.removeLayer(`${id}-outline`);
                if (m.getLayer(`${id}-label`)) m.removeLayer(`${id}-label`);
                if (m.getSource(id)) m.removeSource(id);
            });
            const style = m.getStyle();
            if (style?.sources) {
                Object.keys(style.sources).forEach((key) => {
                    if (key.startsWith('zone-') && !zones.find((z: any) => `zone-${z.id}` === key)) {
                        if (m.getLayer(`${key}-fill`)) m.removeLayer(`${key}-fill`);
                        if (m.getLayer(`${key}-outline`)) m.removeLayer(`${key}-outline`);
                        if (m.getLayer(`${key}-label`)) m.removeLayer(`${key}-label`);
                        if (m.getSource(key)) m.removeSource(key);
                    }
                });
            }
            zones.forEach((zone: any) => {
                const id = `zone-${zone.id}`;
                const geo = parseGeometry(zone.geometry);
                if (!geo) return;
                m.addSource(id, { type: 'geojson', data: geo as any });
                m.addLayer({
                    id: `${id}-fill`,
                    type: 'fill-extrusion',
                    source: id,
                    paint: {
                        'fill-extrusion-color': zone.color || '#3B82F6',
                        'fill-extrusion-height': 40,
                        'fill-extrusion-base': 0,
                        'fill-extrusion-opacity': selectedZoneId === zone.id ? 0.6 : 0.35,
                    },
                });
                m.addLayer({
                    id: `${id}-outline`,
                    type: 'line',
                    source: id,
                    paint: {
                        'line-color': zone.color || '#3B82F6',
                        'line-width': selectedZoneId === zone.id ? 4 : 2,
                    },
                });
            });
            zonesLoadedRef.current = true;
        };
        if (m.isStyleLoaded()) {
            renderZones();
        } else {
            m.on('load', renderZones);
        }
    }, [zones, selectedZoneId]);
    const selectedZone = zones.find((z: any) => z.id === selectedZoneId);
    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-6rem)]">
            { }
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
            { }
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
                { }
                <Card className="lg:col-span-3 overflow-hidden border-2 border-primary/10 relative">
                    <CardContent className="p-0 h-full">
                        <div ref={mapContainer} className="w-full h-full min-h-[500px]" />
                    </CardContent>
                </Card>
                { }
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-1">
                    { }
                    {mode !== 'idle' && (
                        <Card className="border-primary/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {mode === 'create' ? 'Nouvelle zone' : 'Modifier la zone'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                { }
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Nom</Label>
                                    <Input
                                        placeholder="ex: Bordeaux Centre"
                                        value={zoneName}
                                        onChange={(e) => setZoneName(e.target.value)}
                                    />
                                </div>
                                { }
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
                                { }
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Description</Label>
                                    <Input
                                        placeholder="Optionnel"
                                        value={zoneDescription}
                                        onChange={(e) => setZoneDescription(e.target.value)}
                                    />
                                </div>
                                { }
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold flex items-center gap-1">
                                        <Users className="h-3 w-3" /> Techniciens assignés
                                    </Label>
                                    {technicians.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">
                                            Aucun technicien disponible
                                        </p>
                                    ) : (
                                        <div className="space-y-1 max-h-36 overflow-y-auto rounded-md border p-2">
                                            {technicians.map((tech: any) => (
                                                <label
                                                    key={tech.id}
                                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-primary/5 cursor-pointer transition-colors text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="accent-primary"
                                                        checked={selectedTechIds.includes(tech.id)}
                                                        onChange={() => toggleTech(tech.id)}
                                                    />
                                                    <span className="truncate">
                                                        {tech.name || tech.email}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                { }
                                {!drawnGeometry && mode === 'create' && (
                                    <p className="text-[10px] text-center text-muted-foreground animate-pulse">
                                        👉 Cliquez sur la carte pour dessiner le polygone
                                    </p>
                                )}
                                { }
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        className="flex-1 gap-2"
                                        onClick={handleSave}
                                        disabled={saveMutation.isPending}
                                    >
                                        {saveMutation.isPending ? (
                                            <Loader2 className="animate-spin h-4 w-4" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {mode === 'create' ? 'Créer' : 'Sauvegarder'}
                                    </Button>
                                    {mode === 'edit' && selectedZone && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleDelete(selectedZone)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    { }
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
                        {zones.map((zone: any) => {
                            const isSelected = selectedZoneId === zone.id;
                            const techCount = zone.technicians?.length || 0;
                            return (
                                <div
                                    key={zone.id}
                                    className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-border bg-card hover:border-primary/40'
                                        }`}
                                    onClick={() => {
                                        if (isSelected) {
                                            resetForm();
                                        } else {
                                            startEdit(zone);
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
                                                startEdit(zone);
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
                                                handleDelete(zone);
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={!!zoneToDelete}
                onClose={() => setZoneToDelete(null)}
                onConfirm={() => {
                    if (zoneToDelete) {
                        deleteMutation.mutate(zoneToDelete.id);
                    }
                }}
                title="Supprimer la zone"
                description={`Êtes-vous sûr de vouloir supprimer la zone "${zoneToDelete?.name}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
            />
        </div>
    );
}
