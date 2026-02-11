import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';
export async function getCurrentUser(): Promise<User | null> {
    const { userId: clerkId } = await auth();
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