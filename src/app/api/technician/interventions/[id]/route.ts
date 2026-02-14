import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendStatusUpdate } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { z } from 'zod';
const updateSchema = z.object({
    status: z.enum(['IN_PROGRESS', 'COMPLETED']).optional(),
    technicianNotes: z.string().optional(),
    photos: z.array(z.string().url()).optional(),
    isPaid: z.boolean().optional(),
    paymentMethod: z.string().optional(),
    addProducts: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
    })).optional(),
    removeProductIds: z.array(z.string()).optional(),
});
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireRole('TECHNICIEN');
        const { id } = await params;
        const intervention = await prisma.intervention.findUnique({
            where: { id },
            include: {
                client: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                bike: true,
                forfait: true,
                products: {
                    include: { product: { select: { id: true, name: true, price: true } } },
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!intervention) {
            return NextResponse.json({ error: 'Intervention introuvable' }, { status: 404 });
        }
        return NextResponse.json({ data: intervention });
    } catch (error) {
        console.error('GET tech intervention error:', error);
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireRole('TECHNICIEN');
        const { id } = await params;
        const body = await req.json();
        const data = updateSchema.parse(body);
        const current = await prisma.intervention.findUnique({
            where: { id },
        });
        if (!current) {
            return NextResponse.json({ error: 'Intervention introuvable' }, { status: 404 });
        }
        
        if (current.technicianId && current.technicianId !== user.id) {
            return NextResponse.json({ error: 'Intervention déjà assignée à un autre technicien' }, { status: 403 });
        }
        
        if (!current.technicianId) {
            await prisma.intervention.update({
                where: { id },
                data: { technicianId: user.id }
            });
        }
        const updateData: any = {};
        if (data.status) {
            updateData.status = data.status;
            if (data.status === 'COMPLETED') {
                updateData.completedAt = new Date();
            }
        }
        if (data.technicianNotes !== undefined) {
            updateData.technicianNotes = data.technicianNotes;
        }
        if (data.photos) {
            updateData.photos = [...(current.photos || []), ...data.photos];
        }
        if (data.isPaid !== undefined) {
            updateData.isPaid = data.isPaid;
            if (data.isPaid) updateData.paidAt = new Date();
        }
        if (data.paymentMethod) {
            updateData.paymentMethod = data.paymentMethod;
        }
        const updated = await prisma.intervention.update({
            where: { id },
            data: updateData,
        });
        if (data.status && data.status !== current.status) {
            await prisma.interventionStatusHistory.create({
                data: {
                    interventionId: id,
                    status: data.status,
                    notes: `Mis à jour par le technicien`,
                },
            });
            await prisma.notification.create({
                data: {
                    userId: current.clientId,
                    type: 'STATUS_CHANGED',
                    title: data.status === 'COMPLETED' ? 'Intervention terminée !' : 'Intervention en cours',
                    message: data.status === 'COMPLETED'
                        ? 'Votre vélo a été réparé avec succès !'
                        : 'Le technicien a commencé le travail sur votre vélo.',
                    data: { interventionId: id, status: data.status },
                },
            });
            
            await sendPushNotification(current.clientId, {
                title: data.status === 'COMPLETED' ? 'Vélo prêt ! ✨' : 'Intervention en cours 🛠️',
                body: data.status === 'COMPLETED'
                    ? 'Votre vélo a été réparé avec succès !'
                    : 'Le technicien a commencé le travail sur votre vélo.',
                data: { interventionId: id, url: `/dashboard` }
            });
            try {
                const fullIntervention = await prisma.intervention.findUnique({
                    where: { id },
                    include: {
                        client: { select: { email: true, name: true } },
                        forfait: { select: { name: true } },
                    },
                });
                if (fullIntervention) {
                    await sendStatusUpdate(fullIntervention as any);
                }
            } catch { }
        }
        if (data.addProducts && data.addProducts.length > 0) {
            for (const item of data.addProducts) {
                const product = await prisma.product.findUnique({ where: { id: item.productId } });
                if (product) {
                    await prisma.interventionProduct.create({
                        data: {
                            interventionId: id,
                            productId: item.productId,
                            quantity: item.quantity,
                            priceAtTime: product.price,
                        },
                    });
                }
            }
            const allProducts = await prisma.interventionProduct.findMany({ where: { interventionId: id } });
            const forfait = await prisma.forfait.findUnique({ where: { id: current.forfaitId } });
            const productsTotal = allProducts.reduce((sum: number, p: any) => sum + Number(p.priceAtTime) * p.quantity, 0);
            const newTotal = Number(forfait?.price || 0) + productsTotal;
            await prisma.intervention.update({
                where: { id },
                data: { totalPrice: newTotal },
            });
        }
        if (data.removeProductIds && data.removeProductIds.length > 0) {
            await prisma.interventionProduct.deleteMany({
                where: {
                    interventionId: id,
                    id: { in: data.removeProductIds },
                },
            });
            const allProducts = await prisma.interventionProduct.findMany({ where: { interventionId: id } });
            const forfait = await prisma.forfait.findUnique({ where: { id: current.forfaitId } });
            const productsTotal = allProducts.reduce((sum: number, p: any) => sum + Number(p.priceAtTime) * p.quantity, 0);
            const newTotal = Number(forfait?.price || 0) + productsTotal;
            await prisma.intervention.update({
                where: { id },
                data: { totalPrice: newTotal },
            });
        }
        return NextResponse.json({ data: updated });
    } catch (error) {
        console.error('PATCH tech intervention error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
