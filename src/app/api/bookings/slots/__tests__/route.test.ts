/**
 * @jest-environment node
 */
import { GET } from '../route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        intervention: {
            findMany: jest.fn(),
        },
    },
}));

describe('GET /api/bookings/slots', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        // Set the current time to 2026-06-29 08:00:00 local time
        jest.setSystemTime(new Date(2026, 5, 29, 8, 0, 0));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should return 400 if date is missing', async () => {
        const req = new NextRequest('http://localhost/api/bookings/slots');
        const res = await GET(req);
        
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('Paramètre "date" requis');
    });

    it('should generate slots correctly with 30-min intervals between 9h and 18h', async () => {
        (prisma.intervention.findMany as jest.Mock).mockResolvedValue([]);
        
        const req = new NextRequest('http://localhost/api/bookings/slots?date=2026-06-30&duration=60');
        const res = await GET(req);
        
        expect(res.status).toBe(200);
        const json = await res.json();
        
        expect(json.data.length).toBeGreaterThan(0);
        
        // First slot should be 09:00
        expect(json.data[0].start).toBe('09:00');
        
        // Since duration is 60m and business hours end at 18:00, last slot should start at 17:00
        const lastSlot = json.data[json.data.length - 1];
        expect(lastSlot.start).toBe('17:00');
        expect(lastSlot.end).toBe('18:00');
    });

    it('should filter out slots that are already booked', async () => {
        // Mock an intervention at 10:00 for 60 mins
        (prisma.intervention.findMany as jest.Mock).mockResolvedValue([
            { scheduledAt: new Date(2026, 5, 30, 10, 0, 0), duration: 60 }
        ]);

        const req = new NextRequest('http://localhost/api/bookings/slots?date=2026-06-30&duration=60');
        const res = await GET(req);
        
        expect(res.status).toBe(200);
        const json = await res.json();
        
        const slot0930 = json.data.find((s: any) => s.start === '09:30');
        const slot1000 = json.data.find((s: any) => s.start === '10:00');
        const slot1030 = json.data.find((s: any) => s.start === '10:30');
        const slot1100 = json.data.find((s: any) => s.start === '11:00');
        
        // 09:30 to 10:30 overlaps with 10:00-11:00
        expect(slot0930.available).toBe(false);
        // 10:00 to 11:00 overlaps
        expect(slot1000.available).toBe(false);
        // 10:30 to 11:30 overlaps
        expect(slot1030.available).toBe(false);
        // 11:00 to 12:00 does not overlap (ends and starts at same minute)
        expect(slot1100.available).toBe(true);
    });

    it('should filter out past slots for today with a 1 hour buffer', async () => {
        // It's 08:00 today. Buffer is 1 hour, so minimum time is 09:00.
        // Slots starting before 09:00 should not be generated.
        // Let's set time to 09:30. Minimum time is 10:30.
        jest.setSystemTime(new Date(2026, 5, 29, 9, 30, 0));
        
        (prisma.intervention.findMany as jest.Mock).mockResolvedValue([]);
        const req = new NextRequest('http://localhost/api/bookings/slots?date=2026-06-29&duration=60');
        const res = await GET(req);
        
        expect(res.status).toBe(200);
        const json = await res.json();
        
        // Should not have 09:00, 09:30, or 10:00
        expect(json.data.find((s: any) => s.start === '09:00')).toBeUndefined();
        expect(json.data.find((s: any) => s.start === '09:30')).toBeUndefined();
        expect(json.data.find((s: any) => s.start === '10:00')).toBeUndefined();
        // Should have 10:30
        expect(json.data.find((s: any) => s.start === '10:30')).toBeDefined();
    });
});
