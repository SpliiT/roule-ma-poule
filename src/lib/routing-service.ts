import axios from 'axios';

const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

export interface RouteData {
    coordinates: [number, number][]; // [lng, lat]
    distance: number; // en mètres
    duration: number; // en secondes
}

/**
 * Service pour calculer des itinéraires via l'API MapTiler.
 */
export async function getDrivingRoute(
    start: [number, number],
    end: [number, number]
): Promise<RouteData> {
    if (!MAPTILER_API_KEY) {
        throw new Error('API Key MapTiler manquante');
    }

    const url = `https://api.maptiler.com/routing/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}.json?key=${MAPTILER_API_KEY}&alternatives=false&geometries=geojson&overview=full`;

    try {
        const response = await axios.get(url);
        const route = response.data.features[0];

        if (!route) {
            throw new Error('Aucun itinéraire trouvé');
        }

        return {
            coordinates: route.geometry.coordinates,
            distance: route.properties.distance,
            duration: route.properties.duration,
        };
    } catch (error) {
        console.error('Routing API error:', error);
        throw error;
    }
}
