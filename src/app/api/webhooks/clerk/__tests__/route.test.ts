import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';
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
        user: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock('svix', () => {
    return {
        Webhook: jest.fn().mockImplementation(() => ({
            verify: jest.fn(),
        })),
    };
});

// Mock next/headers
jest.mock('next/headers', () => ({
    headers: jest.fn(),
}));
import { headers } from 'next/headers';

describe('Clerk Webhook API', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        process.env = { ...originalEnv, CLERK_WEBHOOK_SECRET: 'test_secret' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('returns 500 if WEBHOOK_SECRET is missing', async () => {
        delete process.env.CLERK_WEBHOOK_SECRET;
        const req = { json: async () => ({}) } as Request;
        const response = await POST(req);
        expect(response.status).toBe(500);
    });

    it('returns 400 if Svix headers are missing', async () => {
        const mockHeaders = new Map();
        (headers as jest.Mock).mockResolvedValue(mockHeaders);

        const req = { json: async () => ({}) } as Request;
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    it('creates a user on user.created event', async () => {
        const mockHeaders = new Map();
        mockHeaders.set('svix-id', 'test_id');
        mockHeaders.set('svix-timestamp', 'test_timestamp');
        mockHeaders.set('svix-signature', 'test_signature');
        (headers as jest.Mock).mockResolvedValue(mockHeaders);

        const mockPayload = {
            type: 'user.created',
            data: {
                id: 'clerk_123',
                email_addresses: [{ email_address: 'test@example.com' }],
                first_name: 'John',
                last_name: 'Doe',
            },
        };

        const req = { json: async () => mockPayload } as Request;

        const mockVerify = jest.fn().mockReturnValue(mockPayload);
        (Webhook as unknown as jest.Mock).mockImplementation(() => ({
            verify: mockVerify,
        }));

        const response = await POST(req);
        expect(response.status).toBe(200);
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                clerkId: 'clerk_123',
                email: 'test@example.com',
                name: 'John Doe',
                phone: null,
                role: 'CLIENT',
            },
        });
    });

    it('updates a user on user.updated event', async () => {
        const mockHeaders = new Map();
        mockHeaders.set('svix-id', 'test_id');
        mockHeaders.set('svix-timestamp', 'test_timestamp');
        mockHeaders.set('svix-signature', 'test_signature');
        (headers as jest.Mock).mockResolvedValue(mockHeaders);

        const mockPayload = {
            type: 'user.updated',
            data: {
                id: 'clerk_123',
                email_addresses: [{ email_address: 'updated@example.com' }],
                first_name: 'Jane',
            },
        };

        const req = { json: async () => mockPayload } as Request;

        const mockVerify = jest.fn().mockReturnValue(mockPayload);
        (Webhook as unknown as jest.Mock).mockImplementation(() => ({
            verify: mockVerify,
        }));

        const response = await POST(req);
        expect(response.status).toBe(200);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { clerkId: 'clerk_123' },
            data: {
                email: 'updated@example.com',
                name: 'Jane',
                phone: null,
            },
        });
    });

    it('deletes a user on user.deleted event', async () => {
        const mockHeaders = new Map();
        mockHeaders.set('svix-id', 'test_id');
        mockHeaders.set('svix-timestamp', 'test_timestamp');
        mockHeaders.set('svix-signature', 'test_signature');
        (headers as jest.Mock).mockResolvedValue(mockHeaders);

        const mockPayload = {
            type: 'user.deleted',
            data: {
                id: 'clerk_123',
            },
        };

        const req = { json: async () => mockPayload } as Request;

        const mockVerify = jest.fn().mockReturnValue(mockPayload);
        (Webhook as unknown as jest.Mock).mockImplementation(() => ({
            verify: mockVerify,
        }));

        const response = await POST(req);
        expect(response.status).toBe(200);
        expect(prisma.user.delete).toHaveBeenCalledWith({
            where: { clerkId: 'clerk_123' },
        });
    });
});
