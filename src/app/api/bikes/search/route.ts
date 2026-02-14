import { NextResponse } from 'next/server';
import { mapBikeIndexTypeToInternal } from '@/lib/utils/bike-mapping';
import { prisma } from '@/lib/prisma';
import { getFromCache, setInCache } from '@/lib/cache'; 

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'model'; 
    const manufacturer = searchParams.get('manufacturer');

    
    if (type === 'manufacturer' && (!query || query.length < 2)) {
        return NextResponse.json({ suggestions: [] });
    }

    
    if (type === 'model' && !query && !manufacturer) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        const decodedQuery = query ? decodeURIComponent(query) : '';
        const searchPromises: Promise<any>[] = [];

        
        
        if (decodedQuery.length >= 2) {
            searchPromises.push(
                (async () => {
                    console.time('Prisma Query');
                    const bikes = await prisma.bike.findMany({
                        where: {
                            OR: [
                                { brand: { contains: decodedQuery, mode: 'insensitive' } },
                                { model: { contains: decodedQuery, mode: 'insensitive' } },
                            ],
                        },
                        distinct: ['brand', 'model', 'year'],
                        take: 20,
                    });
                    console.timeEnd('Prisma Query');
                    return bikes.map(bike => ({
                        id: `local-${bike.id}`,
                        brand: bike.brand,
                        model: bike.model,
                        year: bike.year,
                        image: bike.photoUrl,
                        type: bike.type,
                        isElectric: bike.isElectric,
                        isLocal: true
                    }));
                })()
            );
        }

        
        
        if (decodedQuery.length >= 3) { 
            let bikeIndexUrl = `https://bikeindex.org/api/v3/search?query=${encodeURIComponent(decodedQuery)}&per_page=50&stolenness=all`;
            if (type === 'model' && manufacturer) {
                bikeIndexUrl += `&manufacturer=${encodeURIComponent(manufacturer)}`;
            }

            
            const cachedBikeIndexResults = getFromCache<any[]>(bikeIndexUrl);
            if (cachedBikeIndexResults) {
                console.log('BikeIndex results from cache');
                searchPromises.push(Promise.resolve(cachedBikeIndexResults));
            } else {
                searchPromises.push(
                    (async () => {
                        console.time('BikeIndex Fetch');
                        const res = await fetch(bikeIndexUrl, {
                            headers: { 'Accept': 'application/json' }
                        });
                        console.timeEnd('BikeIndex Fetch');
                        if (!res.ok) return [];
                        const data = await res.json();
                        const bikeIndexResults = (data.bikes || []).map((bike: any) => ({
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
                        setInCache(bikeIndexUrl, bikeIndexResults, 3600); 
                        return bikeIndexResults;
                    })()
                );
            }
        }

        
        const allResults = await Promise.all(searchPromises);
        const combined = allResults.flat();

        
        const seen = new Set();
        const uniqueSuggestions = combined.filter((s: any) => {
            
            const key = `${s.brand}-${s.model}-${s.year || ''}`.toLowerCase().trim();
            if (seen.has(key)) {
                
                return false;
            }
            seen.add(key);
            return true;
        });

        
        
        
        
        const sortedSuggestions = uniqueSuggestions.sort((a: any, b: any) => {
            
            if (a.isLocal && !b.isLocal) return -1;
            if (!a.isLocal && b.isLocal) return 1;

            
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
