import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Instanciation du client Prisma en tant que singleton global.
 * Cette approche évite d'épuiser le pool de connexions à la base de données (PostgreSQL) 
 * à cause du Hot-Module Replacement (HMR) de Next.js en environnement de développement.
 * 
 * L'adaptateur `PrismaPg` est utilisé en surcouche du Pool `pg` standard pour 
 * assurer une compatibilité native et robuste avec des bases de données nécessitant
 * des configurations avancées (comme Neon Tech ou PostGIS).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};
const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_PRISMA_URL is not defined in the environment');
}
const pool = globalForPrisma.pool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool;
const adapter = new PrismaPg(pool);
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
