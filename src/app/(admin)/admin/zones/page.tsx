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

/* ------------------------------------------------------------------ */
/*  Utility                                                           */
/* ------------------------------------------------------------------ */
const parseGeometry = (geometryStr: string) => {
    if (!geometryStr) return null;
    try {
        const parsed = JSON.parse(geometryStr);
        // Wrap bare geometry in a Feature for GeoJSON sources
        if (parsed.type === 'Polygon' || parsed.type === 'MultiPolygon') {
            return { type: 'Feature', geometry: parsed, properties: {} };
        }
        return parsed;
    } catch {
        return null;
    }
};

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function AdminZonesPage() {
    const queryClient = useQueryClient();
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const drawRef = useRef<any>(null);
    const zonesLoadedRef = useRef(false);

    // UI state
    const [mode, setMode] = useState<'idle' | 'create' | 'edit'>('idle');
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [zoneName, setZoneName] = useState('');
    const [zoneColor, setZoneColor] = useState('#3B82F6');
    const [zoneDescription, setZoneDescription] = useState('');
    const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
    const [drawnGeometry, setDrawnGeometry] = useState<any>(null);

    /* ---------- Queries ---------- */
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

    /* ---------- Mutations ---------- */
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

    /* ---------- Helpers ---------- */
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

        // Load the zone geometry into draw
        drawRef.current?.deleteAll();
        const geo = parseGeometry(zone.geometry);
        if (geo) {
            const ids = drawRef.current?.add(geo);
            if (ids?.length) {
                setDrawnGeometry(geo.geometry || geo);
            }
        }

        // Fly to zone
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

        // Get geometry from draw
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
        if (!confirm(`Supprimer la zone "${zone.name}" ? Cette action est irréversible.`)) return;
        deleteMutation.mutate(zone.id);
    };

    const toggleTech = (techId: string) => {
        setSelectedTechIds((prev) =>
            prev.includes(techId)
                ? prev.filter((id) => id !== techId)
                : [...prev, techId]
        );
    };

    /* ---------- Map Init ---------- */
    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;

        const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
        const styleUrl = maptilerKey
            ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
            : 'https://tiles.openfreemap.org/styles/liberty';

        const m = new maplibregl.Map({
            container: mapContainer.current,
            style: styleUrl,
            center: [-0.5792, 44.8378], // Bordeaux
            zoom: 12,
            pitch: 60,
            bearing: -30,
        });

        m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

        const d = new MapboxDraw({
            displayControlsDefault: false,
            controls: { polygon: false, trash: false },
        });
        m.addControl(d as any, 'top-left');

        m.on('load', () => {
            // Add 3D buildings layer if available
            const layers = m.getStyle().layers || [];
            const labelLayerId = layers.find(
                (l: any) => l.type === 'symbol' && l.layout?.['text-field']
            )?.id;

            // Try adding 3D buildings from the style's building source
            try {
                if (!m.getSource('openmaptiles')) {
                    // If not available, skip 3D buildings
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
                // 3D buildings not available in the style
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

    /* ---------- Render Zones on Map ---------- */
    useEffect(() => {
        const m = mapRef.current;
        if (!m || !zones.length) return;

        // Wait for map style to load
        const renderZones = () => {
            // Remove old zone layers/sources
            zones.forEach((zone: any) => {
                const id = `zone-${zone.id}`;
                if (m.getLayer(`${id}-fill`)) m.removeLayer(`${id}-fill`);
                if (m.getLayer(`${id}-outline`)) m.removeLayer(`${id}-outline`);
                if (m.getLayer(`${id}-label`)) m.removeLayer(`${id}-label`);
                if (m.getSource(id)) m.removeSource(id);
            });

            // Also clean up any leftover sources from deleted zones
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

    /* ---------- Render ---------- */
    const selectedZone = zones.find((z: any) => z.id === selectedZoneId);

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-6rem)]">
            {/* Header */}
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

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
                {/* Map */}
                <Card className="lg:col-span-3 overflow-hidden border-2 border-primary/10 relative">
                    <CardContent className="p-0 h-full">
                        <div ref={mapContainer} className="w-full h-full min-h-[500px]" />
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-1">
                    {/* Create / Edit Panel */}
                    {mode !== 'idle' && (
                        <Card className="border-primary/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {mode === 'create' ? 'Nouvelle zone' : 'Modifier la zone'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Nom</Label>
                                    <Input
                                        placeholder="ex: Bordeaux Centre"
                                        value={zoneName}
                                        onChange={(e) => setZoneName(e.target.value)}
                                    />
                                </div>

                                {/* Color */}
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

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Description</Label>
                                    <Input
                                        placeholder="Optionnel"
                                        value={zoneDescription}
                                        onChange={(e) => setZoneDescription(e.target.value)}
                                    />
                                </div>

                                {/* Technicians */}
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

                                {/* Drawing hint */}
                                {!drawnGeometry && mode === 'create' && (
                                    <p className="text-[10px] text-center text-muted-foreground animate-pulse">
                                        👉 Cliquez sur la carte pour dessiner le polygone
                                    </p>
                                )}

                                {/* Actions */}
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

                    {/* Zone List */}
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
        </div>
    );
}
