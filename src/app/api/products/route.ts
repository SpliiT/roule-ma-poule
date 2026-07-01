import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        // Optionnel : vérifier si l'utilisateur est connecté pour éviter un accès public complet
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            where: { 
                isActive: true,
                stock: { gt: 0 } // On ne retourne que les produits en stock
            },
            orderBy: { name: 'asc' },
        });
        
        return NextResponse.json({ data: products }, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 });
    }
}
