const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Attempting to create a ScheduledNotification...');
    const result = await prisma.scheduledNotification.create({
      data: {
        title: 'TEST FROM NODE SCRIPT',
        body: 'This is a test to verify DB connectivity and model availability.',
        scheduledAt: new Date(),
        status: 'SENT',
        sentAt: new Date(),
      }
    });
    console.log('SUCCESS:', result);
  } catch (err) {
    console.error('FAILURE:', err.message);
    if (err.code) console.error('Code:', err.code);
    if (err.meta) console.error('Meta:', err.meta);
  } finally {
    await prisma.$disconnect();
  }
}

run();
