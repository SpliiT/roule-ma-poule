import { clerkSetup } from '@clerk/testing/playwright';
import dotenv from 'dotenv';
import path from 'path';

// On s'assure que les variables d'environnement sont chargées pour le global setup
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

export default async function globalSetup() {
    await clerkSetup();
}
