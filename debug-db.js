const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://neondb_owner:npg_vMIpNwVK7b1e@ep-delicate-block-ab3mtgca-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=verify-full";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const interventions = await prisma.intervention.findMany({
      select: { id: true, status: true, technicianId: true, createdAt: true }
    });
    console.log('ALL_INTERVENTIONS:', JSON.stringify(interventions, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
