import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
import { PrismaClient, BikeType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Début du seed...');

    // ── Infos de la société ──
    const company = await prisma.companyInfo.upsert({
        where: { id: 'company-1' },
        update: {},
        create: {
            id: 'company-1',
            name: 'LeCycleLyonnais',
            description: "68 ans d'expérience dans la vente et l'entretien de vélos",
            address: '42 Rue de la République, 69002 Lyon',
            phone: '04 72 00 00 00',
            email: 'contact@lecyclelyonnais.fr',
            website: 'https://lecyclelyonnais.fr',
            siret: '12345678900012',
        },
    });

    // ── Forfaits ──
    const forfaits = await Promise.all([
        prisma.forfait.upsert({
            where: { id: 'forfait-basique' },
            update: {},
            create: {
                id: 'forfait-basique',
                name: 'Révision basique',
                description: 'Vérification complète, réglage freins et vitesses, graissage',
                duration: 60,
                price: 49.90,
            },
        }),
        prisma.forfait.upsert({
            where: { id: 'forfait-complet' },
            update: {},
            create: {
                id: 'forfait-complet',
                name: 'Révision complète',
                description: 'Révision basique + nettoyage complet + réglage transmission',
                duration: 90,
                price: 79.90,
            },
        }),
        prisma.forfait.upsert({
            where: { id: 'forfait-vae' },
            update: {},
            create: {
                id: 'forfait-vae',
                name: 'Entretien VAE',
                description: 'Révision spéciale vélo électrique avec diagnostic batterie',
                duration: 120,
                price: 99.90,
            },
        }),
        prisma.forfait.upsert({
            where: { id: 'forfait-crevaison' },
            update: {},
            create: {
                id: 'forfait-crevaison',
                name: 'Réparation crevaison',
                description: 'Démontage de la roue, remplacement de la chambre à air, remontage',
                duration: 30,
                price: 25.00,
            },
        }),
    ]);

    // ── Produits ──
    const products = await Promise.all([
        prisma.product.upsert({
            where: { id: 'prod-huile' },
            update: {},
            create: {
                id: 'prod-huile',
                name: 'Huile chaîne 100ml',
                description: 'Lubrifiant haute performance toutes conditions',
                price: 9.90,
                stock: 50,
                category: 'Lubrifiants',
            },
        }),
        prisma.product.upsert({
            where: { id: 'prod-chambre-700' },
            update: {},
            create: {
                id: 'prod-chambre-700',
                name: 'Chambre à air 700x23',
                description: 'Compatible vélos de route',
                price: 7.50,
                stock: 30,
                category: 'Pneumatiques',
            },
        }),
        prisma.product.upsert({
            where: { id: 'prod-chambre-26' },
            update: {},
            create: {
                id: 'prod-chambre-26',
                name: 'Chambre à air 26"',
                description: 'Compatible VTT',
                price: 8.50,
                stock: 25,
                category: 'Pneumatiques',
            },
        }),
        prisma.product.upsert({
            where: { id: 'prod-patins' },
            update: {},
            create: {
                id: 'prod-patins',
                name: 'Patins de frein (x2)',
                description: 'Patins de frein universels',
                price: 12.90,
                stock: 40,
                category: 'Freinage',
            },
        }),
        prisma.product.upsert({
            where: { id: 'prod-cable' },
            update: {},
            create: {
                id: 'prod-cable',
                name: 'Câble de dérailleur',
                description: 'Câble inox universel avec gaine',
                price: 6.90,
                stock: 35,
                category: 'Transmission',
            },
        }),
    ]);

    // ── Zones (Lyon et environs) ──
    const zones = await Promise.all([
        prisma.zone.upsert({
            where: { id: 'zone-lyon-centre' },
            update: {},
            create: {
                id: 'zone-lyon-centre',
                name: 'Lyon Centre',
                description: '1er, 2e, 4e, 6e arrondissements',
                geometry: 'POLYGON((4.82 45.75, 4.85 45.75, 4.85 45.77, 4.82 45.77, 4.82 45.75))',
                color: '#3B82F6',
            },
        }),
        prisma.zone.upsert({
            where: { id: 'zone-lyon-est' },
            update: {},
            create: {
                id: 'zone-lyon-est',
                name: 'Lyon Est',
                description: '3e, 7e, 8e arrondissements',
                geometry: 'POLYGON((4.85 45.74, 4.89 45.74, 4.89 45.77, 4.85 45.77, 4.85 45.74))',
                color: '#10B981',
            },
        }),
        prisma.zone.upsert({
            where: { id: 'zone-lyon-ouest' },
            update: {},
            create: {
                id: 'zone-lyon-ouest',
                name: 'Lyon Ouest',
                description: '5e, 9e arrondissements, Tassin, Écully',
                geometry: 'POLYGON((4.77 45.75, 4.82 45.75, 4.82 45.78, 4.77 45.78, 4.77 45.75))',
                color: '#F59E0B',
            },
        }),
    ]);

    console.log('✅ Seed terminé avec succès');
    console.log({
        company: company.name,
        forfaits: forfaits.length,
        products: products.length,
        zones: zones.length,
    });
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
