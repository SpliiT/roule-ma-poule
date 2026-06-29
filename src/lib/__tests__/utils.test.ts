import { getDistanceFromLatLonInKm, isPointInPolygon } from '../utils';

describe('Geography Utils', () => {
    describe('getDistanceFromLatLonInKm', () => {
        it('should return 0 for the same coordinates', () => {
            const distance = getDistanceFromLatLonInKm(45.7640, 4.8357, 45.7640, 4.8357);
            expect(distance).toBe(0);
        });

        it('should calculate distance correctly between Paris and Lyon', () => {
            const distance = getDistanceFromLatLonInKm(48.8566, 2.3522, 45.7640, 4.8357);
            expect(Math.round(distance)).toBeGreaterThan(380);
            expect(Math.round(distance)).toBeLessThan(400);
        });
    });

    describe('isPointInPolygon', () => {
        it('should return true if point is inside the polygon', () => {
            const square = [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ];
            expect(isPointInPolygon(5, 5, square)).toBe(true);
        });

        it('should return false if point is outside the polygon', () => {
            const square = [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ];
            expect(isPointInPolygon(15, 5, square)).toBe(false);
        });
    });
});
