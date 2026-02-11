import { BikeType } from '@/types/bikes';

interface BikeContext {
    slug?: string | null;
    model?: string | null;
    title?: string | null;
}

/**
 * Maps BikeIndex data to our internal BikeType enum using slugs and keyword analysis.
 */
export function mapBikeIndexTypeToInternal(context: BikeContext): BikeType {
    const slug = context.slug?.toLowerCase() || '';
    const model = context.model?.toLowerCase() || '';
    const title = context.title?.toLowerCase() || '';
    const fullText = `${slug} ${model} ${title}`.toLowerCase();

    // 1. BMX
    if (slug.includes('bmx') || fullText.includes('bmx')) return 'BMX';

    // 2. CARGO
    if (slug.includes('cargo') || fullText.includes('cargo') || fullText.includes('longtail') || fullText.includes('bakfiets') || fullText.includes('bullitt')) return 'CARGO';

    // 3. FOLDING
    if (slug.includes('folding') || fullText.includes('pliant') || fullText.includes('folding') || fullText.includes('brompton') || fullText.includes('dahon')) return 'FOLDING';

    // 4. GRAVEL
    if (slug.includes('gravel') || fullText.includes('gravel') || fullText.includes('diverge') || fullText.includes('revolt') || fullText.includes('grizl') || fullText.includes('grail') || fullText.includes('checkpoint')) return 'GRAVEL';

    // 5. VTT (Mountain)
    if (
        slug.includes('mountain') ||
        fullText.includes('vtt') ||
        fullText.includes('mountain') ||
        fullText.includes('mtb') ||
        fullText.includes('trail') ||
        fullText.includes('rockhopper') ||
        fullText.includes('stumpjumper') ||
        fullText.includes('epic') ||
        fullText.includes('chisel') ||
        fullText.includes('tfs') ||
        fullText.includes('hardtail') ||
        fullText.includes('full suspension')
    ) return 'VTT';

    // 6. ROAD
    if (
        slug.includes('road') ||
        fullText.includes('route') ||
        fullText.includes('course') ||
        fullText.includes('road') ||
        fullText.includes('tarmac') ||
        fullText.includes('roubaix') ||
        fullText.includes('allez') ||
        fullText.includes('domane') ||
        fullText.includes('madone') ||
        fullText.includes('emonda') ||
        fullText.includes('supersix')
    ) return 'ROAD';

    // 7. CITY (Default if nothing else matches but it looks like a normal bike)
    return 'CITY';
}
