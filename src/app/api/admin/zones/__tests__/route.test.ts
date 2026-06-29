import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Mocks
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
        user: {
            findMany: jest.fn(),
        },
        zone: {
            create: jest.fn(),
        },
    },
}));

jest.mock('@/lib/auth', () => ({
    requireRole: jest.fn(),
}));

describe('POST /api/admin/zones', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should assign the closest technician when no technicians are provided', async () => {
        // Mock requireRole
        (requireRole as jest.Mock).mockResolvedValue(true);

        // Mock database
        const mockTechnicians = [
            {
                id: 'tech-1',
                name: 'Far Tech',
                currentLat: 48.8566, // Paris (Far from Lyon)
                currentLng: 2.3522,
                isActive: true,
                addresses: []
            },
            {
                id: 'tech-2',
                name: 'Close Tech',
                currentLat: 45.7640, // Lyon (Close to the zone)
                currentLng: 4.8357,
                isActive: true,
                addresses: []
            }
        ];
        
        (prisma.user.findMany as jest.Mock).mockResolvedValue(mockTechnicians);
        (prisma.zone.create as jest.Mock).mockResolvedValue({ id: 'zone-1' });

        // Geometry roughly in Lyon
        const lyonGeometry = {
            type: "Polygon",
            coordinates: [
                [
                    [4.8, 45.7],
                    [4.9, 45.7],
                    [4.9, 45.8],
                    [4.8, 45.8],
                    [4.8, 45.7]
                ]
            ]
        };

        const req = {
            json: async () => ({
                name: 'Zone Test',
                geometry: lyonGeometry,
                technicianIds: [], // Empty, triggers auto-assignment
                color: '#ff0000',
            })
        } as unknown as Request;

        const response = await POST(req);
        expect(response.status).toBe(200);

        // Verify that prisma.zone.create was called with the closest technician
        expect(prisma.zone.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    technicians: {
                        create: [
                            { technicianId: 'tech-2' } // The closest one (Lyon)
                        ]
                    }
                })
            })
        );
    });
});
