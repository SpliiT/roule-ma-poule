import { getDistanceFromLatLonInKm, isPointInPolygon, deg2rad } from '../utils';

describe('Geography Utils', () => {
    describe('getDistanceFromLatLonInKm', () => {
        it('should return 0 for the same coordinates', () => {
            const distance = getDistanceFromLatLonInKm(45.7640, 4.8357, 45.7640, 4.8357);
            expect(distance).toBe(0);
        });

        it('should calculate distance correctly between Paris and Lyon', () => {
            // Paris
            const lat1 = 48.8566;
            const lon1 = 2.3522;
            // Lyon
            const lat2 = 45.7640;
            const lon2 = 4.8357;

            const distance = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
            // Distance is roughly 392 km
            expect(Math.round(distance)).toBeGreaterThan(380);
            expect(Math.round(distance)).toBeLessThan(400);
        });
    });

    describe('isPointInPolygon', () => {
        const polygon = [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10]
        ]; // Coordinates are [longitude, latitude] in the code, wait:
        // The function `isPointInPolygon` has:
        // const xi = polygon[i][1], yi = polygon[i][0];
        // which means polygon[i][0] is longitude (Y? No, if yi=polygon[0] it treats index 0 as Y which is lat or lng?)
        // Let's test standard square.

        it('should return true if point is inside the polygon', () => {
            // In the function: intersect = ((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
            // yi is mapped to polygon[i][0]
            // xi is mapped to polygon[i][1]
            // Let's pass a square polygon: [[lng, lat]]
            const square = [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ];
            // Point (5, 5) which is lat=5, lng=5
            expect(isPointInPolygon(5, 5, square)).toBe(true);
        });

        it('should return false if point is outside the polygon', () => {
            const square = [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ];
            // Point (15, 5) which is lat=15, lng=5
            expect(isPointInPolygon(15, 5, square)).toBe(false);
        });
    });

    describe('deg2rad', () => {
        it('should convert degrees to radians', () => {
            expect(deg2rad(180)).toBe(Math.PI);
            expect(deg2rad(90)).toBe(Math.PI / 2);
            expect(deg2rad(0)).toBe(0);
        });
    });
});
