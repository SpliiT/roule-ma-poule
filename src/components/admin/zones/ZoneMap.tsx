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
    onGeometryUpdate: (geo: any) => void;
    onZoneClick: (zone: any) => void;
    mapControllerRef?: React.MutableRefObject<any>;
}

export function ZoneMap({
    zones, mode, mapStyle, selectedZoneId, showOtherZones, drawnGeometry, onGeometryUpdate, onZoneClick, mapControllerRef
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
                changeMode: (m: string) => drawRef.current?.changeMode(m),
                addGeometry: (geo: any) => drawRef.current?.add(geo),
                getAllFeatures: () => drawRef.current?.getAll(),
                fitBounds: (bounds: maplibregl.LngLatBounds, options: any) => mapRef.current?.fitBounds(bounds, options)
            };
        }
    }, [mapControllerRef]);

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
            if (drawnGeometry) d.add(drawnGeometry);
        });
        m.on('draw.create', (e: any) => onGeometryUpdate(e.features[0].geometry));
        m.on('draw.update', (e: any) => onGeometryUpdate(e.features[0].geometry));

        mapRef.current = m;
        drawRef.current = d;

        return () => {}; // map unmount handled safely
    }, [mapStyle, drawnGeometry]);

    // 2. Rendu des zones
    useEffect(() => {
        const m = mapRef.current;
        if (!m || !zones.length) return;

        const renderZones = () => {
            zones.forEach((zone: any) => {
                const id = `zone-${zone.id}`;
                if (m.getLayer(`${id}-fill`)) m.removeLayer(`${id}-fill`);
                if (m.getLayer(`${id}-outline`)) m.removeLayer(`${id}-outline`);
                if (m.getSource(id)) m.removeSource(id);
            });

            const style = m.getStyle();
            if (style?.sources) {
                Object.keys(style.sources).forEach((key) => {
                    if (key.startsWith('zone-') && !zones.find((z: any) => `zone-${z.id}` === key)) {
                        if (m.getLayer(`${key}-fill`)) m.removeLayer(`${key}-fill`);
                        if (m.getLayer(`${key}-outline`)) m.removeLayer(`${key}-outline`);
                        if (m.getSource(key)) m.removeSource(key);
                    }
                });
            }
            
            const zonesToRender = mode === 'edit' && !showOtherZones ? zones.filter((z: any) => z.id === selectedZoneId) : zones;
            
            zonesToRender.forEach((zone: any) => {
                const id = `zone-${zone.id}`;
                const geo = parseGeometry(zone.geometry);
                if (!geo) return;
                
                if (geo.type === 'Feature') {
                    geo.properties = { ...geo.properties, name: zone.name, id: zone.id };
                } else if (geo.features) {
                    geo.features.forEach((f: any) => f.properties = { ...f.properties, name: zone.name, id: zone.id });
                }

                m.addSource(id, { type: 'geojson', data: geo as any });
                m.addLayer({
                    id: `${id}-fill`,
                    type: 'fill',
                    source: id,
                    paint: {
                        'fill-color': zone.color || '#3B82F6',
                        'fill-opacity': selectedZoneId === zone.id ? 0.4 : 0.2,
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
        };

        if (m.isStyleLoaded()) {
            renderZones();
        } else {
            m.once('load', renderZones);
        }
    }, [zones, selectedZoneId, mapStyle, mode, showOtherZones]);

    return <div ref={mapContainer} className="w-full h-full min-h-[500px]" />;
}
