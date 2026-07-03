import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { parseGeometry } from '@/lib/mapUtils';

interface Props {
    zones: any[];
    mode: 'idle' | 'create' | 'edit';
    mapStyle: 'plan' | 'satellite';
    selectedZoneId: string | null;
    showOtherZones: boolean;
    drawnGeometry: any;
    activeColor?: string;
    onGeometryUpdate: (geo: any) => void;
    onZoneClick: (zone: any) => void;
    mapControllerRef?: React.MutableRefObject<any>;
}

export function ZoneMap({
    zones, mode, mapStyle, selectedZoneId, showOtherZones, drawnGeometry, activeColor, onGeometryUpdate, onZoneClick, mapControllerRef
}: Props) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const drawRef = useRef<any>(null);
    const popupRef = useRef<maplibregl.Popup | null>(null);
    
    const zonesRef = useRef(zones);
    const modeRef = useRef(mode);
    const onZoneClickRef = useRef(onZoneClick);
    
    useEffect(() => { zonesRef.current = zones; }, [zones]);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { onZoneClickRef.current = onZoneClick; }, [onZoneClick]);

    useEffect(() => {
        if (mapControllerRef) {
            mapControllerRef.current = {
                deleteAll: () => drawRef.current?.deleteAll(),
                changeMode: (m: string, options?: any) => drawRef.current?.changeMode(m, options),
                addGeometry: (geo: any) => drawRef.current?.add(geo),
                getAllFeatures: () => drawRef.current?.getAll(),
                fitBounds: (bounds: maplibregl.LngLatBounds, options: any) => mapRef.current?.fitBounds(bounds, options)
            };
        }
    }, [mapControllerRef]);

    const drawnGeometryRef = useRef(drawnGeometry);
    useEffect(() => { drawnGeometryRef.current = drawnGeometry; }, [drawnGeometry]);

    // 1. Initialisation de la carte
    useEffect(() => {
        if (!mapContainer.current) return;

        const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
        const styleUrl = mapStyle === 'plan'
            ? (maptilerKey ? `https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${maptilerKey}` : 'https://tiles.openfreemap.org/styles/liberty')
            : (maptilerKey ? `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerKey}` : 'https://tiles.openfreemap.org/styles/liberty');

        const LYON_BOUNDS: [[number, number], [number, number]] = [
            [4.65, 45.55],
            [5.05, 45.90],
        ];
        const LYON_CENTER: [number, number] = [4.8357, 45.7640];

        const currentCenter = mapRef.current ? mapRef.current.getCenter() : LYON_CENTER;
        const currentZoom = mapRef.current ? mapRef.current.getZoom() : 12.5;

        if (mapRef.current) {
            mapRef.current.remove();
        }

        const m = new maplibregl.Map({
            container: mapContainer.current,
            style: styleUrl,
            center: currentCenter,
            zoom: currentZoom,
            maxBounds: LYON_BOUNDS,
            minZoom: 10.5,
        });
        m.doubleClickZoom.disable();
        m.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');
        
        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'zone-hover-popup',
        });
        popupRef.current = popup;

        m.on('mousemove', (e) => {
            const features = m.queryRenderedFeatures(e.point);
            const zoneFeature = features.find((f: any) => f.layer.id.endsWith('-fill') && f.layer.id.startsWith('zone-'));
            if (zoneFeature && zoneFeature.properties?.name) {
                m.getCanvas().style.cursor = 'pointer';
                popup.setLngLat(e.lngLat)
                    .setHTML(`<div>${zoneFeature.properties.name}</div>`)
                    .addTo(m);
            } else {
                m.getCanvas().style.cursor = '';
                popup.remove();
            }
        });

        m.on('dblclick', (e) => {
            if (modeRef.current !== 'idle') return;
            const features = m.queryRenderedFeatures(e.point);
            const zoneFeature = features.find((f: any) => f.layer.id.endsWith('-fill') && f.layer.id.startsWith('zone-'));
            if (zoneFeature && zoneFeature.properties?.id) {
                e.preventDefault();
                const clickedZone = zonesRef.current.find(z => z.id === zoneFeature.properties.id);
                if (clickedZone && onZoneClickRef.current) {
                    onZoneClickRef.current(clickedZone);
                }
            }
        });

        const drawStyles = [
            {
                'id': 'gl-draw-polygon-fill-inactive',
                'type': 'fill',
                'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                'paint': { 'fill-color': '#3bb2d0', 'fill-outline-color': '#3bb2d0', 'fill-opacity': 0.1 }
            },
            {
                'id': 'gl-draw-polygon-fill-active',
                'type': 'fill',
                'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
                'paint': { 'fill-color': '#fbb03b', 'fill-outline-color': '#fbb03b', 'fill-opacity': 0.1 }
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
                'paint': { 'circle-radius': 10, 'circle-color': '#fff' }
            },
            {
                'id': 'gl-draw-polygon-and-line-vertex-inactive',
                'type': 'circle',
                'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                'paint': { 'circle-radius': 7, 'circle-color': '#fbb03b' }
            },
            {
                'id': 'gl-draw-point-point-stroke-inactive',
                'type': 'circle',
                'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
                'paint': { 'circle-radius': 10, 'circle-color': '#fff' }
            },
            {
                'id': 'gl-draw-point-inactive',
                'type': 'circle',
                'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
                'paint': { 'circle-radius': 7, 'circle-color': '#3bb2d0' }
            },
            {
                'id': 'gl-draw-point-stroke-active',
                'type': 'circle',
                'filter': ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'vertex']],
                'paint': { 'circle-radius': 12, 'circle-color': '#fff' }
            },
            {
                'id': 'gl-draw-point-active',
                'type': 'circle',
                'filter': ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'vertex'], ['==', 'active', 'true']],
                'paint': { 'circle-radius': 9, 'circle-color': '#fbb03b' }
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
            controls: { polygon: true, trash: true },
            clickBuffer: 10,
            touchBuffer: 25,
            styles: drawStyles as any,
        });
        m.addControl(d as any, 'top-left');

        m.on('load', () => {
            (m as any)._initialLoadDone = true;
            if (drawnGeometryRef.current) d.add(drawnGeometryRef.current);
        });
        m.on('draw.create', (e: any) => onGeometryUpdate(e.features[0].geometry));
        m.on('draw.update', (e: any) => onGeometryUpdate(e.features[0].geometry));

        mapRef.current = m;
        drawRef.current = d;

        return () => {}; // map unmount handled safely
    }, [mapStyle]);

    // 2. Rendu des zones
    useEffect(() => {
        const m = mapRef.current;
        if (!m) return;

        const renderZones = () => {
            zones.forEach((zone: any) => {
                const id = `zone-${zone.id}`;
                const geo = parseGeometry(zone.geometry);
                if (!geo) return;
                
                if (geo.type === 'Feature') {
                    geo.properties = { ...geo.properties, name: zone.name, id: zone.id };
                } else if (geo.features) {
                    geo.features.forEach((f: any) => f.properties = { ...f.properties, name: zone.name, id: zone.id });
                }

                try {
                    // Update source if exists, else add
                    const source = m.getSource(id);
                    if (source) {
                        (source as maplibregl.GeoJSONSource).setData(geo as any);
                    } else {
                        m.addSource(id, { type: 'geojson', data: geo as any });
                    }

                    // Visibility logic
                    let isVisible = true;
                    if (mode === 'edit') {
                        isVisible = showOtherZones && zone.id !== selectedZoneId;
                    } else if (mode === 'create') {
                        isVisible = showOtherZones;
                    }
                    const visibility = isVisible ? 'visible' : 'none';

                    // Update fill layer
                    if (m.getLayer(`${id}-fill`)) {
                        m.setLayoutProperty(`${id}-fill`, 'visibility', visibility);
                        m.setPaintProperty(`${id}-fill`, 'fill-color', zone.color || '#3B82F6');
                    } else {
                        m.addLayer({
                            id: `${id}-fill`,
                            type: 'fill',
                            source: id,
                            layout: { visibility },
                            paint: {
                                'fill-color': zone.color || '#3B82F6',
                                'fill-opacity': 0.2,
                            },
                        });
                    }

                    // Update outline layer
                    if (m.getLayer(`${id}-outline`)) {
                        m.setLayoutProperty(`${id}-outline`, 'visibility', visibility);
                        m.setPaintProperty(`${id}-outline`, 'line-color', zone.color || '#3B82F6');
                    } else {
                        m.addLayer({
                            id: `${id}-outline`,
                            type: 'line',
                            source: id,
                            layout: { visibility },
                            paint: {
                                'line-color': zone.color || '#3B82F6',
                                'line-width': 2,
                            },
                        });
                    }
                } catch (e) {
                    console.error('Error updating zone', zone.id, e);
                }
            });
            
            // Clean up removed zones (zones that are no longer in the props)
            const style = m.getStyle();
            if (style?.sources) {
                Object.keys(style.sources).forEach((key) => {
                    if (key.startsWith('zone-') && !zones.find((z: any) => `zone-${z.id}` === key)) {
                        try {
                            if (m.getLayer(`${key}-fill`)) m.removeLayer(`${key}-fill`);
                            if (m.getLayer(`${key}-outline`)) m.removeLayer(`${key}-outline`);
                            if (m.getSource(key)) m.removeSource(key);
                        } catch (e) {}
                    }
                });
            }

            // Apply active color to MapboxDraw layers
            const drawColor = activeColor || '#fbb03b';
            ['gl-draw-polygon-fill-active.cold', 'gl-draw-polygon-fill-active.hot'].forEach(id => {
                if (m.getLayer(id)) {
                    try { m.setPaintProperty(id, 'fill-color', drawColor); } catch (e) {}
                    try { m.setPaintProperty(id, 'fill-outline-color', drawColor); } catch (e) {}
                }
            });
            ['gl-draw-line-active.cold', 'gl-draw-line-active.hot'].forEach(id => {
                if (m.getLayer(id)) {
                    try { m.setPaintProperty(id, 'line-color', drawColor); } catch (e) {}
                }
            });
            ['gl-draw-polygon-and-line-vertex-inactive.cold', 'gl-draw-polygon-and-line-vertex-inactive.hot', 'gl-draw-point-active.cold', 'gl-draw-point-active.hot'].forEach(id => {
                if (m.getLayer(id)) {
                    try { m.setPaintProperty(id, 'circle-color', drawColor); } catch (e) {}
                }
            });
        };

        if ((m as any)._initialLoadDone) {
            // Map is already loaded, we can run immediately.
            // If isStyleLoaded is false because of diffing, it might throw, but our try/catches handle it.
            renderZones();
        } else {
            // Map is still initializing, wait for the first load event.
            m.once('load', renderZones);
        }
    }, [zones, selectedZoneId, mapStyle, mode, showOtherZones, activeColor]);

    return <div ref={mapContainer} className="w-full h-full min-h-[500px]" />;
}
