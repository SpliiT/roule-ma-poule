import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import axios from 'axios';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const zonesToCreate = [
    // Arrondissements de Lyon
    { id: 'zone-lyon-1', name: 'Lyon 1er', query: 'Lyon 1er Arrondissement, France', color: '#EF4444' },
    { id: 'zone-lyon-2', name: 'Lyon 2e', query: 'Lyon 2e Arrondissement, France', color: '#F97316' },
    { id: 'zone-lyon-3', name: 'Lyon 3e', query: 'Lyon 3e Arrondissement, France', color: '#F59E0B' },
    { id: 'zone-lyon-4', name: 'Lyon 4e', query: 'Lyon 4e Arrondissement, France', color: '#EAB308' },
    { id: 'zone-lyon-5', name: 'Lyon 5e', query: 'Lyon 5e Arrondissement, France', color: '#84CC16' },
    { id: 'zone-lyon-6', name: 'Lyon 6e', query: 'Lyon 6e Arrondissement, France', color: '#22C55E' },
    { id: 'zone-lyon-7', name: 'Lyon 7e', query: 'Lyon 7e Arrondissement, France', color: '#10B981' },
    { id: 'zone-lyon-8', name: 'Lyon 8e', query: 'Lyon 8e Arrondissement, France', color: '#14B8A6' },
    { id: 'zone-lyon-9', name: 'Lyon 9e', query: 'Lyon 9e Arrondissement, France', color: '#06B6D4' },
    
    // Villes limitrophes
    { id: 'zone-villeurbanne', name: 'Villeurbanne', query: 'Villeurbanne, France', color: '#0EA5E9' },
    { id: 'zone-bron', name: 'Bron', query: 'Bron, France', color: '#3B82F6' },
    { id: 'zone-venissieux', name: 'Vénissieux', query: 'Vénissieux, France', color: '#6366F1' },
    { id: 'zone-caluire', name: 'Caluire-et-Cuire', query: 'Caluire-et-Cuire, France', color: '#8B5CF6' },
    { id: 'zone-ecully', name: 'Écully', query: 'Écully, France', color: '#A855F7' },
    { id: 'zone-oullins', name: 'Oullins', query: 'Oullins-Pierre-Bénite, France', color: '#D946EF' },
    { id: 'zone-tassin', name: 'Tassin-la-Demi-Lune', query: 'Tassin-la-Demi-Lune, France', color: '#EC4899' },
    { id: 'zone-sainte-foy', name: 'Sainte-Foy-lès-Lyon', query: 'Sainte-Foy-lès-Lyon, France', color: '#F43F5E' },
    { id: 'zone-decines', name: 'Décines-Charpieu', query: 'Décines-Charpieu, France', color: '#94A3B8' },
    { id: 'zone-saint-fons', name: 'Saint-Fons', query: 'Saint-Fons, France', color: '#10B981' },
    { id: 'zone-pierre-benite', name: 'Pierre-Bénite', query: 'Pierre-Bénite, France', color: '#8B5CF6' },
    { id: 'zone-saint-genis-laval', name: 'Saint-Genis-Laval', query: 'Saint-Genis-Laval, France', color: '#6366F1' },
    { id: 'zone-francheville', name: 'Francheville', query: 'Francheville, Auvergne-Rhône-Alpes, France', color: '#F43F5E' },
    { id: 'zone-craponne', name: 'Craponne', query: 'Craponne, France', color: '#F97316' },
    { id: 'zone-dardilly', name: 'Dardilly', query: 'Dardilly, France', color: '#EAB308' },
    { id: 'zone-rillieux', name: 'Rillieux-la-Pape', query: 'Rillieux-la-Pape, France', color: '#3B82F6' },
    { id: 'zone-saint-priest', name: 'Saint-Priest', query: 'Saint-Priest, Métropole de Lyon, France', color: '#0EA5E9' },
    { id: 'zone-chassieu', name: 'Chassieu', query: 'Chassieu, France', color: '#14B8A6' },
    { id: 'zone-meyzieu', name: 'Meyzieu', query: 'Meyzieu, France', color: '#06B6D4' },
    { id: 'zone-corbas', name: 'Corbas', query: 'Corbas, France', color: '#84CC16' },
    { id: 'zone-feyzin', name: 'Feyzin', query: 'Feyzin, France', color: '#D946EF' },
    { id: 'zone-irigny', name: 'Irigny', query: 'Irigny, France', color: '#EC4899' },
    { id: 'zone-la-mulatiere', name: 'La Mulatière', query: 'La Mulatière, France', color: '#EF4444' },
    { id: 'zone-champagne', name: 'Champagne-au-Mont-d\'Or', query: 'Champagne-au-Mont-d\'Or, France', color: '#10B981' },
    { id: 'zone-saint-cyr', name: 'Saint-Cyr-au-Mont-d\'Or', query: 'Saint-Cyr-au-Mont-d\'Or, France', color: '#F59E0B' },
    { id: 'zone-saint-didier', name: 'Saint-Didier-au-Mont-d\'Or', query: 'Saint-Didier-au-Mont-d\'Or, France', color: '#3B82F6' },
    { id: 'zone-vaulx-en-velin', name: 'Vaulx-en-Velin', query: 'Vaulx-en-Velin, France', color: '#64748B' },
];

async function fetchGeometry(query: string) {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: query,
                polygon_geojson: 1,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'RouleMaPouleSeedScript/1.0'
            }
        });

        if (response.data && response.data.length > 0 && response.data[0].geojson) {
            return JSON.stringify(response.data[0].geojson);
        }
        return null;
    } catch (error) {
        console.error(`❌ Erreur Nominatim pour ${query}:`, error.message);
        return null;
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    console.log('🌱 Nettoyage des anciennes zones...');
    await prisma.zone.deleteMany();
    console.log('✅ Anciennes zones supprimées.');

    console.log('🌱 Début du seed des 36 zones exactes (via Nominatim)...');

    for (const zoneData of zonesToCreate) {
        console.log(`Recherche de la géométrie pour ${zoneData.name}...`);
        const geometry = await fetchGeometry(zoneData.query);
        
        if (!geometry) {
            console.log(`⚠️ Géométrie introuvable pour ${zoneData.name}, on ignore.`);
            continue;
        }

        await prisma.zone.upsert({
            where: { id: zoneData.id },
            update: {
                name: zoneData.name,
                color: zoneData.color,
                geometry: geometry,
            },
            create: {
                id: zoneData.id,
                name: zoneData.name,
                color: zoneData.color,
                geometry: geometry,
                isActive: true,
            },
        });
        console.log(`✅ Zone créée ou mise à jour avec précision : ${zoneData.name}`);
        
        // Respecter la limite de Nominatim (1 requête par seconde)
        await sleep(1500);
    }

    console.log('🎉 Seed des zones exactes terminé avec succès !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed des zones:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
