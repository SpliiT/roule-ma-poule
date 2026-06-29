import { getCurrentUser, requireUser, requireRole } from '../auth';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

describe('Auth Lib', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getCurrentUser', () => {
        it('should return null if not authenticated with Clerk', async () => {
            (auth as jest.Mock).mockResolvedValue({ userId: null });
            
            const user = await getCurrentUser();
            expect(user).toBeNull();
            expect(prisma.user.findUnique).not.toHaveBeenCalled();
        });

        it('should return the user from database if authenticated', async () => {
            (auth as jest.Mock).mockResolvedValue({ userId: 'clerk-123' });
            
            const mockDbUser = { id: 'user-1', clerkId: 'clerk-123', role: 'CLIENT' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

            const user = await getCurrentUser();
            expect(user).toEqual(mockDbUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { clerkId: 'clerk-123' }
            });
        });
    });

    describe('requireUser', () => {
        it('should throw an error if no user is found', async () => {
            (auth as jest.Mock).mockResolvedValue({ userId: null });
            await expect(requireUser()).rejects.toThrow('Non authentifié');
        });

        it('should return the user if found', async () => {
            const mockDbUser = { id: 'user-1', clerkId: 'clerk-123', role: 'CLIENT' };
            (auth as jest.Mock).mockResolvedValue({ userId: 'clerk-123' });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

            const user = await requireUser();
            expect(user).toEqual(mockDbUser);
        });
    });

    describe('requireRole', () => {
        it('should throw an error if user does not have the required role', async () => {
            const mockDbUser = { id: 'user-1', clerkId: 'clerk-123', role: 'CLIENT' };
            (auth as jest.Mock).mockResolvedValue({ userId: 'clerk-123' });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

            await expect(requireRole('TECHNICIEN')).rejects.toThrow('Accès non autorisé');
        });

        it('should allow access if user has the exact required role', async () => {
            const mockDbUser = { id: 'tech-1', clerkId: 'clerk-123', role: 'TECHNICIEN' };
            (auth as jest.Mock).mockResolvedValue({ userId: 'clerk-123' });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

            const user = await requireRole('TECHNICIEN');
            expect(user).toEqual(mockDbUser);
        });

        it('should always allow access if user is an ADMIN', async () => {
            const mockDbUser = { id: 'admin-1', clerkId: 'clerk-123', role: 'ADMIN' };
            (auth as jest.Mock).mockResolvedValue({ userId: 'clerk-123' });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

            const user = await requireRole('TECHNICIEN'); // Asking for Tech, but we are Admin
            expect(user).toEqual(mockDbUser);
        });
    });
});
