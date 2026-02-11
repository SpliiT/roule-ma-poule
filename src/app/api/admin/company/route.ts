import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
const companySchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional().or(z.literal('')),
    logo: z.string().url().optional().or(z.literal('')),
    siret: z.string().optional(),
});
export async function GET() {
    try {
        await requireRole('ADMIN');
        let company = await prisma.companyInfo.findFirst();
        if (!company) {
            company = await prisma.companyInfo.create({
                data: { name: 'Roule Ma Poule' },
            });
        }
        return NextResponse.json({ data: company });
    } catch (error) {
        console.error('GET company error:', error);
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
}
export async function PATCH(req: Request) {
    try {
        await requireRole('ADMIN');
        const body = await req.json();
        const data = companySchema.parse(body);
        let company = await prisma.companyInfo.findFirst();
        if (!company) {
            company = await prisma.companyInfo.create({
                data: { name: data.name || 'Roule Ma Poule', ...data },
            });
        } else {
            company = await prisma.companyInfo.update({
                where: { id: company.id },
                data,
            });
        }
        return NextResponse.json({ data: company });
    } catch (error) {
        console.error('PATCH company error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}