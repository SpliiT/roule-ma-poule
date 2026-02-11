import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const unreadCount = await prisma.notification.count({
            where: { userId: user.id, isRead: false },
        });
        return NextResponse.json({ data: notifications, unreadCount });
    } catch (error) {
        console.error('GET notifications error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
export async function PATCH(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        const body = await req.json();
        const { notificationId, markAllRead } = body;
        if (markAllRead) {
            await prisma.notification.updateMany({
                where: { userId: user.id, isRead: false },
                data: { isRead: true },
            });
        } else if (notificationId) {
            await prisma.notification.update({
                where: { id: notificationId, userId: user.id },
                data: { isRead: true },
            });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH notifications error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}