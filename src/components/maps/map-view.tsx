'use client';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
interface MapViewProps {
    center?: [number, number];
    zoom?: number;
    pitch?: number;
    bearing?: number;
    markers?: Array<{ lng: number; lat: number; label?: string; icon?: string }>;
    polygons?: Array<{ id: string; coordinates: number[][][]; color?: string }>;
    route?: [number, number][];
    onMapClick?: (lngLat: { lng: number; lat: number }) => void;
    className?: string;
}
const LYON_BOUNDS: [[number, number], [number, number]] = [
    [4.48, 45.45],
    [5.15, 46.05],
];
const LYON_CENTER: [number, number] = [4.8357, 45.7640];
export function MapView({
    center,
    zoom = 14,
    pitch = 60,
    bearing = -30,
    markers = [],
    polygons = [],
    route = [],
    onMapClick,
    className,
}: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    useEffect(() => {
        if (map.current || !mapContainer.current) return;
        const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
        const styleUrl = maptilerKey 
            ? `https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${maptilerKey}` 
            : 'https://tiles.openfreemap.org/styles/liberty';
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: styleUrl,
            center: center || LYON_CENTER,
            zoom,
            pitch,
            bearing,
            maxBounds: LYON_BOUNDS,
            minZoom: 11,
            maxZoom: 20,
        });
        const m = map.current;
        m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
        m.on('load', () => {
            if (!m.getLayer('3d-buildings')) {
                m.addLayer({
                    'id': '3d-buildings',
                    'source': 'openmaptiles',
                    'source-layer': 'building',
                    'type': 'fill-extrusion',
                    'minzoom': 13,
                    'paint': {
                        'fill-extrusion-color': '#1a1a1a',
                        'fill-extrusion-height': ['get', 'render_height'],
                        'fill-extrusion-base': ['get', 'render_min_height'],
                        'fill-extrusion-opacity': 0.8
                    }
                });
            }
        });
        if (onMapClick) {
            m.on('click', (e) => {
                onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
            });
        }
        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);
    useEffect(() => {
        if (!map.current) return;
        const currentMarkers: maplibregl.Marker[] = (map.current as any)._markers || [];
        currentMarkers.forEach(m => m.remove());
        markers.forEach(({ lng, lat, label }) => {
            const el = document.createElement('div');
            el.className = 'premium-marker';
            el.innerHTML = `
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-8 h-8 bg-primary rounded-full animate-ping opacity-20"></div>
                    <div class="relative w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg shadow-primary/50"></div>
                </div>
            `;
            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(map.current!);
            if (label) {
                marker.setPopup(new maplibregl.Popup({ offset: 25, className: 'premium-popup' }).setHTML(label));
            }
        });
    }, [markers]);
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        const m = map.current;
        const sourceId = 'route-source';
        const layerId = 'route-layer';
        if (route.length > 0) {
            const geojson: any = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route,
                },
            };
            if (m.getSource(sourceId)) {
                (m.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
            } else {
                m.addSource(sourceId, {
                    type: 'geojson',
                    data: geojson,
                });
                m.addLayer({
                    id: layerId,
                    type: 'line',
                    source: sourceId,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#FACC15',
                        'line-width': 6,
                        'line-opacity': 0.8,
                    },
                });
            }
        } else if (m.getLayer(layerId)) {
            m.removeLayer(layerId);
            m.removeSource(sourceId);
        }
    }, [route]);
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        const m = map.current;
        polygons.forEach(({ id, coordinates, color = '#3B82F6' }) => {
            const sourceId = `source-${id}`;
            const layerId = `layer-${id}`;
            const outlineId = `outline-${id}`;
            if (m.getSource(sourceId)) {
                (m.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates,
                    },
                    properties: {},
                });
            } else {
                m.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates,
                        },
                        properties: {},
                    },
                });
                m.addLayer({
                    id: layerId,
                    type: 'fill',
                    source: sourceId,
                    layout: {},
                    paint: {
                        'fill-color': color,
                        'fill-opacity': 0.2,
                    },
                });
                m.addLayer({
                    id: outlineId,
                    type: 'line',
                    source: sourceId,
                    layout: {},
                    paint: {
                        'line-color': color,
                        'line-width': 2,
                    },
                });
            }
        });
    }, [polygons]);
    return (
        <div
            ref={mapContainer}
            className={className}
            style={{ width: '100%', height: '100%', minHeight: '300px' }}
        />
    );
}
