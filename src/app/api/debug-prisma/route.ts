import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const keys = Object.keys(prisma);
        const models = keys.filter(k => !k.startsWith('_') && !k.startsWith('$'));

        
        let testCreateResult = null;
        let testCreateError = null;

        try {
            testCreateResult = await (prisma as any).scheduledNotification.create({
                data: {
                    title: 'DEBUG TEST',
                    body: 'DEBUG BODY',
                    scheduledAt: new Date(),
                    status: 'SENT',
                    sentAt: new Date(),
                }
            });
        } catch (err: any) {
            testCreateError = {
                message: err.message,
                stack: err.stack,
                code: err.code,
                meta: err.meta
            };
        }

        return NextResponse.json({
            models,
            testCreateResult,
            testCreateError,
            time: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
