import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';
import { cookies } from 'next/headers';

export async function getCurrentUser(): Promise<User | null> {
    let { userId: clerkId } = await auth();
    
    // E2E Test Bypass (Dev/Testing only)
    if (process.env.NODE_ENV !== 'production') {
        const bypassCookie = (await cookies()).get('__e2e_bypass_clerk_id');
        if (bypassCookie) {
            clerkId = bypassCookie.value;
            // On bypass complètement la BDD et on retourne un faux utilisateur Client
            return {
                id: 'e2e_test_user_id',
                clerkId: clerkId,
                email: 'test-e2e@example.com',
                username: 'Teste2e',
                role: 'CLIENT',
                createdAt: new Date(),
                updatedAt: new Date(),
                firstName: 'Test',
                lastName: 'E2E',
                phone: null,
                avatarUrl: null
            } as unknown as User;
        }
    }

    if (!clerkId) {
        return null;
    }
    const user = await prisma.user.findUnique({
        where: { clerkId },
    });
    return user;
}
export async function requireUser(): Promise<User> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Non authentifié');
    }
    return user;
}
export async function requireRole(role: 'ADMIN' | 'TECHNICIEN' | 'CLIENT'): Promise<User> {
    const user = await requireUser();
    if (user.role !== role && user.role !== 'ADMIN') {
        throw new Error('Accès non autorisé');
    }
    return user;
}