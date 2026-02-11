import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        const { userId } = await auth();
        const clerkUser = await currentUser();

        if (!userId || !clerkUser) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Vérifier si le user existe déjà
        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
            const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || null;

            if (!email) {
                return NextResponse.json({ error: 'Email manquant dans Clerk' }, { status: 400 });
            }

            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email,
                    name,
                    phone,
                    role: 'CLIENT',
                },
            });
            console.log(`[Sync] Utilisateur synchronisé (créé): ${email}`);
        } else {
            console.log(`[Sync] Utilisateur déjà synchronisé: ${user.email}`);
        }

        return NextResponse.json({ data: user });
    } catch (error) {
        console.error('Erreur sync user:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
