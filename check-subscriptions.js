const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://neondb_owner:npg_vMIpNwVK7b1e@ep-delicate-block-ab3mtgca-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=verify-full";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const usersCount = await prisma.user.count();
    console.log('USERS_COUNT:', usersCount);

    const subscriptions = await prisma.pushSubscription.findMany({
        include: { user: { select: { name: true, clerkId: true } } }
    });
    console.log('SUBSCRIPTIONS:', JSON.stringify(subscriptions, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
