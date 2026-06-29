import axios from 'axios';

export interface RouteData {
    coordinates: [number, number][];
    distance: number;
    duration: number;
}
export async function getDrivingRoute(
    start: [number, number],
    end: [number, number]
): Promise<RouteData> {
    const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    if (!MAPTILER_API_KEY) {
        throw new Error('API Key MapTiler manquante');
    }
    const url = `https://api.maptiler.com/routing/v1/driving/${start.join(',')};${end.join(',')}.json?key=${MAPTILER_API_KEY}`;
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
