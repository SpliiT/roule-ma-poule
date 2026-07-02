import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const clerkUser = await currentUser();
        if (!userId || !clerkUser) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
        const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || null;
        if (!email) {
            return NextResponse.json({ error: 'Email manquant dans Clerk' }, { status: 400 });
        }
        
        // Handle possible email conflicts by checking first
        let user = await prisma.user.findUnique({ where: { clerkId: userId } });
        
        if (!user) {
            const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
            if (existingUserByEmail) {
                user = await prisma.user.update({
                    where: { email },
                    data: { clerkId: userId, name, phone }
                });
            } else {
                user = await prisma.user.create({
                    data: { clerkId: userId, email, name, phone, role: 'CLIENT' }
                });
            }
        } else {
            user = await prisma.user.update({
                where: { clerkId: userId },
                data: { email, name, phone }
            });
        }

        console.log(`[Sync] Utilisateur synchronisé: ${email}`);
        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error('Erreur sync user:', error);
        return NextResponse.json({ error: 'Erreur serveur: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
    }
}