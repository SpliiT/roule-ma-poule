import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendBookingConfirmation } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { NextResponse } from 'next/server';

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn().mockImplementation((body, init) => ({
            status: init?.status || 200,
            json: async () => body,
        })),
    },
}));

jest.mock('@/lib/prisma', () => ({
    prisma: {
        forfait: {
            findUnique: jest.fn(),
        },
        product: {
            findMany: jest.fn(),
        },
        intervention: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
        },
        zone: {
            findMany: jest.fn(),
        },
        user: {
            findMany: jest.fn(),
        },
        notification: {
            create: jest.fn(),
        },
    },
}));

jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/email', () => ({
    sendBookingConfirmation: jest.fn(),
}));

jest.mock('@/lib/push', () => ({
    sendPushNotification: jest.fn(),
}));

describe('POST /api/bookings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue(null);
        const req = { json: async () => ({}) } as unknown as Request;
        const response = await POST(req);
        expect(response.status).toBe(401);
    });

    it('should return 404 if forfait is not found', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
        (prisma.forfait.findUnique as jest.Mock).mockResolvedValue(null);

        const req = {
            json: async () => ({
                bikeId: 'bike-1',
                forfaitId: 'invalid-id',
                scheduledAt: new Date().toISOString(),
                street: '123 Rue de Test',
                postalCode: '69001',
                city: 'Lyon',
                latitude: 45.7,
                longitude: 4.8,
                products: []
            })
        } as unknown as Request;

        const response = await POST(req);
        expect(response.status).toBe(404);
        expect(prisma.forfait.findUnique).toHaveBeenCalledWith({ where: { id: 'invalid-id' } });
    });

    it('should successfully create a booking', async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
        (prisma.forfait.findUnique as jest.Mock).mockResolvedValue({ id: 'forfait-1', price: 50, duration: 60, name: 'Basic' });
        (prisma.intervention.findFirst as jest.Mock).mockResolvedValue(null); // No conflicts
        (prisma.zone.findMany as jest.Mock).mockResolvedValue([]); // No zones, fallback to closest tech
        (prisma.user.findMany as jest.Mock).mockResolvedValue([
            { id: 'tech-1', role: 'TECHNICIEN', currentLat: 45.7, currentLng: 4.8, isActive: true, addresses: [] }
        ]);
        (prisma.intervention.create as jest.Mock).mockResolvedValue({ id: 'inter-1' });
        (prisma.notification.create as jest.Mock).mockResolvedValue({});
        (prisma.intervention.findUnique as jest.Mock).mockResolvedValue({
            id: 'inter-1',
            client: { email: 'client@test.com', name: 'Client' },
            forfait: { name: 'Basic' }
        });

        const req = {
            json: async () => ({
                bikeId: 'bike-1',
                forfaitId: 'forfait-1',
                scheduledAt: new Date().toISOString(),
                street: '123 Rue de Test',
                postalCode: '69001',
                city: 'Lyon',
                latitude: 45.71,
                longitude: 4.81,
                products: []
            })
        } as unknown as Request;

        const response = await POST(req);
        expect(response.status).toBe(201);
        
        // Verify technician was assigned
        expect(prisma.intervention.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    technicianId: 'tech-1',
                    totalPrice: 50
                })
            })
        );

        // Verify notifications were sent
        expect(sendPushNotification).toHaveBeenCalled();
        expect(sendBookingConfirmation).toHaveBeenCalled();
    });
});
