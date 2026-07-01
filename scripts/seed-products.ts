import { prisma } from '../src/lib/prisma';

const products = [
    {
        name: 'Chambre à air standard',
        description: 'Chambre à air universelle, compatible avec la plupart des vélos de ville et VTT.',
        price: 8.50,
        stock: 50,
        category: 'Pneumatiques',
    },
    {
        name: 'Pneu anti-crevaison Schwalbe',
        description: 'Pneu robuste idéal pour la ville, résistant aux crevaisons.',
        price: 35.00,
        stock: 20,
        category: 'Pneumatiques',
    },
    {
        name: 'Plaquettes de frein à disque',
        description: 'Paires de plaquettes de rechange pour freinage optimal.',
        price: 15.00,
        stock: 30,
        category: 'Freinage',
    },
    {
        name: 'Patins de frein',
        description: 'Patins de frein standard pour V-Brake.',
        price: 6.50,
        stock: 100,
        category: 'Freinage',
    },
    {
        name: 'Chaîne 8/9 vitesses',
        description: 'Chaîne renforcée, idéale pour les vélos électriques et classiques.',
        price: 22.00,
        stock: 15,
        category: 'Transmission',
    },
    {
        name: 'Câble et gaine de dérailleur',
        description: 'Kit complet pour un passage de vitesses fluide.',
        price: 12.00,
        stock: 40,
        category: 'Transmission',
    },
    {
        name: 'Kit de lumières LED',
        description: 'Éclairage avant et arrière rechargeable par USB.',
        price: 25.00,
        stock: 25,
        category: 'Accessoires',
    },
    {
        name: 'Selle confort gel',
        description: 'Selle ergonomique pour un confort optimal sur de longs trajets.',
        price: 45.00,
        stock: 10,
        category: 'Accessoires',
    },
    {
        name: 'Antivol en U haute sécurité',
        description: 'Antivol certifié, idéal pour sécuriser votre vélo en ville.',
        price: 55.00,
        stock: 8,
        category: 'Accessoires',
    },
    {
        name: 'Lubrifiant chaîne (Conditions sèches)',
        description: 'Burette de 100ml pour l\'entretien régulier.',
        price: 9.90,
        stock: 60,
        category: 'Entretien',
    }
];

async function main() {
    console.log('Début de l\'ajout des produits...');
    let count = 0;
    
    for (const p of products) {
        // Optionnel : vérifier si le produit existe déjà pour éviter les doublons lors de ré-exécutions
        const existing = await prisma.product.findFirst({
            where: { name: p.name }
        });

        if (!existing) {
            await prisma.product.create({
                data: p,
            });
            console.log(`✅ Ajouté : ${p.name}`);
            count++;
        } else {
            console.log(`⏩ Ignoré (déjà existant) : ${p.name}`);
        }
    }

    console.log(`Terminé ! ${count} produits ajoutés avec succès.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
