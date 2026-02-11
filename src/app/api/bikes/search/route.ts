import { NextResponse } from 'next/server';
import { mapBikeIndexTypeToInternal } from '@/lib/utils/bike-mapping';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'manufacturer'; // 'manufacturer' or 'model'
    const manufacturer = searchParams.get('manufacturer');

    // Pour les fabricants, on exige une requête.
    // Pour les modèles, on accepte une requête vide si le fabricant est fourni (recommandations).
    if (type === 'manufacturer' && (!query || query.length < 2)) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        // On utilise l'endpoint /search qui est plus robuste
        // stolenness=all pour ne pas cacher des modèles légitimes (souvent volés dans la base)
        let url = `https://bikeindex.org/api/v3/search?query=${encodeURIComponent(query || '')}&per_page=100&stolenness=all`;

        if (type === 'model' && manufacturer) {
            url += `&manufacturer=${encodeURIComponent(manufacturer)}`;
        }

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`BikeIndex API error: ${response.statusText}`);
        }

        const data = await response.json();
        let bikes = data.bikes || [];

        // Filtrer uniquement ceux qui ont une image
        bikes = bikes.filter((bike: any) => bike.large_img || bike.thumb);

        // Filtrage strict si un fabricant est spécifié
        if (manufacturer) {
            const lowerMfr = manufacturer.toLowerCase();
            bikes = bikes.filter((bike: any) =>
                bike.manufacturer_name?.toLowerCase() === lowerMfr
            );
        }

        // Formater les vélos pour le frontend
        const suggestions = bikes.map((bike: any) => ({
            id: bike.id,
            brand: bike.manufacturer_name,
            model: bike.frame_model,
            year: bike.year,
            image: bike.large_img || bike.thumb,
            type: mapBikeIndexTypeToInternal({
                slug: bike.cycle_type_slug,
                model: bike.frame_model,
                title: bike.title
            }),
            isElectric: bike.propulsion_type_slug === 'ebike-pedelec' || bike.propulsion_type_slug === 'ebike-throttle'
        }));

        // Supprimer les doublons basés sur brand + model + year
        const seen = new Set();
        const uniqueSuggestions = suggestions.filter((s: any) => {
            const key = `${s.brand}-${s.model}-${s.year}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return NextResponse.json({ suggestions: uniqueSuggestions });
    } catch (error) {
        console.error('Error fetching from BikeIndex:', error);
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
}
