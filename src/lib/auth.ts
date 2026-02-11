import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

/**
 * Récupère l'utilisateur courant depuis la base de données.
 * Utilise le clerkId de la session pour trouver le user correspondant.
 * Retourne null si non authentifié ou si le user n'existe pas en DB.
 */
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

/**
 * Récupère l'utilisateur courant ou throw une erreur si non authentifié.
 * À utiliser dans les API routes protégées.
 */
export async function requireUser(): Promise<User> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Non authentifié');
    }

    return user;
}

/**
 * Vérifie que l'utilisateur courant a le rôle requis.
 * Throw une erreur si le rôle ne correspond pas.
 */
export async function requireRole(role: 'ADMIN' | 'TECHNICIEN' | 'CLIENT'): Promise<User> {
    const user = await requireUser();

    if (user.role !== role && user.role !== 'ADMIN') {
        throw new Error('Accès non autorisé');
    }

    return user;
}
