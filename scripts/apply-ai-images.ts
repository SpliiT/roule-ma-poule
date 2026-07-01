import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';

const productImages = {
    'Chambre à air standard': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\inner_tube_1782900183974.png',
    'Pneu anti-crevaison Schwalbe': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\bicycle_tire_1782900192913.png',
    'Plaquettes de frein à disque': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\disc_brake_pads_1782900202067.png',
    'Patins de frein': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\v_brake_pads_1782900210876.png',
    'Chaîne 8/9 vitesses': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\bicycle_chain_1782900220272.png',
    'Câble et gaine de dérailleur': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\derailleur_cable_1782900227799.png',
    'Kit de lumières LED': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\led_lights_1782900235865.png',
    'Selle confort gel': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\bicycle_saddle_1782900243605.png',
    'Antivol en U haute sécurité': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\u_lock_1782900251257.png',
    'Lubrifiant chaîne (Conditions sèches)': 'C:\\Users\\splii\\.gemini\\antigravity-ide\\brain\\7e65d6b5-60f0-4d9d-a97f-429f00e79067\\chain_lube_1782900258678.png'
};

async function main() {
    const publicDir = path.join(process.cwd(), 'public');
    const productsDir = path.join(publicDir, 'images', 'products');

    if (!fs.existsSync(productsDir)) {
        fs.mkdirSync(productsDir, { recursive: true });
    }

    console.log('Installation des nouvelles images générées...');

    for (const [name, sourcePath] of Object.entries(productImages)) {
        const product = await prisma.product.findFirst({ where: { name } });
        
        if (product && fs.existsSync(sourcePath)) {
            const filename = `${product.id}.png`;
            const destPath = path.join(productsDir, filename);
            const localUrl = `/images/products/${filename}`;

            try {
                fs.copyFileSync(sourcePath, destPath);
                
                await prisma.product.update({
                    where: { id: product.id },
                    data: { imageUrl: localUrl }
                });
                console.log(`✅ Image installée pour : ${name}`);
            } catch (error) {
                console.error(`❌ Erreur pour ${name}:`, error);
            }
        } else {
            if (!fs.existsSync(sourcePath)) {
                console.log(`Fichier source manquant pour ${name}: ${sourcePath}`);
            }
        }
    }
    console.log('Terminé !');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
