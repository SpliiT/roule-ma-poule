import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const keys = Object.keys(prisma);
    const models = keys.filter(k => !k.startsWith('_') && !k.startsWith('$'));
    return NextResponse.json({
        models,
        time: new Date().toISOString()
    });
}
