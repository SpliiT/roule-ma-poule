import fs from 'fs';
import path from 'path';
import https from 'https';
import { prisma } from '../src/lib/prisma';

const productImages = {
    'Chambre à air standard': 'https://contents.mediadecathlon.com/p1125211/k$cd7a3e81fcda9a96e95ab5f4f81a7dcd/sq/chambre-a-air.jpg',
    'Pneu anti-crevaison Schwalbe': 'https://contents.mediadecathlon.com/p2111585/k$99e7127e4c27aeb8284534fa2be0eb1d/sq/pneu.jpg',
    'Plaquettes de frein à disque': 'https://contents.mediadecathlon.com/p1163456/k$753f2c5e53303cb682496a793c72fc9f/sq/plaquettes.jpg',
    'Patins de frein': 'https://contents.mediadecathlon.com/p1450280/k$e8c148bb66c4c933930b6e921d782cf7/sq/patins.jpg',
    'Chaîne 8/9 vitesses': 'https://contents.mediadecathlon.com/p1100570/k$801ed8fb780bc23b564cdb1c60d84381/sq/chaine.jpg',
    'Câble et gaine de dérailleur': 'https://contents.mediadecathlon.com/p1166645/k$e78c85354964e5124036b0be6de64d0a/sq/cable.jpg',
    'Kit de lumières LED': 'https://contents.mediadecathlon.com/p1713508/k$bf1bb6f4f2c9b4e7a79b8a07c5784f1f/sq/lumieres.jpg',
    'Selle confort gel': 'https://contents.mediadecathlon.com/p2134591/k$0c96eb8e3a2468cffb67cdb998270505/sq/selle.jpg',
    'Antivol en U haute sécurité': 'https://contents.mediadecathlon.com/p2001552/k$10602693e54b67f18db0d30623a85496/sq/antivol.jpg',
    'Lubrifiant chaîne (Conditions sèches)': 'https://contents.mediadecathlon.com/p1775796/k$30d4373eb512c1e7a6abebdd0cd9c8a9/sq/lubrifiant.jpg'
};

const downloadImage = (url: string, filepath: string) => {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };
        https.get(url, options, (res) => {
            if (res.statusCode === 200) {
                const fileStream = fs.createWriteStream(filepath);
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve(true);
                });
            } else {
                reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
};

async function main() {
    const publicDir = path.join(process.cwd(), 'public');
    const productsDir = path.join(publicDir, 'images', 'products');

    // Create directories if they don't exist
    if (!fs.existsSync(productsDir)) {
        fs.mkdirSync(productsDir, { recursive: true });
    }

    console.log('Téléchargement des images en cours...');

    for (const [name, url] of Object.entries(productImages)) {
        const product = await prisma.product.findFirst({ where: { name } });
        
        if (product) {
            const filename = `${product.id}.jpg`;
            const filepath = path.join(productsDir, filename);
            const localUrl = `/images/products/${filename}`;

            try {
                await downloadImage(url, filepath);
                
                await prisma.product.update({
                    where: { id: product.id },
                    data: { imageUrl: localUrl }
                });
                console.log(`✅ Image téléchargée et associée pour : ${name}`);
            } catch (error) {
                console.error(`❌ Erreur pour ${name}:`, error);
            }
        }
    }
    console.log('Terminé !');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
