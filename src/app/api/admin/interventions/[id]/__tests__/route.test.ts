import { PATCH } from '../route';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { sendStatusUpdate } from '@/lib/email';
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
        intervention: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        interventionStatusHistory: {
            create: jest.fn(),
        },
        notification: {
            create: jest.fn(),
        },
    },
}));

jest.mock('@/lib/auth', () => ({
    requireRole: jest.fn(),
}));

jest.mock('@/lib/email', () => ({
    sendStatusUpdate: jest.fn(),
}));

jest.mock('@/lib/push', () => ({
    sendPushNotification: jest.fn(),
}));

describe('PATCH /api/admin/interventions/[id]', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if intervention does not exist', async () => {
        (requireRole as jest.Mock).mockResolvedValue(true);
        (prisma.intervention.findUnique as jest.Mock).mockResolvedValue(null);

        const req = {
            json: async () => ({ status: 'CONFIRMED' })
        } as unknown as Request;

        const response = await PATCH(req, { params: Promise.resolve({ id: 'invalid-id' }) });
        expect(response.status).toBe(404);
    });

    it('should update intervention status and send notifications', async () => {
        (requireRole as jest.Mock).mockResolvedValue(true);
        const mockIntervention = {
            id: 'inter-1',
            status: 'PENDING',
            clientId: 'client-1',
            city: 'Lyon',
            forfait: { name: 'Basic' }
        };

        (prisma.intervention.findUnique as jest.Mock)
            .mockResolvedValueOnce(mockIntervention) // Initial fetch
            .mockResolvedValueOnce({ ...mockIntervention, client: {} }); // Fetch for email

        (prisma.intervention.update as jest.Mock).mockResolvedValue({ id: 'inter-1', status: 'CONFIRMED' });

        const req = {
            json: async () => ({ status: 'CONFIRMED' })
        } as unknown as Request;

        const response = await PATCH(req, { params: Promise.resolve({ id: 'inter-1' }) });
        expect(response.status).toBe(200);

        // Verify update was called
        expect(prisma.intervention.update).toHaveBeenCalledWith({
            where: { id: 'inter-1' },
            data: expect.objectContaining({ status: 'CONFIRMED' })
        });

        // Verify history was created
        expect(prisma.interventionStatusHistory.create).toHaveBeenCalled();

        // Verify push notification to client
        expect(sendPushNotification).toHaveBeenCalledWith('client-1', expect.any(Object));

        // Verify email was sent
        expect(sendStatusUpdate).toHaveBeenCalled();
    });

    it('should automatically set status to CONFIRMED when assigning a technician to a PENDING intervention', async () => {
        (requireRole as jest.Mock).mockResolvedValue(true);
        const mockIntervention = {
            id: 'inter-1',
            status: 'PENDING',
            clientId: 'client-1',
            city: 'Lyon',
            forfait: { name: 'Basic' }
        };

        (prisma.intervention.findUnique as jest.Mock).mockResolvedValue(mockIntervention);
        (prisma.intervention.update as jest.Mock).mockResolvedValue({ id: 'inter-1', status: 'CONFIRMED' });

        const req = {
            json: async () => ({ technicianId: 'tech-1' })
        } as unknown as Request;

        await PATCH(req, { params: Promise.resolve({ id: 'inter-1' }) });

        expect(prisma.intervention.update).toHaveBeenCalledWith({
            where: { id: 'inter-1' },
            data: expect.objectContaining({
                technicianId: 'tech-1',
                status: 'CONFIRMED' // Status auto-updated
            })
        });

        // Verify notification to technician
        expect(sendPushNotification).toHaveBeenCalledWith('tech-1', expect.any(Object));
    });
});
