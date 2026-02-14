import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { sendPushNotification } from '@/lib/push';

export async function GET() {
    try {
        await requireRole('ADMIN');

        const notifications = await prisma.scheduledNotification.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json({ data: notifications });
    } catch (error: any) {
        console.error('GET admin notifications error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const admin = await requireRole('ADMIN');
        const body = await req.json();
        const { userId, role, title, body: messageBody, url, scheduledAt, icon, image, badge } = body;

        if (!title || !messageBody) {
            return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 });
        }

        const isScheduled = !!scheduledAt;
        const scheduleDate = isScheduled ? new Date(scheduledAt) : new Date();

        if (isScheduled && scheduleDate <= new Date()) {
            return NextResponse.json({ error: 'La date programmée doit être dans le futur' }, { status: 400 });
        }

        const safeUserId = userId || null;
        const safeRole = role || null;

        console.log('[API] Notification Payload:', { safeUserId, safeRole, title, isScheduled });

        
        if (!isScheduled) {
            if (safeUserId) {
                console.log('[API] Sending to single user:', safeUserId);
                
                await sendPushNotification(safeUserId, {
                    title,
                    body: messageBody,
                    icon,
                    image,
                    badge,
                    data: { url }
                });

                console.log('[API] Creating history record...');
                
                try {
                    await (prisma as any).scheduledNotification.create({
                        data: {
                            userId: safeUserId,
                            title,
                            body: messageBody,
                            url,
                            scheduledAt: scheduleDate,
                            sentAt: new Date(),
                            status: 'SENT',
                            metadata: { icon, image, badge }
                        }
                    });
                    console.log('[API] History record created successfully');
                } catch (dbErr: any) {
                    console.error('[API] History creation FAILED (but push was sent):', dbErr);
                    
                }
            } else if (safeRole) {
                console.log('[API] Sending to role:', safeRole);
                
                const users = await prisma.user.findMany({
                    where: { role: safeRole as any, pushSubscriptions: { some: {} } },
                    select: { id: true }
                });

                console.log(`[API] Found ${users.length} users with role ${safeRole}`);

                await Promise.all(users.map(u =>
                    sendPushNotification(u.id, {
                        title,
                        body: messageBody,
                        icon,
                        image,
                        badge,
                        data: { url }
                    })
                ));

                try {
                    await (prisma as any).scheduledNotification.create({
                        data: {
                            role: safeRole as any,
                            title,
                            body: messageBody,
                            url,
                            scheduledAt: scheduleDate,
                            sentAt: new Date(),
                            status: 'SENT',
                            metadata: { icon, image, badge }
                        }
                    });
                    console.log('[API] Role history record created');
                } catch (dbErr: any) {
                    console.error('[API] Role history creation FAILED:', dbErr);
                }
            } else {
                console.log('[API] Sending BROADCAST');
                
                const users = await prisma.user.findMany({
                    where: { pushSubscriptions: { some: {} } },
                    select: { id: true }
                });

                console.log(`[API] Found ${users.length} users for broadcast`);

                await Promise.all(users.map(u =>
                    sendPushNotification(u.id, {
                        title,
                        body: messageBody,
                        icon,
                        image,
                        badge,
                        data: { url }
                    })
                ));

                try {
                    await (prisma as any).scheduledNotification.create({
                        data: {
                            title,
                            body: messageBody,
                            url,
                            scheduledAt: scheduleDate,
                            sentAt: new Date(),
                            status: 'SENT',
                            metadata: { icon, image, badge }
                        }
                    });
                    console.log('[API] Broadcast history record created');
                } catch (dbErr: any) {
                    console.error('[API] Broadcast history creation FAILED:', dbErr);
                }
            }

            return NextResponse.json({ success: true, message: 'Notification envoyée instantanément' });
        } else {
            
            const scheduled = await (prisma as any).scheduledNotification.create({
                data: {
                    userId: safeUserId,
                    role: safeRole as any,
                    title,
                    body: messageBody,
                    url,
                    scheduledAt: scheduleDate,
                    status: 'PENDING',
                    metadata: { icon, image, badge }
                }
            });

            return NextResponse.json({ success: true, data: scheduled });
        }
    } catch (error: any) {
        console.error('POST admin notifications error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            meta: error.meta
        });
        return NextResponse.json({
            error: error.message || 'Erreur serveur',
            details: error.toString(),
            stack: error.stack
        }, { status: 500 });
    }
}
