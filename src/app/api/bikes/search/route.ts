import { NextResponse } from 'next/server';
import { mapBikeIndexTypeToInternal } from '@/lib/utils/bike-mapping';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'model'; // 'manufacturer' or 'model'
    const manufacturer = searchParams.get('manufacturer');

    // Pour les fabricants, on exige une requête.
    if (type === 'manufacturer' && (!query || query.length < 2)) {
        return NextResponse.json({ suggestions: [] });
    }

    // Si on cherche un modèle sans query mais avec un manufacturer, on veut des suggestions
    if (type === 'model' && !query && !manufacturer) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        const decodedQuery = query ? decodeURIComponent(query) : '';
        const searchPromises: Promise<any>[] = [];

        // 1. Recherche locale dans notre base de données (Prisma)
        // On cherche des vélos qui ont été précédemment saisis
        if (decodedQuery.length >= 2) {
            searchPromises.push(
                prisma.bike.findMany({
                    where: {
                        OR: [
                            { brand: { contains: decodedQuery, mode: 'insensitive' } },
                            { model: { contains: decodedQuery, mode: 'insensitive' } },
                        ],
                    },
                    distinct: ['brand', 'model', 'year'],
                    take: 20,
                }).then(bikes => bikes.map(bike => ({
                    id: `local-${bike.id}`,
                    brand: bike.brand,
                    model: bike.model,
                    year: bike.year,
                    image: bike.photoUrl,
                    type: bike.type,
                    isElectric: bike.isElectric,
                    isLocal: true
                })))
            );
        }

        // 2. Recherche sur BikeIndex
        // stolenness=all pour ne pas cacher des modèles légitimes
        let bikeIndexUrl = `https://bikeindex.org/api/v3/search?query=${encodeURIComponent(decodedQuery)}&per_page=50&stolenness=all`;
        if (type === 'model' && manufacturer) {
            bikeIndexUrl += `&manufacturer=${encodeURIComponent(manufacturer)}`;
        }

        searchPromises.push(
            fetch(bikeIndexUrl, {
                headers: { 'Accept': 'application/json' }
            }).then(async res => {
                if (!res.ok) return [];
                const data = await res.json();
                return (data.bikes || []).map((bike: any) => ({
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
                    isElectric: bike.propulsion_type_slug === 'ebike-pedelec' || bike.propulsion_type_slug === 'ebike-throttle',
                    isLocal: false
                }));
            })
        );

        // Attendre tous les résultats
        const allResults = await Promise.all(searchPromises);
        const combined = allResults.flat();

        // 3. Filtrage et déduplication intelligente
        const seen = new Set();
        const uniqueSuggestions = combined.filter((s: any) => {
            // Clé de déduplication : Brand + Model + Year (si présent)
            const key = `${s.brand}-${s.model}-${s.year || ''}`.toLowerCase().trim();
            if (seen.has(key)) {
                // Si on a déjà vu ce vélo et que l'actuel n'a pas d'image mais le précédent en avait une, on garde le précédent
                return false;
            }
            seen.add(key);
            return true;
        });

        // 4. Tri intelligent :
        // - Priorité aux correspondances locales (plus pertinentes car déjà utilisées)
        // - Priorité aux vélos avec image
        // - Puis par pertinence de la query
        const sortedSuggestions = uniqueSuggestions.sort((a: any, b: any) => {
            // 1. Local vs BikeIndex
            if (a.isLocal && !b.isLocal) return -1;
            if (!a.isLocal && b.isLocal) return 1;

            // 2. Avec image vs sans image
            if (a.image && !b.image) return -1;
            if (!a.image && b.image) return 1;

            return 0;
        }).slice(0, 50);

        return NextResponse.json({ suggestions: sortedSuggestions });
    } catch (error) {
        console.error('Error in bike search API:', error);
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
}
