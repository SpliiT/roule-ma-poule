import { prisma } from '../src/lib/prisma';

const productImages: Record<string, string> = {
    'Chambre à air standard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bicycle_inner_tube.jpg/400px-Bicycle_inner_tube.jpg',
    'Pneu anti-crevaison Schwalbe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Schwalbe_Marathon_Plus_Tyre.jpg/400px-Schwalbe_Marathon_Plus_Tyre.jpg',
    'Plaquettes de frein à disque': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Bicycle_disc_brake_pads.jpg/400px-Bicycle_disc_brake_pads.jpg',
    'Patins de frein': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Bicycle_brake_pads.jpg/400px-Bicycle_brake_pads.jpg',
    'Chaîne 8/9 vitesses': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Bicycle_chain.jpg/400px-Bicycle_chain.jpg',
    'Câble et gaine de dérailleur': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Bowden_cable.jpg/400px-Bowden_cable.jpg',
    'Kit de lumières LED': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bicycle_lights.jpg/400px-Bicycle_lights.jpg',
    'Selle confort gel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Bicycle_saddle.jpg/400px-Bicycle_saddle.jpg',
    'Antivol en U haute sécurité': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/U-lock.jpg/400px-U-lock.jpg',
    'Lubrifiant chaîne (Conditions sèches)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Chain_lubricant.jpg/400px-Chain_lubricant.jpg'
};

async function main() {
    console.log('Mise à jour des images des produits...');
    let count = 0;

    for (const [name, imageUrl] of Object.entries(productImages)) {
        const product = await prisma.product.findFirst({ where: { name } });
        
        if (product) {
            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrl }
            });
            console.log(`🖼️ Image ajoutée pour : ${name}`);
            count++;
        }
    }

    console.log(`Terminé ! ${count} images mises à jour.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
