import axios from 'axios';

/**
 * Interface définissant la structure d'une réponse d'itinéraire (Routing).
 */
export interface RouteData {
    coordinates: [number, number][];
    distance: number;
    duration: number;
}
/**
 * Calcule l'itinéraire routier optimal entre deux points GPS en utilisant l'API externe MapTiler.
 * Essentiel pour guider les techniciens lors de leurs tournées à domicile.
 * 
 * @param {[number, number]} start - Les coordonnées de départ sous forme [longitude, latitude].
 * @param {[number, number]} end - Les coordonnées d'arrivée sous forme [longitude, latitude].
 * @throws {Error} Si la clé API est manquante ou si le service ne trouve aucun itinéraire.
 * @returns {Promise<RouteData>} L'itinéraire géométrique, la distance totale et la durée estimée.
 */
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
