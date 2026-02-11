'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapViewProps {
    center?: [number, number]; // [lng, lat]
    zoom?: number;
    pitch?: number;
    bearing?: number;
    markers?: Array<{ lng: number; lat: number; label?: string; icon?: string }>;
    polygons?: Array<{ id: string; coordinates: number[][][]; color?: string }>;
    route?: [number, number][]; // Array of [lng, lat]
    onMapClick?: (lngLat: { lng: number; lat: number }) => void;
    className?: string;
}

/**
 * Composant de carte réutilisable basé sur MapLibre GL JS.
 * Supporte les marqueurs, les polygones (zones), la 3D et le routing.
 */
export function MapView({
    center = [4.8357, 45.7640], // Lyon par défaut
    zoom = 12,
    pitch = 0,
    bearing = 0,
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

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL || `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
            center,
            zoom,
            pitch,
            bearing,
        });

        const m = map.current;

        m.addControl(new maplibregl.NavigationControl(), 'top-right');

        m.on('load', () => {
            // Ajouter les bâtiments en 3D si la source les supporte
            // Note: MapTiler Streets v2 a une source 'openmaptiles' avec une couche 'building'
            if (!m.getLayer('3d-buildings')) {
                m.addLayer({
                    'id': '3d-buildings',
                    'source': 'openmaptiles',
                    'source-layer': 'building',
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                        'fill-extrusion-color': '#aaa',
                        'fill-extrusion-height': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15, 0,
                            15.05, ['get', 'render_height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15, 0,
                            15.05, ['get', 'render_min_height']
                        ],
                        'fill-extrusion-opacity': 0.6
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

    // Gestion des marqueurs
    useEffect(() => {
        if (!map.current) return;

        // On nettoie les anciens marqueurs (approche simplifiée)
        const currentMarkers: maplibregl.Marker[] = (map.current as any)._markers || [];
        currentMarkers.forEach(m => m.remove());

        markers.forEach(({ lng, lat, label }) => {
            const marker = new maplibregl.Marker()
                .setLngLat([lng, lat])
                .addTo(map.current!);

            if (label) {
                marker.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(label));
            }
        });
    }, [markers]);

    // Gestion du tracé (Route)
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
                        'line-color': '#FACC15', // Jaune RouleMaPoule
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

    // Gestion des polygones (Zones)
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
