export const parseGeometry = (geometryStr: string) => {
    if (!geometryStr) return null;
    try {
        const parsed = JSON.parse(geometryStr);
        if (parsed.type === 'Polygon' || parsed.type === 'MultiPolygon') {
            return { type: 'Feature', geometry: parsed, properties: {} };
        }
        return parsed;
    } catch {
        return null;
    }
};
