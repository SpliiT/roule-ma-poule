const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing ScheduledNotification model...');
    const count = await prisma.scheduledNotification.count();
    console.log('Current count:', count);
  } catch (err) {
    console.error('Prisma Model Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
