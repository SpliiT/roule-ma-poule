import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';
import { cookies } from 'next/headers';

/**
 * Récupère l'utilisateur actuellement connecté depuis l'authentification Clerk (session)
 * et synchronise l'état avec la base de données via Prisma.
 * Gère également un mode "bypass" par cookie, utilisé exclusivement pour les tests End-to-End (E2E),
 * permettant de simuler une session sans authentifier un compte Clerk réel sur les navigateurs Headless (Playwright).
 * 
 * @returns {Promise<User | null>} L'objet User complet tiré de la BDD, ou null si l'utilisateur n'est pas connecté.
 */
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
/**
 * Vérifie de manière stricte la présence d'un utilisateur connecté.
 * Cette fonction est pensée pour sécuriser les routes de l'API (Server Actions / Route Handlers)
 * qui nécessitent impérativement un contexte utilisateur.
 * 
 * @throws {Error} Si l'utilisateur n'est pas authentifié ("Non authentifié").
 * @returns {Promise<User>} L'objet User, garanti d'exister pour la suite de l'exécution.
 */
export async function requireUser(): Promise<User> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Non authentifié');
    }
    return user;
}
/**
 * Contrôle d'accès basé sur les rôles (RBAC). Vérifie que l'utilisateur connecté 
 * possède bien le rôle demandé. 
 * Note : Le rôle 'ADMIN' dispose d'un accès global outrepassant cette vérification.
 * 
 * @param {'ADMIN' | 'TECHNICIEN' | 'CLIENT'} role - Le rôle requis pour accéder à la ressource.
 * @throws {Error} Si l'utilisateur n'a pas le bon rôle ("Accès non autorisé").
 * @returns {Promise<User>} L'objet User vérifié.
 */
export async function requireRole(role: 'ADMIN' | 'TECHNICIEN' | 'CLIENT'): Promise<User> {
    const user = await requireUser();
    if (user.role !== role && user.role !== 'ADMIN') {
        throw new Error('Accès non autorisé');
    }
    return user;
}