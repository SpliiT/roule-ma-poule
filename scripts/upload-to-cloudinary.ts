import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import axios from 'axios';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

if (!cloudName) {
    console.error("❌ Variable NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME manquante !");
    process.exit(1);
}

async function uploadUnsigned(filePath: string, publicId: string) {
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/png' });

    const formData = new FormData();
    formData.append('file', blob, 'image.png');
    formData.append('upload_preset', 'roule-ma-poule');
    formData.append('folder', 'products');
    formData.append('public_id', publicId);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Upload failed');
    }

    const data = await res.json();
    return data.secure_url;
}

async function main() {
    const productsDir = path.join(process.cwd(), 'public', 'images', 'products');
    
    if (!fs.existsSync(productsDir)) {
        console.error("❌ Le dossier public/images/products n'existe pas. Veuillez lancer le script apply-ai-images.ts d'abord.");
        return;
    }

    console.log('Envoi des images vers Cloudinary (via upload_preset unsigned)...');

    const products = await prisma.product.findMany();

    for (const product of products) {
        const localFilePath = path.join(productsDir, `${product.id}.png`);
        
        if (fs.existsSync(localFilePath)) {
            console.log(`Uploading ${product.name}...`);
            try {
                const secureUrl = await uploadUnsigned(localFilePath, `roulemapoule_product_${product.id}`);
                
                await prisma.product.update({
                    where: { id: product.id },
                    data: { imageUrl: secureUrl }
                });
                console.log(`✅ ${product.name} mis à jour avec l'URL Cloudinary !`);
            } catch (error: any) {
                console.error(`❌ Échec pour ${product.name}:`, error.response?.data || error.message);
            }
        }
    }
    console.log('Toutes les images ont été envoyées vers Cloudinary !');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
